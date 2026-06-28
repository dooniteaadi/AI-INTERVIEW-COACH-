"""
Filler Words Detection
Detects common filler words in speech/text using regex
"""

import re
from typing import List, Tuple

# Common filler words and phrases
FILLER_WORDS = [
    r'\bum\b',
    r'\buh\b',
    r'\ber\b',
    r'\blike\b',
    r'\byou know\b',
    r'\bwell\b',
    r'\bso\b',
    r'\bactually\b',
    r'\bbasically\b',
    r'\bliterally\b',
    r'\bkind of\b',
    r'\bsort of\b',
    r'\bI mean\b',
    r'\byeah\b',
    r'\byep\b',
    r'\bnah\b',
    r'\buhm\b',
    r'\buhh\b',
    r'\bumm\b'
]

# Compile regex patterns for efficiency
FILLER_PATTERNS = [re.compile(pattern, re.IGNORECASE) for pattern in FILLER_WORDS]


def detect_filler_words(text: str) -> Tuple[int, List[str]]:
    """
    Detect filler words in text
    Returns:
        Tuple of (count, list of found filler words)
    """
    if not text:
        return 0, []
    
    found_fillers = []
    text_lower = text.lower()
    
    for pattern in FILLER_PATTERNS:
        matches = pattern.findall(text_lower)
        if matches:
            # Get the actual word/phrase from the pattern
            filler_word = pattern.pattern.replace(r'\b', '').replace('\\', '')
            found_fillers.extend([filler_word] * len(matches))
    
    # Remove duplicates while preserving order
    unique_fillers = list(dict.fromkeys(found_fillers))
    
    return len(found_fillers), unique_fillers


def calculate_filler_word_percentage(text: str) -> float:
    """
    Calculate percentage of filler words in text
    """
    if not text:
        return 0.0
    
    words = text.split()
    if not words:
        return 0.0
    
    filler_count, _ = detect_filler_words(text)
    return (filler_count / len(words)) * 100

