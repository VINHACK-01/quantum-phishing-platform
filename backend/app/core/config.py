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
    
    # Paths for ML & PCAP drop-ins
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    MODELS_DIR = os.path.join(BASE_DIR, "data", "models")
    PCAPS_DIR = os.path.join(BASE_DIR, "data", "pcaps")
    
    # Feature toggle for real vs heuristic model
    USE_REAL_MODEL: bool = False

settings = Settings()
