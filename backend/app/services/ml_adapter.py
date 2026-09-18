"""
ml_adapter.py — ML Adapter Layer for SentinelAI (Phase 3)

Architecture:
    phishing_service  →  ml_adapter.ml_engine.predict(url)
                              ↓
                     [ProductionPredictor]  ← Person A drops model here at Hour 6
                      if model file absent
                             ↓
                     [MockPredictor]        ← deterministic heuristic (this file)

Person A integration path (Hour 6):
  1. Drop `phishing_rf_model.joblib` into  backend/data/models/
  2. Set  USE_REAL_MODEL = True  in  backend/app/core/config.py
  The adapter auto-selects ProductionPredictor on next startup.
  No other file needs to change.
"""

from __future__ import annotations

import math
import os
import re
from abc import ABC, abstractmethod
from typing import List, Tuple
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Shared constants used by the mock predictor
# ---------------------------------------------------------------------------

_SECURITY_KEYWORDS: List[str] = [
    "login", "verify", "secure", "account", "banking", "update", "confirm",
    "password", "auth", "signin", "support", "billing", "wallet", "recover",
]

_SUSPICIOUS_TLDS: List[str] = [
    ".xyz", ".top", ".club", ".work", ".site", ".live",
    ".tk", ".ml", ".ga", ".cf", ".gq",
]

_TARGET_BRANDS: List[str] = [
    "paypal", "apple", "google", "microsoft", "amazon", "netflix",
    "facebook", "instagram", "chase", "wellsfargo", "bankofamerica",
    "coinbase", "binance",
]


# ---------------------------------------------------------------------------
# Risk classification — ONE place, configurable thresholds
# ---------------------------------------------------------------------------

# Thresholds are tied directly to centralized settings in app.core.config
from app.core.config import settings

RISK_THRESHOLD_HIGH: float = settings.RISK_THRESHOLD_HIGH
RISK_THRESHOLD_MEDIUM: float = settings.RISK_THRESHOLD_MEDIUM


def classify_risk(probability: float) -> str:
    """
    Centralised risk classification delegating to settings.classify_risk.
    Returns "HIGH", "MEDIUM", or "LOW".
    """
    return settings.classify_risk(probability)


# ---------------------------------------------------------------------------
# Predictor interface — the seam Person A writes against
# ---------------------------------------------------------------------------

class Predictor(ABC):
    """
    Every predictor must implement predict().
    Return signature is the same for mock and production.
    """

    @abstractmethod
    def predict(self, url: str) -> Tuple[float, str, List[str]]:
        """
        Analyse a URL and return:
            probability  – float in [0.0, 1.0]
            risk_level   – "LOW" | "MEDIUM" | "HIGH"
            reasons      – non-empty list of human-readable explanation strings
        """


# ---------------------------------------------------------------------------
# MockPredictor — deterministic lexical heuristic
# ---------------------------------------------------------------------------

class MockPredictor(Predictor):
    """
    Deterministic mock used while Person A's model is not yet integrated.

    Design notes:
    - Deterministic: same URL always returns the same score.
    - No randomness, no external calls.
    - Clearly named "Mock" so nobody mistakes this for a trained classifier.
    - Feature extraction is clean enough that Person A can reuse it if helpful.
    """

    # ---- internal helpers -------------------------------------------------

    @staticmethod
    def _entropy(text: str) -> float:
        if not text:
            return 0.0
        counts = [text.count(c) / len(text) for c in set(text)]
        return -sum(p * math.log2(p) for p in counts)

    @staticmethod
    def _extract_features(url: str) -> dict:
        canonical = url if url.startswith(("http://", "https://")) else "http://" + url
        parsed = urlparse(canonical)
        netloc = parsed.netloc.lower()
        host = netloc.split(":")[0]
        full = url.lower()

        is_ip = bool(re.fullmatch(r"\d{1,3}(\.\d{1,3}){3}", host))
        host_parts = host.split(".")
        subdomain_count = max(0, len(host_parts) - 2) if not is_ip else 0

        brand_in_subdomain = (
            len(host_parts) >= 3
            and any(b in ".".join(host_parts[:-2]) for b in _TARGET_BRANDS)
        )

        detected_keywords = [kw for kw in _SECURITY_KEYWORDS if kw in full]

        return {
            "length": len(url),
            "entropy": round(MockPredictor._entropy(host), 3),
            "dot_count": url.count("."),
            "at_symbol": "@" in url,
            "is_ip": is_ip,
            "subdomain_count": subdomain_count,
            "detected_keywords": detected_keywords,
            "brand_in_subdomain": brand_in_subdomain,
            "has_suspicious_tld": any(netloc.endswith(tld) for tld in _SUSPICIOUS_TLDS),
            "uses_https": url.startswith("https://"),
        }

    # ---- public interface -------------------------------------------------

    def predict(self, url: str) -> Tuple[float, str, List[str]]:
        """
        Heuristic scoring.  Score accumulates from 0.05 baseline;
        each indicator adds a fixed weight.  Final score is clamped to [0.02, 0.98].
        """
        feat = self._extract_features(url)
        score: float = 0.05
        reasons: List[str] = []

        if feat["at_symbol"]:
            score += 0.40
            reasons.append("'@' character in URL — classic credential-redirection technique")

        if feat["is_ip"]:
            score += 0.40
            reasons.append("Hostname is a raw IP address instead of a registered domain")

        if feat["brand_in_subdomain"]:
            score += 0.40
            reasons.append(
                "Well-known brand name present in subdomain (deceptive brand stacking)"
            )

        if feat["has_suspicious_tld"]:
            score += 0.25
            reasons.append(
                "Top-level domain is in the high-abuse list (e.g. .xyz, .top, .tk)"
            )

        if feat["subdomain_count"] >= 3:
            score += 0.20
            reasons.append(
                f"Abnormal subdomain depth: {feat['subdomain_count']} levels"
            )

        if feat["entropy"] > 3.8:
            score += 0.20
            reasons.append(
                f"High hostname character entropy ({feat['entropy']:.2f}) — consistent with DGA domains"
            )

        kw = feat["detected_keywords"]
        if len(kw) >= 2:
            score += 0.20
            reasons.append(
                f"Multiple security/auth keywords detected: {', '.join(kw[:3])}"
            )
        elif len(kw) == 1:
            score += 0.10
            reasons.append(f"Credential-related keyword detected: '{kw[0]}'")

        if feat["length"] > 75:
            score += 0.15
            reasons.append(
                f"Unusually long URL ({feat['length']} chars) — common obfuscation indicator"
            )

        if not feat["uses_https"] and (kw or feat["is_ip"]):
            score += 0.20
            reasons.append("Insecure HTTP connection for a credential-related page")

        probability = round(min(0.98, max(0.02, score)), 3)
        risk_level = classify_risk(probability)

        if not reasons:
            reasons.append("Standard domain structure — no suspicious lexical indicators found")

        return probability, risk_level, reasons


