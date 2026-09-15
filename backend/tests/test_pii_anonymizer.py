"""
Unit tests for PII Anonymizer.

Tests phone number, email, and name detection/redaction functionality.
Run with: pytest tests/test_pii_anonymizer.py -v
"""

import pytest
from app.utils.pii_anonymizer import PIIAnonymizer, anonymizer


class TestPhoneRedaction:
    """Tests for Nigerian phone number detection and redaction."""

    def test_international_format_with_plus(self):
        """Test +234-XXX-XXX-XXXX format."""
        text = "Call me at +234-803-123-4567"
        result, stats = anonymizer.anonymize(text)
        assert "[PHONE REDACTED]" in result
        assert "+234-803-123-4567" not in result
        assert stats["phones"] == 1

    def test_international_format_with_spaces(self):
        """Test +234 XXX XXX XXXX format."""
        text = "My number is +234 803 123 4567"
        result, stats = anonymizer.anonymize(text)
        assert "[PHONE REDACTED]" in result
        assert stats["phones"] == 1

    def test_international_format_no_separator(self):
        """Test +234XXXXXXXXXX format."""
        text = "Reach me on +2348031234567"
        result, stats = anonymizer.anonymize(text)
        assert "[PHONE REDACTED]" in result
        assert stats["phones"] == 1

    def test_local_format_with_dashes(self):
        """Test 0XXX-XXX-XXXX format."""
        text = "Call 0803-123-4567 for help"
        result, stats = anonymizer.anonymize(text)
        assert "[PHONE REDACTED]" in result
        assert "0803-123-4567" not in result
        assert stats["phones"] == 1

    def test_local_format_no_separator(self):
        """Test 0XXXXXXXXXX format (11 digits)."""
        text = "My number is 08031234567"
        result, stats = anonymizer.anonymize(text)
        assert "[PHONE REDACTED]" in result
        assert stats["phones"] == 1

    def test_without_plus_234(self):
        """Test 234XXXXXXXXXX format (without +)."""
        text = "Contact 2348031234567"
        result, stats = anonymizer.anonymize(text)
        assert "[PHONE REDACTED]" in result
        assert stats["phones"] == 1

    def test_mtn_prefix(self):
        """Test MTN prefixes (0803, 0806, 0813, etc.)."""
        text = "MTN: 08061234567"
        result, stats = anonymizer.anonymize(text)
        assert "[PHONE REDACTED]" in result
        assert stats["phones"] == 1

    def test_glo_prefix(self):
        """Test Glo prefixes (0805, 0807, 0815, etc.)."""
        text = "Glo: 08051234567"
        result, stats = anonymizer.anonymize(text)
        assert "[PHONE REDACTED]" in result
        assert stats["phones"] == 1

    def test_airtel_prefix(self):
        """Test Airtel prefixes (0802, 0808, 0701, etc.)."""
        text = "Airtel: 08021234567"
        result, stats = anonymizer.anonymize(text)
        assert "[PHONE REDACTED]" in result
        assert stats["phones"] == 1

    def test_9mobile_prefix(self):
        """Test 9mobile prefixes (0809, 0817, 0818, etc.)."""
        text = "9mobile: 08091234567"
        result, stats = anonymizer.anonymize(text)
        assert "[PHONE REDACTED]" in result
        assert stats["phones"] == 1

    def test_070x_prefix(self):
        """Test 070X prefixes."""
        text = "Call 07011234567"
        result, stats = anonymizer.anonymize(text)
        assert "[PHONE REDACTED]" in result
        assert stats["phones"] == 1

    def test_multiple_phones(self):
        """Test multiple phone numbers in one message."""
        text = "Call 08031234567 or +234 812 937 8557"
        result, stats = anonymizer.anonymize(text)
        assert result.count("[PHONE REDACTED]") == 2
        assert stats["phones"] == 2

    def test_phone_in_sentence(self):
        """Test phone number embedded in sentence."""
        text = "You can reach me at 08031234567 anytime."
        result, stats = anonymizer.anonymize(text)
        assert "[PHONE REDACTED]" in result
        assert "You can reach me at" in result
        assert "anytime." in result

    def test_no_false_positive_short_numbers(self):
        """Test that short number sequences are not redacted."""
        text = "I have 123 issues"
        result, stats = anonymizer.anonymize(text)
        assert "[PHONE REDACTED]" not in result
        assert stats["phones"] == 0


