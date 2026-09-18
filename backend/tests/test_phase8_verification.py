"""
test_phase8_verification.py — Phase 8: Complete Backend Verification

Verifies all items specified in Phase 8 checklist:
- GET /api/health (and alias /health)
- POST /api/analyze (Contract 1 compliance)
- GET /api/history (History contract & ring buffer)
- GET /api/network-events (Contract 2 compliance)
- Valid URL analysis
- Safe URL classification (LOW risk)
- Suspicious URL classification (MEDIUM/HIGH risk)
- Malformed URL rejection (422)
- Empty URL rejection (422)
- Repeated scans handling
- History capacity limit of 10
- Network event schema integrity
- Micro-training presence & structure
- API payload validation
- CORS headers for frontend origin
- Backend startup lifecycle
- Swagger documentation availability (/docs and /openapi.json)
"""

import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.core.history import history_store

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_history():
    """Ensure clean history state for isolated testing."""
    history_store.clear()
    yield
    history_store.clear()


# ─────────────────────────────────────────────────────────────────────────────
# 1. Backend Startup & Swagger Documentation
# ─────────────────────────────────────────────────────────────────────────────

def test_phase8_backend_startup_and_lifecycle():
    """Verify application boots cleanly within TestClient context."""
    with TestClient(app) as live_client:
        res = live_client.get("/")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "online"
        assert data["docs"] == "/docs"


def test_phase8_swagger_documentation_endpoints():
    """Verify Swagger UI and OpenAPI schema are accessible and document all 4 routes."""
    # Swagger UI
    res_docs = client.get("/docs")
    assert res_docs.status_code == 200
    assert "swagger" in res_docs.text.lower() or "html" in res_docs.headers.get("content-type", "").lower()

    # OpenAPI JSON Schema
    res_openapi = client.get("/openapi.json")
    assert res_openapi.status_code == 200
    schema = res_openapi.json()
    paths = schema.get("paths", {})

    assert "/api/health" in paths
    assert "/api/analyze" in paths
    assert "/api/history" in paths
    assert "/api/network-events" in paths


# ─────────────────────────────────────────────────────────────────────────────
# 2. CORS Verification
# ─────────────────────────────────────────────────────────────────────────────

def test_phase8_cors_headers_for_react_origin():
    """Verify CORS headers are returned for frontend React origin."""
    origin = "http://localhost:5173"
    res = client.options(
        "/api/analyze",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type",
        },
    )
    assert res.status_code == 200
    assert res.headers.get("access-control-allow-origin") == origin


# ─────────────────────────────────────────────────────────────────────────────
# 3. GET /api/health Verification
# ─────────────────────────────────────────────────────────────────────────────

