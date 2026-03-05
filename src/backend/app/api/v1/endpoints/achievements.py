from typing import Sequence

from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.api.permissions import assert_access
from app.db.models.achievement import Achievement
from app.schemas.achievement import AchievementCreate, AchievementResponse
from app.schemas.user import User
from app.services.achievement_service import AchievementService

router = APIRouter()


@router.get("/{profile_id}", response_model=list[AchievementResponse])
async def get_achievements(
    profile_id: str = Path(..., description="ID of the profile"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Sequence[Achievement]:
    """Get all achievements for a profile."""
    # Ensure current user has access to this profile
    await assert_access(db, user_id=current_user.id, profile_id=profile_id)

    return await AchievementService.get_by_profile(db=db, profile_id=profile_id)


@router.post("/", response_model=AchievementResponse, status_code=status.HTTP_201_CREATED)
async def unlock_achievement(
    obj_in: AchievementCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Achievement:
    """Unlock a new achievement for a profile."""
    # Ensure current user has access to this profile
    await assert_access(db, user_id=current_user.id, profile_id=obj_in.profile_id)

    try:
        return await AchievementService.unlock_achievement(db=db, obj_in=obj_in)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
