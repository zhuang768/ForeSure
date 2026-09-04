import chain_writer


def _force_mock(monkeypatch):
    monkeypatch.setattr(chain_writer, "use_fallback", True)
    monkeypatch.setattr(chain_writer.time, "sleep", lambda _s: None)


def test_mock_mode_never_fabricates_explorer_link(monkeypatch):
    _force_mock(monkeypatch)

    result = chain_writer.record_decision_on_chain("atlas-test-1", {"a": 1})

    assert result["is_mock"] is True
    assert result["etherscan_url"] is None
    assert result["tx_hash"] is None


def test_audit_wrapper_labels_mock_network_honestly(monkeypatch):
    _force_mock(monkeypatch)

    receipt = chain_writer.audit_proposal_on_chain(
        {"proposal": {"product_name": "X", "market_gap": "Y"}, "actuarial_data": {}}
    )

    assert receipt["is_mock"] is True
    assert receipt["verification_url"] is None
    assert "Sepolia" not in receipt["network"]
