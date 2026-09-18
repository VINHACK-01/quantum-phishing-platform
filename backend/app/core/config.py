import os
from typing import List

class Settings:
    PROJECT_NAME: str = "SentinelAI API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Quantum-Enhanced Phishing Detection & Real-Time Network Threat Intelligence Platform"
    
    # CORS: Allow frontend dev servers
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Paths for ML & PCAP drop-ins (backend/data/...)
    APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    BACKEND_DIR = os.path.dirname(APP_DIR)
    MODELS_DIR = os.path.join(BACKEND_DIR, "data", "models")
    PCAPS_DIR = os.path.join(BACKEND_DIR, "data", "pcaps")
    
    # Feature toggle for real vs mock model
    USE_REAL_MODEL: bool = False

settings = Settings()
