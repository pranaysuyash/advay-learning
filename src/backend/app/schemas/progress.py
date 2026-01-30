"""Progress schemas."""

from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


class ProgressBase(BaseModel):
    """Base progress schema."""

    activity_type: str
    content_id: str
    score: int = 0
    duration_seconds: int = 0
    meta_data: Dict[str, Any] = {}


class ProgressCreate(ProgressBase):
    """Progress creation schema."""

    idempotency_key: str | None = None
    timestamp: str | None = None


class ProgressUpdate(BaseModel):
    """Progress update schema."""

    score: Optional[int] = None
    duration_seconds: Optional[int] = None
    meta_data: Optional[Dict[str, Any]] = None


class Progress(ProgressBase):
    """Progress response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    profile_id: str
    completed_at: datetime
    idempotency_key: str | None = None
