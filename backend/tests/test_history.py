"""
test_history.py — Phase 5: In-Memory Scan History Tests

Requirements:
- No database.
- No authentication.
- No persistence.
- Store only the latest 10 successful URL analyses.
- Newest scans should appear first.
- Each item must contain:
  - id
  - url
  - risk_level
  - phishing_probability
  - timestamp

Test Coverage:
1. Zero scans (empty history on fresh start or clear)
2. One scan (POST /api/analyze adds 1 entry with all required fields)
3. Multiple scans (sequential additions)
4. Exactly 10 scans (buffer reaches capacity)
5. More than 10 scans (oldest entries evicted, capacity strictly capped at 10)
6. Ordering (newest scans appear first at index 0)
7. Rejected scans (422 malformed/empty) do NOT pollute history store
8. HistoryStore unit-level tests (maxlen enforcement, thread-safety)
"""

import sys
import os
import threading
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.history import HistoryStore, history_store

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_history():
    """Ensure every test starts with an empty history store."""
    history_store.clear()
    yield
    history_store.clear()


# ─────────────────────────────────────────────────────────────────────────────
# 1. Zero scans
# ─────────────────────────────────────────────────────────────────────────────

def test_history_zero_scans():
    res = client.get("/api/history")
    assert res.status_code == 200
    data = res.json()
    assert "scans" in data
    assert isinstance(data["scans"], list)
    assert len(data["scans"]) == 0
    assert data.get("total") == 0


# ─────────────────────────────────────────────────────────────────────────────
# 2. One scan
# ─────────────────────────────────────────────────────────────────────────────

