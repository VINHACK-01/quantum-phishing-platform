import os
import glob
import logging
from typing import List, Optional
from datetime import datetime, timezone
from app.schemas.network import NetworkEvent

logger = logging.getLogger(__name__)

class PCAPAdapter:
    """
    Adapter layer for Network Lead (Person D).
    Parses live .pcap captures using Scapy when available at Hour 8-10.
    """
    def __init__(self, pcap_dir: str = None):
        self.pcap_dir = pcap_dir

    def parse_available_pcaps(self) -> Optional[List[NetworkEvent]]:
        if not self.pcap_dir or not os.path.exists(self.pcap_dir):
            return None
            
        pcap_files = glob.glob(os.path.join(self.pcap_dir, "*.pcap")) + glob.glob(os.path.join(self.pcap_dir, "*.pcapng"))
        if not pcap_files:
            return None

        target_file = pcap_files[0]
        try:
            from scapy.all import rdpcap, DNS, IP, TCP, UDP
            packets = rdpcap(target_file)
            events = []
            
            for idx, pkt in enumerate(packets[:100]):
                if not pkt.haslayer(IP):
                    continue
                
                src = pkt[IP].src
                dst = pkt[IP].dst
                proto = "IP"
                flag = "normal"
                reason = "Routine network communication"
                
                if pkt.haslayer(DNS) and pkt.getlayer(DNS).qr == 0:
                    proto = "DNS"
                    qname = pkt.getlayer(DNS).qd.qname.decode('utf-8', errors='ignore') if pkt.getlayer(DNS).qd else ""
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
                    timestamp=datetime.now(timezone.utc).isoformat(),
                    protocol=proto,
                    src=src,
                    dst=dst,
                    flag=flag,
                    reason=reason
                ))
            return events
        except Exception as e:
            logger.warning(f"Error parsing pcap {target_file}: {e}")
            return None

pcap_adapter = PCAPAdapter()
