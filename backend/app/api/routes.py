from fastapi import APIRouter, Query
from app.schemas.analyze import AnalyzeRequest, AnalyzeResponse
from app.schemas.network import NetworkEventsResponse
from app.schemas.history import ScanHistoryResponse
from app.services.phishing_service import phishing_service
from app.services.network_service import network_service
from app.services.quantum_service import quantum_service
from app.core.history import history_store

router = APIRouter()

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
    Returns the last 10 URL scans in FIFO order without requiring an external database.
    """
    scans = history_store.get_all()
    return ScanHistoryResponse(total=len(scans), scans=scans)

@router.get("/quantum-stats", summary="Detailed Quantum ML Benchmark Metrics")
def get_quantum_stats():
    """
    Returns complete PennyLane benchmark statistics (ansatz, circuit depth, classical vs quantum comparison).
    """
    return quantum_service.get_detailed_benchmark()
