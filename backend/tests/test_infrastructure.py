"""
test_infrastructure.py — Phase 7: Backend Infrastructure Hardening Tests

Covers:
1. CORS configuration & headers for local React development (http://localhost:5173)
2. Centralized configuration values (frontend origin, risk thresholds, model/pcap paths, service flags)
3. Clean JSON error handling (no stack traces leaked) for:
   - Malformed URL / invalid payload (422)
   - Invalid request body
   - ML service unavailable (503)
   - Network service unavailable (503)
   - Unhandled internal server error (500)
4. Comprehensive health check endpoint (GET /api/health and GET /health)
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.core.errors import (
    MLServiceUnavailableError,
    NetworkServiceUnavailableError,
    SentinelAIException,
)

client = TestClient(app, raise_server_exceptions=False)


# ─────────────────────────────────────────────────────────────────────────────
# 1. CORS Verification
# ─────────────────────────────────────────────────────────────────────────────

def test_cors_preflight_for_react_dev_origin():
    """Verify OPTIONS preflight request from local React development server origin."""
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
    }
    response = client.options("/api/analyze", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_cors_headers_on_actual_request():
    """Verify Access-Control-Allow-Origin header is present on actual API requests."""
    headers = {"Origin": "http://localhost:5173"}
    response = client.get("/api/health", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


# ─────────────────────────────────────────────────────────────────────────────
# 2. Centralized Configuration Verification
# ─────────────────────────────────────────────────────────────────────────────

def test_centralized_configuration_values():
    """Verify all centralized settings exist, have valid types, and sane defaults."""
    # Frontend origin
    assert isinstance(settings.FRONTEND_ORIGIN, str)
    assert "localhost" in settings.FRONTEND_ORIGIN or "127.0.0.1" in settings.FRONTEND_ORIGIN
    assert "http://localhost:5173" in settings.CORS_ORIGINS

    # Risk thresholds
    assert isinstance(settings.RISK_THRESHOLD_HIGH, float)
    assert isinstance(settings.RISK_THRESHOLD_MEDIUM, float)
    assert 0.0 < settings.RISK_THRESHOLD_MEDIUM < settings.RISK_THRESHOLD_HIGH < 1.0

    # Paths
    assert isinstance(settings.MODEL_PATH, str)
    assert settings.MODEL_PATH.endswith(".joblib")
    assert isinstance(settings.PCAP_PATH, str)
    assert settings.PCAP_PATH.endswith(".pcap")

    # Service operational flags
    assert isinstance(settings.USE_REAL_MODEL, bool)
    assert isinstance(settings.USE_REAL_PCAP, bool)


# ─────────────────────────────────────────────────────────────────────────────
# 3. Clean JSON Error Handling (No Stack Traces)
# ─────────────────────────────────────────────────────────────────────────────

def test_error_handling_malformed_url_clean_json():
    """Malformed URL returns clean JSON 422 without Python stack traces."""
    response = client.post("/api/analyze", json={"url": "not a valid url"})
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    assert "Traceback (most recent call last)" not in response.text
    assert 'File "' not in response.text


def test_error_handling_empty_url_clean_json():
    """Empty URL returns clean JSON 422 without Python stack traces."""
    response = client.post("/api/analyze", json={"url": ""})
    assert response.status_code == 422
    assert "Traceback (most recent call last)" not in response.text


def test_error_handling_invalid_json_body():
    """Malformed JSON string returns clean 422 without Python stack traces."""
    response = client.post(
        "/api/analyze",
        content="not-json",
        headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 422
    assert "Traceback (most recent call last)" not in response.text


def test_ml_service_unavailable_error_clean_503():
    """When ML service raises MLServiceUnavailableError, client receives clean JSON 503."""
    with patch("app.services.phishing_service.ml_engine.predict", side_effect=Exception("ML engine failure simulation")):
        response = client.post("/api/analyze", json={"url": "https://example.com"})
        assert response.status_code == 503
        data = response.json()
        assert "detail" in data
        assert data["error_type"] == "MLServiceUnavailable"
        assert "Traceback (most recent call last)" not in response.text
        assert 'File "' not in response.text


def test_network_service_unavailable_error_clean_503():
    """When network service fails, client receives clean JSON 503."""
    with patch("app.services.network_service.pcap_adapter.get_events", side_effect=Exception("PCAP capture failure simulation")):
        response = client.get("/api/network-events")
        assert response.status_code == 503
        data = response.json()
        assert "detail" in data
        assert data["error_type"] == "NetworkServiceUnavailable"
        assert "Traceback (most recent call last)" not in response.text
        assert 'File "' not in response.text


def test_unhandled_exception_clean_500_no_stack_trace():
    """Unhandled internal exceptions return clean JSON 500 and NEVER leak tracebacks."""
    with patch("app.services.phishing_service.phishing_service.analyze", side_effect=RuntimeError("Simulated unhandled internal bug")):
        response = client.post("/api/analyze", json={"url": "https://example.com"})
        assert response.status_code == 500
        data = response.json()
        assert data["error_type"] == "InternalServerError"
        assert "detail" in data
        # Crucial security check: stack trace must NOT be leaked
        assert "Traceback (most recent call last)" not in response.text
        assert 'File "' not in response.text


# ─────────────────────────────────────────────────────────────────────────────
# 4. Health Endpoint Operational Telemetry
# ─────────────────────────────────────────────────────────────────────────────

def test_health_endpoint_contract_and_telemetry():
    """GET /api/health returns 200 with complete component and configuration status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()

    # Base requirements
    assert data["status"] == "healthy"
    assert "service" in data
    assert "version" in data
    assert "timestamp" in data
    assert "ml_mode" in data

    # Detailed component telemetry
    components = data.get("components", {})
    assert "ml_service" in components
    assert "network_service" in components
    assert "history_service" in components
    assert "quantum_service" in components

    # Centralized configuration visibility
    config_info = data.get("config", {})
    assert "frontend_origin" in config_info
    assert "risk_thresholds" in config_info


def test_health_endpoint_root_alias():
    """GET /health root alias returns 200 and healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
