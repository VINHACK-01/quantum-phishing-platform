import math
import re
from urllib.parse import urlparse

def calculate_entropy(text: str) -> float:
    """Calculates Shannon entropy to catch randomized/DGA string patterns."""
    if not text:
        return 0.0
    entropy = 0.0
    for x in range(256):
        p_x = text.count(chr(x)) / len(text)
        if p_x > 0:
            entropy += - p_x * math.log2(p_x)
    return entropy

def check_brand_keywords(url: str) -> int:
    """Detects high-risk targeted brand terms often abused in phishing."""
    brands = ['paypal', 'login', 'secure', 'bank', 'account', 'verify', 'update', 'signin']
    url_lower = str(url).lower()
    return sum(1 for brand in brands if brand in url_lower)

def extract_features(url: str) -> list:
    """Combines structural, lexical, entropy, and keyword features into a flat numerical vector."""
    url_str = str(url)
    url_len = len(url_str)
    
    # Special character and symbol counts expected by the model matrix
    features_list = ['@', '?', '-', '=', '.', '#', '%', '+', '$', '!', '*', ',', '//']
    counts = [url_str.count(char) for char in features_list]
    
    # Advanced metrics
    entropy = calculate_entropy(url_str)
    brand_count = check_brand_keywords(url_str)
    
    # Complete feature vector matching training structure
    return [url_len] + counts + [entropy, brand_count]
