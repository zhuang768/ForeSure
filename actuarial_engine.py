import random
import logging

logger = logging.getLogger(__name__)

def estimate_risk_premium(news_summary: str, gap_description: str) -> dict:
    """
    精算/數據判斷模組 (簡化版)
    根據新聞與缺口描述，利用簡化公式估算：
    1. 風險發生機率 (Probability)
    2. 預期損失金額 (Expected Loss)
    3. 建議保費區間 (Suggested Premium) = Expected Loss * Markup
    """
    logger.info("執行精算與數據判斷...")
    
    # 取代純隨機，我們實作一個基礎的「規則引擎 (Rule-based Engine)」
    # 根據新聞內容的關鍵字，動態調整風險參數的基準值
    text_content = (news_summary + " " + gap_description).lower()
    
    # 預設基準值
    base_prob = 0.05
    base_loss = 50000
    
    if any(k in text_content for k in ["climate", "hurricane", "flood", "disaster", "weather"]):
        base_prob = 0.15  # 氣候變遷導致極端天氣頻發，機率較高
        base_loss = 500000 # 巨災損失極大
    elif any(k in text_content for k in ["cyber", "hack", "ransomware", "data"]):
        base_prob = 0.08
        base_loss = 250000
    elif any(k in text_content for k in ["health", "pandemic", "disease", "virus"]):
        base_prob = 0.12
        base_loss = 100000
        
    base_seed = len(text_content)
    random.seed(base_seed)
    
    # 加入隨機擾動 (±20%)，讓每次報告數據看起來不完全一樣
    probability = round(base_prob * random.uniform(0.8, 1.2), 4)
    expected_loss_event = round(base_loss * random.uniform(0.8, 1.2), 2)
    
    # 統計學預期損失 (Expected Loss = 機率 * 事故損失)
    expected_loss = probability * expected_loss_event
    
    # 3. 建議保費區間 (加成係數 Markup 通常包含附加費用、利潤、安全邊際)
    # 動態風險溢價：若發生機率極高(>10%)，保險公司須承擔更高風險，因此提高加成係數建立準備金
    if probability > 0.10:
        markup_min = 1.8
        markup_max = 3.0
    elif probability > 0.05:
        markup_min = 1.5
        markup_max = 2.5
    else:
        markup_min = 1.2
        markup_max = 1.8
        
    premium_min = round(expected_loss * markup_min, 2)
    premium_max = round(expected_loss * markup_max, 2)
    
    # 防止保費過低
    if premium_max < 50:
        premium_min = 50.0
        premium_max = round(premium_min * 1.5, 2)
        
    result = {
        "probability_pct": round(probability * 100, 2),
        "expected_loss_usd": expected_loss_event,
        "premium_range_usd": [premium_min, premium_max],
        "markup_multiplier": [markup_min, markup_max]
    }
    
    logger.info(f"精算結果: 機率 {result['probability_pct']}%, 保費區間 ${premium_min} - ${premium_max}")
    return result
