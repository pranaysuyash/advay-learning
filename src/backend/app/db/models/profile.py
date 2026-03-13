"""Profile model for children."""

from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import JSON, DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Profile(Base):
    """Child profile model."""

    __tablename__ = "profiles"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid4())
    )
    parent_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    age: Mapped[float] = mapped_column(Float, nullable=True)
    avatar_url: Mapped[str] = mapped_column(String, nullable=True)
    preferred_language: Mapped[str] = mapped_column(String, default="english")
    settings: Mapped[dict] = mapped_column(JSON, default=dict)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    parent: Mapped["User"] = relationship("User", back_populates="profiles")  # noqa: F821
    progress: Mapped[list["Progress"]] = relationship(  # noqa: F821
        "Progress",
        back_populates="profile",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    achievements: Mapped[list["Achievement"]] = relationship(  # noqa: F821
        "Achievement",
        back_populates="profile",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    # Parental consent for this child (DPDPA compliance)
    consent: Mapped["ParentalConsent"] = relationship(  # noqa: F821
        "ParentalConsent",
        back_populates="child",
        lazy="selectin",
        uselist=False,  # One consent per child
    )
