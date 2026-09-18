"""
history.py — In-Memory Scan History Store for SentinelAI (Phase 5)

Requirements:
- No database.
- No authentication.
- No persistence.
- Store only the latest 10 successful URL analyses.
- Newest scans should appear first (LIFO ordering via appendleft).
- Each item must contain:
  - id
  - url
  - risk_level
  - phishing_probability
  - timestamp
"""

import threading
import uuid
from datetime import datetime, timezone
from collections import deque
from typing import List, Dict, Any


class HistoryStore:
    """
    In-memory storage keeping up to `maxlen` latest successful URL scans.
    Thread-safe via threading.Lock.
    Newest scans are added to the head of the deque, ensuring newest-first ordering.
    """
    def __init__(self, maxlen: int = 10):
        self._maxlen = maxlen
        self._queue: deque = deque(maxlen=maxlen)
        self._lock = threading.Lock()

    def add_scan(self, url: str, risk_level: str, phishing_probability: float) -> Dict[str, Any]:
        """
        Records a completed scan. Automatically evicts the oldest scan
        once maxlen (10) is exceeded.
        """
        item = {
            "id": f"scan-{uuid.uuid4().hex[:8]}",
            "url": url,
            "risk_level": risk_level,
            "phishing_probability": round(float(phishing_probability), 4),
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        }
        with self._lock:
            self._queue.appendleft(item)
        return item

    def get_all(self) -> List[Dict[str, Any]]:
        """
        Returns a list of all current scans ordered newest to oldest.
        """
        with self._lock:
            return list(self._queue)

    def count(self) -> int:
        """
        Returns the count of currently stored scans.
        """
        with self._lock:
            return len(self._queue)

    def clear(self) -> None:
        """
        Clears the in-memory history. Used during testing and resets.
        """
        with self._lock:
            self._queue.clear()


# Default singleton instance (maxlen=10)
history_store = HistoryStore(maxlen=10)
