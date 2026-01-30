"""User management endpoints."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.core.security import verify_password
from app.core.validation import validate_uuid, ValidationError
from app.db.models.user import User as UserModel
from app.schemas.profile import Profile, ProfileCreate
from app.schemas.user import User, UserUpdate
from app.schemas.verification import DeleteAccountRequest, DeleteProfileRequest
from app.services.audit_service import AuditService
from app.services.profile_service import ProfileService
from app.services.user_service import UserService

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
    # Validate user_id format
    try:
        validate_uuid(user_id, "user_id")
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    
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


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_account(
    request: Request,
    delete_req: DeleteAccountRequest,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> None:
    """Delete current user account with parent verification.
    
    Requires password re-authentication for security.
    This is a destructive operation that cannot be undone.
    """
    # Verify password (parent verification)
    if not verify_password(delete_req.password, current_user.hashed_password):
        # Log failed verification attempt
        await AuditService.log_action(
            db,
            user_id=current_user.id,
            user_email=current_user.email,
            action="account_delete_failed",
            resource_type="user",
            resource_id=current_user.id,
            details="Failed password verification for account deletion",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            verification_required=True,
            verification_method="password_reauth",
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Account deletion cancelled.",
        )
    
    # Store user info for audit log before deletion
    user_id = current_user.id
    user_email = current_user.email
    
    # Log the deletion with verification
    await AuditService.log_action(
        db,
        user_id=user_id,
        user_email=user_email,
        action="account_delete",
        resource_type="user",
        resource_id=user_id,
        details=f"Account deleted. Reason: {delete_req.reason or 'Not provided'}",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        verification_required=True,
        verification_method="password_reauth",
    )
    
    # Delete user (cascade will delete profiles and progress)
    await UserService.delete(db, current_user)


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


@router.get("/me/profiles/{profile_id}", response_model=Profile)
async def get_profile(
    profile_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Profile:
    """Get a specific profile by ID."""
    # Validate profile_id format
    try:
        validate_uuid(profile_id, "profile_id")
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    
    # Get profile
    profile = await ProfileService.get_by_id(db, profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )
    
    # Verify profile belongs to current user
    if profile.parent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    return profile


@router.patch("/me/profiles/{profile_id}", response_model=Profile)
async def update_profile(
    profile_id: str,
    profile_in: ProfileUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Profile:
    """Update a child's profile (name, age, preferred_language, settings).
    
    Allows parents to edit profile details without deleting and recreating.
    """
    # Validate profile_id format
    try:
        validate_uuid(profile_id, "profile_id")
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    
    # Get profile
    profile = await ProfileService.get_by_id(db, profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )
    
    # Verify profile belongs to current user
    if profile.parent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Update profile
    updated = await ProfileService.update(db, profile, profile_in)
    
    # Log the update
    await AuditService.log_action(
        db,
        user_id=current_user.id,
        user_email=current_user.email,
        action="profile_update",
        resource_type="profile",
        resource_id=profile_id,
        details=f"Profile updated: {profile.name}",
        ip_address=None,  # Request object not available in this context
        user_agent=None,
    )
    
    return updated


@router.delete("/me/profiles/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(
    request: Request,
    profile_id: str,
    delete_req: DeleteProfileRequest,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> None:
    """Delete a child's profile with parent verification.
    
    Requires password re-authentication for security.
    This will also delete all progress data associated with the profile.
    """
    # Validate profile_id format
    try:
        validate_uuid(profile_id, "profile_id")
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    
    # Get profile
    profile = await ProfileService.get_by_id(db, profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )
    
    # Verify profile belongs to current user
    if profile.parent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Verify password (parent verification)
    if not verify_password(delete_req.password, current_user.hashed_password):
        # Log failed verification attempt
        await AuditService.log_action(
            db,
            user_id=current_user.id,
            user_email=current_user.email,
            action="profile_delete_failed",
            resource_type="profile",
            resource_id=profile_id,
            details=f"Failed password verification for profile deletion: {profile.name}",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            verification_required=True,
            verification_method="password_reauth",
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Profile deletion cancelled.",
        )
    
    # Log the deletion with verification
    await AuditService.log_action(
        db,
        user_id=current_user.id,
        user_email=current_user.email,
        action="profile_delete",
        resource_type="profile",
        resource_id=profile_id,
        details=f"Profile deleted: {profile.name}. Reason: {delete_req.reason or 'Not provided'}",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        verification_required=True,
        verification_method="password_reauth",
    )
    
    # Delete profile (cascade will delete progress)
    await ProfileService.delete(db, profile)
