import json
import logging

logger = logging.getLogger(__name__)

KB_PATH = "insurance_kb.json"

def load_kb():
    with open(KB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def find_market_gap(news_item: dict) -> dict:
    """
    商品理解模組：
    理論上應該用 Semantic Search 或 LLM 來比對新聞與 KB。
    為了效率，我們這裡先整理資料，統一交由最終的策略規劃 Agent (OpenAI) 去判斷缺口。
    這個模組負責載入 KB，並組裝供 LLM 使用的 Context。
    """
    logger.info("初始化 ChromaDB 向量資料庫...")
    import chromadb
    
    # 使用記憶體模式，重新啟動會清空，適合 Demo
    client = chromadb.EphemeralClient()
    collection = client.get_or_create_collection(name="insurance_kb")
    
    kb = load_kb()
    
    # 建立文件與 ID
    documents = [f"{item['name']}: {item['description']}" for item in kb]
    ids = [str(i) for i in range(len(kb))]
    metadatas = [{"category": item.get("category", "Other")} for item in kb]
    
    # 寫入向量資料庫
    collection.add(documents=documents, metadatas=metadatas, ids=ids)
    
    # 進行語意搜尋 (Semantic Search)
    query_text = news_item['title'] + " " + news_item['summary']
    logger.info("比對新聞與現有保單(Semantic Search)...")
    results = collection.query(query_texts=[query_text], n_results=5)
    
    kb_context_lines = ["【最相關的 5 項現有保險商品】"]
    if results['documents'] and len(results['documents']) > 0:
        for doc in results['documents'][0]:
            kb_context_lines.append(f"- {doc}")
            
    kb_context = "\n".join(kb_context_lines)
    
    return {
        "news": news_item,
        "kb_context": kb_context,
        "gap_analysis_prompt": (
            f"【最新時事新聞】\n標題：{news_item['title']}\n摘要：{news_item['summary']}\n\n"
            f"{kb_context}\n\n"
            f"請比對上述時事與最相關的現有保險清單，找出目前『尚未被完全覆蓋』的風險缺口。"
        )
    }
