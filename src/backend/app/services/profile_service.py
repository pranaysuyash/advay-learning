"""Profile service for business logic."""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.profile import Profile
from app.schemas.profile import ProfileCreate, ProfileUpdate


class ProfileService:
    """Profile service."""
    
    @staticmethod
    async def get_by_id(db: AsyncSession, profile_id: str) -> Optional[Profile]:
        """Get profile by ID."""
        result = await db.execute(select(Profile).where(Profile.id == profile_id))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_by_parent(db: AsyncSession, parent_id: str) -> List[Profile]:
        """Get profiles by parent ID."""
        result = await db.execute(select(Profile).where(Profile.parent_id == parent_id))
        return result.scalars().all()
    
    @staticmethod
    async def create(db: AsyncSession, parent_id: str, profile_in: ProfileCreate) -> Profile:
        """Create new profile."""
        profile = Profile(
            parent_id=parent_id,
            name=profile_in.name,
            age=profile_in.age,
            preferred_language=profile_in.preferred_language,
            settings=profile_in.settings,
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
        return profile
    
    @staticmethod
    async def update(db: AsyncSession, profile: Profile, profile_in: ProfileUpdate) -> Profile:
        """Update profile."""
        update_data = profile_in.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(profile, field, value)
        
        await db.commit()
        await db.refresh(profile)
        return profile
    
    @staticmethod
    async def delete(db: AsyncSession, profile: Profile) -> None:
        """Delete profile."""
        await db.delete(profile)
        await db.commit()
