from app.schemas.analyze import AnalyzeRequest, AnalyzeResponse
from app.services.ml_adapter import ml_engine
from app.services.quantum_service import quantum_service
from app.services.awareness_service import get_micro_training_for_reasons
from app.core.history import history_store

class PhishingAnalysisService:
    def analyze(self, request: AnalyzeRequest) -> AnalyzeResponse:
        url = request.url.strip()
        
        # 1. Run inference (ML model or intelligent fallback)
        probability, risk_level, reasons = ml_engine.predict(url)
        
        # 2. Retrieve honest quantum benchmark comparison
        quantum_comp = quantum_service.get_comparison()
        
        # 3. Retrieve relevant micro-training snippet based on detection reasons
        micro_training = None
        if risk_level in ["HIGH", "MEDIUM"]:
            micro_training = get_micro_training_for_reasons(reasons)
            
        # 4. Save to in-memory history
        history_store.add_scan(
            url=url,
            risk_level=risk_level,
            phishing_probability=probability
        )
        
        # 5. Return Contract 1 response
        return AnalyzeResponse(
            url=url,
            phishing_probability=probability,
            risk_level=risk_level,
            reasons=reasons,
            quantum_comparison=quantum_comp,
            micro_training=micro_training
        )

phishing_service = PhishingAnalysisService()
