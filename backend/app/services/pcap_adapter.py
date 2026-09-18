"""
pcap_adapter.py — PCAP / Network Threat Intelligence Adapter (Phase 6)

Architecture:
    network route  →  network_service.get_events(limit)
                            ↓
                      pcap_adapter.get_events(limit)
                            ↓
                 [ProductionPCAPProvider]   ← Person D drops threats.pcap here at Hour 8
                  if PCAP absent or disabled
                            ↓
                 [MockNetworkEventProvider] ← realistic offline mock telemetry (this file)

Person D integration path (Hour 8):
  1. Drop `threats.pcap` or `*.pcapng` into  backend/data/pcaps/
  2. Set  USE_REAL_PCAP = True  in  backend/app/core/config.py
  The adapter auto-selects ProductionPCAPProvider on next startup.
  No route or frontend code changes required.

Notice:
- These mock events are synthetic offline simulation vectors for testing and demonstration.
- No live packet sniffing is performed.
- No external threat intelligence APIs are contacted.
"""

from __future__ import annotations

import os
import glob
import logging
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta

from app.schemas.network import NetworkEvent

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Provider Interface (Seam for Person D)
# ─────────────────────────────────────────────────────────────────────────────

class NetworkEventProvider(ABC):
    """
    Abstract contract for network event extraction.
    Both mock and production Scapy providers implement this interface.
    """

    @abstractmethod
    def get_events(self, limit: int = 50) -> List[NetworkEvent]:
        """Return a list of parsed or simulated NetworkEvent objects."""
        pass


# ─────────────────────────────────────────────────────────────────────────────
# Mock Network Event Provider (Offline Synthetic Telemetry)
# ─────────────────────────────────────────────────────────────────────────────

# Explicit offline synthetic templates covering the required vectors:
# 1. Normal DNS
# 2. Suspicious DNS
# 3. Normal HTTP
# 4. Suspicious HTTP
# (Plus supplementary realistic telemetry: Normal HTTPS, Suspicious TCP)
OFFLINE_MOCK_EVENT_TEMPLATES: List[Dict[str, Any]] = [
    {
        "id": "evt-001",
        "offset_sec": 14,
        "protocol": "DNS",
        "src": "192.168.1.105",
        "dst": "8.8.8.8",
        "flag": "suspicious",
        "reason": "High-entropy DGA query to known C2 beacon domain: 'x94m-sync-update.biz'"
    },
    {
        "id": "evt-002",
        "offset_sec": 12,
        "protocol": "HTTP",
        "src": "192.168.1.105",
        "dst": "185.220.101.5",
        "flag": "suspicious",
        "reason": "Unencrypted HTTP POST containing victim telemetry to raw external IP"
    },
    {
        "id": "evt-003",
        "offset_sec": 10,
        "protocol": "DNS",
        "src": "192.168.1.105",
        "dst": "8.8.4.4",
        "flag": "normal",
        "reason": "Legitimate DNS query resolution for 'api.github.com'"
    },
    {
        "id": "evt-004",
        "offset_sec": 8,
        "protocol": "HTTP",
        "src": "192.168.1.105",
        "dst": "93.184.216.34",
        "flag": "normal",
        "reason": "Standard plaintext HTTP GET request to legitimate public web host"
    },
    {
        "id": "evt-005",
        "offset_sec": 6,
        "protocol": "TCP",
        "src": "192.168.1.105",
        "dst": "45.154.255.89",
        "flag": "suspicious",
        "reason": "Outbound SYN connection established on port 4444 (Metasploit / Cobalt Strike reverse shell vector)"
    },
    {
        "id": "evt-006",
        "offset_sec": 4,
        "protocol": "HTTPS",
        "src": "192.168.1.105",
        "dst": "140.82.121.6",
        "flag": "normal",
        "reason": "Encrypted TLS v1.3 transport over verified GitHub SSL certificate"
    },
    {
        "id": "evt-007",
        "offset_sec": 2,
        "protocol": "DNS",
        "src": "192.168.1.105",
        "dst": "8.8.8.8",
        "flag": "suspicious",
        "reason": "DNS TXT record query exceeding RFC length threshold (DNS tunneling / data exfiltration)"
    },
    {
        "id": "evt-008",
        "offset_sec": 1,
        "protocol": "HTTP",
        "src": "192.168.1.105",
        "dst": "194.26.29.112",
        "flag": "suspicious",
        "reason": "Suspicious HTTP GET request fetching executable binary payload (.exe) from unverified host"
    }
]


class MockNetworkEventProvider(NetworkEventProvider):
    """
    Supplies realistic offline mock events.
    All events are synthetic simulations for development, demonstration, and automated testing.
    Timestamps are dynamically generated relative to current UTC time so telemetry remains current.
    """

    def __init__(self, templates: Optional[List[Dict[str, Any]]] = None):
        self._templates = templates or OFFLINE_MOCK_EVENT_TEMPLATES

    def get_events(self, limit: int = 50) -> List[NetworkEvent]:
        now = datetime.now(timezone.utc)
        events: List[NetworkEvent] = []

        for sample in self._templates[:limit]:
            event_time = (now - timedelta(seconds=sample["offset_sec"])).strftime("%Y-%m-%dT%H:%M:%SZ")
            events.append(NetworkEvent(
                id=sample["id"],
                timestamp=event_time,
                protocol=sample["protocol"],
                src=sample["src"],
                dst=sample["dst"],
                flag=sample["flag"],
                reason=sample["reason"]
            ))

        return events


