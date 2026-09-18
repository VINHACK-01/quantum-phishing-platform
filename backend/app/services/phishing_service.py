"""
phishing_service.py — Service Layer for Phishing Analysis (Phase 7 Hardened)

Data flow for POST /api/analyze:

    API route  →  phishing_service.analyze()
                        ↓
                  ml_adapter.ml_engine.predict(url)   ← mock or real model
                        ↓
                  quantum_service.get_comparison()
                        ↓
                  awareness_service (micro-training card)
                        ↓
                  history_store.add_scan()
                        ↓
                  AnalyzeResponse (Contract 1)

Hardened with domain exception handling: raises MLServiceUnavailableError if inference fails.
"""

import logging
import urllib.parse
import re
from functools import lru_cache
from app.schemas.analyze import AnalyzeRequest, AnalyzeResponse
from app.services.ml_adapter import ml_engine
from app.services.quantum_service import quantum_service
from app.services.awareness_service import get_micro_training_for_reasons
from app.core.history import history_store
from app.core.errors import MLServiceUnavailableError

logger = logging.getLogger(__name__)

# --- Module-Level Optimizations ---
DANGEROUS_EXTENSIONS_RE = re.compile(
    r'\.(bat|exe|ps1|scr|sh|jar|cmd|vbs|scpt|msi|dmg|pkg|apk|iso)$', 
    re.IGNORECASE
)

TRUSTED_DOMAINS_EXACT = {"localhost"}
TRUSTED_DOMAINS_SUFFIX = {
    "google.com", "microsoft.com", "apple.com", "amazon.com", "yahoo.com", "bing.com",
    "github.com", "gitlab.com", "stackoverflow.com", "npmjs.com", "pypi.org", 
    "claude.ai", "openai.com", "chatgpt.com", "huggingface.co", "perplexity.ai", "groq.com",
    "twitter.com", "x.com", "linkedin.com", "discord.com", "slack.com", "youtube.com", "reddit.com", "whatsapp.com",
    "cloudflare.com", "vercel.app", "netlify.app", "heroku.com", "aws.amazon.com", "azure.com",
    "wikipedia.org", "wikimedia.org", "coursera.org", "canvas.net", "vit.ac.in"
}

URL_SHORTENERS = {"bit.ly", "goo.gl", "t.co", "tinyurl.com", "ow.ly"}

@lru_cache(maxsize=4096)
def _cached_ml_predict(url: str):
    return ml_engine.predict(url)

class PhishingAnalysisService:
    def _build_response(self, url: str, probability: float, risk_level: str, reasons: list) -> AnalyzeResponse:
        # 2. Attach quantum benchmark comparison figures
        try:
            quantum_comp = quantum_service.get_comparison()
        except Exception as exc:
            logger.warning(f"Quantum service retrieval failed: {exc}")
            quantum_comp = {"classical_acc": 0.918, "quantum_acc": 0.742}

        # 3. Attach micro-training card for non-LOW results
        micro_training = None
        if risk_level in ("HIGH", "MEDIUM"):
            micro_training = get_micro_training_for_reasons(reasons)

        # 4. Persist to in-memory scan history
        history_store.add_scan(
            url=url,
            risk_level=risk_level,
            phishing_probability=probability,
        )

        # 5. Return Contract 1 compliant response
        return AnalyzeResponse(
            url=url,
            phishing_probability=probability,
            risk_level=risk_level,
            reasons=reasons,
            quantum_comparison=quantum_comp,
            micro_training=micro_training,
        )

    def analyze(self, request: AnalyzeRequest) -> AnalyzeResponse:
        original_url = request.url.strip()

        # --- Phase 1: Pre-Processing & Parser Defenses ---
        url = urllib.parse.unquote(original_url)
        parsed = urllib.parse.urlparse(url)

        if parsed.scheme not in ["http", "https"]:
            return self._build_response(url, 0.99, "HIGH", ["Dangerous protocol scheme detected (blocked by parser defense)"])

        hostname = parsed.hostname or ""
        hostname_lower = hostname.lower()

        # --- Phase 2: Whitelist & Safety Overrides ---
        is_punycode = "xn--" in hostname_lower
        
        has_dangerous_ext = bool(DANGEROUS_EXTENSIONS_RE.search(parsed.path))
        is_release_download = "/releases/download/" in parsed.path.lower()
        is_dangerous_payload = has_dangerous_ext or is_release_download

        is_whitelisted = False
        if hostname_lower in TRUSTED_DOMAINS_EXACT or hostname_lower in TRUSTED_DOMAINS_SUFFIX:
            is_whitelisted = True
        elif any(hostname_lower.endswith("." + suffix) for suffix in TRUSTED_DOMAINS_SUFFIX):
            is_whitelisted = True

        if is_whitelisted and not is_punycode and not is_dangerous_payload:
            return self._build_response(url, 0.01, "LOW", ["Trusted domain (Whitelisted by Safety Override)"])

        # --- Phase 3: Machine Learning & Heuristic Threat Rules ---
        try:
            probability, risk_level, reasons = _cached_ml_predict(url)
        except Exception as exc:
            logger.exception(f"ML inference failure for URL '{url}': {exc}")
            raise MLServiceUnavailableError(f"ML analysis service error: {exc}")

        # Phase 3 Heuristic Threat Rules & Safety Overrides
        threat_reasons = []

        # 1. URL Shortener Detection (High-risk override)
        if hostname_lower in URL_SHORTENERS or any(hostname_lower.endswith("." + s) for s in URL_SHORTENERS):
            probability = max(probability, 0.88)
            threat_reasons.append("URL shortener detected — frequently used to obfuscate malicious destinations")

        # 2. Script & Executable Download (Dangerous Payload Override)
        if is_dangerous_payload:
            probability = max(probability, 0.95)
            threat_reasons.append("Direct link to an executable script or release payload — high risk of malware delivery")

        # Note: Subdomain Depth, Target Brand Keyword Abuse, High-Risk TLD Filtering, and Abnormal Length 
        # are intentionally excluded here as they are natively handled by the ML features in ml_adapter.py

        # Merge heuristic reasons avoiding duplicates
        for r in threat_reasons:
            if r not in reasons:
                reasons.append(r)

        # If any threats were detected, remove the safe boilerplate reasons
        if threat_reasons or probability >= 0.4:
            safe_strings = [
                "Standard URL structure",
                "No malicious patterns detected",
                "Standard domain structure — no suspicious lexical indicators found"
            ]
            reasons = [r for r in reasons if r not in safe_strings]
            if not reasons:
                reasons.append("Lexical pattern anomaly flagged by heuristic rules")

        from app.services.ml_adapter import classify_risk
        risk_level = classify_risk(probability)

        return self._build_response(url, probability, risk_level, reasons)

phishing_service = PhishingAnalysisService()
