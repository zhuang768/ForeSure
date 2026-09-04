"""
執行紀錄儲存：
- 持久化：reports/audit_log.json（每次 pipeline 完成寫入一筆完整紀錄，供歷史列表、重播、鏈上驗證）
- 進行中：記憶體內的事件列表，供 SSE 串流
"""
import json
import logging
import os
import threading
import time
import uuid

logger = logging.getLogger(__name__)

_HERE = os.path.dirname(os.path.abspath(__file__))
AUDIT_LOG_PATH = os.path.join(_HERE, "reports", "audit_log.json")

_file_lock = threading.Lock()
_active_lock = threading.Lock()
_active_runs: dict[str, dict] = {}


# ---------- 持久化 ----------

def load_runs() -> list[dict]:
    """全部紀錄，最新在前。"""
    with _file_lock:
        if not os.path.exists(AUDIT_LOG_PATH):
            return []
        try:
            with open(AUDIT_LOG_PATH, "r", encoding="utf-8") as f:
                records = json.load(f)
        except (json.JSONDecodeError, OSError) as e:
            logger.error(f"讀取 audit log 失敗: {e}")
            return []
    return list(reversed(records))


def record_decision_id(record: dict):
    """新格式在頂層；早期紀錄只在 blockchain_receipt 裡有 decision_id。"""
    return record.get("decision_id") or (record.get("blockchain_receipt") or {}).get("decision_id")


def get_run(decision_id: str):
    for record in load_runs():
        if record_decision_id(record) == decision_id or record.get("run_id") == decision_id:
            return record
    return None


def save_run(record: dict) -> None:
    with _file_lock:
        os.makedirs(os.path.dirname(AUDIT_LOG_PATH), exist_ok=True)
        records = []
        if os.path.exists(AUDIT_LOG_PATH):
            try:
                with open(AUDIT_LOG_PATH, "r", encoding="utf-8") as f:
                    records = json.load(f)
            except (json.JSONDecodeError, OSError) as e:
                logger.error(f"讀取 audit log 失敗，將重建: {e}")
        records.append(record)
        with open(AUDIT_LOG_PATH, "w", encoding="utf-8") as f:
            json.dump(records, f, ensure_ascii=False, indent=2)


def summarize(record: dict) -> dict:
    """列表用摘要，不含整份提案內容。"""
    receipt = record.get("blockchain_receipt", {}) or {}
    proposal = (record.get("proposal_data", {}) or {}).get("proposal", {}) or {}
    return {
        "decision_id": record_decision_id(record),
        "run_id": record.get("run_id"),
        "timestamp": record.get("timestamp"),
        "news_title": (record.get("news") or {}).get("title"),
        "product_name": proposal.get("product_name"),
        "is_mock_proposal": (record.get("proposal_data") or {}).get("is_mock"),
        "chain_is_mock": receipt.get("is_mock"),
        "tx_hash": receipt.get("blockchain_tx_hash"),
        "verification_url": receipt.get("verification_url"),
    }


# ---------- 進行中的執行 ----------

def reset_active_runs() -> None:
    with _active_lock:
        _active_runs.clear()


def create_run() -> str:
    run_id = uuid.uuid4().hex[:12]
    with _active_lock:
        _active_runs[run_id] = {"run_id": run_id, "status": "running", "events": [], "created_at": time.time()}
    return run_id


def get_active(run_id: str):
    with _active_lock:
        return _active_runs.get(run_id)


def append_event(run_id: str, stage: str, data) -> None:
    with _active_lock:
        run = _active_runs.get(run_id)
        if run is None:
            return
        run["events"].append({"stage": stage, "data": data, "at": time.time()})


def get_events(run_id: str, since: int = 0) -> list[dict]:
    with _active_lock:
        run = _active_runs.get(run_id)
        return list(run["events"][since:]) if run else []


def mark_finished(run_id: str, status: str = "finished") -> None:
    with _active_lock:
        run = _active_runs.get(run_id)
        if run:
            run["status"] = status


def is_finished(run_id: str) -> bool:
    run = get_active(run_id)
    return run is None or run["status"] != "running"
