"""User model."""

from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.schemas.user import UserRole

if TYPE_CHECKING:
    from app.db.models.profile import Profile


class User(Base):
    """User model for authentication."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    role: Mapped[UserRole] = mapped_column(String, default=UserRole.PARENT)

    # Email verification fields
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    email_verification_token: Mapped[str | None] = mapped_column(String, nullable=True)
    email_verification_expires: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Password reset fields
    password_reset_token: Mapped[str | None] = mapped_column(String, nullable=True)
    password_reset_expires: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships - cascade deletes to profiles (and their progress/achievements)
    profiles: Mapped[list["Profile"]] = relationship(
        "Profile",
        back_populates="parent",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
