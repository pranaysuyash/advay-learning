"""Profile schemas."""

from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, field_validator

from app.core.validation import ValidationError, validate_age, validate_language_code


class ProfileBase(BaseModel):
    """Base profile schema."""

    name: str
    age: Optional[float] = None
    preferred_language: str = "en"
    settings: Dict[str, Any] = {}

    @field_validator("age")
    @classmethod
    def validate_age_range(cls, v: Optional[float]) -> Optional[float]:
        """Validate age is between 0 and 18."""
        if v is not None:
            try:
                validate_age(v)
            except ValidationError as e:
                raise ValueError(str(e))
        return v

    @field_validator("preferred_language")
    @classmethod
    def validate_language(cls, v: str) -> str:
        """Validate language code is supported."""
        try:
            validate_language_code(v)
        except ValidationError as e:
            raise ValueError(str(e))
        return v


class ProfileCreate(ProfileBase):
    """Profile creation schema."""

    pass


class ProfileUpdate(BaseModel):
    """Profile update schema."""

    name: Optional[str] = None
    age: Optional[float] = None
    preferred_language: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None


class Profile(ProfileBase):
    """Profile response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    parent_id: str
    created_at: datetime
    updated_at: datetime


class ProfilePhotoResponse(BaseModel):
    """Profile photo upload response schema."""

    avatar_url: Optional[str] = None
    profile_photo: Optional[str] = None
    photo_updated_at: Optional[str] = None
