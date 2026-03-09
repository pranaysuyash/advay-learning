"""
Parental Consent API Endpoints
DPDPA 2023 Section 9(1) Compliance

@ticket TCK-20260307-CRIT-002
@note TEMPORARY: Payment-based verification methods still map to the legacy
       CREDIT_CARD database enum until the enum migration is applied.
"""

from datetime import datetime
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
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

router = APIRouter()


def map_schema_verification_method(method: Any) -> VerificationMethod:
    """Map API-layer verification methods onto the current database enum."""
    value = getattr(method, "value", method)
    if value in {"dodopayments", "razorpay"}:
        return VerificationMethod.CREDIT_CARD
    return VerificationMethod(value)


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
        child_name=consent_in.child_name,
        verification_method=db_verification_method,
        consent_version=consent_in.consent_version,
        data_processing_purpose=consent_in.data_processing_purpose,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        status=ConsentStatus.PENDING,
    )

    db.add(consent)
    await db.commit()
    await db.refresh(consent)

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
        # TODO: Implement actual email verification logic
        consent.email_verified = True

    elif verification_method == VerificationMethod.CREDIT_CARD:
        # Payment verification happens through a provider webhook after checkout.
        if not verification.payment_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment verification token required",
            )
        consent.card_transaction_id = verification.payment_token
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


# ============================================================================
# WEBHOOKS (Placeholder - requires async background tasks)
# ============================================================================

@router.post("/webhooks/dodopayments")
async def handle_dodopayments_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Handle Dodopayments payment webhooks for parental verification.

    @note TEMPORARY: Disabled until database enum migration is complete.
    """
    # TODO: Implement webhook handling after database migration
    # adds DODOPAYMENTS enum value
    return {"status": "disabled", "message": "Webhook handling not yet implemented"}
