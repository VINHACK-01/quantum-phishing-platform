"""
routes.py — API Router for SentinelAI (Phase 7 Hardened)

Exposes:
- GET  /api/health         System health, telemetry, and service status
- POST /api/analyze        URL phishing threat analysis (Contract 1)
- GET  /api/network-events Live / offline synthetic network threat stream (Contract 2)
- GET  /api/history        In-memory URL audit history (latest 10, newest first)
- GET  /api/quantum-stats  PennyLane quantum ML benchmark telemetry
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Query

from app.core.config import settings
from app.core.history import history_store
from app.schemas.analyze import AnalyzeRequest, AnalyzeResponse
from app.schemas.network import NetworkEventsResponse
from app.schemas.history import ScanHistoryResponse
from app.services.phishing_service import phishing_service
from app.services.network_service import network_service
from app.services.quantum_service import quantum_service

router = APIRouter()


@router.get("/health", summary="System Health & Operational Telemetry")
def health_check():
    """
    Returns system health status, active component configurations,
    and operational mode flags without exposing sensitive internal keys.
    """
    ml_mode = "production_model" if settings.USE_REAL_MODEL else "mock_predictor"
    network_mode = "pcap_parser" if settings.USE_REAL_PCAP else "mock_telemetry"

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "phase": "phase-7-hardened",
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "ml_mode": ml_mode,
        "components": {
            "ml_service": {
                "status": "operational",
                "mode": ml_mode,
                "model_path": settings.MODEL_PATH,
                "use_real_model": settings.USE_REAL_MODEL,
            },
            "network_service": {
                "status": "operational",
                "mode": network_mode,
                "pcaps_dir": settings.PCAPS_DIR,
                "use_real_pcap": settings.USE_REAL_PCAP,
            },
            "history_service": {
                "status": "operational",
                "scans_in_memory": history_store.count(),
                "max_capacity": 10,
            },
            "quantum_service": {
                "status": "operational",
                "qubits": 4,
                "benchmark_ready": True,
            },
        },
        "config": {
            "frontend_origin": settings.FRONTEND_ORIGIN,
            "risk_thresholds": {
                "high": settings.RISK_THRESHOLD_HIGH,
                "medium": settings.RISK_THRESHOLD_MEDIUM,
            },
        },
    }


@router.post("/analyze", response_model=AnalyzeResponse, summary="Analyze URL for Phishing Threats (Contract 1)")
def analyze_url(payload: AnalyzeRequest):
    """
    Analyzes an input URL across lexical, structural, and brand-spoofing vectors.
    Returns phishing probability, explainable reasons, quantum benchmark metrics,
    and targeted micro-training snippets.
    """
    return phishing_service.analyze(payload)


@router.get("/network-events", response_model=NetworkEventsResponse, summary="Network Threat Events Stream (Contract 2)")
def get_network_events(limit: int = Query(50, ge=1, le=200, description="Max number of events to return")):
    """
    Returns real-time or offline-replayed network threat events (DNS queries, HTTP POSTs, TCP anomalies).
    """
    return network_service.get_events(limit=limit)


@router.get("/history", response_model=ScanHistoryResponse, summary="Recent Scan History (In-Memory)")
def get_scan_history():
    """
    Returns up to 10 latest URL scans (newest first) without requiring an external database.
    """
    scans = history_store.get_all()
    return ScanHistoryResponse(total=len(scans), scans=scans)


@router.get("/quantum-stats", summary="Detailed Quantum ML Benchmark Metrics")
def get_quantum_stats():
    """
    Returns complete PennyLane benchmark statistics (ansatz, circuit depth, classical vs quantum comparison).
    """
    return quantum_service.get_detailed_benchmark()
