"""Subscription models for game pack subscriptions."""

from datetime import datetime, timezone
from enum import Enum
from typing import TYPE_CHECKING
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint, CheckConstraint, Index, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.db.models.user import User


class SubscriptionPlanType(str, Enum):
    """Subscription plan types."""

    GAME_PACK_5 = "game_pack_5"
    GAME_PACK_10 = "game_pack_10"
    FULL_ANNUAL = "full_annual"


class SubscriptionStatus(str, Enum):
    """Subscription status types."""

    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    UPGRADED = "upgraded"


class Subscription(Base):
    """Subscription model for game pack subscriptions."""

    __tablename__ = "subscriptions"
    __table_args__ = (
        # Ensure only one ACTIVE subscription per parent (database-enforced invariant)
        Index("ix_unique_active_subscription", "parent_id", unique=True,
              postgresql_where=text("status = 'active'")),
        # Ensure payment_reference is unique (idempotency for payment processing)
        UniqueConstraint("payment_reference", name="uq_payment_reference"),
        # Validate end_date is after start_date
        CheckConstraint("end_date > start_date", name="ck_end_after_start"),
        # Validate amount_paid is non-negative (allow 0 for fully credited upgrades)
        CheckConstraint("amount_paid >= 0", name="ck_amount_nonneg"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    parent_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Plan details (enums stored as strings but validated)
    plan_type: Mapped[SubscriptionPlanType] = mapped_column(String, nullable=False)
    amount_paid: Mapped[int] = mapped_column(nullable=False)  # In paise/cents
    currency: Mapped[str] = mapped_column(String, default="INR")

    # Dates (using timezone-aware UTC)
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # Status (enum stored as string but validated)
    status: Mapped[SubscriptionStatus] = mapped_column(
        String, default=SubscriptionStatus.ACTIVE
    )

    # Upgrade tracking
    upgraded_to_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("subscriptions.id"), nullable=True
    )

    # Game swap (1 free per pack)
    game_swap_used: Mapped[bool] = mapped_column(default=False)

    # Payment reference (from payment gateway)
    payment_reference: Mapped[str | None] = mapped_column(String, nullable=True)

    # Metadata
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Timestamps (using timezone-aware UTC for consistency)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    parent: Mapped["User"] = relationship("User", back_populates="subscriptions")
    game_selections: Mapped[list["SubscriptionGameSelection"]] = relationship(
        "SubscriptionGameSelection",
        back_populates="subscription",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    upgraded_to: Mapped["Subscription | None"] = relationship(
        "Subscription",
        remote_side=[id],
        back_populates="upgraded_from",
    )
    upgraded_from: Mapped[list["Subscription"]] = relationship(
        "Subscription",
        back_populates="upgraded_to",
    )


class DodoWebhookEvent(Base):
    """Track Dodo webhook events for idempotency and ops visibility."""

    __tablename__ = "dodo_webhook_events"
    __table_args__ = (
        # Ensure webhook_id is unique - prevents duplicate processing
        UniqueConstraint("webhook_id", name="uq_webhook_id"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    webhook_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String, nullable=False)

    # Processing status for ops visibility
    status: Mapped[str] = mapped_column(String, default="received")  # received | processed | failed
    processed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, default=None
    )

    # Error tracking for failed webhooks
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    attempts: Mapped[int] = mapped_column(default=0)  # Track retry attempts

    # Store the session_id for reference
    session_id: Mapped[str | None] = mapped_column(String, nullable=True)


class SubscriptionGameSelection(Base):
    """Game selections for a subscription."""

    __tablename__ = "subscription_game_selections"
    __table_args__ = (
        # Prevent duplicate game selections per subscription
        UniqueConstraint("subscription_id", "game_id", name="uq_subscription_game"),
        # Ensure swap semantics are consistent: active selections have no original, swapped have original
        CheckConstraint(
            "(swapped_at IS NULL AND original_game_id IS NULL) OR "
            "(swapped_at IS NOT NULL AND original_game_id IS NOT NULL)",
            name="ck_swap_consistency"
        ),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    subscription_id: Mapped[str] = mapped_column(
        String, ForeignKey("subscriptions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    game_id: Mapped[str] = mapped_column(String, nullable=False, index=True)

    # When this game was selected
    selected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # When swapped (if applicable) - NULL means active selection
    swapped_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Original game (if swapped) - track history for audit trail
    original_game_id: Mapped[str | None] = mapped_column(String, nullable=True)

    # Timestamps (using timezone-aware UTC for consistency)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    subscription: Mapped["Subscription"] = relationship(
        "Subscription", back_populates="game_selections"
    )