# ---------------------------------------------------------------------------
# ProductionPredictor — placeholder for Person A's trained model
# ---------------------------------------------------------------------------

class ProductionPredictor(Predictor):
    """
    Loads Person A's trained Random Forest / SVM model via joblib.

    Person A integration checklist:
    ✓  Save model with:  joblib.dump(pipeline, "phishing_rf_model.joblib")
    ✓  The pipeline must expose .predict_proba(feature_matrix)
    ✓  features are extracted by MockPredictor._extract_features()
       or replaced by A's own feature_extraction.py
    ✓  Drop the file into:  backend/data/models/phishing_rf_model.joblib
    ✓  Set  USE_REAL_MODEL = True  in  backend/app/core/config.py
    """

    def __init__(self, model_path: str):
        self._model_path = model_path
        self._pipeline = None
        self._mock_fallback = MockPredictor()
        self._load()

    def _load(self) -> None:
        try:
            import joblib  # only imported if USE_REAL_MODEL is True
            self._pipeline = joblib.load(self._model_path)
            logger.info(f"[ProductionPredictor] Loaded model from {self._model_path}")
        except Exception as exc:
            logger.error(
                f"[ProductionPredictor] Failed to load model from {self._model_path}: {exc}"
            )
            self._pipeline = None

    def predict(self, url: str) -> Tuple[float, str, List[str]]:
        if self._pipeline is None:
            logger.warning(
                "[ProductionPredictor] Model not loaded — falling back to MockPredictor"
            )
            return self._mock_fallback.predict(url)

        try:
            features = MockPredictor._extract_features(url)
            # Build a feature vector matching what A's pipeline expects.
            # Person A: update this list to match your training feature order.
            feature_vector = [[
                features["length"],
                features["entropy"],
                features["dot_count"],
                int(features["at_symbol"]),
                int(features["is_ip"]),
                features["subdomain_count"],
                len(features["detected_keywords"]),
                int(features["brand_in_subdomain"]),
                int(features["has_suspicious_tld"]),
                int(features["uses_https"]),
            ]]

            proba = self._pipeline.predict_proba(feature_vector)[0]
            # Assume index 1 is the phishing class probability
            probability = round(float(proba[1]), 3)
            risk_level = classify_risk(probability)

            # Reasons from trained model — use top feature importances if pipeline
            # exposes them, else provide a generic explanation.
            reasons = [
                f"Trained Random Forest classifier assigned phishing probability of {probability}"
            ]

            return probability, risk_level, reasons

        except Exception as exc:
            logger.error(
                f"[ProductionPredictor] Inference error for url='{url}': {exc}"
            )
            return self._mock_fallback.predict(url)


# ---------------------------------------------------------------------------
# Adapter factory — selects predictor at startup
# ---------------------------------------------------------------------------

def _build_predictor() -> Predictor:
    """
    Reads config at import time and returns the appropriate predictor.
    Import-time selection keeps the rest of the stack unaware of which
    predictor is active.
    """
    from app.core.config import settings

    if settings.USE_REAL_MODEL:
        model_file = settings.MODEL_PATH
        if os.path.isfile(model_file):
            logger.info(
                f"[ml_adapter] USE_REAL_MODEL=True — loading production model from {model_file}"
            )
            return ProductionPredictor(model_file)
        logger.warning(
            f"[ml_adapter] USE_REAL_MODEL=True but model file not found at {model_file} "
            "— using MockPredictor"
        )

    logger.info("[ml_adapter] Using MockPredictor (deterministic heuristic)")
    return MockPredictor()


# Shared singleton used by phishing_service
ml_engine = _build_predictor()
