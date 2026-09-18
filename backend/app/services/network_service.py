from typing import List
from datetime import datetime, timezone, timedelta
from app.schemas.network import NetworkEvent, NetworkEventsResponse
from app.services.pcap_adapter import pcap_adapter

# Realistic fallback threat stream based on actual malware-traffic-analysis samples
SAMPLE_THREAT_EVENTS = [
    {
        "id": "evt-101",
        "offset_sec": 12,
        "protocol": "DNS",
        "src": "192.168.1.105",
        "dst": "8.8.8.8",
        "flag": "suspicious",
        "reason": "High-entropy DGA query to known C2 beacon domain: 'x94m-sync-update.biz'"
    },
    {
        "id": "evt-102",
        "offset_sec": 10,
        "protocol": "HTTP",
        "src": "192.168.1.105",
        "dst": "185.220.101.5",
        "flag": "suspicious",
        "reason": "Unencrypted HTTP POST containing victim system fingerprint to raw external IP"
    },
    {
        "id": "evt-103",
        "offset_sec": 8,
        "protocol": "TCP",
        "src": "192.168.1.105",
        "dst": "45.154.255.89",
        "flag": "suspicious",
        "reason": "Outbound SYN connection established on port 4444 (common Metasploit/CobaltStrike reverse shell)"
    },
    {
        "id": "evt-104",
        "offset_sec": 6,
        "protocol": "DNS",
        "src": "192.168.1.105",
        "dst": "8.8.4.4",
        "flag": "normal",
        "reason": "Legitimate DNS query resolution: 'api.github.com'"
    },
    {
        "id": "evt-105",
        "offset_sec": 4,
        "protocol": "HTTPS",
        "src": "192.168.1.105",
        "dst": "140.82.121.6",
        "flag": "normal",
        "reason": "Encrypted TLS v1.3 transport over verified GitHub SSL certificate"
    },
    {
        "id": "evt-106",
        "offset_sec": 2,
        "protocol": "DNS",
        "src": "192.168.1.105",
        "dst": "8.8.8.8",
        "flag": "suspicious",
        "reason": "DNS TXT record exfiltration query exceeding RFC byte payload threshold"
    }
]

class NetworkThreatService:
    def get_events(self, limit: int = 50) -> NetworkEventsResponse:
        # Check if real pcap events exist from Person D
        pcap_events = pcap_adapter.parse_available_pcaps()
        if pcap_events:
            return NetworkEventsResponse(
                total_events=len(pcap_events[:limit]),
                events=pcap_events[:limit]
            )

        # Fallback to realistic dynamic timestamped mock events
        now = datetime.now(timezone.utc)
        events = []
        for sample in SAMPLE_THREAT_EVENTS[:limit]:
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
            
        return NetworkEventsResponse(
            total_events=len(events),
            events=events
        )

network_service = NetworkThreatService()
