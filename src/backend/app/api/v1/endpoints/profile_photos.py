"""
Profile photo upload endpoint implementation

Uploads photo files, validates size, stores to local filesystem (MVP approach)
S3 integration planned for Phase 3.
"""

from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models.profile import Profile
from app.db.models.user import User
from app.schemas.profile import ProfilePhotoResponse

router = APIRouter()

# Constants
MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB
ALLOWED_EXTENSIONS = ["image/jpeg", "image/png"]
TARGET_RESOLUTION = (640, 480)
LOCAL_STORAGE_DIR = Path("public/profile_photos")


@router.post(
    "/api/v1/users/me/profiles/{profile_id}/photo", response_model=ProfilePhotoResponse
)
async def upload_profile_photo(
    profile_id: str,
    photo: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProfilePhotoResponse:
    """Upload and associate a photo with a child profile."""
    # Verify ownership
    result = await db.execute(select(Profile).where(Profile.id == profile_id))
    profile = result.scalar_one_or_none()

    if not profile or profile.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Profile not found or access denied"
        )

    # Read file content
    contents = await photo.read()
    file_size = len(contents)

    # Validate file size
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"Photo file too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)} bytes",
        )

    # Validate file type
    content_type = (
        photo.content_type if hasattr(photo, "content_type") else "image/jpeg"
    )
    if content_type not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Generate filename
    extension = "jpg" if content_type == "image/jpeg" else "png"
    filename = f"{profile_id}_{datetime.now().strftime('%Y%m%d%H%M%S%f')}.{extension}"

    # Create local storage directory
    profile_dir = LOCAL_STORAGE_DIR / current_user.id
    profile_dir.mkdir(parents=True, exist_ok=True)

    # Save file to local storage (MVP approach)
    file_path = profile_dir / filename
    with open(file_path, "wb") as f:
        f.write(contents)

    # Generate public URL for frontend (local filesystem path)
    file_url = f"/api/v1/users/me/profiles/{current_user.id}/photos/{filename}"

    # Update profile with photo URL
    profile.avatar_url = file_url
    profile.profile_photo = file_url
    profile.photo_updated_at = datetime.now()

    await db.commit()

    return {
        "avatar_url": file_url,
        "photo_updated_at": profile.photo_updated_at.isoformat(),
    }


@router.get(
    "/api/v1/users/me/profiles/{profile_id}/photo", response_model=ProfilePhotoResponse
)
async def get_profile_photo(
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProfilePhotoResponse:
    """Get a child's profile photo URL (avatar_url first, fall back to profile_photo)."""
    result = await db.execute(select(Profile).where(Profile.id == profile_id))
    profile = result.scalar_one_or_none()

    if not profile or profile.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Profile not found or access denied"
        )

    # Return avatar_url or profile_photo
    avatar_url = profile.avatar_url
    profile_photo = profile.profile_photo

    return {"avatar_url": avatar_url, "profile_photo": profile_photo}


@router.delete("/api/v1/users/me/profiles/{profile_id}/photo", response_model=dict)
async def delete_profile_photo(
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Delete a child's profile photo (both avatar_url and profile_photo)."""
    result = await db.execute(select(Profile).where(Profile.id == profile_id))
    profile = result.scalar_one_or_none()

    if not profile or profile.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Profile not found or access denied"
        )

    # Get file path from database
    if profile.profile_photo:
        # Extract path from URL
        file_path_local = None
        if profile.profile_photo.startswith("/api/v1/users/me/profiles/"):
            file_path_local = profile.profile_photo.replace(
                "/api/v1/users/me/profiles/", ""
            )

        # Delete local file
        if file_path_local:
            full_path = LOCAL_STORAGE_DIR / current_user.id / Path(file_path_local).name
            if full_path.exists():
                full_path.unlink(missing_ok=True)

    # Clear profile photo fields
    profile.avatar_url = None
    profile.profile_photo = None
    profile.photo_updated_at = None

    await db.commit()

    return {"message": "Photo deleted successfully"}
