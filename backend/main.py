from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Quantum Phishing Platform API",
    description="Backend API for phishing URL detection and cyber awareness.",
    version="1.0.0"
)

# Allow the React frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Quantum Phishing Platform API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/analyze")
def analyze_url(data: dict):
    """
    Temporary mock endpoint.
    The real ML model will be connected later by the backend/ML team.
    """

    url = data.get("url", "")

    return {
        "url": url,
        "probability": 0.91,
        "risk_level": "HIGH",
        "threat_level": "Phishing",
        "reasons": [
            "Suspicious URL structure",
            "Login-related keyword detected",
            "Unusual number of subdomains"
        ]
    }
