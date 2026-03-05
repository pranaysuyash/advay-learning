"""Game schemas."""

from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


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

    @field_validator("config_json", mode="before")
    def _parse_config_json(cls, v):  # noqa: N805 - Pydantic validator classmethod signature
        """Parse config_json when it's provided as a JSON string.

        Pydantic can receive values from raw dicts or ORM objects; the
        validator may receive the field value directly rather than a mapping.
        """
        if isinstance(v, str):
            try:
                import json

                return json.loads(v)
            except Exception as e:
                raise ValueError("config_json must be a JSON object or valid JSON string") from e
        # leave as-is (None or already dict)
        return v

    @model_validator(mode="after")
    def validate_age_range(self):
        """Ensure age_range_max > age_range_min."""
        if self.age_range_max <= self.age_range_min:
            raise ValueError("age_range_max must be greater than age_range_min")
        return self


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


class GlobalGameStat(BaseModel):
    """Aggregated global game statistics for one game."""

    model_config = ConfigDict(populate_by_name=True)

    game_key: str = Field(serialization_alias="gameKey", description="Game slug or fallback content identifier")
    game_name: str = Field(serialization_alias="gameName", description="Human-readable game title")
    total_plays: int = Field(serialization_alias="totalPlays")
    avg_session_minutes: float = Field(serialization_alias="avgSessionMinutes")
    completion_rate: float = Field(serialization_alias="completionRate")
    popularity_score: float = Field(serialization_alias="popularityScore")
    age_cohort_rank: int = Field(serialization_alias="ageCohortRank")


class GlobalGameStatsResponse(BaseModel):
    """Response schema for global game statistics endpoint."""

    model_config = ConfigDict(populate_by_name=True)

    period: str
    age_group: Optional[str] = Field(default=None, serialization_alias="ageGroup")
    generated_at: datetime = Field(serialization_alias="generatedAt")
    games: List[GlobalGameStat]
    error: Optional[str] = Field(default=None, description="Error message if stats computation failed")
    error_code: Optional[Literal["STATS_COMPUTE_FAILED"]] = Field(default=None, serialization_alias="errorCode", description="Stable error code for operational monitoring")
