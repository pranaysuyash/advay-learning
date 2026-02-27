from typing import Iterable

from fastapi import Depends, HTTPException, status

from app.api.deps import get_current_user
from app.db.models.user import User, UserRole


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
