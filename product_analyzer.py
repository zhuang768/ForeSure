import json
import logging
import os
import threading
import warnings

logger = logging.getLogger(__name__)

KB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "insurance_kb.json")

# 多語言句向量模型：知識庫與新聞都是中文，chromadb 預設的英文 MiniLM 比對結果近乎隨機。
EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

_lock = threading.Lock()
_index = None  # (embedder, collection, kb_by_id)


def load_kb() -> list[dict]:
    with open(KB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _build_index():
    import chromadb
    from fastembed import TextEmbedding

    logger.info(f"載入多語言 embedding 模型 {EMBEDDING_MODEL}（首次需下載）...")
    with warnings.catch_warnings():
        # fastembed 對此模型改用 mean pooling 會發 UserWarning；mean pooling 正是我們要的行為。
        warnings.simplefilter("ignore", UserWarning)
        embedder = TextEmbedding(EMBEDDING_MODEL)

    kb = load_kb()
    documents = [f"{item['name']}: {item['description']}" for item in kb]
    embeddings = [vec.tolist() for vec in embedder.embed(documents)]

    client = chromadb.EphemeralClient()
    collection = client.get_or_create_collection(name="insurance_kb")
    collection.add(
        documents=documents,
        embeddings=embeddings,
        ids=[item["id"] for item in kb],
        metadatas=[{"category": item.get("category", "Other")} for item in kb],
    )
    logger.info(f"知識庫索引完成，共 {len(kb)} 項商品。")
    return embedder, collection, {item["id"]: item for item in kb}


def warmup():
    """伺服器啟動時先呼叫，避免第一次請求卡在模型載入。"""
    global _index
    with _lock:
        if _index is None:
            _index = _build_index()
    return _index


def match_products(query_text: str, n_results: int = 5) -> list[dict]:
    embedder, collection, kb_by_id = warmup()
    query_vec = list(embedder.embed([query_text]))[0].tolist()
    results = collection.query(query_embeddings=[query_vec], n_results=n_results)

    matches = []
    for pid, distance in zip(results["ids"][0], results["distances"][0]):
        item = kb_by_id[pid]
        matches.append({
            "id": pid,
            "name": item["name"],
            "category": item.get("category", "Other"),
            "description": item["description"],
            "distance": round(float(distance), 4),
        })
    return matches


def find_market_gap(news_item: dict) -> dict:
    """比對新聞與現有商品（語意搜尋），組裝給策略 Agent 的 context。"""
    logger.info("比對新聞與現有保單(Semantic Search)...")
    query_text = f"{news_item['title']} {news_item.get('summary', '')}"
    matches = match_products(query_text, n_results=5)

    kb_context_lines = ["【最相關的 5 項現有保險商品】"]
    for m in matches:
        kb_context_lines.append(f"- {m['name']}: {m['description']}")
    kb_context = "\n".join(kb_context_lines)

    return {
        "news": news_item,
        "matched_products": matches,
        "kb_context": kb_context,
        "gap_analysis_prompt": (
            f"【最新時事新聞】\n標題：{news_item['title']}\n摘要：{news_item.get('summary', '')}\n\n"
            f"{kb_context}\n\n"
            f"請比對上述時事與最相關的現有保險清單，找出目前『尚未被完全覆蓋』的風險缺口。"
        ),
    }
