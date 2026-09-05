import os
import logging
from datetime import datetime
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

logger = logging.getLogger(__name__)


def _add_actuarial_basis(doc, basis: dict) -> None:
    """Spell out where each actuarial figure comes from, separating real statistics from assumptions."""
    doc.add_heading('數據依據 (Basis)', level=3)
    source = basis.get("probability_source")
    if source and source != "assumption":
        doc.add_paragraph(f"發生機率依據：{source}；方法：{basis.get('probability_method', '')}")
    else:
        doc.add_paragraph(f"發生機率依據：假設值，無官方統計（{basis.get('probability_method', '')}）")
    if basis.get("low_sample"):
        doc.add_paragraph("注意：嚴重事件樣本少於 5 筆，機率估計的不確定性高。")
    loss_line = f"單次損失依據：假設值（{basis.get('loss_method', '')}）"
    if basis.get("assumed_loss_per_household_usd"):
        loss_line += f"；每戶假設損失 USD {basis['assumed_loss_per_household_usd']}（{basis.get('assumed_loss_note', '')}）"
    doc.add_paragraph(loss_line)
    doc.add_paragraph(f"保費計算：{basis.get('premium_method', '')}")


def generate_report(proposal_data: dict, output_dir: str = "reports") -> str:
    """
    將 Agent 生成的提案資料排版並輸出為 Word (.docx) 檔案。
    """
    logger.info("生成 Word 提案報告中...")
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    doc = Document()
    
    # 標題
    title = doc.add_heading('創新保險商品開發提案書', 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # 日期
    date_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    date_p = doc.add_paragraph(f"生成日期：{date_str}")
    date_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    
    if "error" in proposal_data:
        doc.add_paragraph("發生錯誤，無法生成完整報告。")
        doc.add_paragraph(proposal_data["error"])
        filepath = os.path.join(output_dir, "error_report.docx")
        doc.save(filepath)
        return filepath

    proposal = proposal_data["proposal"]
    actuarial = proposal_data["actuarial_data"]
    
    # 1. 商品概要
    doc.add_heading('1. 商品名稱與市場缺口', level=1)
    doc.add_paragraph(f"商品名稱：{proposal.get('product_name', '未命名商品')}").style = 'Heading 3'
    
    doc.add_heading('觸發時事 (Trigger Event)', level=2)
    doc.add_paragraph(f"新聞標題：{proposal_data.get('source_news', 'N/A')}")
    doc.add_paragraph(f"新聞摘要：{proposal_data.get('news_summary', 'N/A')}")
    
    doc.add_heading('市場缺口分析', level=2)
    doc.add_paragraph(proposal.get('market_gap', 'N/A'))
    
    # 2. 客群與保障
    doc.add_heading('2. 目標客群與保障範圍', level=1)
    doc.add_heading('目標客群 (Target Audience)', level=2)
    doc.add_paragraph(proposal.get('target_audience', 'N/A'))
    
    doc.add_heading('保障細節 (Coverage Details)', level=2)
    doc.add_paragraph(proposal.get('coverage_details', 'N/A'))
    
    doc.add_heading('除外不保事項 (Exclusions)', level=2)
    doc.add_paragraph(proposal.get('exclusions', 'N/A'))
    
    # 3. 精算數據與商業邏輯
    doc.add_heading('3. 基礎精算與商業評估', level=1)
    doc.add_heading('AI 初步精算估算', level=2)
    p_act = doc.add_paragraph()
    p_act.add_run(f"預估風險發生機率：{actuarial.get('probability_pct', '0')}%\n")
    p_act.add_run(f"單次事故預期損失：USD {actuarial.get('expected_loss_usd', '0')}\n")
    p_act.add_run(f"建議保費定價區間：USD {actuarial['premium_range_usd'][0]} ~ USD {actuarial['premium_range_usd'][1]}")

    basis = actuarial.get("basis")
    if basis:
        _add_actuarial_basis(doc, basis)
    
    doc.add_heading('商業邏輯與獲利模式', level=2)
    doc.add_paragraph(proposal.get('business_logic', 'N/A'))
    
    # 儲存檔案
    safe_title = "".join([c for c in proposal.get('product_name', 'Report') if c.isalpha() or c.isdigit() or c==' ']).rstrip()
    if not safe_title:
        safe_title = "Product_Proposal"
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"{timestamp}_{safe_title.replace(' ', '_')}.docx"
    filepath = os.path.join(output_dir, filename)
    doc.save(filepath)

    # 上鏈存證與 audit log 寫入由 main.run_pipeline 負責（見 chain_writer / run_store）。
    logger.info(f"報告已生成並儲存至：{filepath}")
    return filepath
