from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal
from datetime import datetime

RiskLevel = Literal["LOW", "MEDIUM", "HIGH"]

class ScanHistoryItem(BaseModel):
    id: str = Field(..., min_length=1, description="Unique scan identifier (e.g. scan-1)")
    url: str = Field(..., min_length=1, description="Analyzed target URL")
    risk_level: RiskLevel = Field(..., description="Categorical risk assessment: LOW, MEDIUM, or HIGH")
    phishing_probability: float = Field(..., ge=0.0, le=1.0, description="Phishing probability score strictly between 0.0 and 1.0")
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp of the completed scan")

    @field_validator("timestamp")
    @classmethod
    def validate_timestamp(cls, value: str) -> str:
        try:
            cleaned = value.replace("Z", "+00:00")
            datetime.fromisoformat(cleaned)
        except Exception:
            raise ValueError(f"Timestamp '{value}' must be a valid ISO 8601 timestamp string (e.g. 2026-09-18T11:15:00Z)")
        return value

class ScanHistoryResponse(BaseModel):
    scans: List[ScanHistoryItem] = Field(default_factory=list, description="List of recent in-memory scans")
    total: Optional[int] = Field(None, ge=0, description="Total count of scans returned")