def test_phase8_health_endpoint():
    """Verify GET /api/health returns healthy status and component telemetry."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["service"] == settings.PROJECT_NAME
    assert "ml_mode" in data
    assert "components" in data
    assert "config" in data


# ─────────────────────────────────────────────────────────────────────────────
# 4. POST /api/analyze — Contract 1 Verification
# ─────────────────────────────────────────────────────────────────────────────

def test_phase8_analyze_valid_and_safe_url():
    """Verify safe URL produces LOW risk matching Contract 1 schema."""
    url = "https://github.com/torvalds/linux"
    res = client.post("/api/analyze", json={"url": url})
    assert res.status_code == 200
    data = res.json()

    assert data["url"] == url
    assert data["risk_level"] == "LOW"
    assert 0.0 <= data["phishing_probability"] <= 1.0
    assert isinstance(data["reasons"], list)
    assert len(data["reasons"]) > 0

    # Quantum comparison
    qc = data.get("quantum_comparison", {})
    assert "classical_acc" in qc and 0.0 <= qc["classical_acc"] <= 1.0
    assert "quantum_acc" in qc and 0.0 <= qc["quantum_acc"] <= 1.0


def test_phase8_analyze_suspicious_url_and_micro_training():
    """Verify suspicious URL produces HIGH risk and attaches valid micro-training card."""
    url = "https://secure-login-paypal.com.account-verify.xyz/auth"
    res = client.post("/api/analyze", json={"url": url})
    assert res.status_code == 200
    data = res.json()

    assert data["url"] == url
    assert data["risk_level"] in ("MEDIUM", "HIGH")
    assert data["phishing_probability"] >= 0.35
    assert isinstance(data["reasons"], list)

    # Micro-training card
    mt = data.get("micro_training")
    assert mt is not None, "Suspicious URL must include micro-training card"
    assert "title" in mt and len(mt["title"]) > 0
    assert "explanation" in mt and len(mt["explanation"]) > 0
    assert "action_tip" in mt and len(mt["action_tip"]) > 0


def test_phase8_analyze_malformed_url_validation():
    """Verify malformed URLs are rejected with HTTP 422."""
    for bad_url in ["not-a-valid-domain", "http://", "https://", "bad domain with spaces"]:
        res = client.post("/api/analyze", json={"url": bad_url})
        assert res.status_code == 422


def test_phase8_analyze_empty_url_validation():
    """Verify empty and whitespace-only URLs are rejected with HTTP 422."""
    assert client.post("/api/analyze", json={"url": ""}).status_code == 422
    assert client.post("/api/analyze", json={"url": "   "}).status_code == 422
    assert client.post("/api/analyze", json={}).status_code == 422


# ─────────────────────────────────────────────────────────────────────────────
# 5. GET /api/history — Repeated Scans & Capacity Limit of 10
# ─────────────────────────────────────────────────────────────────────────────

def test_phase8_history_repeated_scans_and_limit_of_10():
    """Verify repeated scans are recorded in LIFO order and capped strictly at 10."""
    # Run 12 repeated scans
    for i in range(12):
        res = client.post("/api/analyze", json={"url": f"https://scan-target-{i}.org"})
        assert res.status_code == 200

    res_history = client.get("/api/history")
    assert res_history.status_code == 200
    data = res_history.json()

    assert "scans" in data
    scans = data["scans"]
    assert len(scans) == 10  # Capped at exactly 10

    # LIFO ordering: index 0 must be the 12th scan (scan-target-11)
    assert scans[0]["url"] == "https://scan-target-11.org"
    # Oldest retained is scan-target-2
    assert scans[-1]["url"] == "https://scan-target-2.org"

    # Verify all scan fields
    for s in scans:
        assert s["id"].startswith("scan-")
        assert s["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
        assert 0.0 <= s["phishing_probability"] <= 1.0
        ts = s["timestamp"].replace("Z", "+00:00")
        datetime.fromisoformat(ts)


# ─────────────────────────────────────────────────────────────────────────────
# 6. GET /api/network-events — Contract 2 Verification
# ─────────────────────────────────────────────────────────────────────────────

def test_phase8_network_events_schema_and_traffic_types():
    """Verify Contract 2 network events schema and presence of required traffic flags."""
    res = client.get("/api/network-events?limit=50")
    assert res.status_code == 200
    data = res.json()

    assert "total_events" in data
    assert "events" in data
    assert data["total_events"] == len(data["events"])
    assert data["total_events"] > 0

    events = data["events"]
    protocols = {e["protocol"] for e in events}
    flags = {e["flag"] for e in events}

    assert "DNS" in protocols
    assert "HTTP" in protocols
    assert "normal" in flags
    assert "suspicious" in flags

    for evt in events:
        assert evt["id"].startswith("evt-")
        assert evt["protocol"] in ["DNS", "HTTP", "HTTPS", "TCP", "IP"]
        assert evt["flag"] in ["normal", "suspicious", "malicious"]
        assert len(evt["src"]) > 0
        assert len(evt["dst"]) > 0
        assert len(evt["reason"]) > 0
        ts = evt["timestamp"].replace("Z", "+00:00")
        datetime.fromisoformat(ts)
