import os
import logging
from datetime import datetime
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

logger = logging.getLogger(__name__)

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
    
    # 進行區塊鏈存證 (Trustworthy AI Audit)
    from chain_writer import audit_proposal_on_chain
    blockchain_receipt = audit_proposal_on_chain(proposal_data)
    
    # 寫入 Audit Log
    import json
    audit_log_path = os.path.join(output_dir, "audit_log.json")
    audit_record = {
        "timestamp": timestamp,
        "filename": filename,
        "blockchain_receipt": blockchain_receipt,
        "proposal_data": proposal_data
    }
    
    try:
        logs = []
        if os.path.exists(audit_log_path):
            with open(audit_log_path, "r", encoding="utf-8") as f:
                logs = json.load(f)
        logs.append(audit_record)
        with open(audit_log_path, "w", encoding="utf-8") as f:
            json.dump(logs, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.error(f"寫入 Audit Log 失敗: {e}")
    
    logger.info(f"報告已生成並儲存至：{filepath}")
    return filepath
