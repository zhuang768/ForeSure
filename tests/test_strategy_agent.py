import pytest

import strategy_agent


def test_client_honours_base_url_from_env(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "dummy-key")
    monkeypatch.setenv("OPENAI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/")

    client = strategy_agent._make_client()

    assert str(client.base_url).startswith("https://generativelanguage.googleapis.com/v1beta/openai")


def test_parse_choice_index_extracts_valid_index():
    assert strategy_agent._parse_choice_index("[2]", total=5) == 2
    assert strategy_agent._parse_choice_index("索引 0", total=5) == 0


def test_parse_choice_index_rejects_garbage_and_out_of_range():
    assert strategy_agent._parse_choice_index("", total=5) is None
    assert strategy_agent._parse_choice_index("我選第 9 則", total=5) is None


class _FakeCompletions:
    def __init__(self, fail_models):
        self.fail_models = fail_models
        self.calls = []

    def create(self, **kwargs):
        import httpx
        import openai

        self.calls.append(kwargs["model"])
        if kwargs["model"] in self.fail_models:
            response = httpx.Response(429, request=httpx.Request("POST", "http://x"))
            raise openai.RateLimitError("quota", response=response, body=None)
        return {"model": kwargs["model"]}


class _FakeClient:
    def __init__(self, fail_models):
        self.chat = type("Chat", (), {})()
        self.chat.completions = _FakeCompletions(fail_models)


def test_chat_falls_back_to_secondary_model_on_rate_limit(monkeypatch):
    monkeypatch.setenv("OPENAI_MODEL", "primary")
    monkeypatch.setenv("OPENAI_FALLBACK_MODEL", "backup")
    client = _FakeClient(fail_models={"primary"})

    result = strategy_agent._chat(client, messages=[])

    assert result == {"model": "backup"}
    assert client.chat.completions.calls == ["primary", "backup"]


def test_chat_uses_primary_model_when_it_works(monkeypatch):
    monkeypatch.setenv("OPENAI_MODEL", "primary")
    monkeypatch.setenv("OPENAI_FALLBACK_MODEL", "backup")
    client = _FakeClient(fail_models=set())

    assert strategy_agent._chat(client, messages=[]) == {"model": "primary"}
    assert client.chat.completions.calls == ["primary"]


def test_chat_raises_when_both_models_are_rate_limited(monkeypatch):
    import openai

    monkeypatch.setenv("OPENAI_MODEL", "primary")
    monkeypatch.setenv("OPENAI_FALLBACK_MODEL", "backup")
    client = _FakeClient(fail_models={"primary", "backup"})

    with pytest.raises(openai.RateLimitError):
        strategy_agent._chat(client, messages=[])


def test_actuarial_brief_cites_the_source_of_each_figure():
    brief = strategy_agent._actuarial_brief({
        "probability_pct": 51.61, "expected_loss_usd": 14447368.42, "premium_range_usd": [15938709.68, 26564516.13],
        "basis": {"probability_source": "內政部消防署 臺灣地區天然災害損失統計表 1958-2025 (nfa.gov.tw)",
                  "probability_method": "share of years 1995-2025 with at least one severe typhoon",
                  "loss_source": "assumption",
                  "assumed_loss_note": "NT$1,500,000 full-loss benefit at NT$32/USD",
                  "low_sample": True},
    })

    assert "51.61%" in brief and "14447368.42" in brief
    assert "消防署" in brief
    assert "假設" in brief and "NT$1,500,000" in brief
    assert "樣本" in brief          # low_sample warning surfaces to the agents


def test_actuarial_brief_without_basis_only_lists_the_numbers():
    brief = strategy_agent._actuarial_brief(
        {"probability_pct": 1.0, "expected_loss_usd": 10.0, "premium_range_usd": [1, 2]})

    assert "1.0%" in brief
    assert "依據" not in brief
