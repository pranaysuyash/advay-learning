"""
Parental Consent Database Model
DPDPA 2023 Section 9(1) Compliance

@ticket TCK-20260307-CRIT-002
"""

import uuid
from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Enum, JSON, Text, Unicode
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class VerificationMethod(str, PyEnum):
    EMAIL = "email"
    CREDIT_CARD = "credit_card"
    DECLARATION = "declaration"


class ConsentStatus(str, PyEnum):
    PENDING = "pending"
    VERIFIED = "verified"
    WITHDRAWN = "withdrawn"
    EXPIRED = "expired"


class ParentalConsent(Base):
    """
    Stores verifiable parental consent for child's data processing.
    Required by DPDPA 2023 Section 9(1) for processing children's data.
    """
    __tablename__ = "parental_consents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Relationships - using String to match User.id and Profile.id types
    parent_id = Column(String, ForeignKey("users.id"), nullable=False)
    child_id = Column(String, ForeignKey("profiles.id"), nullable=True)
    
    # Parent and child info (snapshot at time of consent)
    parent_email = Column(String(255), nullable=False)
    child_name = Column(String(100), nullable=True)
    
    # Consent details
    verification_method = Column(Enum(VerificationMethod), nullable=False)
    consent_version = Column(String(10), default="1.0", nullable=False)
    status = Column(Enum(ConsentStatus), default=ConsentStatus.PENDING, nullable=False)
    
    # Verification flags
    email_verified = Column(Boolean, default=False)
    card_verified = Column(Boolean, default=False)
    declaration_signed = Column(Boolean, default=False)
    
    # Verification details (for audit)
    verification_token = Column(String(255), nullable=True)  # Email verification code hash
    card_transaction_id = Column(String(255), nullable=True)  # Legacy field
    dodopayments_intent_id = Column(String(255), nullable=True)  # Dodopayments payment intent
    razorpay_order_id = Column(String(255), nullable=True)  # Future: Razorpay order ID
    
    # DPDPA required fields
    data_processing_purpose = Column(Text, default="Educational activity personalization")
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Timestamps
    consent_timestamp = Column(DateTime, nullable=True)
    withdrawal_timestamp = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    parent = relationship("User", back_populates="consents")
    child = relationship("Profile", back_populates="consent")
    audit_logs = relationship("ConsentAuditLog", back_populates="consent", cascade="all, delete-orphan")

    def is_active(self) -> bool:
        """Check if consent is currently valid"""
        if self.status != ConsentStatus.VERIFIED:
            return False
        if self.withdrawal_timestamp:
            return False
        if self.expires_at and self.expires_at < datetime.utcnow():
            return False
        return True


class ConsentAuditLog(Base):
    """
    Audit trail for all consent-related actions.
    Required for DPDPA compliance and dispute resolution.
    """
    __tablename__ = "consent_audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    consent_id = Column(UUID(as_uuid=True), ForeignKey("parental_consents.id"), nullable=False)
    
    action = Column(String(50), nullable=False)
    actor = Column(String(50), nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    details = Column(JSON, nullable=True)
    
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship
    consent = relationship("ParentalConsent", back_populates="audit_logs")
