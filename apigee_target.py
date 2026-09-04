import asyncio
import json
import logging
import os
import threading
import time

import jwt
import uvicorn
from fastapi import FastAPI, BackgroundTasks, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

import run_store
from chain_writer import chain_status, verify_decision_on_chain
from main import run_pipeline

KB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "insurance_kb.json")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Apigee.Target")

app = FastAPI(
    title="Atlas Insurance GenAI Target",
    description="Backend API intended to be placed behind Google Cloud Apigee API Gateway.",
    version="1.1.0",
)

# Next.js 開發伺服器跨網域呼叫
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _warmup_embeddings():
    """伺服器啟動時在背景載入 embedding 模型，避免第一次 demo 卡 30 秒。"""
    if os.getenv("ATLAS_SKIP_WARMUP"):
        return
    from product_analyzer import warmup
    threading.Thread(target=warmup, name="embedding-warmup", daemon=True).start()


# --- 1. Rate Limiting Middleware (簡易 IP 限流；儀表板端點不計) ---
RATE_LIMIT = 30  # 每分鐘最多 30 次觸發型請求
rate_limit_records: dict[str, list[float]] = {}


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if request.url.path.startswith("/api/v1/runs") or request.method == "OPTIONS":
        return await call_next(request)

    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    rate_limit_records[client_ip] = [t for t in rate_limit_records.get(client_ip, []) if now - t < 60]
    if len(rate_limit_records[client_ip]) >= RATE_LIMIT:
        logger.warning(f"IP {client_ip} 觸發限流防護 (Rate Limit Exceeded)")
        return JSONResponse(status_code=429, content={"error": "Too Many Requests. Apigee quota exceeded."})
    rate_limit_records[client_ip].append(now)
    return await call_next(request)


# --- 2. JWT Authentication (企業級資安認證) ---
security = HTTPBearer()
SECRET_KEY = "SUPER_SECRET_HACKATHON_KEY"  # 僅供 Demo 使用


def verify_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        # 在實際情況下，這裡會對接 Apigee 的 JWKS 端點進行驗證
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token 已經過期 (Token Expired)")
    except jwt.InvalidTokenError:
        # 為了黑客松方便測試，允許一個萬用 Dummy Token 也能通關
        if token == "MOCK_APIGEE_TOKEN":
            return {"role": "admin"}
        raise HTTPException(status_code=401, detail="無效的 JWT Token (Invalid Token)")


class TriggerResponse(BaseModel):
    message: str
    status: str


@app.post("/api/v1/generate_insurance", response_model=TriggerResponse, dependencies=[Depends(verify_jwt)])
async def trigger_insurance_generation(background_tasks: BackgroundTasks):
    """Apigee Proxy 呼叫用：企業主管手動觸發保險發明 Agent（不串流）。"""
    logger.info("收到來自 API Gateway 的觸發請求。")
    background_tasks.add_task(run_pipeline)
    return {"message": "商品開發 Agent 已在背景啟動", "status": "processing"}


# --- 3. 儀表板用：執行、串流、歷史、驗證 ---

def _execute_run(run_id: str):
    def emit(stage, data):
        run_store.append_event(run_id, stage, data)

    try:
        run_pipeline(emit=emit)
        run_store.mark_finished(run_id, "finished")
    except Exception as e:
        logger.exception(f"Run {run_id} 失敗")
        emit("error", str(e))
        run_store.mark_finished(run_id, "error")


@app.post("/api/v1/runs")
async def start_run(background_tasks: BackgroundTasks):
    """啟動一次完整 pipeline，回傳 run_id；用 GET /api/v1/runs/{run_id}/events 追進度。"""
    run_id = run_store.create_run()
    background_tasks.add_task(_execute_run, run_id)
    return {"run_id": run_id, "status": "running"}


def _sse(stage: str, data) -> str:
    return f"event: {stage}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


