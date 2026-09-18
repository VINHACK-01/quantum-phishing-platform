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
    
    # Root alias
    response_root = client.get("/health")
    assert response_root.status_code == 200
    assert response_root.json()["status"] == "healthy"

def test_analyze_invalid_payload_rejections():
    # Empty body
    assert client.post("/api/analyze", json={}).status_code == 422
    # Empty string
    assert client.post("/api/analyze", json={"url": ""}).status_code == 422
    # Whitespace only
    assert client.post("/api/analyze", json={"url": "    "}).status_code == 422
    # Internal spaces
    assert client.post("/api/analyze", json={"url": "https://bad url with spaces.com"}).status_code == 422
    # Missing domain / invalid host
    assert client.post("/api/analyze", json={"url": "notadomain"}).status_code == 422

def test_analyze_valid_url_formats():
    valid_urls = [
        "https://secure-login-paypal.com.account-verify.xyz/auth",
        "http://192.168.1.1/login",
        "google.com",
        "https://github.com/features"
    ]
    for url in valid_urls:
        res = client.post("/api/analyze", json={"url": url})
        assert res.status_code == 200, f"Failed on valid URL: {url}"
        assert res.json()["url"] == url

def test_analyze_contract_1_phishing():
    payload = {
        "url": "https://secure-login-paypaI.auth-security-update.com/login"
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    # Contract 1 verification
    assert "url" in data
    assert "phishing_probability" in data
    assert "risk_level" in data
    assert "reasons" in data
    assert "quantum_comparison" in data
    
    assert data["url"] == payload["url"]
    assert 0.0 <= data["phishing_probability"] <= 1.0
    assert data["risk_level"] in ["HIGH", "MEDIUM", "LOW"]
    assert isinstance(data["reasons"], list)
    assert len(data["reasons"]) > 0
    assert "classical_acc" in data["quantum_comparison"]
    assert "quantum_acc" in data["quantum_comparison"]
    assert 0.0 <= data["quantum_comparison"]["classical_acc"] <= 1.0
    assert 0.0 <= data["quantum_comparison"]["quantum_acc"] <= 1.0
    
    # Micro-training verification (Feature 5)
    if data["risk_level"] in ["HIGH", "MEDIUM"]:
        assert "micro_training" in data
        assert data["micro_training"] is not None
        assert "title" in data["micro_training"]
        assert "explanation" in data["micro_training"]
        assert "action_tip" in data["micro_training"]

def test_analyze_contract_1_legitimate():
    payload = {
        "url": "https://google.com"
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "LOW"
    assert 0.0 <= data["phishing_probability"] < 0.35

def test_network_events_contract_2():
    response = client.get("/api/network-events?limit=10")
    assert response.status_code == 200
    data = response.json()
    
    # Contract 2 verification
    assert "total_events" in data
    assert "events" in data
    assert isinstance(data["events"], list)
    assert len(data["events"]) > 0
    assert data["total_events"] == len(data["events"])
    
    for event in data["events"]:
        assert "id" in event and event["id"]
        assert "timestamp" in event
        # Verify ISO 8601 timestamp parsing
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

def test_openapi_schema_matches_contracts():
    schema = app.openapi()
    components = schema.get("components", {}).get("schemas", {})
    
    # Verify AnalyzeResponse schema
    assert "AnalyzeResponse" in components
    resp_props = components["AnalyzeResponse"]["properties"]
    assert "phishing_probability" in resp_props
    assert "risk_level" in resp_props
    assert "quantum_comparison" in resp_props
    assert "reasons" in resp_props
    assert "micro_training" in resp_props
    
    # Verify NetworkEvent schema
    assert "NetworkEvent" in components
    event_props = components["NetworkEvent"]["properties"]
    assert "timestamp" in event_props
    assert "protocol" in event_props
    assert "src" in event_props
    assert "dst" in event_props
    assert "flag" in event_props
    assert "reason" in event_props
