import re
from typing import Optional, List
from app.schemas.analyze import MicroTraining

AWARENESS_MODULES = [
    {
        "keywords": ["subdomain", "depth", "brand", "stacking", "paypal", "apple", "google", "microsoft", "bank"],
        "training": MicroTraining(
            title="Spotting Deceptive Brand Stacking in Subdomains",
            explanation="Attackers frequently prefix reputable company names into the subdomains of an unrelated malicious root domain (e.g. paypal.com.verify-security.net).",
            action_tip="Always read the host from right to left before the first forward slash. In 'paypal.com.verify-security.net', the true host is 'verify-security.net', NOT PayPal."
        )
    },
    {
        "keywords": ["ip", "literal", "raw ip"],
        "training": MicroTraining(
            title="IP Address Hostnames vs Domain Names",
            explanation="Legitimate financial, corporate, and social websites use registered domains with validated SSL certificates, never raw numerical IP addresses.",
            action_tip="Never enter account passwords or personal details into URLs displaying an IP address (e.g., http://192.168.1.1/login or http://45.33.32.156/)."
        )
    },
    {
        "keywords": ["entropy", "random", "gibberish", "character"],
        "training": MicroTraining(
            title="Detecting High-Entropy & Generated Domains",
            explanation="Phishing kits often use Domain Generation Algorithms (DGA) or throwaway random alphanumeric strings to evade domain reputation filters.",
            action_tip="Be suspicious of random character strings in the domain (e.g., 'x9q2m-auth.xyz'). Genuine brands maintain recognizable, clean names."
        )
    },
    {
        "keywords": ["keyword", "login", "verify", "secure", "update", "account", "suspended"],
        "training": MicroTraining(
            title="Urgency Keywords and Credential Harvesting",
            explanation="Social engineering relies on false urgency terms such as 'Account Suspended', 'Urgent Verification', or 'Password Expired' to trigger hasty actions.",
            action_tip="Never click re-verification links in unsolicited emails or SMS messages. Open a new tab and navigate to the official service directly."
        )
    },
    {
        "keywords": ["homograph", "punycode", "typosquatting"],
        "training": MicroTraining(
            title="Spotting Homograph and Typosquatting Attacks",
            explanation="Attackers register domains with subtle misspellings (e.g. 'paypaI' with capital 'i' instead of 'l') or Cyrillic characters that look identical to Latin letters.",
            action_tip="Carefully inspect the spelling in your browser's address bar and check the SSL certificate details by clicking the padlock icon."
        )
    }
]

DEFAULT_TRAINING = MicroTraining(
    title="General URL Hygiene & Threat Prevention",
    explanation="Modern phishing campaigns disguise malicious destinations behind layered redirection, cloaked links, and spoofed UI layouts.",
    action_tip="Hover over links to verify the actual destination before clicking. Bookmark your critical banking and service portals rather than following email links."
)

def get_micro_training_for_reasons(reasons: List[str]) -> Optional[MicroTraining]:
    if not reasons:
        return None
        
    combined_reasons = " ".join(reasons).lower()
    for module in AWARENESS_MODULES:
        if any(re.search(rf"\b{re.escape(keyword)}\b", combined_reasons) for keyword in module["keywords"]):
            return module["training"]
            
    return DEFAULT_TRAINING
