import grounding_check as gc

ACTUARIAL = {
    "probability_pct": 51.61,
    "expected_loss_usd": 14447368.42,
    "premium_range_usd": [15938709.68, 26564516.13],
    "markup_multiplier": [1.8, 3.0],
    "basis": {
        "peril": "typhoon",
        "probability_source": "內政部消防署 臺灣地區天然災害損失統計表 1958-2025 (https://www.nfa.gov.tw/cht/index.php?code=list&ids=233)",
        "probability_source_en": "National Fire Agency, Ministry of the Interior: Natural Disaster Loss Statistics for Taiwan 1958-2025",
        "loss_source": "assumption",
        "annual_frequency": 0.6129,
        "years_observed": 31,
        "events_observed": 151,
        "severe_events_observed": 19,
        "mean_households_per_severe_event": 308.21,
        "assumed_loss_per_household_usd": 46875.0,
    },
}
NEWS = {"title": "颱風重創南部 逾3000戶淹水", "summary": "農損初估8億元", "source": "測試報"}
PRODUCTS = [{"id": "INS-016", "name": "農業保險", "category": "Property",
             "description": "承保颱風造成之農作物損失，最高保額 500 萬", "distance": 0.3}]


def _proposal(**overrides):
    fields = {
        "product_name": "颱風參數險",
        "target_audience": "南部農漁業",
        "market_gap": "現有商品需人工勘損。",
        "coverage_details": "1. 降雨量連續 3 日超過 500mm 自動理賠 100萬。",
        "exclusions": "1. 人為蓄意破壞。",
        "business_logic": "依據精算引擎，年發生機率約 51.6%，單次損失約 1,444 萬美元，屬假設值。",
    }
    fields.update(overrides)
    return {"proposal": fields, "actuarial_data": ACTUARIAL}


def _check(**overrides):
    return gc.check_grounding(_proposal(**overrides), NEWS, PRODUCTS)


def test_numbers_matching_the_actuarial_engine_are_grounded():
    result = _check()
    assert result["status"] == "pass"
    assert result["checked_claims"] == 2 and result["grounded_claims"] == 2
    assert result["flags"] == []


def test_percent_claim_matches_a_fraction_in_the_basis():
    result = _check(business_logic="嚴重颱風年頻率約 61%，屬假設值。")
    assert result["status"] == "pass"
    assert result["grounded_claims"] == 1


def test_unsupported_number_in_business_logic_fails():
    result = _check(business_logic="透過再保險分散風險，保費利潤率預期可達 35%，其餘屬假設值。")
    assert result["status"] == "fail"
    assert result["flag_count"] == 1
    flag = result["flags"][0]
    assert flag["type"] == "unsupported_number" and flag["severity"] == "high"
    assert flag["field"] == "business_logic" and flag["value"] == "35%"
    assert "35%" in flag["excerpt"]


def test_numbers_from_news_and_matched_products_count_as_evidence():
    result = _check(market_gap="新聞指出逾3000戶淹水、農損 8億元；既有農業保險最高保額 500 萬，不足以覆蓋。")
    assert result["status"] == "pass"
    # 3 numbers here (news x2, matched product x1) plus the 2 in the default business_logic
    assert result["checked_claims"] == 5 and result["grounded_claims"] == 5


def test_design_parameters_in_coverage_and_exclusions_are_not_checked():
    result = _check(coverage_details="每日補償 5000 美金，最高 250,000 美金。", exclusions="投保後 30 天內之事故。")
    assert result["status"] == "pass"
    assert result["checked_claims"] == 2  # only the two numbers in the default business_logic


def test_list_markers_years_and_unit_counts_are_ignored():
    result = _check(market_gap="1. 2025 年起需 24 小時內出險\n2. 等待期 60 天\n3. 三個月內")
    assert result["status"] == "pass"
    assert result["checked_claims"] == 2  # still only the default business_logic numbers


def test_fabricated_citation_fails():
    result = _check(market_gap="根據世界銀行統計，農損逐年上升。")
    assert result["status"] == "fail"
    flag = result["flags"][0]
    assert flag["type"] == "unverified_citation" and flag["value"] == "世界銀行"
    assert flag["field"] == "market_gap"


def test_citation_of_a_real_source_passes():
    result = _check(market_gap="根據內政部消防署統計，嚴重颱風每年約 0.61 次。")
    assert result["status"] == "pass"
    assert result["flags"] == []


def test_missing_disclosure_warns_when_figures_rest_on_assumptions():
    result = _check(business_logic="年發生機率約 51.6%，單次損失約 1,444 萬美元。")
    assert result["status"] == "warn"
    assert [f["type"] for f in result["flags"]] == ["missing_disclosure"]
    assert result["flags"][0]["severity"] == "medium"


def test_legacy_actuarial_without_basis_is_not_asked_to_disclose():
    data = _proposal(business_logic="年發生機率約 51.6%。")
    data["actuarial_data"] = {"probability_pct": 51.61, "expected_loss_usd": 1.0, "premium_range_usd": [1, 2]}
    result = gc.check_grounding(data, NEWS, PRODUCTS)
    assert result["status"] == "pass"


def test_missing_news_and_products_are_tolerated():
    result = gc.check_grounding(_proposal(), None, None)
    assert result["status"] == "pass"
    assert result["evidence_sources"] == ["actuarial_engine"]


def test_result_is_deterministic_and_versioned():
    assert _check() == _check()
    result = _check()
    assert result["checker_version"] == gc.CHECKER_VERSION == "grounding-check/v1"
    assert result["evidence_sources"] == ["actuarial_engine", "news", "matched_products"]


def test_extract_numbers_handles_separators_scales_and_percent():
    values = [v for v, _ in gc.extract_numbers("損失 1,444 萬美元、機率 51.6%、農損 8億元、預算 14.4M")]
    assert values == [14_440_000.0, 51.6, 800_000_000.0, 14_400_000.0]


def test_unit_skip_survives_trailing_punctuation_and_no_space():
    assert gc.extract_numbers("本商品最多理賠12次。") == []
    assert gc.extract_numbers("保單有效期間內申請理賠 10次以內免審核。") == []
    assert gc.extract_numbers("需 24 小時內出險") == []
