"""
network_service.py — Network Threat Intelligence Service (Phase 6)

Architecture:
    GET /api/network-events
            ↓
       network route
            ↓
      network_service
            ↓
        pcap_adapter
            ↓
    mock network events (or Scapy PCAP parser if available)

The service acts as the orchestration layer between the API route and the pcap_adapter.
"""

from app.schemas.network import NetworkEventsResponse
from app.services.pcap_adapter import pcap_adapter


class NetworkThreatService:
    """
    Service responsible for providing real-time or offline simulated network threat events.
    Delegates packet parsing and mock telemetry retrieval to pcap_adapter.
    """

    def get_events(self, limit: int = 50) -> NetworkEventsResponse:
        """
        Retrieves network events from the adapter layer and formats them into
        the standardized Contract 2 NetworkEventsResponse payload.
        """
        events = pcap_adapter.get_events(limit=limit)
        return NetworkEventsResponse(
            total_events=len(events),
            events=events
        )


network_service = NetworkThreatService()
