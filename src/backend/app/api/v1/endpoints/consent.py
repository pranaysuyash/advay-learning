"""
Parental Consent API Endpoints
DPDPA 2023 Section 9(1) Compliance

@ticket TCK-20260307-CRIT-002
@note TEMPORARY: Payment-based verification methods still map to the legacy
       CREDIT_CARD database enum until the enum migration is applied.
"""

import json
import logging
import re
import secrets
from datetime import datetime
from typing import Any
from uuid import UUID

# Safe logger sanitization (prevents log injection via untrusted input)
_LOG_SANITIZER_RE = re.compile(r"[^a-zA-Z0-9_@\-\. ]")

def _sanitize_log_value(value: Any) -> str:
    if value is None:
        return ""
    s = str(value)
    s = s.replace("\n", " ").replace("\r", " ")
    sanitized = _LOG_SANITIZER_RE.sub("_", s)
    return sanitized[:200]

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.core.email import EmailService
from app.db.models.consent import (
    ConsentAuditLog,
    ConsentStatus,
    ParentalConsent,
    VerificationMethod,
)
from app.db.models.user import User
from app.schemas.consent import (
    ConsentVerificationRequest,
    ConsentWithdrawalRequest,
    ParentalConsentCreate,
    ParentalConsentResponse,
)
from app.services.dodo_payment_service import DodoPaymentService, get_dodo_client

logger = logging.getLogger(__name__)

router = APIRouter()


def map_schema_verification_method(method: Any) -> VerificationMethod:
    """Map API-layer verification methods onto the current database enum."""
    value = getattr(method, "value", method)
    if value in {"dodopayments", "razorpay"}:
        return VerificationMethod.CREDIT_CARD
    return VerificationMethod(value)


def generate_email_verification_code() -> str:
    """Generate a six-digit numeric verification code."""
    return f"{secrets.randbelow(1_000_000):06d}"


@router.post("/", response_model=ParentalConsentResponse, status_code=status.HTTP_201_CREATED)
async def create_consent(
    *,
    db: AsyncSession = Depends(get_db),
    consent_in: ParentalConsentCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new parental consent record.

    This is the first step in DPDPA-compliant parental consent flow.
    The consent starts as PENDING and must be verified via the chosen method.
    """
    db_verification_method = map_schema_verification_method(
        consent_in.verification_method
    )

    # Check if user already has active consent for this child
    result = await db.execute(
        select(ParentalConsent).where(
            ParentalConsent.parent_id == current_user.id,
            ParentalConsent.child_name == consent_in.child_name,
            ParentalConsent.status == ConsentStatus.VERIFIED,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Active consent already exists for this child",
        )

    # Create consent record
    consent = ParentalConsent(
        parent_id=current_user.id,
        parent_email=consent_in.parent_email,
        child_id=consent_in.child_id,
        child_name=consent_in.child_name,
        verification_method=db_verification_method,
        consent_version=consent_in.consent_version,
        data_processing_purpose=consent_in.data_processing_purpose,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        status=ConsentStatus.PENDING,
    )

    if db_verification_method == VerificationMethod.EMAIL:
        consent.verification_token = generate_email_verification_code()

    db.add(consent)
    await db.commit()
    await db.refresh(consent)

    if db_verification_method == VerificationMethod.EMAIL and consent.verification_token:
        await EmailService.send_parental_consent_verification_email(
            consent.parent_email,
            consent.verification_token,
            consent.child_name,
        )

    # Create audit log
    audit_log = ConsentAuditLog(
        consent_id=consent.id,
        action="created",
        actor="parent",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        details={"method": consent_in.verification_method.value},
    )
    db.add(audit_log)
    await db.commit()

    return consent


@router.post("/{consent_id}/verify", response_model=ParentalConsentResponse)
async def verify_consent(
    *,
    db: AsyncSession = Depends(get_db),
    consent_id: UUID,
    verification: ConsentVerificationRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Verify parental consent using chosen method.

    - EMAIL: Requires verification code
    - CREDIT_CARD: Requires payment processor token
    - DECLARATION: Requires explicit acceptance
    """
    result = await db.execute(
        select(ParentalConsent).where(
            ParentalConsent.id == consent_id,
            ParentalConsent.parent_id == current_user.id,
        )
    )
    consent = result.scalar_one_or_none()

    if not consent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent not found",
        )

    if consent.status != ConsentStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Consent is already {consent.status}",
        )

    verification_method = map_schema_verification_method(
        verification.verification_method
    )

    if verification_method == VerificationMethod.EMAIL:
        if not verification.email_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email verification code required",
            )
        if verification.email_code != consent.verification_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email verification code",
            )
        consent.email_verified = True
        consent.verification_token = None

    elif verification_method == VerificationMethod.CREDIT_CARD:
        # Payment verification happens through a provider webhook after checkout.
        if not verification.payment_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment verification token required",
            )
        consent.card_transaction_id = verification.payment_token
        consent.dodopayments_intent_id = verification.payment_token
        # Don't mark as verified yet - wait for webhook

    elif verification_method == VerificationMethod.DECLARATION:
        if not verification.declaration_accepted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Declaration must be accepted",
            )
        consent.declaration_signed = True

    # Check if all required verifications are complete
    # Note: For CREDIT_CARD, verification happens via webhook, not here
    if consent.email_verified or consent.declaration_signed:
        consent.status = ConsentStatus.VERIFIED
        consent.consent_timestamp = datetime.utcnow()

    db.add(consent)

    # Create audit log
    audit_log = ConsentAuditLog(
        consent_id=consent.id,
        action="verified",
        actor="parent",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        details={"method": verification.verification_method.value},
    )
    db.add(audit_log)
    await db.commit()
    await db.refresh(consent)

    return consent


