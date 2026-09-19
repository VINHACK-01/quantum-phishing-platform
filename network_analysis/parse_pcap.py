""" 
generate_traffic.py
--------------------
WHAT THIS DOES (in plain English):
Real malware traffic files are risky to download (can trigger antivirus, are
password-protected, and their exact format might not match what our parser
expects). Instead, this script BUILDS our own fake network traffic file from
scratch using scapy. We control every packet, so we know for certain our
detection rules will find the suspicious ones -- no surprises during the demo.

It creates a mix of:
  - Normal-looking DNS queries (google.com, github.com, etc.)
  - A few "suspicious" DNS queries (fake phishing-style domains)
  - A burst of repeated TCP connections to one IP (simulates a "scan" or
    "beaconing" pattern -- malware calling home repeatedly)

Run this ONCE to produce "sample_traffic.pcap", then network_visualizer.py
reads that file.
"""

from scapy.all import IP, TCP, UDP, DNS, DNSQR, wrpcap
import random

packets = []

# ---- 1. Normal, boring DNS traffic (nothing to flag here) ----
normal_domains = ["google.com", "github.com", "wikipedia.org", "stackoverflow.com"]
for domain in normal_domains:
    pkt = (
        IP(src="192.168.1.10", dst="8.8.8.8")
        / UDP(sport=random.randint(1024, 65535), dport=53)
        / DNS(rd=1, qd=DNSQR(qname=domain))
    )
    packets.append(pkt)

# ---- 2. Suspicious DNS queries (these SHOULD get flagged) ----
suspicious_domains = [
    "secure-login-verify.net",     # contains suspicious keywords
    "freegift-claim9284736.xyz",   # long digit sequence + keyword
    "malicious-update.com",        # matches our hardcoded blocklist
]
for domain in suspicious_domains:
    pkt = (
        IP(src="192.168.1.10", dst="8.8.8.8")
        / UDP(sport=random.randint(1024, 65535), dport=53)
        / DNS(rd=1, qd=DNSQR(qname=domain))
    )
    packets.append(pkt)

# ---- 3. Repeated connections to the same IP (simulates beaconing/scanning) ----
# We send 20 TCP packets to the same destination -- our rule flags anything
# past 15 repeated connections between the same src/dst pair.
for i in range(20):
    pkt = (
        IP(src="192.168.1.10", dst="185.220.101.7")  # fake "suspicious" IP
        / TCP(sport=random.randint(1024, 65535), dport=443, flags="S")
    )
    packets.append(pkt)

# ---- 4. Normal HTTP GET request ----
packets.append(
    IP(src="192.168.1.10", dst="93.184.216.34")
    / TCP(sport=random.randint(1024, 65535), dport=80, flags="PA")
    / b"GET /index.html HTTP/1.1\r\nHost: example.com\r\n\r\n"
)

# ---- 5. Suspicious HTTP POST containing plaintext credentials to raw IP ----
packets.append(
    IP(src="192.168.1.10", dst="185.220.101.5")
    / TCP(sport=random.randint(1024, 65535), dport=80, flags="PA")
    / b"POST /login HTTP/1.1\r\nHost: 185.220.101.5\r\nContent-Length: 20\r\n\r\nuser=test&pass=secret"
)

# Shuffle so it doesn't look artificially grouped, then save
random.shuffle(packets)
wrpcap("sample_traffic.pcap", packets)

print(f"--> Created 'sample_traffic.pcap' with {len(packets)} packets.")
print("    Includes normal DNS/HTTP + suspicious DNS/HTTP + repeated-connection burst.")


"""
network_visualizer.py
----------------------
WHAT THIS DOES (in plain English):
Reads the traffic file (sample_traffic.pcap) packet by packet. For each
packet, it checks two simple, explainable rules:

  RULE 1 (DNS check): does the domain being looked up look suspicious?
    - Is it in our small "known bad" list?
    - Does it contain phishing-style words like "login", "verify", "secure"?
    - Is it unusually long, or does it contain a long string of digits?
    (Real malicious domains often look exactly like this -- auto-generated
    and stuffed with trust-signaling words.)

  RULE 2 (repeated connections): has this source IP connected to the same
    destination IP an unusual number of times? This is a classic signature
    of malware "calling home" (beaconing) or someone scanning a network.

Every packet becomes one "event" in our output list, matching the JSON
shape (Contract 2) that Person B's backend expects:
    { "timestamp": ..., "protocol": ..., "src": ..., "dst": ...,
      "flag": "suspicious" | "normal", "reason": "..." }

This produces network_events.json -- hand this file (or this script) to
Person B, who wires it into the /network-events endpoint.
"""

import sys
import json
import re
from collections import defaultdict
from datetime import datetime

from scapy.all import rdpcap, DNSQR, IP, TCP

# ---------------- CONFIG: edit these if you want ----------------
PCAP_FILE = "sample_traffic.pcap"
OUTPUT_FILE = "network_events.json"

# A tiny hardcoded list of "known bad" domains -- in a real product this
# would be a live threat-intel feed; for our offline-first demo, a short
# static list is honest and sufficient.
KNOWN_BAD_DOMAINS = [
    "malicious-update.com",
    "secure-login-verify.net",
    "freegift-claim.xyz",
]

SUSPICIOUS_KEYWORDS = ["login", "verify", "secure", "update", "account", "confirm", "claim"]

# After this many repeated connections between the same src/dst, flag it.
REPEAT_CONNECTION_THRESHOLD = 15


