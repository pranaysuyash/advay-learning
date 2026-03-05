from typing import Iterable

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models.user import User, UserRole
from app.services.profile_service import ProfileService


def require_roles(roles: Iterable[UserRole]):
    """Dependency factory ensuring current_user has one of the given roles.

    Superusers bypass role checks automatically.
    Usage:

        @router.post("/admin")
        async def admin_action(
            current_user: User = Depends(require_roles([UserRole.ADMIN])),
        ):
            ...
    """

    async def _require(current_user: User = Depends(get_current_user)) -> User:
        if current_user.is_superuser:
            return current_user
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )
        return current_user

    return _require


def require_superuser(current_user: User = Depends(get_current_user)) -> User:
    """Ensure current user is marked superuser."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user


async def assert_access(
    db: AsyncSession,
    user_id: str,
    profile_id: str,
) -> None:
    """Assert that a user has access to a specific profile.
    
    Raises:
        HTTPException: 403 if user doesn't own the profile
    """
    # Get the profile to check ownership
    profile = await ProfileService.get_by_id(db=db, profile_id=profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )
    
    # Check if user owns this profile
    if profile.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
