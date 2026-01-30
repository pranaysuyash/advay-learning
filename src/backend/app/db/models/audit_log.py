"""Audit log model for tracking sensitive operations."""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class AuditLog(Base):
    """Audit log for tracking sensitive operations like deletions."""

    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))

    # Who performed the action
    user_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    user_email: Mapped[str | None] = mapped_column(String, nullable=True)

    # What action was performed
    action: Mapped[str] = mapped_column(String, nullable=False, index=True)
    # e.g., "profile_delete", "user_delete", "data_export"

    # What resource was affected
    resource_type: Mapped[str] = mapped_column(String, nullable=False)
    # e.g., "profile", "user", "progress"
    resource_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)

    # Additional details (JSON string)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)

    # IP address and user agent for tracking
    ip_address: Mapped[str | None] = mapped_column(String, nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String, nullable=True)

    # Whether parent verification was required and provided
    verification_required: Mapped[bool] = mapped_column(default=False)
    verification_method: Mapped[str | None] = mapped_column(String, nullable=True)
    # e.g., "password_reauth", "email_confirmation"

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
