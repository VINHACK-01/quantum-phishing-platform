"""
test_network.py — Phase 6: Mock Network Event Service Tests

Requirements:
- GET /api/network-events works without D's real PCAP parser
- Realistic offline mock events containing:
  - normal DNS
  - suspicious DNS
  - normal HTTP
  - suspicious HTTP
- Every event contains:
  - id
  - timestamp
  - protocol
  - src
  - dst
  - flag
  - reason
- Response structure:
  {
    "total_events": number,
    "events": [...]
  }
- Adapter boundary tested (MockNetworkEventProvider, ProductionPCAPProvider fallback)
"""

import sys
import os
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.pcap_adapter import (
    MockNetworkEventProvider,
    ProductionPCAPProvider,
    pcap_adapter,
    OFFLINE_MOCK_EVENT_TEMPLATES,
)
from app.schemas.network import NetworkEvent, NetworkEventsResponse

client = TestClient(app)


# ─────────────────────────────────────────────────────────────────────────────
# 1. API Route Contract 2 Response Verification
# ─────────────────────────────────────────────────────────────────────────────

def test_get_network_events_endpoint():
    res = client.get("/api/network-events")
    assert res.status_code == 200
    data = res.json()

    assert "total_events" in data
    assert "events" in data
    assert isinstance(data["total_events"], int)
    assert isinstance(data["events"], list)
    assert data["total_events"] == len(data["events"])
    assert data["total_events"] > 0


# ─────────────────────────────────────────────────────────────────────────────
# 2. Field Schema Completeness on Every Event
# ─────────────────────────────────────────────────────────────────────────────

def test_every_event_contains_required_fields():
    res = client.get("/api/network-events?limit=50")
    assert res.status_code == 200
    events = res.json()["events"]

    for evt in events:
        assert "id" in evt and len(evt["id"]) > 0
        assert "timestamp" in evt and len(evt["timestamp"]) > 0
        assert "protocol" in evt and len(evt["protocol"]) > 0
        assert "src" in evt and len(evt["src"]) > 0
        assert "dst" in evt and len(evt["dst"]) > 0
        assert "flag" in evt and evt["flag"] in ["normal", "suspicious", "malicious"]
        assert "reason" in evt and len(evt["reason"]) > 0

        # Strict ISO 8601 UTC timestamp check
        ts = evt["timestamp"].replace("Z", "+00:00")
        dt = datetime.fromisoformat(ts)
        assert dt.tzinfo is not None


# ─────────────────────────────────────────────────────────────────────────────
# 3. Required Event Categories in Mock Telemetry
# ─────────────────────────────────────────────────────────────────────────────

def test_contains_normal_dns():
    res = client.get("/api/network-events?limit=50")
    events = res.json()["events"]
    normal_dns = [e for e in events if e["protocol"] == "DNS" and e["flag"] == "normal"]
    assert len(normal_dns) >= 1, "Mock telemetry must contain normal DNS events"


def test_contains_suspicious_dns():
    res = client.get("/api/network-events?limit=50")
    events = res.json()["events"]
    suspicious_dns = [e for e in events if e["protocol"] == "DNS" and e["flag"] == "suspicious"]
    assert len(suspicious_dns) >= 1, "Mock telemetry must contain suspicious DNS events"


def test_contains_normal_http():
    res = client.get("/api/network-events?limit=50")
    events = res.json()["events"]
    normal_http = [e for e in events if e["protocol"] == "HTTP" and e["flag"] == "normal"]
    assert len(normal_http) >= 1, "Mock telemetry must contain normal HTTP events"


def test_contains_suspicious_http():
    res = client.get("/api/network-events?limit=50")
    events = res.json()["events"]
    suspicious_http = [e for e in events if e["protocol"] == "HTTP" and e["flag"] == "suspicious"]
    assert len(suspicious_http) >= 1, "Mock telemetry must contain suspicious HTTP events"


# ─────────────────────────────────────────────────────────────────────────────
# 4. Limit Query Parameter
# ─────────────────────────────────────────────────────────────────────────────

def test_limit_query_parameter():
    res_1 = client.get("/api/network-events?limit=1")
    assert res_1.status_code == 200
    data_1 = res_1.json()
    assert data_1["total_events"] == 1
    assert len(data_1["events"]) == 1

    res_3 = client.get("/api/network-events?limit=3")
    assert res_3.status_code == 200
    data_3 = res_3.json()
    assert data_3["total_events"] == 3
    assert len(data_3["events"]) == 3


# ─────────────────────────────────────────────────────────────────────────────
# 5. Unit Testing MockNetworkEventProvider directly
# ─────────────────────────────────────────────────────────────────────────────

def test_mock_network_event_provider_unit():
    provider = MockNetworkEventProvider()
    events = provider.get_events(limit=4)
    assert len(events) == 4
    for ev in events:
        assert isinstance(ev, NetworkEvent)
        assert ev.id
        assert ev.flag in ["normal", "suspicious", "malicious"]


def test_mock_timestamps_are_recent():
    provider = MockNetworkEventProvider()
    events = provider.get_events(limit=5)
    now = datetime.now(timezone.utc)

    for ev in events:
        ts = ev.timestamp.replace("Z", "+00:00")
        dt = datetime.fromisoformat(ts)
        # Event timestamp should be within the last minute
        delta = abs((now - dt).total_seconds())
        assert delta < 60.0


# ─────────────────────────────────────────────────────────────────────────────
# 6. Adapter Boundary & Fallback Safety for ProductionPCAPProvider
# ─────────────────────────────────────────────────────────────────────────────

def test_production_pcap_provider_fallback_when_dir_missing():
    # If pointed to a non-existent directory, must safely fall back to mock
    prod_provider = ProductionPCAPProvider(pcap_dir="/non/existent/pcap/directory")
    events = prod_provider.get_events(limit=5)
    assert len(events) == 5
    assert all(isinstance(e, NetworkEvent) for e in events)


def test_pcap_adapter_active_instance():
    # Verify the singleton adapter returns valid NetworkEvent objects
    events = pcap_adapter.get_events(limit=6)
    assert len(events) == 6
    assert all(isinstance(e, NetworkEvent) for e in events)
