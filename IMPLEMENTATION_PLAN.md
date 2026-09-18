# SentinelAI: Team Implementation Plan & Parallel Architecture

**Project Title:** SentinelAI — Quantum-Enhanced Phishing Detection & Real-Time Network Threat Intelligence Platform  
**Target Repository:** `https://github.com/VINHACK-01/quantum-phishing-platform`  
**Core Strategy:** Contract-first, 100% parallel execution. Everyone codes against locked JSON contracts without blocking on each other.

---

## 1. Team Division & Ownership

| Role | Member | Primary Workspace | Immediate Tasks | Handoff Point |
|---|---|---|---|---|
| **A** | **ML Lead** | `ml_training/` | 1. Collect UCI/Kaggle phishing URLs.<br>2. Build `feature_extraction.py` (length, entropy, keywords, dots, hyphens, IP presence).<br>3. Train Random Forest / SVM classifier.<br>4. Save `phishing_rf_model.joblib`.<br>5. Write `predict(url)` returning `(prob, risk_level, reasons)`. | **Hour 6**: Drop `phishing_rf_model.joblib` and feature extraction script into `backend/app/data/models/`. |
| **B** | **Backend Lead** | `backend/` | 1. Modular FastAPI architecture with strict Pydantic schemas for Contracts 1 & 2.<br>2. Mock engines for realistic phishing detection & network event replay.<br>3. In-memory scan history (last 10 scans) & micro-training knowledge base.<br>4. Seamless adapter hooks to plug in A's ML model and D's PCAP parser. | **Hour 1–2**: Provide live backend on `http://localhost:8000` with Swagger docs for C.<br>**Hour 6**: Plug in A's model.<br>**Hour 8–10**: Plug in D's network analyzer. |
| **C** | **Frontend Lead** | `frontend/` | 1. Replace default Vite boilerplate with Tailwind CSS dashboard.<br>2. Build: `UrlScanner`, `ResultCard`, `MicroTraining`, `NetworkVisualizer`, `HistoryTable`, `QuantumComparison`.<br>3. Connect directly to Backend endpoints (`/api/analyze`, `/api/network-events`, `/api/history`). | **Hour 10**: Fully connected end-to-end dashboard ready for demo presentation. |
| **D** | **Network & Quantum Lead** | `network_analysis/` | 1. Acquire/curate sample malicious `.pcap` traffic.<br>2. Build `parse_pcap.py` with Scapy (detect DGA/high-entropy DNS, suspicious HTTP POST to raw IPs).<br>3. Build PennyLane VQC script `quantum_benchmark.py` comparing classical vs quantum accuracy. | **Hour 8**: Hand `sample.pcap` & parser to B.<br>**Hour 8**: Hand quantum accuracy metrics to B & C. |

---

## 2. Directory Layout

```text
quantum-phishing-platform/
│
├── IMPLEMENTATION_PLAN.md           # This document (team alignment guide)
│
├── backend/                         # [B] Backend Lead Workspace
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI app factory, CORS, router mounting
│   │   ├── core/
│   │   │   ├── config.py            # App settings (CORS, model paths)
│   │   │   └── history.py           # In-memory FIFO queue (capped at 10)
│   │   ├── schemas/
│   │   │   ├── analyze.py           # Request & Response models for Contract 1
│   │   │   ├── network.py           # Event models for Contract 2
│   │   │   └── history.py           # History & micro-training schemas
│   │   ├── services/
│   │   │   ├── phishing_service.py  # Mock/Heuristic & ML orchestrator
│   │   │   ├── ml_adapter.py        # Adapter loading A's model at Hour 6
│   │   │   ├── network_service.py   # Traffic replay orchestrator
│   │   │   ├── pcap_adapter.py      # Adapter loading D's parser at Hour 8-10
│   │   │   ├── awareness_service.py # Maps threat reasons to micro-training cards
│   │   │   └── quantum_service.py   # Serves PennyLane benchmark figures
│   │   ├── api/
│   │   │   └── routes.py            # Endpoints: /analyze, /network-events, /history, /health
│   │   └── data/
│   │       ├── models/              # Destination for A's 'phishing_rf_model.joblib'
│   │       └── pcaps/               # Destination for D's 'threats.pcap'
│   ├── requirements.txt
│   └── run.py
│
├── ml_training/                     # [A] ML Lead Workspace
│   ├── dataset/
│   ├── feature_extraction.py
│   ├── train_model.py
│   └── evaluate.py
│
├── network_analysis/                # [D] Network & Quantum Lead Workspace
│   ├── sample_pcaps/
│   ├── parse_pcap.py                # Scapy packet inspection
│   └── quantum_benchmark.py         # PennyLane Variational Quantum Classifier
│
└── frontend/                        # [C] Frontend Lead Workspace
    ├── src/
    │   ├── components/
    │   │   ├── UrlScanner.jsx       # Input field + quick test buttons
    │   │   ├── ResultCard.jsx       # Probability gauge, risk level, reasons
    │   │   ├── MicroTraining.jsx    # Educational tip card based on threat flag
    │   │   ├── NetworkVisualizer.jsx# Real-time traffic events table/graph
    │   │   ├── HistoryTable.jsx     # Recent scan history (last 5-10)
    │   │   └── QuantumComparison.jsx# Classical vs Quantum accuracy comparison
    │   ├── services/
    │   │   └── api.js               # Axios/Fetch client pointed to http://localhost:8000
    │   └── App.jsx
    └── package.json
```