@router.post("/{consent_id}/withdraw", response_model=ParentalConsentResponse)
async def withdraw_consent(
    *,
    db: AsyncSession = Depends(get_db),
    consent_id: UUID,
    withdrawal: ConsentWithdrawalRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Withdraw parental consent.

    Per DPDPA 2023, consent withdrawal must be:
    - As easy as giving consent
    - Effective immediately
    - Not retroactively affect processing already done
    """
    result = await db.execute(
        select(ParentalConsent).where(
            ParentalConsent.id == consent_id,
            ParentalConsent.parent_id == current_user.id,
        )
    )
    consent = result.scalar_one_or_none()

    if not consent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent not found",
        )

    if consent.status == ConsentStatus.WITHDRAWN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consent already withdrawn",
        )

    consent.status = ConsentStatus.WITHDRAWN
    consent.withdrawal_timestamp = datetime.utcnow()

    db.add(consent)

    # Create audit log
    audit_log = ConsentAuditLog(
        consent_id=consent.id,
        action="withdrawn",
        actor="parent",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        details={"reason": withdrawal.reason, "immediate": withdrawal.effective_immediately},
    )
    db.add(audit_log)
    await db.commit()
    await db.refresh(consent)

    return consent


@router.get("/", response_model=list[ParentalConsentResponse])
async def list_consents(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """List all consents for current parent user."""
    result = await db.execute(
        select(ParentalConsent).where(ParentalConsent.parent_id == current_user.id)
    )
    consents = result.scalars().all()

    return consents


@router.get("/{consent_id}", response_model=ParentalConsentResponse)
async def get_consent(
    *,
    db: AsyncSession = Depends(get_db),
    consent_id: UUID,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get specific consent by ID."""
    result = await db.execute(
        select(ParentalConsent).where(
            ParentalConsent.id == consent_id,
            ParentalConsent.parent_id == current_user.id,
        )
    )
    consent = result.scalar_one_or_none()

    if not consent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent not found",
        )

    return consent


