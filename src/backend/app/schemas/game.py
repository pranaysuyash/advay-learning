"""Game schemas."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.user import UserRole


class GameBase(BaseModel):
    """Base game schema."""

    title: str
    slug: str
    description: str
    icon: str

    category: str
    age_range_min: int = Field(ge=2, le=12)
    age_range_max: int = Field(ge=2, le=12)
    difficulty: str
    duration_minutes: Optional[int] = Field(gt=0, default=None)
    game_path: str
    is_published: bool = True
    is_featured: bool = False
    config_json: Optional[dict] = None

    @model_validator(mode="after")
    def validate_age_range(cls, values):
        """Ensure age_range_max > age_range_min."""
        if values.get("age_range_min") and values.get("age_range_max"):
            if values["age_range_max"] <= values["age_range_min"]:
                raise ValueError("age_range_max must be greater than age_range_min")
        return values


class GameCreate(GameBase):
    """Schema for creating a game (admin only)."""

    pass


class GameUpdate(BaseModel):
    """Schema for updating a game (admin only)."""

    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None

    category: Optional[str] = None
    age_range_min: Optional[int] = Field(None, ge=2, le=12)
    age_range_max: Optional[int] = Field(None, ge=2, le=12)
    difficulty: Optional[str] = None
    duration_minutes: Optional[int] = Field(None, gt=0)

    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None
    config_json: Optional[dict] = None


class Game(GameBase):
    """Response schema for a game."""

    id: str
    total_plays: int = 0
    avg_score: Optional[float] = None
    completion_rate: Optional[float] = None

    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class GameList(BaseModel):
    """List of games with optional filters."""

    games: List[Game]
    total: int
    page: int
    page_size: int


class GameFilter(BaseModel):
    """Query parameters for filtering games."""

    category: Optional[str] = None
    age_min: Optional[int] = Field(None, ge=2, le=12)
    age_max: Optional[int] = Field(None, ge=2, le=12)
    difficulty: Optional[str] = None
    is_published: bool = True
    is_featured: Optional[bool] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
