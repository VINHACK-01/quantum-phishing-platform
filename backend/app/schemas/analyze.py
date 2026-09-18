from pydantic import BaseModel, Field
from typing import List, Optional

class AnalyzeRequest(BaseModel):
    url: str = Field(..., description="The target URL to inspect for phishing indicators", json_schema_extra={"example": "https://secure-login-paypal.com.account-verify.xyz/auth"})

class QuantumComparison(BaseModel):
    classical_acc: float = Field(..., description="Accuracy of production Classical Random Forest/SVM model", json_schema_extra={"example": 0.918})
    quantum_acc: float = Field(..., description="Accuracy of PennyLane Variational Quantum Classifier benchmark", json_schema_extra={"example": 0.742})

class MicroTraining(BaseModel):
    title: str = Field(..., description="Educational topic name for the detected threat")
    explanation: str = Field(..., description="Explanation of how attackers construct this vector")
    action_tip: str = Field(..., description="Actionable advice on how to detect and avoid this threat")

class AnalyzeResponse(BaseModel):
    url: str
    phishing_probability: float = Field(..., ge=0.0, le=1.0, description="Phishing likelihood score between 0.0 and 1.0")
    risk_level: str = Field(..., description="HIGH, MEDIUM, or LOW")
    reasons: List[str] = Field(default_factory=list, description="Explainable feature reasons behind the classification")
    quantum_comparison: QuantumComparison
    micro_training: Optional[MicroTraining] = None
