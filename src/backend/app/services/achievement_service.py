import logging
from typing import Sequence
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.achievement import Achievement
from app.db.models.profile import Profile
from app.schemas.achievement import AchievementCreate


logger = logging.getLogger(__name__)


class AchievementService:
    @staticmethod
    async def get_by_profile(db: AsyncSession, profile_id: str) -> Sequence[Achievement]:
        """Get all achievements unlocked by a specific profile."""
        stmt = select(Achievement).where(Achievement.profile_id == profile_id)
        result = await db.execute(stmt)
        return result.scalars().all()
    
    @staticmethod
    async def unlock_achievement(db: AsyncSession, obj_in: AchievementCreate) -> Achievement:
        """Unlock a new achievement for a profile. Is idempotent (returns existing if already unlocked)."""
        # First, check if the profile exists
        profile_stmt = select(Profile).where(Profile.id == obj_in.profile_id)
        profile_result = await db.execute(profile_stmt)
        if not profile_result.scalar_one_or_none():
            raise ValueError(f"Profile with id {obj_in.profile_id} does not exist.")

        # Check if achievement is already unlocked to ensure idempotency
        stmt = select(Achievement).where(
            Achievement.profile_id == obj_in.profile_id,
            Achievement.achievement_type == obj_in.achievement_type
        )
        existing_result = await db.execute(stmt)
        existing = existing_result.scalar_one_or_none()
        
        if existing:
            return existing

        # Create new achievement
        db_obj = Achievement(
            id=str(uuid.uuid4()),
            profile_id=obj_in.profile_id,
            achievement_type=obj_in.achievement_type,
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        
        logger.info(f"Unlocked achievement '{obj_in.achievement_type}' for profile {obj_in.profile_id}")
        return db_obj
