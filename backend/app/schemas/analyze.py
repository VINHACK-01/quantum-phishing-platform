import re
from urllib.parse import urlparse
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal

RiskLevel = Literal["LOW", "MEDIUM", "HIGH"]

class AnalyzeRequest(BaseModel):
    url: str = Field(
        ...,
        min_length=3,
        max_length=2048,
        description="The target URL to inspect for phishing indicators",
        json_schema_extra={"example": "https://secure-login-paypal.com.account-verify.xyz/auth"}
    )

    @field_validator("url")
    @classmethod
    def validate_url(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("URL cannot be empty or whitespace only")
        if " " in trimmed:
            raise ValueError("URL must not contain internal spaces")
        
        # Validate parseable host structure
        candidate = trimmed if trimmed.startswith(("http://", "https://")) else f"http://{trimmed}"
        parsed = urlparse(candidate)
        
        if not parsed.netloc:
            raise ValueError("URL must have a valid domain or host component")
            
        host = parsed.netloc.split(":")[0].lower()
        is_ip = bool(re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", host))
        is_localhost = host in ["localhost", "127.0.0.1"]
        has_tld = "." in host and len(host.split(".")[-1]) >= 2
        
        if not (is_ip or is_localhost or has_tld):
            raise ValueError("URL must contain a valid domain name with a TLD or an IP address")
            
        return trimmed

class QuantumComparison(BaseModel):
    classical_acc: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Accuracy of production Classical Random Forest/SVM model (0.0 to 1.0)",
        json_schema_extra={"example": 0.918}
    )
    quantum_acc: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Accuracy of PennyLane Variational Quantum Classifier benchmark (0.0 to 1.0)",
        json_schema_extra={"example": 0.742}
    )

class MicroTraining(BaseModel):
    title: str = Field(..., min_length=1, description="Educational topic name for the detected threat")
    explanation: str = Field(..., min_length=1, description="Explanation of how attackers construct this vector")
    action_tip: str = Field(..., min_length=1, description="Actionable advice on how to detect and avoid this threat")

class AnalyzeResponse(BaseModel):
    url: str = Field(..., description="The analyzed URL")
    phishing_probability: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Phishing likelihood score strictly bounded between 0.0 and 1.0"
    )
    risk_level: RiskLevel = Field(
        ...,
        description="Categorical risk assessment: LOW, MEDIUM, or HIGH"
    )
    reasons: List[str] = Field(
        default_factory=list,
        description="Explainable feature reasons behind the risk classification"
    )
    quantum_comparison: QuantumComparison = Field(
        ...,
        description="Comparative accuracy metrics between classical ML and quantum simulator"
    )
    micro_training: Optional[MicroTraining] = Field(
        None,
        description="Targeted micro-training awareness card based on detected indicators"
    )
