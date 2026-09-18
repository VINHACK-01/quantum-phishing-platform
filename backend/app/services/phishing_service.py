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
from app.schemas.analyze import AnalyzeRequest, AnalyzeResponse
from app.services.ml_adapter import ml_engine
from app.services.quantum_service import quantum_service
from app.services.awareness_service import get_micro_training_for_reasons
from app.core.history import history_store
from app.core.errors import MLServiceUnavailableError

logger = logging.getLogger(__name__)


class PhishingAnalysisService:
    def analyze(self, request: AnalyzeRequest) -> AnalyzeResponse:
        url = request.url.strip()

        # 1. Run prediction through the adapter (mock or real model)
        try:
            probability, risk_level, reasons = ml_engine.predict(url)
        except Exception as exc:
            logger.exception(f"ML inference failure for URL '{url}': {exc}")
            raise MLServiceUnavailableError(f"ML analysis service error: {exc}")

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


phishing_service = PhishingAnalysisService()
