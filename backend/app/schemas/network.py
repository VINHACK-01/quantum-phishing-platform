from pydantic import BaseModel, Field
from typing import List, Optional

class NetworkEvent(BaseModel):
    id: Optional[str] = Field(None, description="Unique event ID")
    timestamp: str = Field(..., description="ISO 8601 timestamp of event")
    protocol: str = Field(..., description="Network protocol (e.g. DNS, HTTP, TCP)")
    src: str = Field(..., description="Source IP address")
    dst: str = Field(..., description="Destination IP address")
    flag: str = Field(..., description="Threat flag status: suspicious, malicious, normal")
    reason: str = Field(..., description="Explainable network threat reason")

class NetworkEventsResponse(BaseModel):
    total_events: int
    events: List[NetworkEvent]
