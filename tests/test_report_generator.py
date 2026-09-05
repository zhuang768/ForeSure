from docx import Document

from report_generator import generate_report

PROPOSAL = {"product_name": "颱風參數險", "target_audience": "t", "market_gap": "g",
            "coverage_details": "c", "exclusions": "e", "business_logic": "b"}
PROPOSAL_EN = {"product_name_en": "Typhoon Parametric Cover", "target_audience_en": "audience-en",
               "market_gap_en": "gap-en", "coverage_details_en": "coverage-en",
               "exclusions_en": "exclusions-en", "business_logic_en": "logic-en"}
BASIS = {
    "peril": "typhoon",
    "probability_source": "內政部消防署 臺灣地區天然災害損失統計表 1958-2025 (https://www.nfa.gov.tw/cht/index.php?code=list&ids=233)",
    "probability_source_en": "National Fire Agency, Ministry of the Interior: Natural Disaster Loss Statistics for Taiwan 1958-2025",
    "probability_method": "share of years 1995-2025 with at least one typhoon event destroying >= 50 households (full + half)",
    "annual_frequency": 0.6129, "low_sample": False,
    "loss_source": "assumption",
    "loss_method": "mean households destroyed per severe event x assumed loss per household",
    "assumed_loss_per_household_usd": 46875.0,
    "assumed_loss_note": "NT$1,500,000 full-loss benefit of the residential earthquake basic insurance, at NT$32/USD",
    "premium_method": "annual expected loss (annual frequency x loss per event) x markup",
}
ACTUARIAL = {"probability_pct": 51.61, "expected_loss_usd": 14447368.42,
             "premium_range_usd": [15938709.68, 26564516.13], "basis": BASIS}


def _text_of(path):
    return "\n".join(p.text for p in Document(path).paragraphs)


def test_report_lists_the_basis_of_each_actuarial_figure(tmp_path):
    data = {"proposal": PROPOSAL, "source_news": "n", "news_summary": "s", "actuarial_data": ACTUARIAL}

    text = _text_of(generate_report(data, output_dir=str(tmp_path)))

    assert "51.61%" in text
    assert "消防署" in text and "nfa.gov.tw" in text
    assert "假設" in text and "46875" in text


def test_report_without_basis_still_renders(tmp_path):
    data = {"proposal": PROPOSAL, "source_news": "n", "news_summary": "s",
            "actuarial_data": {"probability_pct": 4.57, "expected_loss_usd": 41839.45,
                               "premium_range_usd": [3495.69, 5825.49]}}

    text = _text_of(generate_report(data, output_dir=str(tmp_path)))

    assert "4.57%" in text
    assert "依據" not in text


def test_report_headings_and_labels_are_bilingual(tmp_path):
    data = {"proposal": PROPOSAL, "source_news": "n", "news_summary": "s", "actuarial_data": ACTUARIAL}

    text = _text_of(generate_report(data, output_dir=str(tmp_path)))

    for zh, en in [("創新保險商品開發提案書", "Innovative Insurance Product Proposal"),
                   ("市場缺口", "Market Gap"), ("目標客群", "Target Audience"),
                   ("除外不保事項", "Exclusions"), ("預估風險發生機率", "Estimated probability"),
                   ("建議保費定價區間", "Suggested premium range"), ("數據依據", "Basis"),
                   ("發生機率依據", "Probability source"), ("保費計算", "Premium method")]:
        assert zh in text, zh
        assert en in text, en
    assert "National Fire Agency" in text   # English name of the statistics source


def test_report_renders_english_version_of_every_proposal_field(tmp_path):
    data = {"proposal": {**PROPOSAL, **PROPOSAL_EN}, "source_news": "n", "news_summary": "s",
            "actuarial_data": ACTUARIAL}

    path = generate_report(data, output_dir=str(tmp_path))
    text = _text_of(path)

    for value in PROPOSAL.values():
        assert value in text
    for value in PROPOSAL_EN.values():
        assert value in text
    assert "Typhoon_Parametric_Cover" in path       # English name lands in the filename too
    assert "English version not provided" not in text


def test_report_flags_missing_english_instead_of_failing(tmp_path):
    data = {"proposal": PROPOSAL, "source_news": "n", "news_summary": "s", "actuarial_data": ACTUARIAL}

    text = _text_of(generate_report(data, output_dir=str(tmp_path)))

    assert "English version not provided" in text


def test_low_sample_warning_is_bilingual(tmp_path):
    data = {"proposal": PROPOSAL, "source_news": "n", "news_summary": "s",
            "actuarial_data": {**ACTUARIAL, "basis": {**BASIS, "low_sample": True}}}

    text = _text_of(generate_report(data, output_dir=str(tmp_path)))

    assert "樣本少於 5 筆" in text and "Fewer than 5 severe events" in text


def test_error_report_is_bilingual(tmp_path):
    text = _text_of(generate_report({"error": "boom"}, output_dir=str(tmp_path)))

    assert "無法生成完整報告" in text and "could not be generated" in text and "boom" in text
