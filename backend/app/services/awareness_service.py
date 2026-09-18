"""
awareness_service.py — Static Phishing Awareness / Micro-Training Service (Phase 4)

This is a local knowledge base mapping phishing detection reasons to educational
awareness cards. It is NOT an adaptive ML personalisation engine and does NOT
call any external API or database.

Categories covered
──────────────────
1.  brand_impersonation   – brand name in subdomain / stacking
2.  excessive_subdomains  – abnormal subdomain depth
3.  raw_ip_address        – raw IP used as hostname
4.  suspicious_tld        – high-abuse TLD (.xyz, .top, .tk …)
5.  url_obfuscation       – high entropy / DGA-style hostnames
6.  unusual_characters    – '@' in URL, credential redirection
7.  suspicious_url        – security keywords (login, verify, update …)
8.  insecure_protocol     – HTTP for credential-related pages
9.  long_url              – excessive URL length
   (generic fallback)     – no category matched

Integration
───────────
phishing_service calls:
    get_micro_training_for_reasons(reasons: List[str]) → Optional[MicroTraining]

The function returns the card for the *first* matched category (highest-priority
match in list order).  Returns the generic card if nothing matches.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List, Optional

from app.schemas.analyze import MicroTraining


# ─────────────────────────────────────────────────────────────────────────────
# Knowledge base — ordered from most specific / highest severity to generic
# ─────────────────────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class _AwarenessEntry:
    category: str          # internal label (used in tests)
    signals: List[str]     # substrings to look for (case-insensitive, any-match)
    card: MicroTraining


_KNOWLEDGE_BASE: List[_AwarenessEntry] = [

    _AwarenessEntry(
        category="unusual_characters",
        signals=["'@'", "@ character", "credential-redirection"],
        card=MicroTraining(
            title="The '@' Trick — URL Credential Redirection",
            explanation=(
                "Browsers interpret everything before '@' in a URL as credentials and "
                "silently ignore it, so 'http://safe.com@evil.com/login' actually "
                "takes you to evil.com. Attackers hide the real destination this way."
            ),
            action_tip=(
                "If you see '@' anywhere in a URL, treat it as suspicious. "
                "Copy the URL to a text editor and read the actual hostname "
                "(the part after '@' and before the next '/')."
            ),
        ),
    ),

    _AwarenessEntry(
        category="raw_ip_address",
        signals=["raw ip", "ip address", "ip instead", "numerical ip", "registered domain"],
        card=MicroTraining(
            title="Raw IP Address in URL",
            explanation=(
                "Legitimate services always use a registered domain name with an SSL "
                "certificate (e.g. paypal.com). Phishing sites often expose their real "
                "server IP because they cannot get a certificate for a brand-name domain."
            ),
            action_tip=(
                "Never enter passwords or payment details on a page whose address bar "
                "shows an IP address (e.g. http://185.220.101.5/login). "
                "Verify the padlock and a recognisable domain name before proceeding."
            ),
        ),
    ),

    _AwarenessEntry(
        category="brand_impersonation",
        signals=["brand", "stacking", "non-authoritative", "impersonat", "brand name"],
        card=MicroTraining(
            title="Brand Impersonation via Subdomain Stacking",
            explanation=(
                "Attackers prefix a trusted brand name (e.g. 'paypal.com') into the "
                "subdomain of a domain they actually control "
                "(e.g. paypal.com.account-verify.xyz). "
                "The real owner of the destination is 'account-verify.xyz', not PayPal."
            ),
            action_tip=(
                "Read the URL from right to left: the actual domain is immediately "
                "before the first '/' that follows the host. "
                "Bookmark your bank and services — never follow links in emails."
            ),
        ),
    ),

    _AwarenessEntry(
        category="excessive_subdomains",
        signals=["subdomain depth", "subdomain level", "abnormal subdomain"],
        card=MicroTraining(
            title="Excessive Subdomain Depth",
            explanation=(
                "Legitimate websites rarely use more than two subdomain levels "
                "(e.g. mail.google.com). "
                "Deep chains like 'secure.login.verify.bank.attacker.xyz' are designed "
                "to push the real (malicious) domain name off your screen."
            ),
            action_tip=(
                "Hover over any link before clicking — look at the full URL in your "
                "browser's status bar. If the domain has more than two dots before "
                "the TLD, inspect it carefully."
            ),
        ),
    ),

    _AwarenessEntry(
        category="suspicious_tld",
        signals=["top-level domain", "high-abuse", "tld", ".xyz", ".top", ".tk",
                 ".ml", ".ga", ".cf", ".gq", ".club", ".site", ".live"],
        card=MicroTraining(
            title="High-Abuse Top-Level Domain (TLD)",
            explanation=(
                "Certain TLDs such as .xyz, .top, .tk, and .ml are popular with "
                "phishers because they are cheap or free and have lax registration "
                "controls. Legitimate businesses almost always use .com, .org, .gov, "
                "or their country-code TLD."
            ),
            action_tip=(
                "Be extra cautious with links ending in .xyz, .top, .tk, .ml, .ga, "
                ".cf, .gq, .club, or .site — especially when combined with urgent "
                "language or a familiar brand name in the subdomain."
            ),
        ),
    ),

    _AwarenessEntry(
        category="url_obfuscation",
        signals=["entropy", "dga", "randomized", "character entropy", "obfuscat",
                 "generated domain", "random character"],
        card=MicroTraining(
            title="URL Obfuscation via High-Entropy Hostnames",
            explanation=(
                "Domain Generation Algorithms (DGAs) produce hostnames that look like "
                "random strings (e.g. 'xk93n-c2.net'). Phishing kits use them to "
                "rotate domains rapidly, evading block-lists."
            ),
            action_tip=(
                "If the domain looks like a keyboard mash or a random sequence of "
                "letters and numbers, do not click. Legitimate services use clean, "
                "memorable domain names."
            ),
        ),
    ),

    _AwarenessEntry(
        category="insecure_protocol",
        signals=["insecure", "http connection", "http for", "http transmission",
                 "unencrypted"],
        card=MicroTraining(
            title="Insecure HTTP Instead of HTTPS",
            explanation=(
                "Any page that asks for credentials, payment details, or personal "
                "information must use HTTPS (the padlock icon). An HTTP page transmits "
                "your data in plain text — anyone on the same network can intercept it."
            ),
            action_tip=(
                "Look for 'https://' and the padlock icon before entering any "
                "sensitive information. If the browser shows a warning or the URL "
                "starts with 'http://', close the tab."
            ),
        ),
    ),

    _AwarenessEntry(
        category="suspicious_url",
        signals=["keyword", "login", "verify", "secure", "account", "update",
                 "confirm", "password", "auth", "signin", "billing", "recover",
                 "suspended", "credential-related"],
        card=MicroTraining(
            title="Credential-Harvesting Keywords in URL",
            explanation=(
                "Phishers craft URLs containing words like 'login', 'verify', "
                "'secure', or 'update' to make them look like legitimate "
                "authentication pages. The words are designed to lower your guard "
                "and prompt hasty action."
            ),
            action_tip=(
                "When you see security-sounding words in a URL, stop and navigate "
                "to the official site manually. Banks and services rarely send direct "
                "login links via email or SMS."
            ),
        ),
    ),

    _AwarenessEntry(
        category="long_url",
        signals=["long url", "unusually long", "url length", "characters"],
        card=MicroTraining(
            title="Suspiciously Long URL",
            explanation=(
                "Long URLs (typically over 75 characters) can be used to bury the "
                "real destination domain deep inside the string, or to stuff it with "
                "plausible-looking paths and query parameters that conceal the "
                "actual hostname."
            ),
            action_tip=(
                "Use a URL expander or inspect the beginning of the URL "
                "(the domain, right after 'https://') rather than the long path "
                "that follows. Most legitimate deep links use short, recognisable "
                "base domains."
            ),
        ),
    ),
]

# ─────────────────────────────────────────────────────────────────────────────
# Fallback card — returned when no category signal matches
# ─────────────────────────────────────────────────────────────────────────────

_GENERIC_CARD = MicroTraining(
    title="General Phishing Awareness",
    explanation=(
        "Phishing attacks disguise malicious destinations behind convincing "
        "imitations of trusted websites, using urgency, fear, or curiosity "
        "to bypass your critical thinking."
    ),
    action_tip=(
        "When in doubt: do not click. Navigate directly to the service by "
        "typing the known address into your browser, or use your bookmarks. "
        "Verify any unexpected request with the sender through a separate channel."
    ),
)


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def get_micro_training_for_reasons(reasons: List[str]) -> Optional[MicroTraining]:
    """
    Select the most relevant awareness card for a list of detection reasons.

    Algorithm:
    - Join all reasons into a single lower-cased string for matching.
    - Iterate through _KNOWLEDGE_BASE (highest-priority first).
    - Return the card for the first entry whose signals produce any substring match.
    - Fall back to _GENERIC_CARD if nothing matches.
    - Return None only when reasons is empty (LOW-risk URLs don't get a card).
    """
    if not reasons:
        return None

    combined = " ".join(reasons).lower()

    for entry in _KNOWLEDGE_BASE:
        if any(signal.lower() in combined for signal in entry.signals):
            return entry.card

    return _GENERIC_CARD


def list_categories() -> List[str]:
    """Return all category names in the knowledge base. Useful for tests."""
    return [e.category for e in _KNOWLEDGE_BASE]
