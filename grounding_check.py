"""幻覺檢測／數字接地檢查（grounding check）。

在多代理人辯論產出提案之後、產報告與上鏈之前，對提案做一次純規則、不呼叫 LLM、
離線可重現的檢查（同樣輸入必得同樣輸出）：

1. unsupported_number（high）：market_gap 與 business_logic 裡的數字，必須對得回精算引擎輸出、
   新聞原文或既有商品資料。coverage_details 與 exclusions 是商品設計參數，不受檢。
2. unverified_citation（high）：「根據 X 統計」的 X 必須出現在本次證據文字裡。
3. missing_disclosure（medium）：精算數字含假設值時，敘述必須揭露「假設」或「估計」。

結論 status：有 high 為 fail、只有 medium 為 warn、無標記為 pass。
"""
from __future__ import annotations

import re

CHECKER_VERSION = "grounding-check/v1"
NUMBER_TOLERANCE = 0.02  # 讓 LLM 四捨五入（0.6129 → 0.61、14,447,368 → 1,444 萬）仍算接地

CLAIM_FIELDS = ("market_gap", "business_logic")
CITATION_FIELDS = ("market_gap", "target_audience", "coverage_details", "exclusions", "business_logic")
DISCLOSURE_KEYWORDS = ("假設", "估計", "初估", "假定", "推估", "estimate", "assum")
_SELF_REFERENCES = ("精算引擎", "本模型", "本提案", "上述", "以上", "內部", "本公司", "我們")
_UNIT_SKIP = ("日", "天", "小時", "分鐘", "月", "週", "年", "次", "人", "家", "個", "項", "級", "期", "季", "倍")
_SCALE = {"萬": 1e4, "億": 1e8, "千": 1e3, "k": 1e3, "K": 1e3, "M": 1e6, "B": 1e9}

_LIST_MARKER_RE = re.compile(r"(?m)^\s*\d+[.、)．]\s*")
_NUMBER_RE = re.compile(
    r"(?<![A-Za-z0-9_.])"            # 不接在 ASCII 字母、數字或小數點後面（\w 會誤吃中文字）
    r"(\d{1,3}(?:,\d{3})+|\d+)"      # 整數部分，可含千分位
    r"(?:\.(\d+))?"                  # 小數部分
    r"\s*(萬|億|千|[kKMB])?"         # 中文或 SI 倍數
    r"\s*(%|％)?"                    # 百分比
    r"\s*([^\s\d,.%％]{0,2})"        # 後面緊接的一到兩個字，用來判斷單位（涵蓋「小時」「分鐘」等雙字單位）
)
_CITATION_RES = (
    re.compile(r"(?:根據|依據|參考)\s*([^，。；,;：:\n]{2,40}?)(?:的)?(?:統計|資料|數據|報告|研究|調查)"),
    re.compile(r"([^，。；,;：:\n\s]{2,30}?)(?:統計顯示|數據顯示|報告指出|研究指出|資料顯示)"),
)


def extract_numbers(text: str) -> list[tuple[float, str]]:
    """回傳 (數值, 原文片段)。跳過清單編號、年份、小於 10 的計數、以及接著時間或計數單位的數字。"""
    results: list[tuple[float, str]] = []
    cleaned = _LIST_MARKER_RE.sub("", text or "")
    for m in _NUMBER_RE.finditer(cleaned):
        integer, decimal, scale, pct, following = m.groups()
        value = float(f"{integer.replace(',', '')}.{decimal}" if decimal else integer.replace(",", ""))
        if scale:
            value *= _SCALE[scale]
        is_plain_int = not decimal and not scale and not pct
        if is_plain_int and len(integer) == 4 and 1900 <= value <= 2100:
            continue  # 年份
        if is_plain_int and value < 10:
            continue  # 「3 日」這類描述用語
        if is_plain_int and following in _UNIT_SKIP:
            continue  # 「24 小時」「60 天」
        end = m.end(4) if pct else m.end(3) if scale else m.end(2) if decimal else m.end(1)
        raw = cleaned[m.start(): end].strip()  # 數字＋倍數＋百分比原樣切出，不含後面判斷單位用的那個字
        results.append((value, raw))
    return results


def _walk_numbers(obj) -> list[float]:
    if isinstance(obj, bool):
        return []
    if isinstance(obj, (int, float)):
        return [float(obj)]
    if isinstance(obj, dict):
        return [n for v in obj.values() for n in _walk_numbers(v)]
    if isinstance(obj, (list, tuple)):
        return [n for v in obj for n in _walk_numbers(v)]
    return []


