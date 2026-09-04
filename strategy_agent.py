import json
import logging
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

_SYSTEM_PROMPT = (
    "你是一個世界頂尖的保險商品創新精算師與產品經理。"
    "你的任務是根據「最新時事新聞」與「精算引擎提供的風險數據」，發明一款市面上還沒有的保險商品。"
    "這款商品必須具備商業可行性，解決真實的市場痛點，並提供明確的保障範圍。"
)

_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "propose_new_insurance_product",
            "description": "生成全新保險商品開發提案",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_name": {
                        "type": "string",
                        "description": "創新保險商品名稱 (具備行銷吸引力)"
                    },
                    "target_audience": {
                        "type": "string",
                        "description": "目標客群分析 (哪些人最需要這個保險)"
                    },
                    "market_gap": {
                        "type": "string",
                        "description": "市場缺口說明 (為何現有保險無法涵蓋此風險)"
                    },
                    "coverage_details": {
                        "type": "string",
                        "description": "保障範圍與理賠條件 (條列式說明)"
                    },
                    "exclusions": {
                        "type": "string",
                        "description": "除外不保事項 (道德風險防範)"
                    },
                    "business_logic": {
                        "type": "string",
                        "description": "商業邏輯與精算數據結合說明 (解釋保費是否具備競爭力，預期獲利模式)"
                    }
                },
                "required": ["product_name", "target_audience", "market_gap", "coverage_details", "exclusions", "business_logic"]
            }
        }
    }
]

_TOOL_CHOICE = {"type": "function", "function": {"name": "propose_new_insurance_product"}}

def select_best_news(news_items: list[dict]) -> dict:
    """
    使用 LLM 從多則新聞中挑選最適合開發保險商品的時事。
    如果失敗或無 API Key，則回退至隨機挑選。
    """
    import random
    logger.info("呼叫 OpenAI 挑選最具潛力的時事新聞...")
    
    if not OPENAI_API_KEY:
        logger.warning("無 OpenAI API Key，回退至隨機挑選新聞。")
        return random.choice(news_items)
        
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        news_text = "\n".join([f"[{i}] {n['title']} - {n['summary']}" for i, n in enumerate(news_items)])
        
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "你是一個風險分析師，請從以下新聞中，挑選出「最適合用來設計創新保險商品」的一則。只回答該則新聞的索引數字 (例如 0, 1, 2)，不要回答其他內容。"},
                {"role": "user", "content": news_text}
            ],
            temperature=0.3,
            max_tokens=10,
        )
        
        choice_str = response.choices[0].message.content.strip()
        # 提取數字
        choice_idx = int(''.join(filter(str.isdigit, choice_str)))
        if 0 <= choice_idx < len(news_items):
            return news_items[choice_idx]
        return random.choice(news_items)
    except Exception as e:
        logger.error(f"OpenAI 挑選新聞失敗：{e}。回退至隨機挑選。")
        return random.choice(news_items)

