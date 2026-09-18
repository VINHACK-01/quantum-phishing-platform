from pydantic import BaseModel
from typing import List

class ScanHistoryItem(BaseModel):
    id: str
    url: str
    risk_level: str
    phishing_probability: float
    timestamp: str

class ScanHistoryResponse(BaseModel):
    total: int
    scans: List[ScanHistoryItem]
