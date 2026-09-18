from pydantic import BaseModel, Field, field_validator
from typing import List, Literal
from datetime import datetime

ThreatFlag = Literal["suspicious", "malicious", "normal"]

class NetworkEvent(BaseModel):
    id: str = Field(..., min_length=1, description="Unique network event identifier (e.g. evt-001)")
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp of packet event")
    protocol: str = Field(..., min_length=1, description="Network protocol (e.g. DNS, HTTP, HTTPS, TCP)")
    src: str = Field(..., min_length=1, description="Source IP address or hostname")
    dst: str = Field(..., min_length=1, description="Destination IP address or hostname")
    flag: ThreatFlag = Field(..., description="Threat classification: suspicious, malicious, or normal")
    reason: str = Field(..., min_length=1, description="Human-readable explanation of why this packet is flagged")

    @field_validator("timestamp")
    @classmethod
    def validate_timestamp(cls, value: str) -> str:
        try:
            cleaned = value.replace("Z", "+00:00")
            datetime.fromisoformat(cleaned)
        except Exception:
            raise ValueError(f"Timestamp '{value}' must be a valid ISO 8601 timestamp string (e.g. 2026-09-18T11:20:05Z)")
        return value

class NetworkEventsResponse(BaseModel):
    total_events: int = Field(..., ge=0, description="Total count of network events returned")
    events: List[NetworkEvent] = Field(default_factory=list, description="List of network events")