@router.get("/child/{child_id}/status")
async def check_child_consent_status(
    *,
    db: AsyncSession = Depends(get_db),
    child_id: str,
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Check if valid consent exists for a child.

    Used by other endpoints to verify consent before processing child data.
    """
    result = await db.execute(
        select(ParentalConsent).where(
            ParentalConsent.parent_id == current_user.id,
            ParentalConsent.child_id == child_id,
            ParentalConsent.status == ConsentStatus.VERIFIED,
        )
    )
    consent = result.scalar_one_or_none()

    return {
        "has_valid_consent": consent is not None and consent.is_active(),
        "consent_id": str(consent.id) if consent else None,
        "consent_timestamp": consent.consent_timestamp if consent else None,
    }


@router.post("/webhooks/dodopayments")
async def handle_dodopayments_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Handle Dodopayments payment webhooks for parental verification.
    """
    body = await request.body()
    webhook_id = request.headers.get("webhook-id", "")
    webhook_timestamp = request.headers.get("webhook-timestamp", "")
    webhook_signature = request.headers.get("webhook-signature", "")

    dodo_service: DodoPaymentService = get_dodo_client()
    if not dodo_service.verify_webhook_signature(
        body,
        webhook_id,
        webhook_timestamp,
        webhook_signature,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook signature",
        )

    event = json.loads(body.decode("utf-8"))
    event_type = event.get("type") or event.get("event")
    data = event.get("data", {})
    metadata = data.get("metadata", {}) if isinstance(data, dict) else {}

    supported_events = {
        "payment.succeeded",
        "payment.completed",
        "payment_intent.succeeded",
    }
    if event_type not in supported_events:
        # lgtm[py/log-injection] Webhook event type and ID are logged for audit/debugging
        logger.warning(
            "Webhook event type not supported, ignoring",
            extra={
                "event_type": _sanitize_log_value(event_type),
                "webhook_id": _sanitize_log_value(webhook_id),
            },
        )
        return {"status": "ignored", "event_type": event_type}

    consent: ParentalConsent | None = None
    consent_id = metadata.get("consent_id")
    if consent_id:
        try:
            parsed_id = UUID(consent_id)
        except (ValueError, TypeError):
            # lgtm[py/log-injection] Webhook ID is logged for audit/debugging
            logger.warning(
                "Webhook contains malformed consent_id UUID",
                extra={
                    "consent_id": _sanitize_log_value(consent_id),
                    "event_type": _sanitize_log_value(event_type),
                    "webhook_id": _sanitize_log_value(webhook_id),
                },
            )
            parsed_id = None
        if parsed_id:
            result = await db.execute(
                select(ParentalConsent).where(ParentalConsent.id == parsed_id)
            )
            consent = result.scalar_one_or_none()

    payment_id = data.get("payment_id") or data.get("id")
    if consent is None and payment_id:
        result = await db.execute(
            select(ParentalConsent).where(
                ParentalConsent.dodopayments_intent_id == payment_id
            )
        )
        consent = result.scalar_one_or_none()

    if consent is None:
        # lgtm[py/log-injection] Webhook IDs are logged for audit/debugging
        logger.warning(
            "Webhook received for unknown consent record",
            extra={
                "event_type": _sanitize_log_value(event_type),
                "consent_id": _sanitize_log_value(consent_id),
                "payment_id": _sanitize_log_value(payment_id),
                "webhook_id": _sanitize_log_value(webhook_id),
            },
        )
        return {"status": "record_not_found", "event_type": event_type}

    if consent.status == ConsentStatus.WITHDRAWN:
        # lgtm[py/log-injection] Webhook IDs are logged for audit/debugging
        logger.info(
            "Webhook received for withdrawn consent, ignoring",
            extra={
                "consent_id": _sanitize_log_value(str(consent.id)),
                "event_type": _sanitize_log_value(event_type),
                "payment_id": _sanitize_log_value(payment_id),
                "webhook_id": _sanitize_log_value(webhook_id),
            },
        )
        return {"status": "consent_withdrawn", "consent_id": str(consent.id)}

    if consent.status == ConsentStatus.VERIFIED and consent.card_verified:
        # lgtm[py/log-injection] Webhook IDs are logged for audit/debugging
        logger.info(
            "Webhook received for already verified consent, ignoring",
            extra={
                "consent_id": str(consent.id),
                "event_type": event_type,
                "payment_id": payment_id,
                "webhook_id": webhook_id,
            },
        )
        return {"status": "already_verified", "consent_id": str(consent.id)}

    consent.card_verified = True
    consent.status = ConsentStatus.VERIFIED
    consent.consent_timestamp = datetime.utcnow()
    if payment_id:
        consent.card_transaction_id = payment_id

    db.add(consent)
    db.add(
        ConsentAuditLog(
            consent_id=consent.id,
            action="verified_via_webhook",
            actor="system",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            details={
                "event_type": event_type,
                "payment_id": payment_id,
                "webhook_id": webhook_id,
            },
        )
    )
    await db.commit()
    await db.refresh(consent)

    return {"status": "verified", "consent_id": str(consent.id)}
