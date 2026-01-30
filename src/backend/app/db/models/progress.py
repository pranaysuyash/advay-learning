"""Progress model for tracking learning."""

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import uuid4

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.db.models.profile import Profile


class Progress(Base):
    """Learning progress model."""

    __tablename__ = "progress"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    profile_id: Mapped[str] = mapped_column(
        ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False
    )
    activity_type: Mapped[str] = mapped_column(String, nullable=False)  # drawing, recognition, game
    content_id: Mapped[str] = mapped_column(
        String, nullable=False
    )  # letter, word, object identifier
    score: Mapped[int] = mapped_column(Integer, default=0)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    meta_data: Mapped[dict] = mapped_column(JSON, default=dict)  # detailed tracking

    # Optional idempotency key set by clients to avoid duplicates (unique per profile)
    idempotency_key: Mapped[str | None] = mapped_column(String, nullable=True, index=True)

    completed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("profile_id", "idempotency_key", name="uix_profile_id_idempotency_key"),
    )
    # Relationships
    profile: Mapped["Profile"] = relationship("Profile", back_populates="progress")
