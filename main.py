import logging
import sys
import os
import random
from apscheduler.schedulers.background import BackgroundScheduler
import time

from market_observer import fetch_trending_news
from product_analyzer import find_market_gap
from actuarial_engine import estimate_risk_premium
from strategy_agent import generate_product_proposal
from report_generator import generate_report

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("Atlas.Core")

def run_pipeline():
    logger.info("="*50)
    logger.info("啟動保險商品自動化開發 Pipeline...")
    
    # 1. 市場觀察 (抓取新聞)
    news_items = fetch_trending_news(limit=5)
    if not news_items:
        logger.warning("未抓取到任何新聞，中斷 Pipeline。")
        return None
        
    # 挑選一則最值得發展的新聞
    from strategy_agent import select_best_news
    selected_news = select_best_news(news_items)
    logger.info(f"鎖定時事主題：{selected_news['title']}")
    
    # 2. 商品理解與缺口比對
    gap_analysis = find_market_gap(selected_news)
    
    # 3. 精算數據
    actuarial_data = estimate_risk_premium(selected_news['summary'], gap_analysis['gap_analysis_prompt'])
    
    # 4. OpenAI 策略生成
    proposal_data = generate_product_proposal(selected_news, gap_analysis, actuarial_data)
    
    # 5. 報告生成
    report_path = generate_report(proposal_data)
    
    logger.info("Pipeline 執行完畢！")
    logger.info("="*50)
    return report_path

def main():
    logger.info("Atlas 企業保險開發 Agent 已啟動。")
    
    # 初次啟動立刻跑一次
    run_pipeline()
    
    # 排程設定：每日執行一次 (這裡 demo 設定為每 60 分鐘以利測試)
    scheduler = BackgroundScheduler(timezone="Asia/Taipei")
    scheduler.add_job(run_pipeline, 'interval', minutes=60, id='daily_insurance_gen')
    scheduler.start()
    
    try:
        while True:
            time.sleep(1)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
        logger.info("系統停止。")

if __name__ == "__main__":
    main()