def test_history_one_scan():
    target_url = "https://github.com"
    post_res = client.post("/api/analyze", json={"url": target_url})
    assert post_res.status_code == 200
    post_data = post_res.json()

    res = client.get("/api/history")
    assert res.status_code == 200
    data = res.json()
    assert len(data["scans"]) == 1

    item = data["scans"][0]
    # Check all required fields
    assert "id" in item and item["id"].startswith("scan-")
    assert item["url"] == target_url
    assert item["risk_level"] == post_data["risk_level"]
    assert item["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
    assert item["phishing_probability"] == round(post_data["phishing_probability"], 4)
    assert 0.0 <= item["phishing_probability"] <= 1.0
    assert "timestamp" in item

    # Verify ISO 8601 UTC timestamp format
    ts = item["timestamp"].replace("Z", "+00:00")
    parsed_dt = datetime.fromisoformat(ts)
    assert parsed_dt is not None


# ─────────────────────────────────────────────────────────────────────────────
# 3. Multiple scans (e.g. 3 scans)
# ─────────────────────────────────────────────────────────────────────────────

def test_history_multiple_scans():
    urls = [
        "https://example.com",
        "https://wikipedia.org",
        "https://python.org",
    ]

    for u in urls:
        r = client.post("/api/analyze", json={"url": u})
        assert r.status_code == 200

    res = client.get("/api/history")
    assert res.status_code == 200
    data = res.json()
    assert len(data["scans"]) == 3

    # All items must have valid fields
    for scan in data["scans"]:
        assert scan["id"].startswith("scan-")
        assert scan["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
        assert 0.0 <= scan["phishing_probability"] <= 1.0
        ts = scan["timestamp"].replace("Z", "+00:00")
        datetime.fromisoformat(ts)


# ─────────────────────────────────────────────────────────────────────────────
# 4. Exactly 10 scans
# ─────────────────────────────────────────────────────────────────────────────

def test_history_exactly_10_scans():
    for i in range(10):
        r = client.post("/api/analyze", json={"url": f"https://example-{i}.org"})
        assert r.status_code == 200

    res = client.get("/api/history")
    assert res.status_code == 200
    data = res.json()
    assert len(data["scans"]) == 10
    assert data.get("total") == 10


# ─────────────────────────────────────────────────────────────────────────────
# 5. More than 10 scans (overflow & eviction)
# ─────────────────────────────────────────────────────────────────────────────

def test_history_more_than_10_scans_evicts_oldest():
    # Analyze 15 URLs: 0 to 14
    for i in range(15):
        r = client.post("/api/analyze", json={"url": f"https://domain-{i}.com"})
        assert r.status_code == 200

    res = client.get("/api/history")
    assert res.status_code == 200
    data = res.json()
    # Must strictly cap at 10 items
    assert len(data["scans"]) == 10
    assert data.get("total") == 10

    # Oldest 5 (0 through 4) should have been evicted
    stored_urls = [item["url"] for item in data["scans"]]
    for old_i in range(5):
        assert f"https://domain-{old_i}.com" not in stored_urls

    # Latest 10 (5 through 14) must all be present
    for recent_i in range(5, 15):
        assert f"https://domain-{recent_i}.com" in stored_urls


# ─────────────────────────────────────────────────────────────────────────────
# 6. Ordering (Newest First)
# ─────────────────────────────────────────────────────────────────────────────

def test_history_ordering_newest_first():
    urls = [
        "https://first-scanned.com",
        "https://second-scanned.com",
        "https://third-scanned.com",
        "https://fourth-scanned.com",
    ]

    for u in urls:
        r = client.post("/api/analyze", json={"url": u})
        assert r.status_code == 200

    res = client.get("/api/history")
    assert res.status_code == 200
    data = res.json()
    scans = data["scans"]
    assert len(scans) == 4

    # Index 0 must be the most recently scanned URL
    assert scans[0]["url"] == "https://fourth-scanned.com"
    assert scans[1]["url"] == "https://third-scanned.com"
    assert scans[2]["url"] == "https://second-scanned.com"
    assert scans[3]["url"] == "https://first-scanned.com"


# ─────────────────────────────────────────────────────────────────────────────
# 7. Rejected / Unsuccessful scans NOT added to history
# ─────────────────────────────────────────────────────────────────────────────

def test_unsuccessful_scans_not_added_to_history():
    # Initial valid scan
    r1 = client.post("/api/analyze", json={"url": "https://valid-target.com"})
    assert r1.status_code == 200

    # Invalid / malformed scans that fail validation
    r_empty = client.post("/api/analyze", json={"url": ""})
    assert r_empty.status_code == 422

    r_whitespace = client.post("/api/analyze", json={"url": "   "})
    assert r_whitespace.status_code == 422

    r_malformed = client.post("/api/analyze", json={"url": "not-a-domain"})
    assert r_malformed.status_code == 422

    # History should STILL only have the 1 successful scan
    res = client.get("/api/history")
    data = res.json()
    assert len(data["scans"]) == 1
    assert data["scans"][0]["url"] == "https://valid-target.com"


# ─────────────────────────────────────────────────────────────────────────────
# 8. HistoryStore Unit-Level Isolation Tests
# ─────────────────────────────────────────────────────────────────────────────

def test_history_store_isolated_unit():
    store = HistoryStore(maxlen=5)
    assert store.count() == 0
    assert store.get_all() == []

    # Add 7 items
    for i in range(7):
        item = store.add_scan(f"https://unit-{i}.org", "LOW", 0.05)
        assert item["url"] == f"https://unit-{i}.org"
        assert item["id"].startswith("scan-")

    # Maxlen capped at 5
    assert store.count() == 5
    all_scans = store.get_all()
    assert len(all_scans) == 5

    # Newest is unit-6, oldest retained is unit-2
    assert all_scans[0]["url"] == "https://unit-6.org"
    assert all_scans[-1]["url"] == "https://unit-2.org"

    # Clear works
    store.clear()
    assert store.count() == 0
    assert store.get_all() == []


def test_history_store_concurrent_thread_safety():
    """Verify thread-safety when multiple concurrent threads add scans."""
    store = HistoryStore(maxlen=10)

    def worker(worker_id: int):
        for j in range(20):
            store.add_scan(f"https://worker-{worker_id}-{j}.com", "LOW", 0.1)

    threads = [threading.Thread(target=worker, args=(t,)) for t in range(5)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    # Even with 100 total concurrent writes, maxlen is strictly respected
    assert store.count() == 10
    scans = store.get_all()
    assert len(scans) == 10
