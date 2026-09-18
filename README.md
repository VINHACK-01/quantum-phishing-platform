# SentinelAI

**Quantum-Enhanced Phishing Detection & Real-Time Network Threat Intelligence Platform**

SentinelAI is a comprehensive platform designed for advanced phishing detection and real-time network threat intelligence. Our architecture is built around a contract-first, 100% parallel execution model, allowing independent development across multiple domains.

## Overview
SentinelAI leverages both classical machine learning and quantum-enhanced models (PennyLane Variational Quantum Classifier) to detect phishing URLs and analyze network traffic (PCAP) for malicious activities. The platform features an interactive frontend dashboard and a robust FastAPI backend.

## Features
- **Phishing Detection:** Utilizes classical ML (Random Forest/SVM) and Quantum Classifiers to detect phishing URLs based on domain structure, keyword presence, and entropy.
- **Real-Time Network Threat Intelligence:** Analyzes network traffic events (PCAP parsing with Scapy) to detect DGA queries, plain-text POST requests to raw IPs, and other anomalous behaviors.
- **Micro-Training:** Provides actionable security education tips dynamically mapped to detected threat flags.
- **Interactive Dashboard:** Tailwind CSS and React based frontend (Vite) visualizing URL scan results, real-time network events, and scan histories.
- **Quantum vs. Classical Benchmark:** Direct comparison of accuracy metrics between classical models and quantum machine learning approaches.

## Architecture
- **`backend/`**: FastAPI backend providing modular services for phishing ML model integration and network traffic parsing.
- **`frontend/`**: React-based UI mapping directly to the backend API contracts.
- **`ml_training/`**: Data processing, feature extraction, and classical ML training pipelines.
- **`network_analysis/`**: PCAP traffic parsing and PennyLane-based quantum benchmark scripts.

## API Contracts
The platform guarantees strict API contracts enabling seamless parallel development:
- `POST /api/analyze`: Phishing URL classification, returning probabilities, threat reasons, and micro-training.
- `GET /api/network-events`: Retrieving real-time network traffic analysis results.
- `GET /api/history`: Fetching recent scan histories.

## Getting Started

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python run.py
# Server runs on http://localhost:8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Machine Learning Pipeline
```bash
cd ml_training
python feature_extraction.py
python train_model.py
```

### Network & Quantum Analysis
```bash
cd network_analysis
python parse_pcap.py
python quantum_benchmark.py
```

## Contributing
Follow the implementation plan in `IMPLEMENTATION_PLAN.md` to adhere to the team's parallel execution strategy and API contracts. Make sure to drop compiled models (`.joblib`) into `backend/app/data/models/` and sample traffic (`.pcap`) into `backend/app/data/pcaps/` at the designated handoff points.

## License
MIT License
