"""Subscription models for game pack subscriptions."""

from datetime import datetime, timezone
from enum import Enum
from typing import TYPE_CHECKING
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, String, Text
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

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    parent_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Plan details
    plan_type: Mapped[SubscriptionPlanType] = mapped_column(String, nullable=False)
    amount_paid: Mapped[int] = mapped_column(nullable=False)  # In paise/cents
    currency: Mapped[str] = mapped_column(String, default="INR")

    # Dates
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    # Status
    status: Mapped[SubscriptionStatus] = mapped_column(
        String, default=SubscriptionStatus.ACTIVE
    )

    # Upgrade tracking
    upgraded_to_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("subscriptions.id"), nullable=True
    )

    # Game swap (1 free per pack)
    game_swap_used: Mapped[bool] = mapped_column(default=False)

    # Payment reference (from Dodo)
    payment_reference: Mapped[str | None] = mapped_column(String, nullable=True)

    # Metadata
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
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


class SubscriptionGameSelection(Base):
    """Game selections for a subscription."""

    __tablename__ = "subscription_game_selections"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    subscription_id: Mapped[str] = mapped_column(
        String, ForeignKey("subscriptions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    game_id: Mapped[str] = mapped_column(String, nullable=False, index=True)

    # When this game was selected
    selected_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # When swapped (if applicable)
    swapped_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Original game (if swapped)
    original_game_id: Mapped[str | None] = mapped_column(String, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    subscription: Mapped["Subscription"] = relationship(
        "Subscription", back_populates="game_selections"
    )
