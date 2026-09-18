"""
network_service.py — Network Threat Intelligence Service (Phase 7 Hardened)

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

Hardened with domain exception handling: raises NetworkServiceUnavailableError on failure.
"""

import logging
from app.schemas.network import NetworkEventsResponse
from app.services.pcap_adapter import pcap_adapter
from app.core.errors import NetworkServiceUnavailableError

logger = logging.getLogger(__name__)


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
        try:
            events = pcap_adapter.get_events(limit=limit)
        except Exception as exc:
            logger.exception(f"Network threat service error: {exc}")
            raise NetworkServiceUnavailableError(f"Network intelligence retrieval failed: {exc}")

        return NetworkEventsResponse(
            total_events=len(events),
            events=events
        )


network_service = NetworkThreatService()
