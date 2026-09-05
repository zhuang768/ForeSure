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