---

## 3. Strict API Contracts (Do Not Break)

### Contract 1: `POST /api/analyze`
**Request:**
```json
{
  "url": "https://secure-login-paypal.com.account-verify.xyz/auth"
}
```

**Response:**
```json
{
  "url": "https://secure-login-paypal.com.account-verify.xyz/auth",
  "phishing_probability": 0.89,
  "risk_level": "HIGH",
  "reasons": [
    "Subdomain depth exceeds normal threshold (> 3 levels)",
    "Targeted brand keyword ('paypal') in non-authoritative domain",
    "Suspicious top-level domain (.xyz) frequently abused"
  ],
  "quantum_comparison": {
    "classical_acc": 0.918,
    "quantum_acc": 0.742
  },
  "micro_training": {
    "title": "Deceptive Brand Stacking",
    "explanation": "Phishers embed well-known brand names into subdomains or paths, but the actual domain is at the end before the TLD.",
    "action_tip": "Look immediately before the last slash: 'account-verify.xyz' is the real owner, NOT 'paypal.com'."
  }
}
```

---

### Contract 2: `GET /api/network-events`
**Response:**
```json
{
  "total_events": 2,
  "events": [
    {
      "id": "evt-001",
      "timestamp": "2026-09-18T11:20:05.120Z",
      "protocol": "DNS",
      "src": "192.168.1.45",
      "dst": "8.8.8.8",
      "flag": "suspicious",
      "reason": "High-entropy DGA query to known C2 server pattern"
    },
    {
      "id": "evt-002",
      "timestamp": "2026-09-18T11:20:09.340Z",
      "protocol": "HTTP",
      "src": "192.168.1.45",
      "dst": "185.220.101.5",
      "flag": "suspicious",
      "reason": "Plaintext POST request to external raw IP address"
    }
  ]
}
```

---

### In-Memory History: `GET /api/history`
**Response:**
```json
{
  "scans": [
    {
      "id": "scan-1",
      "url": "https://google.com",
      "risk_level": "LOW",
      "phishing_probability": 0.04,
      "timestamp": "2026-09-18T11:15:00Z"
    }
  ]
}
```

---

## 4. Integration Milestones (Swap-In Schedule)

- **Hour 0 – 2**: Backend Lead (B) deploys FastAPI with working Contract 1 & 2 mocks, history store, and micro-training. Frontend Lead (C) starts immediately against `http://localhost:8000`.
- **Hour 6**: ML Lead (A) hands `phishing_rf_model.joblib` to B. B drops it into `backend/app/data/models/` and toggles `USE_REAL_MODEL = True`.
- **Hour 8**: Network Lead (D) hands `threats.pcap` to B. B drops it into `backend/app/data/pcaps/` and connects Scapy parser.
- **Hour 10**: Full-team end-to-end integration test with live dashboard and pitch rehearsal.
