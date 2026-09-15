"""
PII Anonymizer for Mental Health Chatbot.

Detects and redacts Personally Identifiable Information (PII) from user messages
before they are sent to the AI Engine / OpenAI API.

Detects:
- Nigerian phone numbers (various formats)
- Email addresses
- Names (using phrase patterns + Nigerian names database)

Usage:
    from app.utils.pii_anonymizer import anonymizer

    sanitized_text, stats = anonymizer.anonymize("My name is Chukwuemeka, call me at 08031234567")
    # sanitized_text: "My name is [NAME REDACTED], call me at [PHONE REDACTED]"
    # stats: {"phones": 1, "emails": 0, "names": 1}
"""

import re
from typing import Tuple, Dict
from .nigerian_names import NIGERIAN_NAMES_SET, COMMON_WORD_EXCLUSIONS


class PIIAnonymizer:
    """
    Anonymizes PII from user messages before sending to AI Engine.
    Thread-safe and stateless - safe to use as a singleton.
    """

    # Redaction placeholders
    PHONE_REDACTED = "[PHONE REDACTED]"
    EMAIL_REDACTED = "[EMAIL REDACTED]"
    NAME_REDACTED = "[NAME REDACTED]"

    def __init__(self):
        """Initialize and compile regex patterns for performance."""
        self._compile_phone_patterns()
        self._compile_email_pattern()
        self._compile_name_phrase_patterns()

    def _compile_phone_patterns(self):
        """
        Compile Nigerian phone number patterns.

        Nigerian mobile prefixes:
        - MTN: 0803, 0806, 0810, 0813, 0814, 0816, 0903, 0906, 0913, 0916
        - Glo: 0805, 0807, 0811, 0815, 0905, 0915
        - Airtel: 0802, 0808, 0812, 0701, 0708, 0902, 0907, 0912
        - 9mobile: 0809, 0817, 0818, 0908, 0909

        Formats supported:
        - +234-803-123-4567, +234 803 123 4567, +2348031234567
        - 0803-123-4567, 0803 123 4567, 08031234567
        - 234-803-123-4567, 234 803 123 4567, 2348031234567
        """
        phone_patterns = [
            # International format with + prefix
            r'\+234[-.\s]?[789][01]\d[-.\s]?\d{3}[-.\s]?\d{4}',  # +234-803-123-4567
            r'\+234\d{10}',  # +2348031234567

            # International format without + (just 234)
            r'(?<!\d)234[-.\s]?[789][01]\d[-.\s]?\d{3}[-.\s]?\d{4}(?!\d)',  # 234-803-123-4567
            r'(?<!\d)234\d{10}(?!\d)',  # 2348031234567

            # Local format starting with 0
            r'(?<!\d)0[789][01]\d[-.\s]?\d{3}[-.\s]?\d{4}(?!\d)',  # 0803-123-4567
            r'(?<!\d)0[789][01]\d{8}(?!\d)',  # 08031234567

            # Additional patterns for 070x numbers (Airtel)
            r'(?<!\d)070[1-9][-.\s]?\d{3}[-.\s]?\d{4}(?!\d)',  # 0701-123-4567
            r'(?<!\d)070[1-9]\d{7}(?!\d)',  # 07011234567
        ]

        # Compile all patterns into a single regex for efficiency
        combined_pattern = '|'.join(f'({p})' for p in phone_patterns)
        self._phone_regex = re.compile(combined_pattern, re.IGNORECASE)

    def _compile_email_pattern(self):
        """Compile email address pattern."""
        # Standard email pattern - handles most common email formats
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        self._email_regex = re.compile(email_pattern, re.IGNORECASE)

    def _compile_name_phrase_patterns(self):
        """
        Compile patterns for detecting names in phrases.

        Only using high-confidence patterns to avoid false positives.
        Patterns like "I am X" are too ambiguous (e.g., "I am worried").
        """
        # Only keep explicit name introduction patterns
        # Removed ambiguous patterns like "I am X", "Call me X", etc.
        phrase_patterns = [
            # "My name is John" or "My name is John Smith"
            r"my\s+name\s+is\s+(?P<name>[A-Za-z]+(?:\s+[A-Za-z]+)?)",
            # "name: John" (form-style input)
            r"name:\s*(?P<name>[A-Za-z]+(?:\s+[A-Za-z]+)?)",
        ]

        self._name_phrase_regexes = [
            re.compile(p, re.IGNORECASE) for p in phrase_patterns
        ]

    def anonymize(self, text: str) -> Tuple[str, Dict[str, int]]:
        """
        Anonymize PII in the given text.

        Args:
            text: The input text to anonymize

        Returns:
            Tuple of (anonymized_text, stats_dict)
            stats_dict contains counts: {"phones": N, "emails": N, "names": N}
        """
        if not text or not isinstance(text, str):
            return text, {"phones": 0, "emails": 0, "names": 0}

        stats = {"phones": 0, "emails": 0, "names": 0}

        # Order matters: redact phones first (to avoid partial matches with names)
        # then emails, then names
        text, phone_count = self._redact_phones(text)
        stats["phones"] = phone_count

        text, email_count = self._redact_emails(text)
        stats["emails"] = email_count

        text, name_count = self._redact_names(text)
        stats["names"] = name_count

        return text, stats

    def _redact_phones(self, text: str) -> Tuple[str, int]:
        """
        Redact Nigerian phone numbers from text.

        Returns:
            Tuple of (redacted_text, count_of_redactions)
        """
        count = len(self._phone_regex.findall(text))
        redacted = self._phone_regex.sub(self.PHONE_REDACTED, text)
        return redacted, count

    def _redact_emails(self, text: str) -> Tuple[str, int]:
        """
        Redact email addresses from text.

        Returns:
            Tuple of (redacted_text, count_of_redactions)
        """
        count = len(self._email_regex.findall(text))
        redacted = self._email_regex.sub(self.EMAIL_REDACTED, text)
        return redacted, count

    def _redact_names(self, text: str) -> Tuple[str, int]:
        """
        Redact names from text using two strategies:

        1. Phrase-based detection: "My name is X", "I am X", etc.
        2. Nigerian names database lookup for standalone capitalized words

        Returns:
            Tuple of (redacted_text, count_of_redactions)
        """
        count = 0

        # Strategy 1: Phrase-based detection (high confidence)
        for regex in self._name_phrase_regexes:
            matches = list(regex.finditer(text))
            for match in reversed(matches):  # Reverse to maintain indices
                name = match.group('name')
                if name and name.lower() not in COMMON_WORD_EXCLUSIONS:
                    # Replace just the name part, not the whole phrase
                    start = match.start('name')
                    end = match.end('name')
                    text = text[:start] + self.NAME_REDACTED + text[end:]
                    count += 1

        # Strategy 2: Nigerian names database lookup
        # Find capitalized words and check against database
        # Only check words that haven't already been redacted
        words = re.findall(r'\b([A-Z][a-z]+)\b', text)

        for word in words:
            word_lower = word.lower()

            # Skip if it's a common word that shouldn't be redacted
            if word_lower in COMMON_WORD_EXCLUSIONS:
                continue

            # Skip if it's already been redacted
            if self.NAME_REDACTED in word:
                continue

            # Check if it's a Nigerian name
            if word_lower in NIGERIAN_NAMES_SET:
                # Use word boundary to avoid partial replacements
                pattern = re.compile(r'\b' + re.escape(word) + r'\b')
                new_text = pattern.sub(self.NAME_REDACTED, text, count=1)
                if new_text != text:
                    text = new_text
                    count += 1

        return text, count

    def get_pii_types_detected(self, text: str) -> Dict[str, bool]:
        """
        Check which types of PII are present in the text without redacting.
        Useful for validation or warning purposes.

        Args:
            text: The text to check

        Returns:
            Dict with boolean flags: {"has_phone": bool, "has_email": bool, "has_name": bool}
        """
        if not text:
            return {"has_phone": False, "has_email": False, "has_name": False}

        has_phone = bool(self._phone_regex.search(text))
        has_email = bool(self._email_regex.search(text))

        # Check for names (must also check exclusion list)
        has_name = False
        for regex in self._name_phrase_regexes:
            match = regex.search(text)
            if match:
                name = match.group('name')
                # Only count as name if not in exclusion list
                if name and name.lower() not in COMMON_WORD_EXCLUSIONS:
                    has_name = True
                    break

        if not has_name:
            # Check database
            words = re.findall(r'\b([A-Z][a-z]+)\b', text)
            for word in words:
                word_lower = word.lower()
                if word_lower not in COMMON_WORD_EXCLUSIONS and word_lower in NIGERIAN_NAMES_SET:
                    has_name = True
                    break

        return {"has_phone": has_phone, "has_email": has_email, "has_name": has_name}


# Singleton instance for reuse across the application
# Thread-safe as it's stateless after initialization
anonymizer = PIIAnonymizer()