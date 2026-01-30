"""Achievement model for gamification."""

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.db.models.profile import Profile


class Achievement(Base):
    """Achievement model."""

    __tablename__ = "achievements"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    profile_id: Mapped[str] = mapped_column(
        ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False
    )
    achievement_type: Mapped[str] = mapped_column(String, nullable=False)

    unlocked_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    profile: Mapped["Profile"] = relationship("Profile", back_populates="achievements")
