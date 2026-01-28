"""Progress schemas."""

from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Dict, Any


class ProgressBase(BaseModel):
    """Base progress schema."""
    activity_type: str
    content_id: str
    score: int = 0
    duration_seconds: int = 0
    metadata: Dict[str, Any] = {}


class ProgressCreate(ProgressBase):
    """Progress creation schema."""
    pass


class ProgressUpdate(BaseModel):
    """Progress update schema."""
    score: Optional[int] = None
    duration_seconds: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None


class Progress(ProgressBase):
    """Progress response schema."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    profile_id: str
    completed_at: datetime
