"""User management endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.api.deps import get_db, get_current_user
from app.schemas.user import User, UserUpdate
from app.schemas.profile import Profile, ProfileCreate
from app.services.user_service import UserService
from app.services.profile_service import ProfileService

router = APIRouter()


@router.get("/me", response_model=User)
async def get_me(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current user info."""
    return current_user


@router.get("/{user_id}", response_model=User)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get user by ID."""
    # Only allow users to view themselves or superusers to view anyone
    if current_user.id != user_id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    user = await UserService.get_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.put("/me", response_model=User)
async def update_me(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Update current user."""
    user = await UserService.update(db, current_user, user_in)
    return user


# Profile endpoints (nested under users)
@router.get("/me/profiles", response_model=List[Profile])
async def get_my_profiles(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Profile]:
    """Get current user's profiles (children)."""
    profiles = await ProfileService.get_by_parent(db, current_user.id)
    return profiles


@router.post("/me/profiles", response_model=Profile)
async def create_profile(
    profile_in: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Profile:
    """Create a new profile (child) for current user."""
    profile = await ProfileService.create(db, current_user.id, profile_in)
    return profile