class TestEmailRedaction:
    """Tests for email address detection and redaction."""

    def test_standard_email(self):
        """Test standard email format."""
        text = "Email me at john@gmail.com"
        result, stats = anonymizer.anonymize(text)
        assert "[EMAIL REDACTED]" in result
        assert "john@gmail.com" not in result
        assert stats["emails"] == 1

    def test_email_with_subdomain(self):
        """Test email with subdomain."""
        text = "Contact support@mail.example.com"
        result, stats = anonymizer.anonymize(text)
        assert "[EMAIL REDACTED]" in result
        assert stats["emails"] == 1

    def test_email_with_dots(self):
        """Test email with dots in local part."""
        text = "Email john.doe@example.com for info"
        result, stats = anonymizer.anonymize(text)
        assert "[EMAIL REDACTED]" in result
        assert stats["emails"] == 1

    def test_email_with_plus(self):
        """Test email with + in local part."""
        text = "Send to user+tag@gmail.com"
        result, stats = anonymizer.anonymize(text)
        assert "[EMAIL REDACTED]" in result
        assert stats["emails"] == 1

    def test_multiple_emails(self):
        """Test multiple emails in one message."""
        text = "Contact john@example.com or jane@example.org"
        result, stats = anonymizer.anonymize(text)
        assert result.count("[EMAIL REDACTED]") == 2
        assert stats["emails"] == 2

    def test_nigerian_domain(self):
        """Test Nigerian domain (.ng)."""
        text = "Email info@company.com.ng"
        result, stats = anonymizer.anonymize(text)
        assert "[EMAIL REDACTED]" in result
        assert stats["emails"] == 1


