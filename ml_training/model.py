import joblib
import re
from urllib.parse import urlparse
from feature_extraction import extract_features

# Load your trained Extra Trees model once on startup
loaded_model = joblib.load("backend/app/data/models/phishing_rf_model.joblib")

def is_whitelisted(url: str) -> bool:
    """Bypasses ML model for an extensive list of trusted global and institutional domains."""
    try:
        parsed = urlparse(url)
        netloc = parsed.netloc.lower()
        
        # Strip 'www.' if present to match root domains cleanly
        if netloc.startswith('www.'):
            netloc = netloc[4:]
            
        # Comprehensive registry of trusted domains across various categories
        trusted_domains = [
            # --- Search & Tech Giants ---
            'google.com', 'google.co.in', 'google.co.uk', 'googleapis.com', 'gstatic.com',
            'microsoft.com', 'apple.com', 'amazon.com', 'aws.amazon.com', 'microsoftonline.com',
            'office.com', 'live.com', 'outlook.com', 'bing.com', 'yahoo.com',
            
            # --- Developer Platforms & Tools ---
            'github.com', 'githubusercontent.com', 'gitlab.com', 'stackoverflow.com',
            'npmjs.com', 'pypi.org', 'readthedocs.io', 'jsdelivr.net', 'unpkg.com',
            'replit.com', 'codepen.io', 'codesandbox.io', 'localhost', '127.0.0.1',
            
            # --- AI & LLM Platforms ---
            'claude.ai', 'anthropic.com', 'openai.com', 'chatgpt.com', 
            'huggingface.co', 'hf.co', 'groq.com', 'cohere.ai', 'perplexity.ai',
            
            # --- Social & Communication ---
            'twitter.com', 'x.com', 'linkedin.com', 'discord.com', 'discord.gg',
            'slack.com', 'youtube.com', 'youtu.be', 'reddit.com', 'whatsapp.com',
            'telegram.org', 'zoom.us', 'teams.microsoft.com',
            
            # --- Cloud, Hosting & Infrastructure ---
            'cloudflare.com', 'vercel.app', 'netlify.app', 'heroku.com', 
            'digitalocean.com', 'firebaseapp.com', 'web.app', 'github.io',
            
            # --- Encyclopedias & Reference ---
            'wikipedia.org', 'wikimedia.org', 'wikidata.org',
            
            # --- Education & University Portal ---
            'vit.ac.in', 'vtop.vit.ac.in', 'blackboard.com', 'coursera.org', 
            'udemy.com', 'edx.org', 'canvaslms.com'
        ]
        
        # Check if netloc matches exact domain or is a subdomain of a trusted domain
        for domain in trusted_domains:
            if netloc == domain or netloc.endswith('.' + domain):
                return True
                
    except Exception:
        pass
        
    return False

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
    # 1. IMMEDIATE WHITELIST CHECK (Prevents false positives on trusted sites like Wikipedia)
    if is_whitelisted(url):
        return {
            "url": url,
            "phishing_probability": 0.01,
            "risk_level": "LOW",
            "reasons": ["Trusted mainstream or institutional domain whitelist matched"],
            "quantum_comparison": {
                "classical_acc": 0.8612,
                "quantum_acc": 0.742
            }
        }

    # 2. Extract features using the feature extraction script
    features = extract_features(url)
    
    # 3. Get multi-class prediction probabilities
    probs = loaded_model.predict_proba([features])[0]
    
    # Aggregate risk probability for phishing (class 2) and malware (class 3)
    phishing_probability = float(probs[2] + probs[3]) if len(probs) > 3 else float(probs[-1])
    
    # 4. Determine risk level
    if phishing_probability > 0.7:
        risk_level = "HIGH"
    elif phishing_probability > 0.3:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"
        
    # 5. Return exact Contract 1 JSON response shape
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
