from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class AchievementBase(BaseModel):
    """Shared properties for achievements."""

    achievement_type: str = Field(description="The unique identifier for the achievement type")


class AchievementCreate(AchievementBase):
    """Properties to receive on achievement creation."""

    profile_id: str = Field(description="The profile ID earning the achievement")


class AchievementResponse(AchievementBase):
    """Properties to return for an achievement."""

    id: str
    profile_id: str
    unlocked_at: datetime

    model_config = ConfigDict(from_attributes=True)
