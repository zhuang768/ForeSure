import logging
import sys
import time
from datetime import datetime

from apscheduler.schedulers.background import BackgroundScheduler

from actuarial_engine import estimate_risk_premium
from chain_writer import audit_proposal_on_chain
from market_observer import fetch_trending_news
from product_analyzer import find_market_gap
from report_generator import generate_report
from run_store import save_run
from strategy_agent import generate_product_proposal, select_best_news

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("Atlas.Core")


def run_pipeline(emit=None) -> dict | None:
    """
    完整流程：新聞 → 挑選 → 缺口比對 → 精算 → 多代理人辯論 → Word 報告 → 上鏈存證 → 持久化。
    emit(stage, data) 可選，每個階段完成時呼叫一次，供 SSE 即時推送。
    回傳寫入 audit_log 的完整紀錄。
    """
    def _emit(stage, data):
        if emit:
            emit(stage, data)

    logger.info("=" * 50)
    logger.info("啟動保險商品自動化開發 Pipeline...")

    news_items = fetch_trending_news(limit=5)
    if not news_items:
        logger.warning("未抓取到任何新聞，中斷 Pipeline。")
        _emit("error", "未抓取到任何新聞")
        return None
    _emit("news_fetched", news_items)

    selected_news = select_best_news(news_items)
    logger.info(f"鎖定時事主題：{selected_news['title']}")
    _emit("news_selected", selected_news)

    gap_analysis = find_market_gap(selected_news)
    _emit("kb_matched", gap_analysis["matched_products"])

    actuarial_data = estimate_risk_premium(selected_news.get("summary", ""), gap_analysis["gap_analysis_prompt"])
    _emit("actuarial", actuarial_data)

    proposal_data = generate_product_proposal(selected_news, gap_analysis, actuarial_data, on_stage=_emit)

    report_path = generate_report(proposal_data)
    _emit("report", {"report_path": report_path})

    _emit("chain_pending", {"network": "Ethereum Sepolia Testnet"})
    receipt = audit_proposal_on_chain(proposal_data)
    _emit("chain_done", receipt)

    record = {
        "decision_id": receipt["decision_id"],
        "timestamp": datetime.now().strftime("%Y%m%d_%H%M%S"),
        "news": selected_news,
        "matched_products": gap_analysis["matched_products"],
        "actuarial_data": actuarial_data,
        "proposal_data": proposal_data,
        "blockchain_receipt": receipt,
        "report_path": report_path,
    }
    save_run(record)
    _emit("done", record)

    logger.info("Pipeline 執行完畢！")
    logger.info("=" * 50)
    return record


def main():
    logger.info("Atlas 企業保險開發 Agent 已啟動。")
    run_pipeline()

    scheduler = BackgroundScheduler(timezone="Asia/Taipei")
    scheduler.add_job(run_pipeline, "interval", minutes=60, id="daily_insurance_gen")
    scheduler.start()
    try:
        while True:
            time.sleep(1)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
        logger.info("系統停止。")


if __name__ == "__main__":
    main()
