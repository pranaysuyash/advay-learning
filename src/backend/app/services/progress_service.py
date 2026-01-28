"""Progress service for business logic."""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.db.models.progress import Progress
from app.schemas.progress import ProgressCreate, ProgressUpdate


class ProgressService:
    """Progress service."""
    
    @staticmethod
    async def get_by_id(db: AsyncSession, progress_id: str) -> Optional[Progress]:
        """Get progress by ID."""
        result = await db.execute(select(Progress).where(Progress.id == progress_id))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_by_profile(db: AsyncSession, profile_id: str) -> List[Progress]:
        """Get progress by profile ID."""
        result = await db.execute(
            select(Progress)
            .where(Progress.profile_id == profile_id)
            .order_by(desc(Progress.completed_at))
        )
        return result.scalars().all()
    
    @staticmethod
    async def create(db: AsyncSession, profile_id: str, progress_in: ProgressCreate) -> Progress:
        """Create new progress entry."""
        progress = Progress(
            profile_id=profile_id,
            activity_type=progress_in.activity_type,
            content_id=progress_in.content_id,
            score=progress_in.score,
            duration_seconds=progress_in.duration_seconds,
            meta_data=progress_in.metadata,
        )
        db.add(progress)
        await db.commit()
        await db.refresh(progress)
        return progress
    
    @staticmethod
    async def update(db: AsyncSession, progress: Progress, progress_in: ProgressUpdate) -> Progress:
        """Update progress."""
        update_data = progress_in.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(progress, field, value)
        
        await db.commit()
        await db.refresh(progress)
        return progress
    
    @staticmethod
    async def delete(db: AsyncSession, progress: Progress) -> None:
        """Delete progress."""
        await db.delete(progress)
        await db.commit()