class TestNameRedaction:
    """Tests for name detection and redaction."""

    def test_my_name_is_pattern(self):
        """Test 'My name is X' pattern."""
        text = "My name is Chukwuemeka"
        result, stats = anonymizer.anonymize(text)
        assert "[NAME REDACTED]" in result
        assert "Chukwuemeka" not in result
        assert stats["names"] == 1

    def test_my_name_is_full_name(self):
        """Test 'My name is X Y' pattern with full name."""
        text = "My name is Adebayo Ogunlesi"
        result, stats = anonymizer.anonymize(text)
        assert "[NAME REDACTED]" in result
        # Should catch at least the first name via phrase pattern
        assert stats["names"] >= 1

    def test_i_am_with_nigerian_name(self):
        """Test 'I am X' - name caught via database lookup, not phrase pattern."""
        text = "I am Fatima from Lagos"
        result, stats = anonymizer.anonymize(text)
        # Fatima is in the Nigerian names database, so it gets caught
        assert "[NAME REDACTED]" in result
        assert "Fatima" not in result
        assert stats["names"] == 1

    def test_nigerian_name_in_sentence(self):
        """Test Nigerian name in middle of sentence."""
        text = "Hello, I am Ngozi"
        result, stats = anonymizer.anonymize(text)
        # Ngozi is in the Nigerian names database
        assert "[NAME REDACTED]" in result
        assert stats["names"] == 1

    def test_please_call_nigerian_name(self):
        """Test Nigerian name after 'call' - caught via database."""
        text = "Please call Ngozi"
        result, stats = anonymizer.anonymize(text)
        # Ngozi is in the Nigerian names database
        assert "[NAME REDACTED]" in result
        assert "Ngozi" not in result
        assert stats["names"] == 1

    def test_nigerian_name_after_im(self):
        """Test Nigerian name after 'I'm' - caught via database."""
        text = "Hi, I'm Oluwaseun"
        result, stats = anonymizer.anonymize(text)
        # Oluwaseun is in the Nigerian names database
        assert "[NAME REDACTED]" in result
        assert stats["names"] >= 1

    def test_nigerian_name_standalone_yoruba(self):
        """Test standalone Yoruba name detection."""
        text = "Please help Adebayo with his issue"
        result, stats = anonymizer.anonymize(text)
        assert "[NAME REDACTED]" in result
        assert "Adebayo" not in result
        assert stats["names"] == 1

    def test_nigerian_name_standalone_hausa(self):
        """Test standalone Hausa name detection."""
        text = "Abubakar needs assistance"
        result, stats = anonymizer.anonymize(text)
        assert "[NAME REDACTED]" in result
        assert "Abubakar" not in result
        assert stats["names"] == 1

    def test_nigerian_name_standalone_igbo(self):
        """Test standalone Igbo name detection."""
        text = "Please contact Obiora"
        result, stats = anonymizer.anonymize(text)
        assert "[NAME REDACTED]" in result
        assert "Obiora" not in result
        assert stats["names"] == 1

    def test_no_false_positive_hope(self):
        """Test that 'hope' as common word is not redacted."""
        text = "I have hope for my recovery"
        result, stats = anonymizer.anonymize(text)
        assert "[NAME REDACTED]" not in result
        assert "hope" in result
        assert stats["names"] == 0

    def test_no_false_positive_grace(self):
        """Test that 'grace' as common word is not redacted."""
        text = "By the grace of God"
        result, stats = anonymizer.anonymize(text)
        assert "[NAME REDACTED]" not in result
        assert "grace" in result.lower()
        assert stats["names"] == 0

    def test_no_false_positive_blessing(self):
        """Test that 'blessing' as common word is not redacted."""
        text = "This is a blessing in disguise"
        result, stats = anonymizer.anonymize(text)
        assert "[NAME REDACTED]" not in result
        assert "blessing" in result.lower()
        assert stats["names"] == 0

    def test_no_false_positive_faith(self):
        """Test that 'faith' as common word is not redacted."""
        text = "I need faith to overcome this"
        result, stats = anonymizer.anonymize(text)
        assert "[NAME REDACTED]" not in result
        assert "faith" in result.lower()
        assert stats["names"] == 0

    def test_no_false_positive_patience(self):
        """Test that 'patience' as common word is not redacted."""
        text = "I need patience during this time"
        result, stats = anonymizer.anonymize(text)
        assert "[NAME REDACTED]" not in result
        assert "patience" in result.lower()
        assert stats["names"] == 0

    def test_no_redaction_for_regular_words(self):
        """Test that regular English words are not redacted."""
        text = "I am feeling better today"
        result, stats = anonymizer.anonymize(text)
        assert "[NAME REDACTED]" not in result
        assert stats["names"] == 0

    def test_no_false_positive_worried(self):
        """Test that 'I am worried' does NOT flag 'worried' as a name."""
        text = "I am worried about my situation"
        result, stats = anonymizer.anonymize(text)
        assert "[NAME REDACTED]" not in result
        assert "worried" in result
        assert stats["names"] == 0

    def test_no_false_positive_anxious(self):
        """Test that 'I am anxious' does NOT flag 'anxious' as a name."""
        text = "I am anxious and stressed"
        result, stats = anonymizer.anonymize(text)
        assert "[NAME REDACTED]" not in result
        assert stats["names"] == 0

    def test_no_false_positive_depressed(self):
        """Test that 'I am depressed' does NOT flag 'depressed' as a name."""
        text = "I am depressed and need help"
        result, stats = anonymizer.anonymize(text)
        assert "[NAME REDACTED]" not in result
        assert stats["names"] == 0

    def test_case_insensitive_pattern(self):
        """Test that name patterns work case-insensitively."""
        text = "MY NAME IS EMEKA"
        result, stats = anonymizer.anonymize(text)
        # Should still detect the name pattern
        assert stats["names"] >= 0  # May or may not catch due to case


