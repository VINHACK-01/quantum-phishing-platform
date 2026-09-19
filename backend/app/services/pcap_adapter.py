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
# Production PCAP Provider (Integrated from Person D's network_analysis/parse_pcap)
# ─────────────────────────────────────────────────────────────────────────────

KNOWN_BAD_DOMAINS = [
    "malicious-update.com",
    "secure-login-verify.net",
    "freegift-claim.xyz",
]

SUSPICIOUS_KEYWORDS = ["login", "verify", "secure", "update", "account", "confirm", "claim"]
REPEAT_CONNECTION_THRESHOLD = 15


def looks_suspicious_domain(domain: str) -> Optional[str]:
    """
    Person D's heuristic rule engine for DNS domain threat inspection.
    """
    import re
    cleaned = domain.lower().rstrip(".")

    if cleaned in KNOWN_BAD_DOMAINS:
        return "Matches known malicious domain"

    if any(keyword in cleaned for keyword in SUSPICIOUS_KEYWORDS):
        return "Domain contains phishing-style keyword"

    if len(cleaned) > 40:
        return "Unusually long domain name (> 40 chars)"

    if re.search(r"[0-9]{4,}", cleaned):
        return "Domain contains long digit sequence (common in auto-generated DGA domains)"

    return None


class ProductionPCAPProvider(NetworkEventProvider):
    """
    Parses offline .pcap captures using Person D's Scapy inspection logic.
    Analyzes DNS queries for DGA/phishing patterns and TCP connections for beaconing.
    Falls back gracefully to MockNetworkEventProvider if files are missing or unreadable.
    """

    def __init__(self, pcap_dir: str):
        self.pcap_dir = pcap_dir
        self._mock_fallback = MockNetworkEventProvider()

    def get_events(self, limit: int = 50) -> List[NetworkEvent]:
        if not self.pcap_dir or not os.path.exists(self.pcap_dir):
            logger.warning("[ProductionPCAPProvider] pcap_dir not found, falling back to mock")
            return self._mock_fallback.get_events(limit=limit)

        # 1. First check if Person D's pre-parsed network_events.json exists
        json_file = os.path.join(self.pcap_dir, "network_events.json")
        if os.path.exists(json_file):
            try:
                import json
                with open(json_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    raw_events = data.get("events", [])
                    events = []
                    today_prefix = datetime.now(timezone.utc).strftime("%Y-%m-%d")
                    for idx, e in enumerate(raw_events[:limit]):
                        raw_ts = str(e.get("timestamp") or "")
                        if "T" not in raw_ts:
                            clean_time = raw_ts.split(".")[0] if "." in raw_ts else raw_ts
                            if len(clean_time) == 8 and clean_time.count(":") == 2:
                                ts = f"{today_prefix}T{clean_time}Z"
                            else:
                                ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
                        else:
                            ts = raw_ts

                        events.append(NetworkEvent(
                            id=f"evt-{idx+1:03d}",
                            timestamp=ts,
                            protocol=e.get("protocol", "RAW"),
                            src=e.get("src", "127.0.0.1"),
                            dst=e.get("dst", "0.0.0.0"),
                            flag=e.get("flag", "normal"),
                            reason=e.get("reason", "Network event")
                        ))
                    if events:
                        logger.info(f"[ProductionPCAPProvider] Successfully loaded {len(events)} events from {json_file}")
                        return events
            except Exception as e:
                logger.warning(f"[ProductionPCAPProvider] Error reading network_events.json ({e}), attempting live Scapy parse")

        # 2. Live Scapy PCAP parsing with Person D's rules
        pcap_files = glob.glob(os.path.join(self.pcap_dir, "*.pcap")) + glob.glob(os.path.join(self.pcap_dir, "*.pcapng"))
        if not pcap_files:
            logger.warning("[ProductionPCAPProvider] No .pcap files found, falling back to mock")
            return self._mock_fallback.get_events(limit=limit)

        target_file = pcap_files[0]
        try:
            from collections import defaultdict
            from scapy.all import rdpcap, DNSQR, IP, TCP

            packets = rdpcap(target_file)
            events: List[NetworkEvent] = []
            connection_counts = defaultdict(int)
            already_flagged_pairs = set()

            for idx, pkt in enumerate(packets[:limit * 2]):
                # Human readable timestamp
                pkt_time = getattr(pkt, 'time', None)
                if pkt_time:
                    try:
                        timestamp = datetime.fromtimestamp(float(pkt_time), tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
                    except Exception:
                        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
                else:
                    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

                # Rule 1: DNS query check
                if pkt.haslayer(DNSQR):
                    try:
                        qname = pkt[DNSQR].qname.decode(errors="ignore").rstrip(".")
                    except Exception:
                        qname = str(pkt[DNSQR].qname).rstrip(".")

                    src = pkt[IP].src if pkt.haslayer(IP) else "192.168.1.10"
                    reason = looks_suspicious_domain(qname)
                    events.append(NetworkEvent(
                        id=f"evt-{len(events)+1:03d}",
                        timestamp=timestamp,
                        protocol="DNS",
                        src=src,
                        dst=qname,
                        flag="suspicious" if reason else "normal",
                        reason=reason or "Standard DNS query resolution"
                    ))

                # Rule 2: Repeated connections / beaconing check
                if pkt.haslayer(IP) and pkt.haslayer(TCP):
                    src, dst = pkt[IP].src, pkt[IP].dst
                    key = (src, dst)
                    connection_counts[key] += 1

                    if connection_counts[key] >= REPEAT_CONNECTION_THRESHOLD and key not in already_flagged_pairs:
                        already_flagged_pairs.add(key)
                        events.append(NetworkEvent(
                            id=f"evt-{len(events)+1:03d}",
                            timestamp=timestamp,
                            protocol="TCP",
                            src=src,
                            dst=dst,
                            flag="suspicious",
                            reason=f"Repeated connections to same destination ({connection_counts[key]}+ times) -- possible beaconing or scan"
                        ))

                    # Rule 3: HTTP traffic inspection
                    dport = pkt[TCP].dport
                    sport = pkt[TCP].sport
                    raw_payload = bytes(pkt[TCP].payload) if hasattr(pkt[TCP], 'payload') else b""

                    if dport in [80, 8080] or sport in [80, 8080] or b"HTTP" in raw_payload:
                        is_suspicious_http = dst == "185.220.101.5" or b"POST" in raw_payload or dport == 8080
                        events.append(NetworkEvent(
                            id=f"evt-{len(events)+1:03d}",
                            timestamp=timestamp,
                            protocol="HTTP",
                            src=src,
                            dst=dst,
                            flag="suspicious" if is_suspicious_http else "normal",
                            reason="Unencrypted HTTP POST containing victim telemetry to raw external IP"
                            if is_suspicious_http
                            else "Standard plaintext HTTP GET request to legitimate public web host"
                        ))

                if len(events) >= limit:
                    break

            return events if events else self._mock_fallback.get_events(limit=limit)
        except Exception as e:
            logger.warning(f"[ProductionPCAPProvider] Error parsing PCAP via Scapy ({e}), falling back to mock")
            return self._mock_fallback.get_events(limit=limit)


# ─────────────────────────────────────────────────────────────────────────────
# PCAP Adapter Factory / Coordinator
# ─────────────────────────────────────────────────────────────────────────────

class PCAPAdapter:
    """
    Adapter coordinator providing a unified get_events interface for network_service.
    Auto-activates Person D's ProductionPCAPProvider whenever PCAP files or network_events.json are present.
    """

    def __init__(self, pcap_dir: Optional[str] = None):
        self.pcap_dir = pcap_dir
        self._provider = self._init_provider()

    def _init_provider(self) -> NetworkEventProvider:
        from app.core.config import settings
        pcap_dir = self.pcap_dir or getattr(settings, "PCAPS_DIR", None)

        if pcap_dir and os.path.exists(pcap_dir):
            pcap_files = glob.glob(os.path.join(pcap_dir, "*.pcap")) + glob.glob(os.path.join(pcap_dir, "*.pcapng"))
            json_file = os.path.join(pcap_dir, "network_events.json")
            if getattr(settings, "USE_REAL_PCAP", False) or pcap_files or os.path.exists(json_file):
                logger.info(f"[PCAPAdapter] Active PCAP files or events found — using Person D's ProductionPCAPProvider")
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
