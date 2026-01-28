"""Profile schemas."""

from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Dict, Any


class ProfileBase(BaseModel):
    """Base profile schema."""
    name: str
    age: Optional[int] = None
    preferred_language: str = "english"
    settings: Dict[str, Any] = {}


class ProfileCreate(ProfileBase):
    """Profile creation schema."""
    pass


class ProfileUpdate(BaseModel):
    """Profile update schema."""
    name: Optional[str] = None
    age: Optional[int] = None
    preferred_language: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None


class Profile(ProfileBase):
    """Profile response schema."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    parent_id: str
    created_at: datetime
    updated_at: datetime