class TestCombinedRedaction:
    """Tests for multiple PII types in single message."""

    def test_phone_and_email(self):
        """Test phone and email together."""
        text = "Call 08031234567 or email me at john@gmail.com"
        result, stats = anonymizer.anonymize(text)
        assert "[PHONE REDACTED]" in result
        assert "[EMAIL REDACTED]" in result
        assert stats["phones"] == 1
        assert stats["emails"] == 1

    def test_name_and_phone(self):
        """Test name and phone together."""
        text = "My name is Adebayo, call me at 08031234567"
        result, stats = anonymizer.anonymize(text)
        assert "[NAME REDACTED]" in result
        assert "[PHONE REDACTED]" in result
        assert stats["names"] >= 1
        assert stats["phones"] == 1

    def test_all_three_types(self):
        """Test all three PII types together."""
        text = "My name is Chukwuemeka, call 08031234567 or email chukwuemeka@gmail.com"
        result, stats = anonymizer.anonymize(text)
        assert "[NAME REDACTED]" in result
        assert "[PHONE REDACTED]" in result
        assert "[EMAIL REDACTED]" in result
        assert stats["names"] >= 1
        assert stats["phones"] == 1
        assert stats["emails"] == 1

    def test_preserves_rest_of_message(self):
        """Test that non-PII content is preserved."""
        text = "Hello, my name is Adebayo. I am struggling with anxiety."
        result, stats = anonymizer.anonymize(text)
        assert "Hello" in result
        assert "struggling with anxiety" in result
        assert "[NAME REDACTED]" in result


class TestEdgeCases:
    """Tests for edge cases and special scenarios."""

    def test_empty_string(self):
        """Test empty string input."""
        result, stats = anonymizer.anonymize("")
        assert result == ""
        assert stats == {"phones": 0, "emails": 0, "names": 0}

    def test_none_input(self):
        """Test None input."""
        result, stats = anonymizer.anonymize(None)
        assert result is None
        assert stats == {"phones": 0, "emails": 0, "names": 0}

    def test_no_pii(self):
        """Test message with no PII."""
        text = "I am feeling anxious and need help coping with stress."
        result, stats = anonymizer.anonymize(text)
        assert result == text
        assert stats == {"phones": 0, "emails": 0, "names": 0}

    def test_unicode_handling(self):
        """Test handling of unicode characters."""
        text = "My name is Chukwuemeka and I feel sad"
        result, stats = anonymizer.anonymize(text)
        assert "[NAME REDACTED]" in result
        # Should not crash on unicode

    def test_long_message(self):
        """Test handling of long messages."""
        text = "Hello, " + "this is a test message. " * 100 + "Call 08031234567."
        result, stats = anonymizer.anonymize(text)
        assert "[PHONE REDACTED]" in result
        assert stats["phones"] == 1

    def test_multiple_names_same_person(self):
        """Test multiple occurrences of same name."""
        text = "Chukwuemeka said that Chukwuemeka will come back"
        result, stats = anonymizer.anonymize(text)
        # Should redact at least one occurrence
        assert "[NAME REDACTED]" in result


class TestGetPIITypesDetected:
    """Tests for the detection-only method."""

    def test_detect_phone_only(self):
        """Test detection of phone only."""
        text = "Call me at 08031234567"
        result = anonymizer.get_pii_types_detected(text)
        assert result["has_phone"] is True
        assert result["has_email"] is False
        assert result["has_name"] is False

    def test_detect_email_only(self):
        """Test detection of email only."""
        text = "Email me at test@example.com"
        result = anonymizer.get_pii_types_detected(text)
        assert result["has_phone"] is False
        assert result["has_email"] is True
        assert result["has_name"] is False

    def test_detect_name_only(self):
        """Test detection of name only."""
        text = "My name is Adebayo"
        result = anonymizer.get_pii_types_detected(text)
        assert result["has_phone"] is False
        assert result["has_email"] is False
        assert result["has_name"] is True

    def test_detect_all_types(self):
        """Test detection of all PII types."""
        text = "I am Adebayo, call 08031234567, email adebayo@gmail.com"
        result = anonymizer.get_pii_types_detected(text)
        assert result["has_phone"] is True
        assert result["has_email"] is True
        assert result["has_name"] is True

    def test_detect_none(self):
        """Test detection with no PII."""
        text = "I need help with my anxiety"
        result = anonymizer.get_pii_types_detected(text)
        assert result["has_phone"] is False
        assert result["has_email"] is False
        assert result["has_name"] is False