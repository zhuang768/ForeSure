from docx import Document

from report_generator import generate_report

PROPOSAL = {"product_name": "颱風參數險", "target_audience": "t", "market_gap": "g",
            "coverage_details": "c", "exclusions": "e", "business_logic": "b"}
BASIS = {
    "peril": "typhoon",
    "probability_source": "內政部消防署 臺灣地區天然災害損失統計表 1958-2025 (https://www.nfa.gov.tw/cht/index.php?code=list&ids=233)",
    "probability_method": "share of years 1995-2025 with at least one typhoon event destroying >= 50 households (full + half)",
    "annual_frequency": 0.6129, "low_sample": False,
    "loss_source": "assumption",
    "loss_method": "mean households destroyed per severe event x assumed loss per household",
    "assumed_loss_per_household_usd": 46875.0,
    "assumed_loss_note": "NT$1,500,000 full-loss benefit of the residential earthquake basic insurance, at NT$32/USD",
    "premium_method": "annual expected loss (annual frequency x loss per event) x markup",
}


def _text_of(path):
    return "\n".join(p.text for p in Document(path).paragraphs)


def test_report_lists_the_basis_of_each_actuarial_figure(tmp_path):
    data = {"proposal": PROPOSAL, "source_news": "n", "news_summary": "s",
            "actuarial_data": {"probability_pct": 51.61, "expected_loss_usd": 14447368.42,
                               "premium_range_usd": [15938709.68, 26564516.13], "basis": BASIS}}

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
