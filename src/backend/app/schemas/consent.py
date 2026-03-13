"""
Parental Consent Schemas
DPDPA 2023 Section 9(1) Compliance

@ticket TCK-20260307-CRIT-002
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class VerificationMethod(str, Enum):
    """Methods for verifying parental identity"""
    EMAIL = "email"
    DODOPAYMENTS = "dodopayments"  # UPI/Card/NetBanking via Dodopayments (India)
    RAZORPAY = "razorpay"  # Future: Alternative Indian provider
    DECLARATION = "declaration"


class ConsentStatus(str, Enum):
    """Status of parental consent"""
    PENDING = "pending"
    VERIFIED = "verified"
    WITHDRAWN = "withdrawn"
    EXPIRED = "expired"


class ParentalConsentBase(BaseModel):
    """Base consent data"""
    parent_email: str
    child_id: Optional[str] = None
    child_name: Optional[str] = None
    verification_method: VerificationMethod
    consent_version: str = "1.0"
    data_processing_purpose: str = Field(
        default="Educational activity personalization and progress tracking"
    )


class ParentalConsentCreate(ParentalConsentBase):
    """Schema for creating new consent record"""
    verification_token: Optional[str] = None  # For email verification
    payment_transaction_id: Optional[str] = None  # For payment verification providers
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class ParentalConsentResponse(ParentalConsentBase):
    """Schema for consent response"""
    model_config = ConfigDict(from_attributes=True)

    id: str
    parent_id: str
    child_id: Optional[str] = None
    status: ConsentStatus
    email_verified: bool = False
    card_verified: bool = False
    declaration_signed: bool = False
    consent_timestamp: Optional[datetime] = None
    withdrawal_timestamp: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    @field_validator("id", mode="before")
    @classmethod
    def stringify_id(cls, value: object) -> str:
        return str(value)

    @field_validator("verification_method", mode="before")
    @classmethod
    def normalize_verification_method(cls, value: object) -> VerificationMethod:
        raw = getattr(value, "value", value)
        if raw == "credit_card":
            return VerificationMethod.DODOPAYMENTS
        return VerificationMethod(raw)


class ConsentVerificationRequest(BaseModel):
    """Request to verify consent via specific method"""
    verification_method: VerificationMethod
    email_code: Optional[str] = None  # For email verification
    payment_token: Optional[str] = None  # For payment verification providers
    declaration_accepted: Optional[bool] = None  # For declaration


class ConsentWithdrawalRequest(BaseModel):
    """Request to withdraw consent"""
    reason: Optional[str] = None
    effective_immediately: bool = True  # DPDPA requires immediate cessation


class ConsentAuditLog(BaseModel):
    """Audit log entry for consent actions"""
    id: str
    consent_id: str
    action: str  # "created", "verified", "withdrawn", etc.
    actor: str  # "parent", "system", "admin"
    ip_address: Optional[str]
    timestamp: datetime
    details: Optional[dict]
