"""Progress tracking endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.api.deps import get_db, get_current_user
from app.schemas.user import User
from app.schemas.progress import Progress, ProgressCreate
from app.services.progress_service import ProgressService
from app.services.profile_service import ProfileService

router = APIRouter()


@router.get("/", response_model=List[Progress])
async def get_progress(
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Progress]:
    """Get learning progress for a profile."""
    # Verify profile belongs to current user
    profile = await ProfileService.get_by_id(db, profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )
    
    if profile.parent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    progress = await ProgressService.get_by_profile(db, profile_id)
    return progress


@router.post("/", response_model=Progress)
async def save_progress(
    progress_in: ProgressCreate,
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Progress:
    """Save learning progress."""
    # Verify profile belongs to current user
    profile = await ProfileService.get_by_id(db, profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )
    
    if profile.parent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    progress = await ProgressService.create(db, profile_id, progress_in)
    return progress


@router.get("/stats")
async def get_progress_stats(
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Get progress statistics for a profile."""
    # Verify profile belongs to current user
    profile = await ProfileService.get_by_id(db, profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )
    
    if profile.parent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    progress = await ProgressService.get_by_profile(db, profile_id)
    
    # Calculate stats
    total_activities = len(progress)
    total_score = sum(p.score for p in progress)
    avg_score = total_score / total_activities if total_activities > 0 else 0
    
    # Get unique completed content
    completed_content = set(p.content_id for p in progress if p.score >= 80)
    
    return {
        "total_activities": total_activities,
        "total_score": total_score,
        "average_score": round(avg_score, 2),
        "completed_content": list(completed_content),
        "completion_count": len(completed_content),
    }
