import uvicorn
from fastapi import FastAPI, BackgroundTasks, Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import logging
import time
import jwt

from main import run_pipeline

KB_PATH = "insurance_kb.json"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Apigee.Target")

app = FastAPI(
    title="Atlas Insurance GenAI Target",
    description="Backend API intended to be placed behind Google Cloud Apigee API Gateway.",
    version="1.0.0"
)

# --- 1. Rate Limiting Middleware (簡易 IP 限流) ---
RATE_LIMIT = 5  # 每分鐘最多 5 次請求
rate_limit_records = {}

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    now = time.time()
    
    # 清理超過一分鐘的舊紀錄
    if client_ip in rate_limit_records:
        rate_limit_records[client_ip] = [t for t in rate_limit_records[client_ip] if now - t < 60]
    else:
        rate_limit_records[client_ip] = []
        
    if len(rate_limit_records[client_ip]) >= RATE_LIMIT:
        from fastapi.responses import JSONResponse
        logger.warning(f"IP {client_ip} 觸發限流防護 (Rate Limit Exceeded)")
        return JSONResponse(status_code=429, content={"error": "Too Many Requests. Apigee quota exceeded."})
        
    rate_limit_records[client_ip].append(now)
    response = await call_next(request)
    return response

# --- 2. JWT Authentication (企業級資安認證) ---
security = HTTPBearer()
SECRET_KEY = "SUPER_SECRET_HACKATHON_KEY" # 僅供 Demo 使用

def verify_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        # 在實際情況下，這裡會對接 Apigee 的 JWKS 端點進行驗證
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token 已經過期 (Token Expired)")
    except jwt.InvalidTokenError:
        # 為了黑客松方便測試，我們允許一個萬用 Dummy Token "MOCK_APIGEE_TOKEN" 也能通關
        if token == "MOCK_APIGEE_TOKEN":
            return {"role": "admin"}
        raise HTTPException(status_code=401, detail="無效的 JWT Token (Invalid Token)")

class TriggerResponse(BaseModel):
    message: str
    status: str

@app.post("/api/v1/generate_insurance", response_model=TriggerResponse, dependencies=[Depends(verify_jwt)])
async def trigger_insurance_generation(background_tasks: BackgroundTasks):
    """
    這個 Endpoint 提供給 Apigee Proxy 呼叫。
    Apigee 可以透過這個接口，讓企業主管手動觸發保險發明 Agent。
    """
    logger.info("收到來自 API Gateway 的觸發請求。")
    # 將 pipeline 放入背景執行，避免 API 超時 (Timeout)
    background_tasks.add_task(run_pipeline)
    return {"message": "商品開發 Agent 已在背景啟動", "status": "processing"}

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

@app.post("/api/v1/decisions/{decision_id}/finalize")
async def finalize_decision_endpoint(decision_id: str, background_tasks: BackgroundTasks):
    """
    7.3 整合到現有的決策流程 (黑客松 Demo 版本)
    這是一個示意用的端點，展示如何用 BackgroundTasks 非同步上鏈。
    """
    logger.info(f"收到決策完成請求: {decision_id}")
    
    # 這裡放一個假的決策資料，模擬原本 AI 產出的最終決策
    final_decision = {
        "decision_id": decision_id,
        "product_type": "颱風停班停課補償險",
        "agent_pipeline_version": "v1.3.0"
    }
    
    # 匯入 chain_writer (放在這裡延遲載入避免循環相依)
    from chain_writer import record_decision_on_chain
    
    def background_chain_write():
        try:
            logger.info(f"背景任務開始上鏈: {decision_id}")
            chain_result = record_decision_on_chain(decision_id, final_decision)
            # 在真實系統中，這裡會將 tx_hash 寫回 DB
            logger.info(f"背景任務上鏈完成: {chain_result['tx_hash']}")
        except Exception as e:
            logger.error(f"背景上鏈失敗: {e}")

    # NEW: 上鏈存證 (非同步/背景執行,避免拖慢 API 回應)
    background_tasks.add_task(background_chain_write)

    # 瞬間回傳 200 OK，讓前端秒收回應
    return {
        "decision_id": decision_id,
        "decision": final_decision,
        "message": "決策已確立，正在背景寫入區塊鏈存證..."
    }

@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "timestamp": time.time()}

if __name__ == "__main__":
    logger.info("啟動 Backend Server (Port: 8080) 等待 Apigee 連線...")
    uvicorn.run(app, host="0.0.0.0", port=8080)
