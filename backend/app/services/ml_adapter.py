import math
import re
from urllib.parse import urlparse
from typing import Tuple, List, Dict, Any
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# Security & authentication keywords commonly monitored in phishing feeds
SECURITY_KEYWORDS = [
    "login", "verify", "secure", "account", "banking", "update", "confirm",
    "password", "auth", "signin", "support", "billing", "wallet", "recover"
]

SUSPICIOUS_TLDS = [
    ".xyz", ".top", ".club", ".work", ".site", ".live", ".tk", ".ml", ".ga", ".cf", ".gq"
]

TARGET_BRANDS = [
    "paypal", "apple", "google", "microsoft", "amazon", "netflix", "facebook",
    "instagram", "chase", "wellsfargo", "bankofamerica", "coinbase", "binance"
]

class MockPhishingPredictor:
    """
    Mock phishing predictor for development and testing.
    Explicitly NOT a trained machine learning model.
    Uses deterministic lexical, structural, and brand-spoofing heuristics to produce
    reproducible SAFE, SUSPICIOUS, and HIGHLY SUSPICIOUS classification scores.
    """
    def calculate_entropy(self, text: str) -> float:
        if not text:
            return 0.0
        prob = [float(text.count(c)) / len(text) for c in dict.fromkeys(list(text))]
        return -sum([p * math.log(p) / math.log(2.0) for p in prob])

    def extract_features(self, url: str) -> Dict[str, Any]:
        url_to_parse = url if url.startswith(("http://", "https://")) else f"http://{url}"
        parsed = urlparse(url_to_parse)
        netloc = parsed.netloc.lower()
        full = url.lower()

        # Check for IP literal
        host_only = netloc.split(":")[0]
        is_ip = bool(re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", host_only))
        
        # Subdomain depth
        host_parts = host_only.split(".")
        subdomain_count = max(0, len(host_parts) - 2) if not is_ip else 0

        # Keywords and brand detection
        detected_keywords = [kw for kw in SECURITY_KEYWORDS if kw in full]
        detected_brands = [brand for brand in TARGET_BRANDS if brand in full]

        # Brand spoofing in subdomain/path
        brand_in_subdomain = False
        if len(host_parts) >= 3:
            subdomain_part = ".".join(host_parts[:-2])
            brand_in_subdomain = any(b in subdomain_part for b in TARGET_BRANDS)

        return {
            "length": len(url),
            "netloc": netloc,
            "entropy": round(self.calculate_entropy(netloc), 3),
            "dot_count": url.count("."),
            "hyphen_count": url.count("-"),
            "at_symbol": "@" in url,
            "is_ip": is_ip,
            "subdomain_count": subdomain_count,
            "detected_keywords": detected_keywords,
            "detected_brands": detected_brands,
            "brand_in_subdomain": brand_in_subdomain,
            "has_suspicious_tld": any(netloc.endswith(tld) for tld in SUSPICIOUS_TLDS),
            "uses_https": url.startswith("https://")
        }

    def predict(self, url: str) -> Tuple[float, str, List[str]]:
        """
        Deterministic mock prediction returning:
        (phishing_probability: float, risk_level: str, reasons: List[str])
        """
        features = self.extract_features(url)
        reasons: List[str] = []
        score = 0.03  # baseline safe probability

        # 1. IP Hostname Check
        if features["is_ip"]:
            score += 0.50
            reasons.append("Hostname is a raw IP address rather than a verified domain name")

        # 2. Brand Stacking in Subdomain
        if features["brand_in_subdomain"]:
            score += 0.45
            reasons.append("Target brand keyword detected in subdomain hierarchy (deceptive brand stacking)")

        # 3. Excessive Subdomain Depth
        if features["subdomain_count"] >= 3:
            score += 0.20
            reasons.append(f"Subdomain depth exceeds normal threshold ({features['subdomain_count']} levels)")

        # 4. Suspicious TLD Abuse
        if features["has_suspicious_tld"]:
            score += 0.25
            reasons.append("Suspicious top-level domain frequently abused in phishing campaigns")

        # 5. URL Credential Redirection (@ symbol)
        if features["at_symbol"]:
            score += 0.35
            reasons.append("Presence of '@' character in URL (URL credential redirection technique)")

        # 6. High Character Entropy
        if features["entropy"] > 3.8:
            score += 0.20
            reasons.append(f"High domain character entropy ({features['entropy']}), characteristic of DGA generation")

        # 7. Credential / Security Keywords
        if len(features["detected_keywords"]) >= 2:
            score += 0.25
            reasons.append(f"Multiple security/auth keywords present: {', '.join(features['detected_keywords'][:3])}")
        elif len(features["detected_keywords"]) == 1:
            score += 0.15
            reasons.append(f"Authentication-related keyword detected: '{features['detected_keywords'][0]}'")

        # 8. Excessive URL Length
        if features["length"] > 75:
            score += 0.15
            reasons.append(f"Unusually long URL length ({features['length']} characters)")

        # 9. Insecure Protocol for Sensitive Operations
        if not features["uses_https"] and (features["detected_keywords"] or features["is_ip"]):
            score += 0.20
            reasons.append("Insecure transmission protocol (HTTP) for credential/sensitive page")

        # Probability is strictly bounded between 0.01 and 0.99
        probability = round(min(0.99, max(0.02, score)), 3)

        # Centralized risk classification via Settings
        risk_level = settings.classify_risk(probability)

        # Default explanation for clean URLs
        if not reasons:
            reasons.append("Clean lexical profile with recognized domain structure")

        return probability, risk_level, reasons

class MLAdapter:
    """
    Clean adapter interface isolating the application from ML model details.
    Allows Person A's real Random Forest model to later replace the mock predictor
    without changing the API or service layer.
    """
    def __init__(self, model_path: str = None):
        self.model_path = model_path or settings.MODELS_DIR
        self.mock_predictor = MockPhishingPredictor()
        self._real_model = None

    @property
    def is_mock(self) -> bool:
        """Indicates whether inference is currently running via mock predictor."""
        return self._real_model is None or not settings.USE_REAL_MODEL

    def predict(self, url: str) -> Tuple[float, str, List[str]]:
        """
        Main adapter entrypoint. Returns (phishing_probability, risk_level, reasons).
        Delegates to mock predictor during Phase 3 development.
        """
        if self.is_mock:
            return self.mock_predictor.predict(url)
            
        # Hook for Phase 4 real model integration
        return self._predict_with_real_model(url)

    def _predict_with_real_model(self, url: str) -> Tuple[float, str, List[str]]:
        """Stub for future model swap-in when Person A delivers phishing_rf_model.joblib."""
        logger.info(f"Running production ML inference on: {url}")
        # Falls back to mock if model evaluation fails
        return self.mock_predictor.predict(url)

# Shared adapter instance
ml_adapter = MLAdapter()
# Backward-compatibility alias
ml_engine = ml_adapter
