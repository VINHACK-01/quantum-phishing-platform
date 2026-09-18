"""
test_phishing.py — Phase 3: Mock Phishing Detection tests

Covers:
 1. safe URL
 2. suspicious URL
 3. highly suspicious URL
 4. malformed URL → 422 from Pydantic validation
 5. empty URL    → 422 from Pydantic validation
 6. Contract 1 field completeness
 7. risk classification thresholds
 8. ml_adapter layer isolation (MockPredictor tested directly)
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.ml_adapter import (
    MockPredictor,
    classify_risk,
    RISK_THRESHOLD_HIGH,
    RISK_THRESHOLD_MEDIUM,
)

client = TestClient(app)

# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def post_analyze(url: str):
    return client.post("/api/analyze", json={"url": url})


# ──────────────────────────────────────────────
# 1. Safe URL
# ──────────────────────────────────────────────

def test_safe_url():
    res = post_analyze("https://github.com")
    assert res.status_code == 200
    data = res.json()
    assert data["risk_level"] == "LOW"
    assert data["phishing_probability"] < RISK_THRESHOLD_MEDIUM
    assert isinstance(data["reasons"], list)
    assert len(data["reasons"]) >= 1
    # LOW risk → no micro-training card required
    # (micro_training may be None or absent for LOW)
    if data.get("micro_training") is not None:
        assert "title" in data["micro_training"]


# ──────────────────────────────────────────────
# 2. Suspicious URL
# ──────────────────────────────────────────────

def test_suspicious_url():
    # Has a security keyword and an uncommon TLD
    res = post_analyze("http://secure-login-portal.xyz/auth")
    assert res.status_code == 200
    data = res.json()
    assert data["risk_level"] in ("MEDIUM", "HIGH")
    assert data["phishing_probability"] >= RISK_THRESHOLD_MEDIUM
    assert len(data["reasons"]) >= 1


# ──────────────────────────────────────────────
# 3. Highly suspicious URL
# ──────────────────────────────────────────────

def test_highly_suspicious_url():
    # Contains: brand-in-subdomain, suspicious TLD, multiple security keywords, long URL
    res = post_analyze(
        "http://paypal.com.secure-verify-account-update-login.xyz/auth/signin/confirm"
    )
    assert res.status_code == 200
    data = res.json()
    assert data["risk_level"] == "HIGH"
    assert data["phishing_probability"] >= RISK_THRESHOLD_HIGH
    assert len(data["reasons"]) >= 2
    # HIGH risk must include a micro-training card
    assert data["micro_training"] is not None
    assert "title" in data["micro_training"]
    assert "explanation" in data["micro_training"]
    assert "action_tip" in data["micro_training"]


# ──────────────────────────────────────────────
# 4. Malformed URL
# ──────────────────────────────────────────────

def test_malformed_url():
    # No host component at all — validator must reject it
    res = post_analyze("not-a-url-at-all")
    assert res.status_code == 422


def test_url_with_spaces():
    res = post_analyze("https://bad url with spaces.com")
    assert res.status_code == 422


# ──────────────────────────────────────────────
# 5. Empty URL
# ──────────────────────────────────────────────

def test_empty_url_string():
    res = post_analyze("")
    assert res.status_code == 422


def test_whitespace_only_url():
    res = post_analyze("   ")
    assert res.status_code == 422


def test_missing_url_field():
    res = client.post("/api/analyze", json={})
    assert res.status_code == 422


# ──────────────────────────────────────────────
# 6. Contract 1 field completeness
# ──────────────────────────────────────────────

def test_contract_1_all_fields_present():
    res = post_analyze("https://secure-login-paypal.com.account-verify.xyz/auth")
    assert res.status_code == 200
    data = res.json()

    required_top = {"url", "phishing_probability", "risk_level", "reasons", "quantum_comparison"}
    assert required_top.issubset(data.keys()), f"Missing fields: {required_top - data.keys()}"

    qc = data["quantum_comparison"]
    assert "classical_acc" in qc
    assert "quantum_acc" in qc
    assert isinstance(qc["classical_acc"], float)
    assert isinstance(qc["quantum_acc"], float)
    assert 0.0 <= qc["classical_acc"] <= 1.0
    assert 0.0 <= qc["quantum_acc"] <= 1.0

    assert 0.0 <= data["phishing_probability"] <= 1.0
    assert data["risk_level"] in ("LOW", "MEDIUM", "HIGH")
    assert isinstance(data["reasons"], list)
    assert data["url"] == "https://secure-login-paypal.com.account-verify.xyz/auth"


# ──────────────────────────────────────────────
# 7. Risk classification thresholds — unit level
# ──────────────────────────────────────────────

def test_classify_risk_thresholds():
    assert classify_risk(0.00) == "LOW"
    assert classify_risk(RISK_THRESHOLD_MEDIUM - 0.01) == "LOW"
    assert classify_risk(RISK_THRESHOLD_MEDIUM) == "MEDIUM"
    assert classify_risk(RISK_THRESHOLD_HIGH - 0.01) == "MEDIUM"
    assert classify_risk(RISK_THRESHOLD_HIGH) == "HIGH"
    assert classify_risk(1.00) == "HIGH"


# ──────────────────────────────────────────────
# 8. MockPredictor — adapter isolation (no HTTP)
# ──────────────────────────────────────────────

def test_mock_predictor_safe_domain():
    mock = MockPredictor()
    prob, risk, reasons = mock.predict("https://github.com")
    assert isinstance(prob, float)
    assert 0.0 <= prob <= 1.0
    assert risk == "LOW"
    assert len(reasons) >= 1


def test_mock_predictor_high_risk():
    mock = MockPredictor()
    prob, risk, reasons = mock.predict(
        "http://paypal.com.secure-verify-account.xyz/login/confirm"
    )
    assert risk == "HIGH"
    assert prob >= RISK_THRESHOLD_HIGH
    assert len(reasons) >= 2


def test_mock_predictor_ip_url():
    mock = MockPredictor()
    prob, risk, reasons = mock.predict("http://192.168.1.1/login")
    assert risk in ("MEDIUM", "HIGH")
    assert any("IP" in r or "ip" in r.lower() for r in reasons)


def test_mock_predictor_is_deterministic():
    mock = MockPredictor()
    url = "https://secure-login-paypal.com.account-verify.xyz/auth"
    r1 = mock.predict(url)
    r2 = mock.predict(url)
    assert r1 == r2  # same URL must always produce the same output