# ─────────────────────────────────────────────────────────────────────────────
# Production PCAP Provider (Placeholder for Person D's Scapy parser)
# ─────────────────────────────────────────────────────────────────────────────

class ProductionPCAPProvider(NetworkEventProvider):
    """
    Parses real offline .pcap / .pcapng captures using Scapy.
    Person D drops threats.pcap into backend/data/pcaps/ at Hour 8.
    Falls back gracefully to MockNetworkEventProvider if Scapy is missing or files cannot be parsed.
    """

    def __init__(self, pcap_dir: str):
        self.pcap_dir = pcap_dir
        self._mock_fallback = MockNetworkEventProvider()

    def get_events(self, limit: int = 50) -> List[NetworkEvent]:
        if not self.pcap_dir or not os.path.exists(self.pcap_dir):
            logger.warning("[ProductionPCAPProvider] pcap_dir not found, falling back to mock")
            return self._mock_fallback.get_events(limit=limit)

        pcap_files = glob.glob(os.path.join(self.pcap_dir, "*.pcap")) + glob.glob(os.path.join(self.pcap_dir, "*.pcapng"))
        if not pcap_files:
            logger.warning("[ProductionPCAPProvider] No .pcap files found, falling back to mock")
            return self._mock_fallback.get_events(limit=limit)

        target_file = pcap_files[0]
        try:
            from scapy.all import rdpcap, DNS, IP, TCP
            packets = rdpcap(target_file)
            events: List[NetworkEvent] = []

            for idx, pkt in enumerate(packets[:limit]):
                if not pkt.haslayer(IP):
                    continue

                src = pkt[IP].src
                dst = pkt[IP].dst
                proto = "IP"
                flag = "normal"
                reason = "Routine network communication"

                if pkt.haslayer(DNS) and pkt.getlayer(DNS).qr == 0:
                    proto = "DNS"
                    qname = pkt.getlayer(DNS).qd.qname.decode("utf-8", errors="ignore") if pkt.getlayer(DNS).qd else ""
                    if any(bad in qname for bad in ["c2", "malware", "dga", "tunnel", "exfil"]) or len(qname) > 35:
                        flag = "suspicious"
                        reason = f"High-entropy / anomalous DNS query: {qname.strip('.')}"
                    else:
                        reason = f"Standard DNS query: {qname.strip('.')}"
                elif pkt.haslayer(TCP):
                    proto = "TCP"
                    dport = pkt[TCP].dport
                    if dport in [80, 8080]:
                        proto = "HTTP"
                    elif dport == 443:
                        proto = "HTTPS"
                    elif dport in [4444, 1337, 8888, 9001]:
                        flag = "suspicious"
                        reason = f"Non-standard outbound connection on suspicious port {dport}"

                events.append(NetworkEvent(
                    id=f"pcap-evt-{idx+1:03d}",
                    timestamp=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                    protocol=proto,
                    src=src,
                    dst=dst,
                    flag=flag,
                    reason=reason
                ))

            return events if events else self._mock_fallback.get_events(limit=limit)
        except Exception as e:
            logger.warning(f"[ProductionPCAPProvider] Error parsing PCAP ({e}), falling back to mock")
            return self._mock_fallback.get_events(limit=limit)


# ─────────────────────────────────────────────────────────────────────────────
# PCAP Adapter Factory / Coordinator
# ─────────────────────────────────────────────────────────────────────────────

class PCAPAdapter:
    """
    Adapter coordinator providing a unified get_events interface for network_service.
    Switches between production Scapy PCAP parsing and realistic mock telemetry based on config.
    """

    def __init__(self, pcap_dir: Optional[str] = None):
        self.pcap_dir = pcap_dir
        self._provider = self._init_provider()

    def _init_provider(self) -> NetworkEventProvider:
        from app.core.config import settings
        pcap_dir = self.pcap_dir or getattr(settings, "PCAPS_DIR", None)

        if getattr(settings, "USE_REAL_PCAP", False) and pcap_dir and os.path.exists(pcap_dir):
            pcap_files = glob.glob(os.path.join(pcap_dir, "*.pcap")) + glob.glob(os.path.join(pcap_dir, "*.pcapng"))
            if pcap_files:
                logger.info(f"[PCAPAdapter] USE_REAL_PCAP=True — using ProductionPCAPProvider with {pcap_files[0]}")
                return ProductionPCAPProvider(pcap_dir)

        logger.info("[PCAPAdapter] Using MockNetworkEventProvider (offline synthetic telemetry)")
        return MockNetworkEventProvider()

    def get_events(self, limit: int = 50) -> List[NetworkEvent]:
        """Fetches events from the active provider up to limit."""
        return self._provider.get_events(limit=limit)

    def parse_available_pcaps(self) -> Optional[List[NetworkEvent]]:
        """Backwards compatibility shim for existing callers."""
        return self.get_events()


pcap_adapter = PCAPAdapter()
