"""Email service for sending notifications."""

import logging
import secrets
from datetime import datetime, timedelta, timezone

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Email service for sending verification and password reset emails."""

    @staticmethod
    def generate_verification_token() -> str:
        """Generate a secure random verification token."""
        return secrets.token_urlsafe(32)

    @staticmethod
    def get_verification_expiry() -> datetime:
        """Get expiration time for verification tokens (24 hours)."""
        # Return naive datetime for database compatibility (PostgreSQL TIMESTAMP WITHOUT TIME ZONE)
        return datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(hours=24)

    @staticmethod
    async def send_verification_email(email: str, token: str) -> None:
        """Send email verification email."""
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"

        subject = "Verify your email - Learning App"
        body = f"""
Hello,

Thank you for registering! Please verify your email address by clicking the link below:

{verification_url}

This link will expire in 24 hours.

If you didn't create this account, you can safely ignore this email.

Best regards,
Learning App Team
"""

        # For local development, log the email instead of sending
        # In production, integrate with SendGrid, AWS SES, etc.
        logger.info("=" * 60)
        logger.info("EMAIL VERIFICATION")
        logger.info("=" * 60)
        logger.info(f"To: {email}")
        logger.info(f"Subject: {subject}")
        logger.info("-" * 60)
        logger.info(body)
        logger.info("=" * 60)

    @staticmethod
    async def send_password_reset_email(email: str, token: str) -> None:
        """Send password reset email."""
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"

        subject = "Password Reset Request - Learning App"
        body = f"""
Hello,

We received a request to reset your password. Click the link below to reset it:

{reset_url}

This link will expire in 1 hour.

If you didn't request this, you can safely ignore this email. Your password will not be changed.

Best regards,
Learning App Team
"""

        logger.info("=" * 60)
        logger.info("PASSWORD RESET EMAIL")
        logger.info("=" * 60)
        logger.info(f"To: {email}")
        logger.info(f"Subject: {subject}")
        logger.info("-" * 60)
        logger.info(body)
        logger.info("=" * 60)


# Convenience function for generating tokens
def generate_secure_token() -> str:
    """Generate a cryptographically secure token."""
    return secrets.token_urlsafe(32)