@app.get("/api/v1/runs/{run_id}/events")
async def stream_run_events(run_id: str):
    """Server-Sent Events：依序送出 news_fetched … chain_done, done（或 error）。"""
    if run_store.get_active(run_id) is None:
        raise HTTPException(status_code=404, detail="run not found")

    async def generator():
        sent = 0
        while True:
            events = run_store.get_events(run_id, since=sent)
            for ev in events:
                yield _sse(ev["stage"], ev["data"])
            sent += len(events)
            if any(ev["stage"] in ("done", "error") for ev in events):
                return
            if run_store.is_finished(run_id) and not run_store.get_events(run_id, since=sent):
                return
            await asyncio.sleep(0.25)

    return StreamingResponse(generator(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.get("/api/v1/runs")
async def list_runs(limit: int = 50):
    """歷史執行紀錄摘要，最新在前。"""
    return [run_store.summarize(r) for r in run_store.load_runs()[:limit]]


@app.get("/api/v1/runs/{decision_id}")
async def get_run(decision_id: str):
    """單筆完整紀錄（含辯論全文、比對商品、精算、鏈上收據），供重播與驗證。"""
    record = run_store.get_run(decision_id)
    if record is not None:
        return record
    active = run_store.get_active(decision_id)
    if active is not None:
        return {"run_id": decision_id, "status": active["status"], "events": active["events"]}
    raise HTTPException(status_code=404, detail="run not found")


class VerifyRequest(BaseModel):
    tampered: dict | None = None


@app.post("/api/v1/runs/{decision_id}/verify")
async def verify_run(decision_id: str, body: VerifyRequest | None = None):
    """
    用儲存的 payload 重新計算雜湊並與鏈上比對。
    傳入 tampered 可覆寫任意欄位，示範竄改後驗證不符。
    """
    record = run_store.get_run(decision_id)
    if record is None:
        raise HTTPException(status_code=404, detail="run not found")
    receipt = record.get("blockchain_receipt") or {}
    payload = dict(receipt.get("payload") or {})
    tampered = (body.tampered if body else None) or {}
    payload.update(tampered)

    result = verify_decision_on_chain(receipt.get("decision_id", decision_id), payload)
    result.update({
        "tampered_fields": sorted(tampered.keys()),
        "payload": payload,
        "stored_hash": receipt.get("data_hash"),
        "tx_hash": receipt.get("blockchain_tx_hash"),
        "verification_url": receipt.get("verification_url"),
    })
    return result


@app.get("/api/v1/chain/status")
async def get_chain_status():
    return chain_status()


# --- 4. 知識庫 ---

class KBItem(BaseModel):
    name: str
    category: str
    description: str


@app.get("/api/v1/knowledge_base")
async def get_knowledge_base():
    """讀取現有所有的保險知識庫"""
    try:
        if os.path.exists(KB_PATH):
            with open(KB_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        return []
    except Exception as e:
        logger.error(f"讀取 KB 失敗: {e}")
        return {"error": "無法讀取知識庫"}


@app.post("/api/v1/knowledge_base")
async def add_knowledge_base(item: KBItem):
    """允許新增未來的保險商品到知識庫中"""
    try:
        kb = []
        if os.path.exists(KB_PATH):
            with open(KB_PATH, "r", encoding="utf-8") as f:
                kb = json.load(f)
        kb.append(item.model_dump())
        with open(KB_PATH, "w", encoding="utf-8") as f:
            json.dump(kb, f, ensure_ascii=False, indent=4)
        return {"message": "新增成功", "item": item}
    except Exception as e:
        logger.error(f"寫入 KB 失敗: {e}")
        return {"error": "無法新增知識庫"}


@app.get("/api/v1/all_reports")
async def get_all_reports():
    """回傳所有的保單報告歷史紀錄"""
    try:
        if os.path.exists("audit_log.json"):
            with open("audit_log.json", "r", encoding="utf-8") as f:
                logs = json.load(f)
                if isinstance(logs, list):
                    return logs
                elif isinstance(logs, dict):
                    return [logs]
        return []
    except Exception as e:
        logger.error(f"讀取歷史報告失敗: {e}")
        return []

@app.get("/api/v1/latest_report")
async def get_latest_report():
    """回傳最新一份生成的保單報告 (讀取 audit_log.json)"""
    try:
        if os.path.exists("audit_log.json"):
            with open("audit_log.json", "r", encoding="utf-8") as f:
                logs = json.load(f)
                if isinstance(logs, list) and len(logs) > 0:
                    return logs[-1] # 取最新一筆
                elif isinstance(logs, dict):
                    return logs
        return {"error": "尚未生成任何報告"}
    except Exception as e:
        logger.error(f"讀取最新報告失敗: {e}")
        return {"error": str(e)}

@app.post("/api/v1/run_agent")
async def run_agent_synchronous():
    """
    黑客松 Demo 專用端點：
    同步觸發 Python AI 代理人流程，並等待它跑完，直接將最新的產出與上鏈結果回傳給前端。
    """
    logger.info("前端手動觸發了 AI Agent Pipeline！")
    try:
        # 同步執行 (這會卡住大約 10-20 秒，等待 OpenAI 回應與上鏈)
        report_path = run_pipeline()
        if not report_path:
            return {"error": "Pipeline 執行失敗，未產生報告。請檢查終端機 Log。"}
        
        # 讀取剛產生的熱騰騰報告
        return await get_latest_report()
    except Exception as e:
        logger.error(f"執行 Agent 失敗: {e}")
        return {"error": str(e)}

@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "timestamp": time.time(), "chain": chain_status()["mode"]}


if __name__ == "__main__":
    logger.info("啟動 Backend Server (Port: 8080) 等待 Apigee 連線...")
    uvicorn.run(app, host="0.0.0.0", port=8080)
