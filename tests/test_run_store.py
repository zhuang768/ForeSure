import run_store


def test_summarize_falls_back_to_receipt_decision_id_for_legacy_records():
    legacy = {
        "timestamp": "20260905_021125",
        "proposal_data": {"proposal": {"product_name": "舊格式商品"}, "is_mock": False},
        "blockchain_receipt": {"decision_id": "atlas-legacy-1", "is_mock": True},
    }

    summary = run_store.summarize(legacy)

    assert summary["decision_id"] == "atlas-legacy-1"
    assert summary["product_name"] == "舊格式商品"


def test_get_run_matches_legacy_record_by_receipt_decision_id(tmp_path, monkeypatch):
    monkeypatch.setattr(run_store, "AUDIT_LOG_PATH", str(tmp_path / "audit_log.json"))
    run_store.save_run({"proposal_data": {}, "blockchain_receipt": {"decision_id": "atlas-legacy-2"}})

    assert run_store.get_run("atlas-legacy-2") is not None
