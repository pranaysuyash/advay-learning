"""
Profile photo upload endpoint implementation

Uploads photo files, validates size, stores to local filesystem (MVP approach)
S3 integration planned for Phase 3.
"""

import os
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.db.models.profile import Profile
from app.db.models.user import User
from app.schemas.profile import ProfilePhotoResponse

router = APIRouter()

# Constants
MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB
ALLOWED_EXTENSIONS = ["image/jpeg", "image/png"]
ALLOWED_MIME_TYPES = {"jpeg": "image/jpeg", "png": "image/png"}
TARGET_RESOLUTION = (640, 480)
LOCAL_STORAGE_DIR = Path("public/profile_photos")

# Magic bytes for image validation (file signatures)
IMAGE_SIGNATURES = {
    b'\xff\xd8\xff': 'jpeg',  # JPEG
    b'\x89PNG\r\n\x1a\n': 'png',  # PNG
}


def validate_image_magic_bytes(content: bytes) -> str | None:
    """Validate image by checking magic bytes (file signatures).

    Returns the detected image type or None if invalid.
    """
    # Check first few bytes against known signatures
    for signature, image_type in IMAGE_SIGNATURES.items():
        if content.startswith(signature):
            return image_type
    return None


def build_photo_url(profile_id: str, filename: str) -> str:
    """Build the stable API URL used to serve an uploaded profile photo."""
    return f"/api/v1/users/me/profiles/{profile_id}/photo/file/{filename}"


def resolve_storage_path(current_user_id: str, filename: str) -> Path:
    """Resolve the filesystem path for a stored profile photo.

    This function prevents path traversal by treating `filename` as a basename. Any
    path separators or absolute paths provided by a client will be sanitized.
    """
    profile_dir = (LOCAL_STORAGE_DIR / current_user_id).resolve()

    # Force filename to be a basename (drops any ../ or absolute path parts)
    safe_filename = Path(filename).name

    file_path = (profile_dir / safe_filename).resolve()

    if not str(file_path).startswith(str(profile_dir) + os.sep) and file_path != profile_dir:
        raise HTTPException(status_code=400, detail="Invalid file name")

    return file_path


def ensure_profile_photo_uploads_enabled() -> None:
    """Public beta does not allow persisted child photo uploads."""
    if not settings.CHILD_PHOTO_UPLOADS_ENABLED:
        raise HTTPException(
            status_code=410,
            detail=(
                "Stored child profile photos are disabled for the public beta. "
                "Use a preset character avatar instead."
            ),
        )


@router.post("/users/me/profiles/{profile_id}/photo", response_model=ProfilePhotoResponse)
async def upload_profile_photo(
    profile_id: str,
    photo: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProfilePhotoResponse:
    """Upload and associate a photo with a child profile."""
    ensure_profile_photo_uploads_enabled()
    # Verify ownership
    result = await db.execute(select(Profile).where(Profile.id == profile_id))
    profile = result.scalar_one_or_none()

    if not profile or profile.parent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Profile not found or access denied")

    # Read file content
    contents = await photo.read()
    file_size = len(contents)

    # Validate file size
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"Photo file too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)} bytes",
        )

    # Validate file type (header can be spoofed, so we check magic bytes below)
    content_type = photo.content_type if hasattr(photo, "content_type") else "image/jpeg"
    if content_type not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Validate magic bytes (actual file content) to prevent spoofing
    detected_type = validate_image_magic_bytes(contents)
    if detected_type is None:
        raise HTTPException(
            status_code=415,
            detail="Invalid image file. Only JPEG and PNG are allowed.",
        )

    # Verify detected type matches declared type
    if detected_type == 'jpeg' and content_type != 'image/jpeg':
        raise HTTPException(
            status_code=415,
            detail="File content does not match declared type.",
        )
    if detected_type == 'png' and content_type != 'image/png':
        raise HTTPException(
            status_code=415,
            detail="File content does not match declared type.",
        )

    # Generate filename
    extension = "jpg" if content_type == "image/jpeg" else "png"
    filename = f"{profile_id}_{datetime.now().strftime('%Y%m%d%H%M%S%f')}.{extension}"

    # Create local storage directory
    profile_dir = LOCAL_STORAGE_DIR / current_user.id
    profile_dir.mkdir(parents=True, exist_ok=True)

    # Save file to local storage (MVP approach)
    file_path = profile_dir / filename
    file_path.write_bytes(contents)

    # Generate public URL for frontend.
    file_url = build_photo_url(profile_id, filename)

    # Update profile with photo URL
    profile.avatar_url = file_url

    await db.commit()

    return {
        "avatar_url": file_url,
        "photo_updated_at": datetime.utcnow().isoformat(),
    }


@router.get("/users/me/profiles/{profile_id}/photo", response_model=ProfilePhotoResponse)
async def get_profile_photo(
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProfilePhotoResponse:
    """Get a child's profile photo URL (avatar_url first, fall back to profile_photo)."""
    ensure_profile_photo_uploads_enabled()
    result = await db.execute(select(Profile).where(Profile.id == profile_id))
    profile = result.scalar_one_or_none()

    if not profile or profile.parent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Profile not found or access denied")

    return {"avatar_url": profile.avatar_url, "profile_photo": profile.avatar_url}


@router.get("/users/me/profiles/{profile_id}/photo/file/{filename}")
async def get_profile_photo_file(
    profile_id: str,
    filename: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FileResponse:
    """Serve the uploaded profile photo file for the owning parent."""
    ensure_profile_photo_uploads_enabled()
    result = await db.execute(select(Profile).where(Profile.id == profile_id))
    profile = result.scalar_one_or_none()

    if not profile or profile.parent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Profile not found or access denied")

    if profile.avatar_url != build_photo_url(profile_id, filename):
        raise HTTPException(status_code=404, detail="Profile photo not found")

    file_path = resolve_storage_path(current_user.id, filename)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Profile photo file missing")

    media_type = "image/png" if file_path.suffix.lower() == ".png" else "image/jpeg"
    return FileResponse(file_path, media_type=media_type)


@router.delete("/users/me/profiles/{profile_id}/photo", response_model=dict)
async def delete_profile_photo(
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Delete a child's profile photo (both avatar_url and profile_photo)."""
    ensure_profile_photo_uploads_enabled()
    result = await db.execute(select(Profile).where(Profile.id == profile_id))
    profile = result.scalar_one_or_none()

    if not profile or profile.parent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Profile not found or access denied")

    # Get file path from database
    if profile.avatar_url:
        filename = Path(profile.avatar_url).name
        resolve_storage_path(current_user.id, filename).unlink(missing_ok=True)

    profile.avatar_url = None

    await db.commit()

    return {"message": "Photo deleted successfully"}
