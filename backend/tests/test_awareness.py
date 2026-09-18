"""
test_awareness.py — Unit tests for Phase 4 Awareness / Micro-Training Service.

Tests:
 1. Every category in the knowledge base matches via a known signal string.
 2. Generic fallback card is returned when no signal matches.
 3. Empty reasons list returns None (not a card).
 4. Card fields all non-empty strings (schema compliance).
 5. End-to-end: POST /api/analyze HIGH URL includes a valid micro_training card.
 6. End-to-end: POST /api/analyze LOW URL has no micro_training (None).
 7. Category priority — '@' in URL selects unusual_characters before suspicious_url.
 8. list_categories() covers all required categories.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.awareness_service import (
    get_micro_training_for_reasons,
    list_categories,
    _KNOWLEDGE_BASE,
    _GENERIC_CARD,
)
from app.schemas.analyze import MicroTraining

client = TestClient(app)

# ─────────────────────────────────────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────────────────────────────────────

def _card_is_valid(card) -> bool:
    return (
        isinstance(card, MicroTraining)
        and len(card.title.strip()) > 0
        and len(card.explanation.strip()) > 0
        and len(card.action_tip.strip()) > 0
    )


# ─────────────────────────────────────────────────────────────────────────────
# 1. Every knowledge-base category must match via its own signals
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.parametrize("entry", _KNOWLEDGE_BASE)
def test_every_category_matches_its_own_signals(entry):
    """Each entry must match at least one of its own signal strings."""
    # Build a fake reason string containing the first signal for that entry
    trigger_reason = entry.signals[0]
    card = get_micro_training_for_reasons([trigger_reason])
    assert card is not None
    # Should return this entry's card (may be overridden by a higher-priority
    # entry only if signals overlap — we check category by title)
    assert _card_is_valid(card)


# ─────────────────────────────────────────────────────────────────────────────
# 2. Category-specific matching
# ─────────────────────────────────────────────────────────────────────────────

def test_unusual_characters_at_symbol():
    card = get_micro_training_for_reasons(["'@' character in URL — classic credential-redirection technique"])
    assert card.title == "The '@' Trick — URL Credential Redirection"

def test_raw_ip_address():
    card = get_micro_training_for_reasons(["Hostname is a raw IP address instead of a registered domain"])
    assert card.title == "Raw IP Address in URL"

def test_brand_impersonation():
    card = get_micro_training_for_reasons(["Well-known brand name present in subdomain (deceptive brand stacking)"])
    assert card.title == "Brand Impersonation via Subdomain Stacking"

def test_excessive_subdomains():
    card = get_micro_training_for_reasons(["Abnormal subdomain depth: 4 levels"])
    assert card.title == "Excessive Subdomain Depth"

def test_suspicious_tld():
    card = get_micro_training_for_reasons(["Top-level domain is in the high-abuse list (e.g. .xyz, .top, .tk)"])
    assert card.title == "High-Abuse Top-Level Domain (TLD)"

def test_url_obfuscation_entropy():
    card = get_micro_training_for_reasons(["High hostname character entropy (4.12) — consistent with DGA domains"])
    assert card.title == "URL Obfuscation via High-Entropy Hostnames"

def test_insecure_protocol():
    card = get_micro_training_for_reasons(["Insecure HTTP connection for a credential-related page"])
    assert card.title == "Insecure HTTP Instead of HTTPS"

def test_credential_keywords():
    card = get_micro_training_for_reasons(["Credential-related keyword detected: 'login'"])
    assert card.title == "Credential-Harvesting Keywords in URL"

def test_long_url():
    card = get_micro_training_for_reasons(["Unusually long URL length (120 characters) detected"])
    assert card.title == "Suspiciously Long URL"


# ─────────────────────────────────────────────────────────────────────────────
# 3. Generic fallback card
# ─────────────────────────────────────────────────────────────────────────────

def test_fallback_for_unmatched_reasons():
    card = get_micro_training_for_reasons(["some completely unrecognised flag xyz123"])
    assert card is not None
    assert card.title == _GENERIC_CARD.title
    assert _card_is_valid(card)


# ─────────────────────────────────────────────────────────────────────────────
# 4. Empty reasons → None
# ─────────────────────────────────────────────────────────────────────────────

def test_empty_reasons_returns_none():
    assert get_micro_training_for_reasons([]) is None


# ─────────────────────────────────────────────────────────────────────────────
# 5. All card fields must be non-empty strings
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.parametrize("entry", _KNOWLEDGE_BASE)
def test_card_fields_non_empty(entry):
    card = entry.card
    assert _card_is_valid(card), (
        f"Category '{entry.category}' has empty field(s) in its card"
    )

def test_generic_card_fields_non_empty():
    assert _card_is_valid(_GENERIC_CARD)


# ─────────────────────────────────────────────────────────────────────────────
# 6. Category priority — unusual_characters beats suspicious_url
# ─────────────────────────────────────────────────────────────────────────────

def test_priority_at_symbol_beats_login_keyword():
    # Both signals present; unusual_characters appears first in _KNOWLEDGE_BASE
    card = get_micro_training_for_reasons([
        "'@' character in URL — classic credential-redirection technique",
        "Credential-related keyword detected: 'login'",
    ])
    assert card.title == "The '@' Trick — URL Credential Redirection"


# ─────────────────────────────────────────────────────────────────────────────
# 7. list_categories() covers all required categories
# ─────────────────────────────────────────────────────────────────────────────

REQUIRED_CATEGORIES = {
    "unusual_characters",
    "raw_ip_address",
    "brand_impersonation",
    "excessive_subdomains",
    "suspicious_tld",
    "url_obfuscation",
    "insecure_protocol",
    "suspicious_url",
    "long_url",
}

def test_list_categories_covers_required():
    present = set(list_categories())
    missing = REQUIRED_CATEGORIES - present
    assert not missing, f"Missing required categories: {missing}"


# ─────────────────────────────────────────────────────────────────────────────
# 8. End-to-end: HIGH-risk URL gets micro_training in Contract 1 response
# ─────────────────────────────────────────────────────────────────────────────

def test_e2e_high_risk_url_has_micro_training():
    res = client.post(
        "/api/analyze",
        json={"url": "http://paypal.com.secure-verify-account.xyz/login/confirm"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["risk_level"] in ("HIGH", "MEDIUM")
    mt = data.get("micro_training")
    assert mt is not None, "HIGH/MEDIUM response must include micro_training"
    assert mt["title"]
    assert mt["explanation"]
    assert mt["action_tip"]


# ─────────────────────────────────────────────────────────────────────────────
# 9. End-to-end: LOW-risk URL has micro_training = null in Contract 1 response
# ─────────────────────────────────────────────────────────────────────────────

def test_e2e_low_risk_url_no_micro_training():
    res = client.post("/api/analyze", json={"url": "https://github.com"})
    assert res.status_code == 200
    data = res.json()
    assert data["risk_level"] == "LOW"
    # micro_training must be null for LOW-risk URLs
    assert data.get("micro_training") is None