def generate_product_proposal(news_item: dict, gap_analysis: dict, actuarial_data: dict) -> dict:
    """
    呼叫 OpenAI Function Calling 生成商品提案，加入多代理人辯論邏輯。
    """
    logger.info("呼叫 OpenAI 多代理人辯論 (PM vs Underwriter vs Actuary)...")
    
    pm_message = (
        f"{gap_analysis['gap_analysis_prompt']}\n\n"
        f"【精算引擎數據提供】\n"
        f"- 預估風險發生機率：{actuarial_data['probability_pct']}%\n"
        f"- 預估單次事故損失：USD {actuarial_data['expected_loss_usd']}\n"
        f"- 建議保費區間：USD {actuarial_data['premium_range_usd'][0]} ~ {actuarial_data['premium_range_usd'][1]}\n\n"
        f"請初步草擬一份極具市場破壞力的保險商品點子。"
    )

    try:
        if not OPENAI_API_KEY:
            raise ValueError("No API Key")
            
        client = OpenAI(api_key=OPENAI_API_KEY, timeout=15.0)
        
        # 1. 產品經理 (PM) 提案
        pm_response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "你是一位激進的保險產品經理，目標是發明最吸引眼球的新形態保險。"},
                {"role": "user", "content": pm_message}
            ],
            temperature=0.8,
            max_tokens=500
        )
        pm_idea = pm_response.choices[0].message.content
        logger.info("PM 提案完成。")
        
        # 2. 核保人員 (Underwriter) 批評
        uw_response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "你是一位嚴格且保守的資深核保人員，負責找出保險點子中的道德風險與漏洞。"},
                {"role": "user", "content": f"這是 PM 提出的點子，請嚴厲批評並指出可能導致虧損的 3 大漏洞：\n\n{pm_idea}"}
            ],
            temperature=0.4,
            max_tokens=400
        )
        uw_critique = uw_response.choices[0].message.content
        logger.info("核保人員批評完成。")
        
        # 3. 精算師 (Actuary) 整合並呼叫 Function 產出正式提案
        final_message = (
            f"【原始提案】\n{pm_idea}\n\n"
            f"【核保人員批評】\n{uw_critique}\n\n"
            f"請扮演精算師，修正這些漏洞，並嚴謹地呼叫 propose_new_insurance_product 生成最終正式提案。"
        )
        
        final_response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": final_message}
            ],
            tools=_TOOLS,
            tool_choice=_TOOL_CHOICE,
            temperature=0.7,
            max_tokens=1000,
        )
        
        tool_calls = final_response.choices[0].message.tool_calls
        if not tool_calls:
            raise ValueError("OpenAI 未回傳 tool_calls")
            
        args = json.loads(tool_calls[0].function.arguments)
        
        proposal = {
            "source_news": news_item['title'],
            "news_summary": news_item['summary'],
            "actuarial_data": actuarial_data,
            "proposal": args
        }
        
        logger.info(f"多代理人策略生成成功！商品名稱：{args['product_name']}")
        return proposal

    except Exception as e:
        logger.error(f"OpenAI 呼叫失敗或無 API Key：{e}。切換至動態 Mock 資料產生器。")
        
        text_content = (news_item['title'] + " " + news_item['summary']).lower()
        if any(k in text_content for k in ["cyber", "hack", "ransomware", "data"]):
            mock_args = {
                "product_name": "企業勒索軟體停工與談判綜合險 (Mock)",
                "target_audience": "持有大量用戶個資之中小企業與數位平台。",
                "market_gap": "現有資安險僅賠償資料庫重建，無覆蓋高額談判專家費用與贖金損失。",
                "coverage_details": "1. 補助最高 10 萬美金之駭客談判專家顧問費。\n2. 營業中斷期間每日補償 5000 美金。",
                "exclusions": "1. 企業未安裝基礎防火牆與防毒軟體。\n2. 內鬼竊取資料。",
                "business_logic": "隨數位勒索案件激增，潛在需求大。透過再保與嚴格核保條件控制風險。"
            }
        elif any(k in text_content for k in ["health", "pandemic", "disease", "virus"]):
            mock_args = {
                "product_name": "新興傳染病營業中斷與防疫險 (Mock)",
                "target_audience": "餐飲業、旅遊業與零售實體店家。",
                "market_gap": "傳統營業中斷險需有「實體財物損毀」才理賠，傳染病停業無法獲賠。",
                "coverage_details": "1. 政府宣布三級警戒即刻啟動理賠。\n2. 補助員工遠端辦公軟硬體建置費。",
                "exclusions": "1. 已被世界衛生組織宣告為全球大流行後才投保。\n2. 企業自行決定停業(非政府強制)。",
                "business_logic": "將理賠條件參數化(政府公告)，省去人工理賠勘驗成本，保費可有效降低。"
            }
        else:
            mock_args = {
                "product_name": "氣候巨災參數型保證險 (Mock)",
                "target_audience": "容易受極端氣候影響之農漁業及運輸業。",
                "market_gap": "現有保險需人工勘損，耗時數月。此商品結合大數據，觸發參數即刻理賠。",
                "coverage_details": "1. 降雨量連續 3 日超過 500mm 自動理賠 100萬。\n2. 因颱風導致之營業中斷固定補償 50萬。",
                "exclusions": "1. 未依氣象局發布之警告進行預防。\n2. 人為蓄意破壞。",
                "business_logic": "預期損失極大但機率較低，透過再保險分散風險，保費利潤率預期可達 35%。"
            }
            
        return {
            "source_news": news_item['title'],
            "news_summary": news_item['summary'],
            "actuarial_data": actuarial_data,
            "proposal": mock_args
        }
