import pytest
from datetime import datetime
from fastapi.testclient import TestClient
import os
import sys

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["ml_mode"] == "mock_predictor"
    
    # Root alias
    response_root = client.get("/health")
    assert response_root.status_code == 200
    assert response_root.json()["status"] == "healthy"

# =========================================================================
# Phase 3 Required Tests: Mock Phishing Detection (1 through 5)
# =========================================================================

def test_mock_phishing_1_safe_url():
    """Test 1: Safe URL produces LOW risk with clean lexical profile."""
    res = client.post("/api/analyze", json={"url": "https://google.com"})
    assert res.status_code == 200
    data = res.json()
    assert data["url"] == "https://google.com"
    assert data["risk_level"] == "LOW"
    assert 0.0 <= data["phishing_probability"] < 0.35
    assert len(data["reasons"]) > 0
    assert "quantum_comparison" in data
    assert 0.0 <= data["quantum_comparison"]["classical_acc"] <= 1.0
    assert 0.0 <= data["quantum_comparison"]["quantum_acc"] <= 1.0

def test_mock_phishing_2_suspicious_url():
    """Test 2: Suspicious URL produces MEDIUM risk with explainable reasons."""
    res = client.post("/api/analyze", json={"url": "https://account-verify-portal.net/settings/update"})
    assert res.status_code == 200
    data = res.json()
    assert data["url"] == "https://account-verify-portal.net/settings/update"
    assert data["risk_level"] == "MEDIUM"
    assert 0.35 <= data["phishing_probability"] < 0.70
    assert len(data["reasons"]) >= 1

def test_mock_phishing_3_highly_suspicious_url():
    """Test 3: Highly suspicious URL produces HIGH risk with explainable reasons and micro-training."""
    url = "https://secure-login-paypal.com.account-verify.xyz/auth"
    res = client.post("/api/analyze", json={"url": url})
    assert res.status_code == 200
    data = res.json()
    assert data["url"] == url
    assert data["risk_level"] == "HIGH"
    assert data["phishing_probability"] >= 0.70
    assert len(data["reasons"]) >= 2
    assert "quantum_comparison" in data
    
    # Micro-training awareness card must be present for HIGH risk
    assert data["micro_training"] is not None
    assert "title" in data["micro_training"]
    assert "explanation" in data["micro_training"]
    assert "action_tip" in data["micro_training"]

def test_mock_phishing_4_malformed_url():
    """Test 4: Malformed URLs are rejected with HTTP 422."""
    malformed_cases = [
        "not a valid url with spaces",
        "missingdomainname",
        "http://",
        "https://"
    ]
    for bad_url in malformed_cases:
        res = client.post("/api/analyze", json={"url": bad_url})
        assert res.status_code == 422, f"Expected 422 for malformed URL '{bad_url}'"

def test_mock_phishing_5_empty_url():
    """Test 5: Empty, whitespace-only, and missing URL payloads are rejected with HTTP 422."""
    assert client.post("/api/analyze", json={"url": ""}).status_code == 422
    assert client.post("/api/analyze", json={"url": "   "}).status_code == 422
    assert client.post("/api/analyze", json={}).status_code == 422

# =========================================================================
# Additional Contract 2 & History Tests
# =========================================================================

def test_network_events_contract_2():
    response = client.get("/api/network-events?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "total_events" in data
    assert "events" in data
    assert isinstance(data["events"], list)
    assert len(data["events"]) > 0
    assert data["total_events"] == len(data["events"])
    
    for event in data["events"]:
        assert "id" in event and event["id"]
        assert "timestamp" in event
        # Verify ISO 8601 UTC timestamp format
        ts = event["timestamp"].replace("Z", "+00:00")
        datetime.fromisoformat(ts)
        assert "protocol" in event and event["protocol"]
        assert "src" in event and event["src"]
        assert "dst" in event and event["dst"]
        assert event["flag"] in ["suspicious", "malicious", "normal"]
        assert "reason" in event and event["reason"]

def test_scan_history():
    response = client.get("/api/history")
    assert response.status_code == 200
    data = response.json()
    assert "scans" in data
    assert isinstance(data["scans"], list)
    assert len(data["scans"]) <= 10
    
    for item in data["scans"]:
        assert "id" in item and item["id"]
        assert "url" in item and item["url"]
        assert item["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
        assert 0.0 <= item["phishing_probability"] <= 1.0
        assert "timestamp" in item
        ts = item["timestamp"].replace("Z", "+00:00")
        datetime.fromisoformat(ts)

def test_openapi_swagger_schema():
    schema = app.openapi()
    assert "/api/analyze" in schema["paths"]
    assert "/api/network-events" in schema["paths"]
    assert "/api/history" in schema["paths"]
    assert "/api/health" in schema["paths"]
    
    analyze_schema = schema["components"]["schemas"]["AnalyzeResponse"]
    assert "phishing_probability" in analyze_schema["properties"]
    assert "risk_level" in analyze_schema["properties"]
    assert "quantum_comparison" in analyze_schema["properties"]
    assert "micro_training" in analyze_schema["properties"]