def _corpus_numbers(actuarial: dict, news: dict | None, products: list[dict] | None) -> list[float]:
    numbers = _walk_numbers(actuarial)
    for text in _evidence_texts(news, products):
        numbers.extend(v for v, _ in extract_numbers(text))
    return numbers


def _evidence_texts(news: dict | None, products: list[dict] | None) -> list[str]:
    texts: list[str] = []
    if news:
        texts.extend(str(news.get(k) or "") for k in ("title", "summary", "source"))
    for p in products or []:
        texts.extend(str(p.get(k) or "") for k in ("name", "description"))
    return texts


def _corpus_text(actuarial: dict, news: dict | None, products: list[dict] | None) -> str:
    basis = actuarial.get("basis") or {}
    parts = [str(basis.get(k) or "") for k in
             ("probability_source", "probability_source_en", "probability_method", "loss_method", "assumed_loss_note")]
    parts.extend(_evidence_texts(news, products))
    return re.sub(r"\s+", "", " ".join(parts))


def _is_grounded(value: float, corpus: list[float]) -> bool:
    for c in corpus:
        for candidate in (value, value / 100, value * 100):
            if abs(candidate - c) <= NUMBER_TOLERANCE * max(abs(c), 1e-9):
                return True
    return False


def _cited_entities(text: str) -> list[str]:
    entities = []
    for pattern in _CITATION_RES:
        for m in pattern.finditer(text or ""):
            entity = m.group(1).strip()
            if entity and not any(ref in entity for ref in _SELF_REFERENCES):
                entities.append(entity)
    return entities


def _excerpt(text: str, needle: str, width: int = 24) -> str:
    pos = (text or "").find(needle)
    if pos < 0:
        return (text or "")[: width * 2]
    return text[max(0, pos - width): pos + len(needle) + width].strip()


def check_grounding(proposal_data: dict, news: dict | None, matched_products: list[dict] | None) -> dict:
    proposal = proposal_data.get("proposal") or {}
    actuarial = proposal_data.get("actuarial_data") or {}
    corpus_numbers = _corpus_numbers(actuarial, news, matched_products)
    corpus_text = _corpus_text(actuarial, news, matched_products)
    flags: list[dict] = []
    checked = grounded = 0

    for field in CLAIM_FIELDS:
        text = proposal.get(field) or ""
        for value, raw in extract_numbers(text):
            checked += 1
            if _is_grounded(value, corpus_numbers):
                grounded += 1
                continue
            flags.append({
                "type": "unsupported_number", "severity": "high", "field": field, "value": raw,
                "excerpt": _excerpt(text, raw),
                "message": f"「{raw}」對不回精算引擎輸出、新聞原文或既有商品資料",
            })

    for field in CITATION_FIELDS:
        text = proposal.get(field) or ""
        for entity in _cited_entities(text):
            if re.sub(r"\s+", "", entity) in corpus_text:
                continue
            flags.append({
                "type": "unverified_citation", "severity": "high", "field": field, "value": entity,
                "excerpt": _excerpt(text, entity),
                "message": f"引用的來源「{entity}」不在本次證據（精算依據、新聞、既有商品）中",
            })

    basis = actuarial.get("basis") or {}
    rests_on_assumption = basis.get("probability_source") == "assumption" or basis.get("loss_source") == "assumption"
    if basis and rests_on_assumption:
        narrative = " ".join(proposal.get(f) or "" for f in CLAIM_FIELDS).lower()
        if not any(k.lower() in narrative for k in DISCLOSURE_KEYWORDS):
            flags.append({
                "type": "missing_disclosure", "severity": "medium", "field": "business_logic", "value": None,
                "excerpt": "", "message": "精算數字含假設值，但提案未揭露「假設」或「估計」",
            })

    if any(f["severity"] == "high" for f in flags):
        status = "fail"
    elif flags:
        status = "warn"
    else:
        status = "pass"

    sources = ["actuarial_engine"] if actuarial else []
    if news:
        sources.append("news")
    if matched_products:
        sources.append("matched_products")
    return {
        "status": status,
        "checker_version": CHECKER_VERSION,
        "checked_claims": checked,
        "grounded_claims": grounded,
        "flag_count": len(flags),
        "evidence_sources": sources,
        "flags": flags,
    }
