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
