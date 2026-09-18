import pytest
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

def test_analyze_invalid_payload():
    response = client.post("/api/analyze", json={})
    assert response.status_code == 422

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
    assert isinstance(data["quantum_comparison"]["classical_acc"], float)
    assert isinstance(data["quantum_comparison"]["quantum_acc"], float)
    
    # Micro training verification (Feature 5)
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
    assert data["phishing_probability"] < 0.35

def test_network_events_contract_2():
    response = client.get("/api/network-events?limit=10")
    assert response.status_code == 200
    data = response.json()
    
    # Contract 2 verification
    assert "events" in data
    assert isinstance(data["events"], list)
    assert len(data["events"]) > 0
    
    first_event = data["events"][0]
    assert "timestamp" in first_event
    assert "protocol" in first_event
    assert "src" in first_event
    assert "dst" in first_event
    assert "flag" in first_event
    assert "reason" in first_event

def test_scan_history():
    response = client.get("/api/history")
    assert response.status_code == 200
    data = response.json()
    assert "scans" in data
    assert isinstance(data["scans"], list)
    assert len(data["scans"]) <= 10

def test_quantum_stats():
    response = client.get("/api/quantum-stats")
    assert response.status_code == 200
    data = response.json()
    assert "classical_acc" in data
    assert "quantum_acc" in data
    assert "qubits_used" in data
    assert "ansatz" in data
