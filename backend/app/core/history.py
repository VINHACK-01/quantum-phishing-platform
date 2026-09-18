import threading
import uuid
from datetime import datetime, timezone
from collections import deque
from typing import List, Dict, Any

class HistoryStore:
    def __init__(self, maxlen: int = 10):
        self._queue = deque(maxlen=maxlen)
        self._lock = threading.Lock()
        
        # Pre-seed with a couple of realistic demo scans so initial UI load is not empty
        self.add_scan(
            url="https://github.com",
            risk_level="LOW",
            phishing_probability=0.03
        )
        self.add_scan(
            url="https://secure-login-paypaI.auth-security-update.com/login",
            risk_level="HIGH",
            phishing_probability=0.94
        )

    def add_scan(self, url: str, risk_level: str, phishing_probability: float) -> Dict[str, Any]:
        item = {
            "id": f"scan-{uuid.uuid4().hex[:8]}",
            "url": url,
            "risk_level": risk_level,
            "phishing_probability": round(phishing_probability, 4),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        with self._lock:
            self._queue.appendleft(item)
        return item

    def get_all(self) -> List[Dict[str, Any]]:
        with self._lock:
            return list(self._queue)

    def clear(self):
        with self._lock:
            self._queue.clear()

history_store = HistoryStore(maxlen=10)
