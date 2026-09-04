import feedparser
import logging

logger = logging.getLogger(__name__)

# Google News RSS (擴展抓取範圍：包含科技、商業、總體經濟，以及災難風險，讓 AI 自己從海量資訊中找缺口)
RSS_URLS = [
    "https://news.google.com/rss/search?q=technology+OR+startup+OR+innovation+when:1d&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=business+OR+economy+OR+market+when:1d&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=disaster+OR+risk+OR+cyberattack+when:1d&hl=en-US&gl=US&ceid=US:en"
]

def fetch_trending_news(limit: int = 5) -> list[dict]:
    """
    抓取 Google News RSS，取得最新趨勢新聞。
    """
    logger.info("開始抓取 Google News RSS...")
    news_items = []
    
    for url in RSS_URLS:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:limit]:
                news_items.append({
                    "title": entry.title,
                    "link": entry.link,
                    "published": entry.published if hasattr(entry, 'published') else "N/A",
                    "summary": entry.summary if hasattr(entry, 'summary') else ""
                })
        except Exception as e:
            logger.error(f"抓取 RSS 失敗 {url}: {e}")
            
    if not news_items:
        logger.warning("無法從 Google News 取得資料，切換為模擬重大新聞以防系統中斷。")
        news_items.append({
            "title": "全球最大的雲端服務供應商發生連續 12 小時的服務中斷",
            "link": "https://example.com/outage",
            "published": "Just now",
            "summary": "本次中斷導致全球數千家企業無法營運，電子商務與金融交易全面停擺，預估經濟損失高達數十億美元。"
        })
            
    logger.info(f"共抓取 {len(news_items)} 則新聞。")
    return news_items

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    news = fetch_trending_news(3)
    for n in news:
        print(f"- {n['title']}")
