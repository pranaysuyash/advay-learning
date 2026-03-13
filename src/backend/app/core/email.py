"""Email service for sending notifications using Resend."""

import logging
import secrets
from datetime import datetime, timedelta, timezone

import resend

from app.core.config import settings

logger = logging.getLogger(__name__)

BRAND_COLORS = {
    "primary": "#4F46E5",
    "sky_blue": "#87CEEB",
    "grass_green": "#6BCB77",
    "coral_orange": "#FF8C42",
    "sunshine_yellow": "#FFD93D",
    "text": "#1F2937",
    "text_light": "#6B7280",
    "background": "#F0F9FF",
    "white": "#FFFFFF",
}


class EmailService:
    """Email service for sending verification and password reset emails."""

    @staticmethod
    def generate_verification_token() -> str:
        """Generate a secure random verification token."""
        return secrets.token_urlsafe(32)

    @staticmethod
    def get_verification_expiry() -> datetime:
        """Get expiration time for verification tokens (24 hours)."""
        return (datetime.now(timezone.utc) + timedelta(hours=24)).replace(tzinfo=None)

    @staticmethod
    async def send_verification_email(email: str, token: str) -> None:
        """Send email verification email via Resend."""
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        subject = "Verify your email - Advay Vision Learning 👋"
        html_body = EmailService._verification_email_html(verification_url)
        await EmailService._send_email(email, subject, html_body)

    @staticmethod
    async def send_password_reset_email(email: str, token: str) -> None:
        """Send password reset email via Resend."""
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        subject = "Reset your password - Advay Vision Learning 🔐"
        html_body = EmailService._password_reset_email_html(reset_url)
        await EmailService._send_email(email, subject, html_body)

    @staticmethod
    async def send_parental_consent_verification_email(
        email: str,
        verification_code: str,
        child_name: str | None,
    ) -> None:
        """Send the parental consent verification code via email."""
        subject = "Your parental consent verification code - Advay Vision Learning"
        html_body = EmailService._parental_consent_email_html(
            verification_code,
            child_name,
        )
        await EmailService._send_email(email, subject, html_body)

    @staticmethod
    def _verification_email_html(verification_url: str) -> str:
        """Generate verification email HTML with brand guidelines."""
        c = BRAND_COLORS
        return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your email</title>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;font-family:'Nunito','Segoe UI',Arial,sans-serif;background:linear-gradient(135deg,#E0F2FE 0%,#FEF3C7 50%,#D1FAE5 100%);min-height:100vh;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:{c['white']};border-radius:24px;box-shadow:0 20px 40px rgba(0,0,0,0.08),0 0 0 1px rgba(255,255,255,0.5);overflow:hidden;">
            <tr>
                <td style="padding:40px 40px 32px 40px;text-align:center;background:linear-gradient(180deg,{c['sky_blue']} 0%,{c['primary']} 100%);position:relative;">
                    <div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);width:80px;height:80px;background:{c['white']};border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 16px rgba(79,70,229,0.2);">
                        <span style="font-size:40px;">🐼</span>
                    </div>
                    <div style="margin-top:32px;">
                        <span style="display:inline-block;background:rgba(255,255,255,0.2);color:{c['white']};padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">Welcome!</span>
                    </div>
                    <h1 style="margin:16px 0 0 0;font-size:28px;font-weight:800;color:{c['white']};text-shadow:0 2px 4px rgba(0,0,0,0.1);">Verify Your Email</h1>
                </td>
            </tr>
            <tr>
                <td style="padding:40px 40px 32px 40px;">
                    <p style="margin:0 0 8px 0;font-size:18px;font-weight:700;color:{c['text']};">Hi there! 👋</p>
                    <p style="margin:0 0 24px 0;font-size:16px;color:{c['text_light']};line-height:1.6;">Thank you for joining <strong>Advay Vision Learning</strong>! We're thrilled to have you as part of our learning family.</p>
                    <p style="margin:0 0 28px 0;font-size:15px;color:{c['text_light']};line-height:1.6;">To get started with your child's learning adventure, please verify your email address below:</p>

                    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 24px 0;">
                        <a href="{verification_url}" style="display:inline-block;background:linear-gradient(135deg,{c['coral_orange']} 0%,#F97316 100%);color:{c['white']};font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:12px;box-shadow:0 4px 12px rgba(255,140,66,0.4);transition:all 0.2s;">Verify Email Address</a>
                    </td></tr></table>

                    <div style="background:{c['background']};border-radius:12px;padding:16px;margin-bottom:24px;">
                        <p style="margin:0;font-size:13px;color:{c['text_light']};text-align:center;">Having trouble clicking the button?</p>
                        <p style="margin:8px 0 0 0;font-size:12px;color:{c['primary']};word-break:break-all;text-align:center;text-decoration:underline;">{verification_url}</p>
                    </div>

                    <p style="margin:0;font-size:13px;color:{c['text_light']};">⏰ This link expires in 24 hours</p>
                </td>
            </tr>
            <tr>
                <td style="padding:28px 40px;background:{c['background']};border-top:1px dashed #CBD5E1;">
                    <p style="margin:0 0 8px 0;font-size:13px;color:{c['text_light']};text-align:center;">If you didn't create this account, no worries — you can safely ignore this email.</p>
                    <p style="margin:0;font-size:12px;color:{c['text_light']};text-align:center;">© 2026 Advay Vision Learning · Made with 💜 for little learners</p>
                </td>
            </tr>
        </table>
        <p style="margin:24px 0 0 0;font-size:12px;color:{c['text_light']};">Wave hello to learning! 👋</p>
    </td></tr></table>
