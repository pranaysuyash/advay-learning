"""Progress model for tracking learning."""

from datetime import datetime
from uuid import uuid4
from sqlalchemy import String, Integer, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Progress(Base):
    """Learning progress model."""
    
    __tablename__ = "progress"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    profile_id: Mapped[str] = mapped_column(ForeignKey("profiles.id"), nullable=False)
    activity_type: Mapped[str] = mapped_column(String, nullable=False)  # drawing, recognition, game
    content_id: Mapped[str] = mapped_column(String, nullable=False)  # letter, word, object identifier
    score: Mapped[int] = mapped_column(Integer, default=0)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    # Keep attribute name `meta_data` but map to DB column named `metadata` (legacy migration)
    meta_data: Mapped[dict] = mapped_column(JSON, name="metadata", default=dict)  # detailed tracking (maps to existing column)
    
    completed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    profile: Mapped["Profile"] = relationship("Profile", back_populates="progress")