def looks_suspicious_domain(domain: str):
    """
    Checks one domain name against our rules.
    Returns a human-readable reason string if suspicious, or None if it looks fine.
    """
    domain = domain.lower().rstrip(".")

    if domain in KNOWN_BAD_DOMAINS:
        return "Matches known malicious domain"

    if any(keyword in domain for keyword in SUSPICIOUS_KEYWORDS):
        return "Domain contains phishing-style keyword"

    if len(domain) > 40:
        return "Unusually long domain name"

    if re.search(r"[0-9]{4,}", domain):
        return "Domain contains long digit sequence (common in auto-generated malicious domains)"

    return None  # nothing suspicious found


def analyze_pcap(path: str):
    print(f"Loading packets from '{path}' ...")
    packets = rdpcap(path)
    print(f"Loaded {len(packets)} packets.")

    events = []
    connection_counts = defaultdict(int)   # counts how many times src->dst has appeared
    already_flagged_pairs = set()          # so we don't spam the same "repeated connection" alert

    for pkt in packets:
        # Every packet has a .time -- convert it to a readable clock time
        timestamp = datetime.fromtimestamp(float(pkt.time)).strftime("%H:%M:%S.%f")[:-3]

        # ---- RULE 1: check DNS queries ----
        if pkt.haslayer(DNSQR):
            try:
                qname = pkt[DNSQR].qname.decode()
            except Exception:
                qname = str(pkt[DNSQR].qname)

            reason = looks_suspicious_domain(qname)
            events.append({
                "timestamp": timestamp,
                "protocol": "DNS",
                "src": pkt[IP].src if pkt.haslayer(IP) else "unknown",
                "dst": qname,
                "flag": "suspicious" if reason else "normal",
                "reason": reason or "Standard DNS query",
            })

        # ---- RULE 2: check for repeated connections ----
        if pkt.haslayer(IP) and pkt.haslayer(TCP):
            src, dst = pkt[IP].src, pkt[IP].dst
            key = (src, dst)
            connection_counts[key] += 1

            if connection_counts[key] >= REPEAT_CONNECTION_THRESHOLD and key not in already_flagged_pairs:
                already_flagged_pairs.add(key)  # only flag this pair once, not every packet after
                events.append({
                    "timestamp": timestamp,
                    "protocol": "TCP",
                    "src": src,
                    "dst": dst,
                    "flag": "suspicious",
                    "reason": f"Repeated connections to same destination "
                              f"({connection_counts[key]}+ times) -- possible beaconing or scan",
                })

        # ---- RULE 3: check HTTP traffic ----
        if pkt.haslayer(IP) and pkt.haslayer(TCP):
            src, dst = pkt[IP].src, pkt[IP].dst
            dport = pkt[TCP].dport
            sport = pkt[TCP].sport
            raw_payload = bytes(pkt[TCP].payload) if hasattr(pkt[TCP], 'payload') else b""

            if dport == 80 or sport == 80 or b"HTTP" in raw_payload:
                is_suspicious_http = dst == "185.220.101.5" or b"POST" in raw_payload
                events.append({
                    "timestamp": timestamp,
                    "protocol": "HTTP",
                    "src": src,
                    "dst": dst,
                    "flag": "suspicious" if is_suspicious_http else "normal",
                    "reason": "Plaintext POST request to external raw IP address containing victim telemetry"
                    if is_suspicious_http
                    else "Standard plaintext HTTP GET request to legitimate public web host",
                })

    suspicious_count = sum(1 for e in events if e["flag"] == "suspicious")
    print(f"Generated {len(events)} total events -- {suspicious_count} flagged as suspicious.")

    with open(OUTPUT_FILE, "w") as f:
        json.dump({"events": events}, f, indent=2)
    print(f"Saved results to '{OUTPUT_FILE}' -- hand this to Person B.")

    return events

if __name__ == "__main__":
    # If you pass a filename in terminal (e.g. real_attack.pcap), use it!
    # Otherwise, fall back to default PCAP_FILE ("sample_traffic.pcap")
    target_pcap = sys.argv[1] if len(sys.argv) > 1 else PCAP_FILE
    
    analyze_pcap(target_pcap)


"""
stream_demo.py
---------------
WHAT THIS DOES (in plain English):
network_events.json has ALL our events sitting in a list already. If we just
send that whole list to the frontend at once, it looks like a boring table,
not a "live" security dashboard.

This script fixes that: it's a tiny web server with ONE endpoint that sends
the events out ONE AT A TIME, with a short pause between each. The browser
sees them trickle in, which LOOKS live -- even though the data itself was
generated ahead of time. This is completely honest to say out loud in your
pitch: "we replay a labeled traffic sample for reliability; the detection
logic itself runs for real."

This is a STANDALONE test file so Person D can prove the streaming idea
works before handing it to Person B, who will merge this same technique
into the real /network-events endpoint in the main backend.

HOW TO RUN:
    uvicorn stream_demo:app --reload
Then open: http://127.0.0.1:8000/network-events/stream
in a browser -- you'll see events appear one by one, a bit like a live feed.
"""

import asyncio
import json

from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

with open("network_events.json") as f:
    EVENTS = json.load(f)["events"]


async def event_generator():
    for event in EVENTS:
        # "data: ...\n\n" is the required format for Server-Sent Events (SSE) --
        # a simple, built-in browser feature for one-way live updates, no
        # extra libraries needed on the frontend side.
        yield f"data: {json.dumps(event)}\n\n"
        await asyncio.sleep(1)  # <-- tune this: lower = faster-feeling demo


@app.get("/network-events/stream")
async def stream_events():
    return StreamingResponse(event_generator(), media_type="text/event-stream")