</body>
</html>"""

    @staticmethod
    def _password_reset_email_html(reset_url: str) -> str:
        """Generate password reset email HTML with brand guidelines."""
        c = BRAND_COLORS
        return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset your password</title>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;font-family:'Nunito','Segoe UI',Arial,sans-serif;background:linear-gradient(135deg,#E0F2FE 0%,#FEF3C7 50%,#D1FAE5 100%);min-height:100vh;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:{c['white']};border-radius:24px;box-shadow:0 20px 40px rgba(0,0,0,0.08),0 0 0 1px rgba(255,255,255,0.5);overflow:hidden;">
            <tr>
                <td style="padding:40px 40px 32px 40px;text-align:center;background:linear-gradient(180deg,{c['grass_green']} 0%,#10B981 100%);position:relative;">
                    <div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);width:80px;height:80px;background:{c['white']};border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 16px rgba(16,185,129,0.2);">
                        <span style="font-size:40px;">🔐</span>
                    </div>
                    <div style="margin-top:32px;">
                        <span style="display:inline-block;background:rgba(255,255,255,0.2);color:{c['white']};padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">Security</span>
                    </div>
                    <h1 style="margin:16px 0 0 0;font-size:28px;font-weight:800;color:{c['white']};text-shadow:0 2px 4px rgba(0,0,0,0.1);">Reset Password</h1>
                </td>
            </tr>
            <tr>
                <td style="padding:40px 40px 32px 40px;">
                    <p style="margin:0 0 8px 0;font-size:18px;font-weight:700;color:{c['text']};">Hello! 🔑</p>
                    <p style="margin:0 0 24px 0;font-size:16px;color:{c['text_light']};line-height:1.6;">We received a request to reset your password for <strong>Advay Vision Learning</strong>.</p>
                    <p style="margin:0 0 28px 0;font-size:15px;color:{c['text_light']};line-height:1.6;">No worries — let's get you back to your child's learning adventure! Click the button below to create a new password:</p>

                    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 24px 0;">
                        <a href="{reset_url}" style="display:inline-block;background:linear-gradient(135deg,{c['primary']} 0%,#7C3AED 100%);color:{c['white']};font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:12px;box-shadow:0 4px 12px rgba(79,70,229,0.4);transition:all 0.2s;">Reset Password</a>
                    </td></tr></table>

                    <div style="background:{c['background']};border-radius:12px;padding:16px;margin-bottom:24px;">
                        <p style="margin:0;font-size:13px;color:{c['text_light']};text-align:center;">Having trouble clicking the button?</p>
                        <p style="margin:8px 0 0 0;font-size:12px;color:{c['primary']};word-break:break-all;text-align:center;text-decoration:underline;">{reset_url}</p>
                    </div>

                    <div style="background:#FEF3C7;border-radius:12px;padding:16px;margin-bottom:24px;">
                        <p style="margin:0;font-size:13px;color:#92400E;text-align:center;"><strong>⏰ This link expires in 1 hour</strong></p>
                        <p style="margin:8px 0 0 0;font-size:12px;color:#B45309;text-align:center;">For security, please don't share this link with anyone.</p>
                    </div>
                </td>
            </tr>
            <tr>
                <td style="padding:28px 40px;background:{c['background']};border-top:1px dashed #CBD5E1;">
                    <p style="margin:0 0 8px 0;font-size:13px;color:{c['text_light']};text-align:center;">If you didn't request a password reset, you can safely ignore this email. Your password will stay secure.</p>
                    <p style="margin:0;font-size:12px;color:{c['text_light']};text-align:center;">© 2026 Advay Vision Learning · Made with 💜 for little learners</p>
                </td>
            </tr>
        </table>
        <p style="margin:24px 0 0 0;font-size:12px;color:{c['text_light']};">Wave hello to learning! 👋</p>
    </td></tr></table>
</body>
</html>"""

    @staticmethod
    def _parental_consent_email_html(
        verification_code: str,
        child_name: str | None,
    ) -> str:
        """Generate parental consent verification email HTML."""
        c = BRAND_COLORS
        child_label = child_name or "your child"
        return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parental consent verification</title>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;font-family:'Nunito','Segoe UI',Arial,sans-serif;background:linear-gradient(135deg,#E0F2FE 0%,#FEF3C7 50%,#D1FAE5 100%);min-height:100vh;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:{c['white']};border-radius:24px;box-shadow:0 20px 40px rgba(0,0,0,0.08),0 0 0 1px rgba(255,255,255,0.5);overflow:hidden;">
            <tr>
                <td style="padding:40px 40px 32px 40px;text-align:center;background:linear-gradient(180deg,{c['sunshine_yellow']} 0%,{c['coral_orange']} 100%);position:relative;">
                    <div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);width:80px;height:80px;background:{c['white']};border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 16px rgba(255,140,66,0.2);">
                        <span style="font-size:40px;">🛡️</span>
                    </div>
                    <div style="margin-top:32px;">
                        <span style="display:inline-block;background:rgba(255,255,255,0.2);color:{c['white']};padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">Consent Check</span>
                    </div>
                    <h1 style="margin:16px 0 0 0;font-size:28px;font-weight:800;color:{c['white']};text-shadow:0 2px 4px rgba(0,0,0,0.1);">Verify Parental Consent</h1>
                </td>
            </tr>
            <tr>
                <td style="padding:40px 40px 32px 40px;">
                    <p style="margin:0 0 12px 0;font-size:18px;font-weight:700;color:{c['text']};">One more quick step</p>
                    <p style="margin:0 0 24px 0;font-size:15px;color:{c['text_light']};line-height:1.6;">Use this code to verify consent for <strong>{child_label}</strong> in Advay Vision Learning.</p>
                    <div style="margin:0 0 24px 0;padding:20px;border-radius:16px;background:{c['background']};text-align:center;">
                        <div style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:{c['text_light']};margin-bottom:8px;">Verification code</div>
                        <div style="font-size:36px;font-weight:800;letter-spacing:8px;color:{c['primary']};">{verification_code}</div>
                    </div>
                    <p style="margin:0;font-size:13px;color:{c['text_light']};text-align:center;">Enter this code in the consent screen to continue.</p>
                </td>
            </tr>
        </table>
    </td></tr></table>
</body>
</html>"""

    @staticmethod
    async def _send_email(to: str, subject: str, html_body: str) -> None:
        """Send email via Resend API."""
        import os
        if os.environ.get("TESTING") == "true":
            logger.info("TESTING mode: Skipping actual email send")
            return

        api_key = getattr(settings, "RESEND_API_KEY", None)

        if not api_key:
            logger.warning(
                "RESEND_API_KEY not configured; email delivery is disabled until production secrets are set."
            )
            logger.info("=" * 60)
            logger.info(f"EMAIL TO: {to}")
            logger.info(f"Subject: {subject}")
            logger.info("-" * 60)
            logger.info(html_body)
            logger.info("=" * 60)
            return

        try:
            resend.api_key = api_key
            response = resend.Emails.send(
                {
                    "from": settings.EMAIL_FROM,
                    "to": to,
                    "subject": subject,
                    "html": html_body,
                }
            )
            logger.info(f"Email sent successfully to {to}: {response}")
        except Exception as e:
            logger.error(f"Failed to send email to {to}: {e}")
            raise


def generate_secure_token() -> str:
    """Generate a cryptographically secure token."""
    return secrets.token_urlsafe(32)
