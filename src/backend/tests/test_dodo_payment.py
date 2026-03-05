"""Tests for Dodo payment service signature verification."""

import hashlib
import hmac
import time
from unittest.mock import patch

from app.services.dodo_payment_service import DodoPaymentService


class TestDodoSignatureVerification:
    """Test Dodo webhook signature verification according to their specification."""

    def test_signature_verification_valid(self):
        """Test correct signature verification with valid payload."""
        # Setup test data matching Dodo's spec
        webhook_id = "webhook_abc123"
        webhook_timestamp = str(int(time.time()))
        payload = b'{"type": "payment.completed", "data": {"id": "sess_123"}}'
        webhook_secret = "test_secret_key"

        # Compute expected signature exactly as Dodo specifies: "{webhook_id}.{webhook_timestamp}.{raw_payload}"
        message_to_sign = f"{webhook_id}.{webhook_timestamp}.".encode() + payload
        expected_signature = hmac.new(
            webhook_secret.encode(),
            message_to_sign,
            hashlib.sha256,
        ).hexdigest()

        # Mock environment
        with patch.dict("os.environ", {"DODO_WEBHOOK_SECRET": webhook_secret, "DODO_API_KEY": "test_key"}):
            service = DodoPaymentService()

            # Verify signature should return True
            result = service.verify_webhook_signature(
                payload=payload,
                webhook_id=webhook_id,
                webhook_timestamp=webhook_timestamp,
                webhook_signature=expected_signature,
            )

            assert result is True

    def test_signature_verification_invalid(self):
        """Test signature verification with invalid signature."""
        webhook_id = "webhook_abc123"
        webhook_timestamp = str(int(time.time()))
        payload = b'{"type": "payment.completed", "data": {"id": "sess_123"}}'
        webhook_secret = "test_secret_key"

        # Use wrong signature
        invalid_signature = "invalid_signature_hex"

        with patch.dict("os.environ", {"DODO_WEBHOOK_SECRET": webhook_secret, "DODO_API_KEY": "test_key"}):
            service = DodoPaymentService()

            result = service.verify_webhook_signature(
                payload=payload,
                webhook_id=webhook_id,
                webhook_timestamp=webhook_timestamp,
                webhook_signature=invalid_signature,
            )

            assert result is False

    def test_signature_verification_timestamp_rejection(self):
        """Test that old timestamps are rejected to prevent replay attacks."""
        webhook_id = "webhook_abc123"
        # Timestamp older than 5 minutes (301 seconds in the past)
        old_timestamp = str(int(time.time()) - 301)
        payload = b'{"type": "payment.completed", "data": {"id": "sess_123"}}'
        webhook_secret = "test_secret_key"

        # Even with correct signature, old timestamp should be rejected
        message_to_sign = f"{webhook_id}.{old_timestamp}.".encode() + payload
        signature = hmac.new(
            webhook_secret.encode(),
            message_to_sign,
            hashlib.sha256,
        ).hexdigest()

        with patch.dict("os.environ", {"DODO_WEBHOOK_SECRET": webhook_secret, "DODO_API_KEY": "test_key"}):
            service = DodoPaymentService()

            result = service.verify_webhook_signature(
                payload=payload,
                webhook_id=webhook_id,
                webhook_timestamp=old_timestamp,
                webhook_signature=signature,
            )

            assert result is False

    def test_signature_verification_missing_secret(self):
        """Test that verification fails gracefully when webhook secret is not configured."""
        with patch.dict("os.environ", {"DODO_WEBHOOK_SECRET": "", "DODO_API_KEY": "test_key"}):
            service = DodoPaymentService()

            result = service.verify_webhook_signature(
                payload=b"test",
                webhook_id="id",
                webhook_timestamp="123",
                webhook_signature="signature",
            )

            assert result is False

    def test_signature_verification_payload_matters(self):
        """Test that different payloads produce different signatures."""
        webhook_id = "webhook_abc123"
        webhook_timestamp = str(int(time.time()))
        webhook_secret = "test_secret_key"

        payload1 = b'{"type": "payment.completed", "data": {"id": "sess_123"}}'
        payload2 = b'{"type": "payment.completed", "data": {"id": "sess_456"}}'

        # Compute signatures for both payloads
        message1 = f"{webhook_id}.{webhook_timestamp}.".encode() + payload1
        signature1 = hmac.new(
            webhook_secret.encode(),
            message1,
            hashlib.sha256,
        ).hexdigest()

        message2 = f"{webhook_id}.{webhook_timestamp}.".encode() + payload2
        signature2 = hmac.new(
            webhook_secret.encode(),
            message2,
            hashlib.sha256,
        ).hexdigest()

        # Signatures should be different
        assert signature1 != signature2

        # Verify each payload only validates with its own signature
        with patch.dict("os.environ", {"DODO_WEBHOOK_SECRET": webhook_secret, "DODO_API_KEY": "test_key"}):
            service = DodoPaymentService()

            # Payload 1 should validate with signature 1
            result1 = service.verify_webhook_signature(
                payload=payload1,
                webhook_id=webhook_id,
                webhook_timestamp=webhook_timestamp,
                webhook_signature=signature1,
            )
            assert result1 is True

            # Payload 1 should NOT validate with signature 2
            result2 = service.verify_webhook_signature(
                payload=payload1,
                webhook_id=webhook_id,
                webhook_timestamp=webhook_timestamp,
                webhook_signature=signature2,
            )
            assert result2 is False
