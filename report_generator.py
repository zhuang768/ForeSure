import os
import logging
from datetime import datetime
from docx import Document
from docx.shared import RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

logger = logging.getLogger(__name__)

# The report is bilingual: every heading and label is printed as "中文 / English", and every section written by
# the agent is printed twice, Chinese first, then the English version the agent produced in the "<field>_en" key.
_ENGLISH_GREY = RGBColor(0x55, 0x55, 0x55)
_MISSING_EN = "（未提供英文版 / English version not provided）"
_ENGLISH_NAME_MAX_CHARS = 60  # keeps file names within filesystem limits for long English product names


def _heading(doc, zh: str, en: str, level: int):
    return doc.add_heading(f"{zh} / {en}", level)


def _label(zh: str, en: str, value) -> str:
    return f"{zh} / {en}：{value}"


def _english(paragraph, text: str):
    run = paragraph.add_run(text)
    run.italic = True
    run.font.color.rgb = _ENGLISH_GREY
    return run


def _bilingual_section(doc, zh_text, en_text) -> None:
    """Chinese body, then the English version in italic grey; flag it honestly when the agent gave none."""
    doc.add_paragraph(zh_text or "N/A")
    _english(doc.add_paragraph(), en_text or _MISSING_EN)


def _add_actuarial_basis(doc, basis: dict) -> None:
    """Spell out where each actuarial figure comes from, separating real statistics from assumptions."""
    _heading(doc, "數據依據", "Basis", level=3)
    source = basis.get("probability_source")
    if source and source != "assumption":
        if basis.get("probability_source_en"):
            source = f"{source}（{basis['probability_source_en']}）"
        doc.add_paragraph(_label("發生機率依據", "Probability source", source)
                          + f"；{_label('方法', 'Method', basis.get('probability_method', ''))}")
    else:
        doc.add_paragraph(_label("發生機率依據", "Probability source",
                                 f"假設值，無官方統計 / assumption, no official statistics（{basis.get('probability_method', '')}）"))
    if basis.get("low_sample"):
        doc.add_paragraph(_label("注意", "Note",
                                 "嚴重事件樣本少於 5 筆，機率估計的不確定性高。"
                                 " / Fewer than 5 severe events in the sample; the probability estimate is highly uncertain."))
    loss_line = _label("單次損失依據", "Loss basis", f"假設值 / assumption（{basis.get('loss_method', '')}）")
    if basis.get("assumed_loss_per_household_usd"):
        loss_line += (f"；每戶假設損失 / assumed loss per household USD {basis['assumed_loss_per_household_usd']}"
                      f"（{basis.get('assumed_loss_note', '')}）")
    doc.add_paragraph(loss_line)
    doc.add_paragraph(_label("保費計算", "Premium method", basis.get("premium_method", "")))


def _safe_name(name: str) -> str:
    return "".join(c for c in (name or "") if c.isalnum() or c == " ").strip().replace(" ", "_")


def _report_filename(proposal: dict) -> str:
    """<timestamp>_<Chinese name>[_<English name>].docx; the English part is skipped when it is already in the name."""
    zh = _safe_name(proposal.get("product_name", "Report")) or "Product_Proposal"
    parts = [datetime.now().strftime("%Y%m%d_%H%M%S"), zh]
    en = _safe_name(proposal.get("product_name_en", ""))[:_ENGLISH_NAME_MAX_CHARS].rstrip("_")
    if en and en not in zh:
        parts.append(en)
    return "_".join(parts) + ".docx"


def generate_report(proposal_data: dict, output_dir: str = "reports") -> str:
    """
    將 Agent 生成的提案資料排版並輸出為中英雙語的 Word (.docx) 檔案。
    """
    logger.info("生成 Word 提案報告中...")

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    doc = Document()

    # 標題 / Title
    title = doc.add_heading('創新保險商品開發提案書', 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle = doc.add_paragraph('Innovative Insurance Product Proposal', style='Subtitle')
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # 日期 / Date
    date_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    date_p = doc.add_paragraph(_label("生成日期", "Generated", date_str))
    date_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT

    if "error" in proposal_data:
        doc.add_paragraph("發生錯誤，無法生成完整報告。 / An error occurred and the full report could not be generated.")
        doc.add_paragraph(proposal_data["error"])
        filepath = os.path.join(output_dir, "error_report.docx")
        doc.save(filepath)
        return filepath

    proposal = proposal_data["proposal"]
    actuarial = proposal_data["actuarial_data"]

    # 1. 商品概要 / Product overview
    _heading(doc, '1. 商品名稱與市場缺口', 'Product Name & Market Gap', level=1)
    name = proposal.get('product_name', '未命名商品')
    if proposal.get('product_name_en'):
        name = f"{name} / {proposal['product_name_en']}"
    doc.add_paragraph(_label("商品名稱", "Product name", name)).style = 'Heading 3'

    _heading(doc, '觸發時事', 'Trigger Event', level=2)
    doc.add_paragraph(_label("新聞標題", "Headline", proposal_data.get('source_news', 'N/A')))
    doc.add_paragraph(_label("新聞摘要", "Summary", proposal_data.get('news_summary', 'N/A')))

    _heading(doc, '市場缺口分析', 'Market Gap Analysis', level=2)
    _bilingual_section(doc, proposal.get('market_gap'), proposal.get('market_gap_en'))

    # 2. 客群與保障 / Audience and coverage
    _heading(doc, '2. 目標客群與保障範圍', 'Target Audience & Coverage', level=1)
    _heading(doc, '目標客群', 'Target Audience', level=2)
    _bilingual_section(doc, proposal.get('target_audience'), proposal.get('target_audience_en'))

    _heading(doc, '保障細節', 'Coverage Details', level=2)
    _bilingual_section(doc, proposal.get('coverage_details'), proposal.get('coverage_details_en'))

    _heading(doc, '除外不保事項', 'Exclusions', level=2)
    _bilingual_section(doc, proposal.get('exclusions'), proposal.get('exclusions_en'))

    # 3. 精算數據與商業邏輯 / Actuarial figures and business logic
    _heading(doc, '3. 基礎精算與商業評估', 'Actuarial Basis & Business Assessment', level=1)
    _heading(doc, 'AI 初步精算估算', 'Preliminary AI Actuarial Estimate', level=2)
    p_act = doc.add_paragraph()
    p_act.add_run(_label("預估風險發生機率", "Estimated probability", f"{actuarial.get('probability_pct', '0')}%") + "\n")
    p_act.add_run(_label("單次事故預期損失", "Expected loss per event", f"USD {actuarial.get('expected_loss_usd', '0')}") + "\n")
    p_act.add_run(_label("建議保費定價區間", "Suggested premium range",
                         f"USD {actuarial['premium_range_usd'][0]} ~ USD {actuarial['premium_range_usd'][1]}"))

    basis = actuarial.get("basis")
    if basis:
        _add_actuarial_basis(doc, basis)

    _heading(doc, '商業邏輯與獲利模式', 'Business Logic & Profit Model', level=2)
    _bilingual_section(doc, proposal.get('business_logic'), proposal.get('business_logic_en'))

    # 儲存檔案 / Save
    filepath = os.path.join(output_dir, _report_filename(proposal))
    doc.save(filepath)

    # 上鏈存證與 audit log 寫入由 main.run_pipeline 負責（見 chain_writer / run_store）。
    logger.info(f"報告已生成並儲存至：{filepath}")
    return filepath
