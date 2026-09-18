"""
config.py — Centralized Configuration for SentinelAI (Phase 7)

Centralizes:
- frontend origin and CORS origins
- risk classification thresholds
- ML model and PCAP file paths
- mock/real service operational flags
"""

import os
from typing import List


class Settings:
    PROJECT_NAME: str = "SentinelAI API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Quantum-Enhanced Phishing Detection & Real-Time Network Threat Intelligence Platform"

    # 1. Frontend origin & CORS
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    CORS_ORIGINS: List[str] = [
        FRONTEND_ORIGIN,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # 2. Risk classification thresholds
    RISK_THRESHOLD_HIGH: float = float(os.getenv("RISK_THRESHOLD_HIGH", "0.70"))
    RISK_THRESHOLD_MEDIUM: float = float(os.getenv("RISK_THRESHOLD_MEDIUM", "0.35"))

    # 3. Base directories & Data paths
    APP_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    BACKEND_DIR: str = os.path.dirname(APP_DIR)
    MODELS_DIR: str = os.getenv("MODELS_DIR", os.path.join(BACKEND_DIR, "data", "models"))
    PCAPS_DIR: str = os.getenv("PCAPS_DIR", os.path.join(BACKEND_DIR, "data", "pcaps"))

    # 4. Centralized ML model path and PCAP path
    MODEL_FILENAME: str = "phishing_rf_model.joblib"
    MODEL_PATH: str = os.getenv("MODEL_PATH", os.path.join(MODELS_DIR, MODEL_FILENAME))

    PCAP_FILENAME: str = "threats.pcap"
    PCAP_PATH: str = os.getenv("PCAP_PATH", os.path.join(PCAPS_DIR, PCAP_FILENAME))

    # 5. Feature toggle flags for mock vs real service providers
    USE_REAL_MODEL: bool = os.getenv("USE_REAL_MODEL", "false").lower() in ("true", "1", "yes")
    USE_REAL_PCAP: bool = os.getenv("USE_REAL_PCAP", "false").lower() in ("true", "1", "yes")

    def classify_risk(self, probability: float) -> str:
        """Centralized risk level determination based on probability score."""
        if probability >= self.RISK_THRESHOLD_HIGH:
            return "HIGH"
        elif probability >= self.RISK_THRESHOLD_MEDIUM:
            return "MEDIUM"
        return "LOW"


settings = Settings()
