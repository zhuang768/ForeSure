import main

NEWS = [{"title": "n1", "summary": "s1", "link": "https://x", "is_mock": False}]
ACTUARIAL = {"probability_pct": 1.0, "expected_loss_usd": 10.0, "premium_range_usd": [1, 2], "markup_multiplier": [1, 2]}
RECEIPT = {
    "decision_id": "atlas-1", "payload": {"decision_id": "atlas-1"}, "data_hash": "ab",
    "blockchain_tx_hash": None, "block_number": None, "verification_url": None,
    "network": "本地模擬（未上鏈）", "is_mock": True, "timestamp": "t",
}


def _fake_proposal(news, gap, actuarial, on_stage=None):
    on_stage("pm", "PM 說")
    on_stage("underwriter", "核保說")
    on_stage("actuary", "精算說")
    return {
        "source_news": news["title"], "news_summary": news["summary"], "news_link": news["link"],
        "actuarial_data": actuarial, "debate": {"pm": "PM 說", "underwriter": "核保說"},
        "proposal": {"product_name": "X", "target_audience": "t", "market_gap": "g",
                     "coverage_details": "c", "exclusions": "e", "business_logic": "b"},
        "is_mock": False, "model": "fake",
    }


def _wire_fakes(monkeypatch, saved):
    monkeypatch.setattr(main, "fetch_trending_news", lambda limit=5: NEWS)
    monkeypatch.setattr(main, "select_best_news", lambda items: items[0])
    monkeypatch.setattr(main, "find_market_gap", lambda n: {
        "news": n, "matched_products": [{"id": "INS-016", "name": "農業保險", "category": "Property",
                                          "description": "d", "distance": 0.3}],
        "kb_context": "", "gap_analysis_prompt": "p"})
    monkeypatch.setattr(main, "estimate_risk_premium", lambda s, g: ACTUARIAL)
    monkeypatch.setattr(main, "generate_product_proposal", _fake_proposal)
    monkeypatch.setattr(main, "generate_report", lambda pd: "reports/x.docx")
    monkeypatch.setattr(main, "audit_proposal_on_chain", lambda pd: RECEIPT)
    monkeypatch.setattr(main, "save_run", lambda rec: saved.append(rec))


def test_run_pipeline_emits_stages_in_order_and_persists(monkeypatch):
    saved, events = [], []
    _wire_fakes(monkeypatch, saved)

    record = main.run_pipeline(emit=lambda stage, data: events.append(stage))

    assert events == [
        "news_fetched", "news_selected", "kb_matched", "actuarial",
        "pm", "underwriter", "actuary", "report", "chain_pending", "chain_done", "done",
    ]
    assert record["decision_id"] == "atlas-1"
    assert record["matched_products"][0]["name"] == "農業保險"
    assert record["blockchain_receipt"]["is_mock"] is True
    assert saved == [record]


def test_run_pipeline_works_without_emit_callback(monkeypatch):
    saved = []
    _wire_fakes(monkeypatch, saved)

    record = main.run_pipeline()

    assert record["report_path"] == "reports/x.docx"
