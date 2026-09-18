import joblib
import re
from feature_extraction import extract_features

# Load your trained Extra Trees model once on startup
loaded_model = joblib.load("backend/app/data/models/phishing_rf_model.joblib")

def generate_threat_reasons(url: str, probability: float) -> list:
    reasons = []
    if probability < 0.4:
        return ["Standard URL structure", "No malicious patterns detected"]
    
    if url.count('.') > 3:
        reasons.append("Subdomain depth exceeds normal threshold (> 3 levels)")
    
    if any(brand in url.lower() for brand in ['paypal', 'login', 'secure', 'bank', 'account', 'verify']):
        reasons.append("Targeted brand keyword detected in non-authoritative structure")
        
    if re.search(r'\.(xyz|top|zip|rar|cam|gq|ml|cf)$', url.lower()):
        reasons.append("High-risk top-level domain (TLD) frequently abused in phishing campaigns")
        
    if len(url) > 75:
        reasons.append("Unusually long URL structure designed to hide destination path")
        
    if not reasons:
        reasons.append("Lexical pattern anomaly flagged by machine learning classifier")
        
    return reasons

def predict(url: str) -> dict:
    # 1. Extract features using the same logic you used in the notebook
    features = extract_features(url)
    
    # 2. Get multi-class prediction probabilities
    probs = loaded_model.predict_proba([features])[0]
    
    # Aggregate risk probability for phishing (class 2) and malware (class 3)
    phishing_probability = float(probs[2] + probs[3]) if len(probs) > 3 else float(probs[-1])
    
    # 3. Determine risk level
    if phishing_probability > 0.7:
        risk_level = "HIGH"
    elif phishing_probability > 0.3:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"
        
    # 4. Return exact Contract 1 JSON response shape
    return {
        "url": url,
        "phishing_probability": phishing_probability,
        "risk_level": risk_level,
        "reasons": generate_threat_reasons(url, phishing_probability),
        "quantum_comparison": {
            "classical_acc": 0.8612,
            "quantum_acc": 0.742
        }
    }

