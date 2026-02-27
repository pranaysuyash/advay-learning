"""Issue reporting endpoints (contract-first foundation)."""

from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Dict
from uuid import uuid4
import os

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.api.deps import get_current_user
from app.db.models.user import User
from app.schemas.issue_report import (
    IssueReportFinalize,
    IssueReportResponse,
    IssueReportSession,
    IssueReportSessionCreate,
    IssueReportUploadResponse,
)
from app.services.cache_service import cache_service

router = APIRouter()

MAX_VIDEO_SIZE_BYTES = 40 * 1024 * 1024  # 40MB
CHUNK_SIZE = 1024 * 1024  # 1MB
ALLOWED_VIDEO_MIME_TYPES = {"video/webm", "video/mp4"}
ISSUE_REPORT_STORAGE_DIR = Path("storage/issue_reports")
SESSION_TTL_SECONDS = 86400  # 24 hours


def normalize_video_mime_type(value: str | None) -> str:
    """Normalize MIME string to a base media type (drop codec parameters)."""
    if not value:
        return "application/octet-stream"
    return value.split(";", 1)[0].strip().lower()


def get_session_cache_key(report_id: str) -> str:
    return f"issue_report_session:{report_id}"


@router.post("/sessions", response_model=IssueReportSession)
async def create_issue_report_session(
    payload: IssueReportSessionCreate,
    current_user: User = Depends(get_current_user),
) -> IssueReportSession:
    """Create an issue report session before clip upload."""
    report_id = str(uuid4())
    created_at = datetime.now(UTC)

    session_data = {
        "report_id": report_id,
        "owner_id": current_user.id,
        "status": "created",
        "created_at": created_at.isoformat(),
        "payload": payload.model_dump(),
    }

    success = await cache_service.set(
        get_session_cache_key(report_id), session_data, ttl=SESSION_TTL_SECONDS
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create issue report session. Cache unavailable.",
        )

    return IssueReportSession(
        report_id=report_id,
        status="created",
        created_at=created_at,
    )


@router.post("/{report_id}/clip", response_model=IssueReportUploadResponse)
async def upload_issue_report_clip(
    report_id: str,
    clip: UploadFile = File(...),
    mime_type: str | None = Form(default=None),
    current_user: User = Depends(get_current_user),
) -> IssueReportUploadResponse:
    """Upload a recorded issue clip for an existing report session."""
    cache_key = get_session_cache_key(report_id)
    report = await cache_service.get(cache_key)
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue report session not found or expired",
        )

    if report["owner_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    detected_mime = normalize_video_mime_type(mime_type or clip.content_type)
    if detected_mime not in ALLOWED_VIDEO_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Invalid clip MIME type. Allowed: {', '.join(sorted(ALLOWED_VIDEO_MIME_TYPES))}",
        )

    file_size_bytes = 0
    is_testing = os.getenv("TESTING", "false").lower() == "true"

    # In test mode we avoid writing generated media files into the repository.
    if is_testing:
        while chunk := await clip.read(CHUNK_SIZE):
            file_size_bytes += len(chunk)
            if file_size_bytes > MAX_VIDEO_SIZE_BYTES:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Clip exceeds size limit of {MAX_VIDEO_SIZE_BYTES // (1024 * 1024)}MB",
                )
        file_path = Path(f"in-memory://{report_id}")
    else:
        user_dir = ISSUE_REPORT_STORAGE_DIR / str(current_user.id)
        user_dir.mkdir(parents=True, exist_ok=True)

        extension = "webm" if "webm" in detected_mime else "mp4"
        file_name = f"{report_id}_{datetime.now(UTC).strftime('%Y%m%d%H%M%S%f')}.{extension}"
        file_path = user_dir / file_name

        try:
            with open(file_path, "wb") as output:
                while chunk := await clip.read(CHUNK_SIZE):
                    file_size_bytes += len(chunk)
                    if file_size_bytes > MAX_VIDEO_SIZE_BYTES:
                        # Cleanup partial file
                        output.close()
                        file_path.unlink(missing_ok=True)
                        raise HTTPException(
                            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            detail=f"Clip exceeds size limit of {MAX_VIDEO_SIZE_BYTES // (1024 * 1024)}MB",
                        )
                    output.write(chunk)
        except HTTPException:
            raise
        except Exception as e:
            file_path.unlink(missing_ok=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save video clip",
            ) from e

    report["status"] = "clip_uploaded"
    report["clip"] = {
        "path": str(file_path),
        "mime_type": detected_mime,
        "file_size_bytes": file_size_bytes,
        "uploaded_at": datetime.now(UTC).isoformat(),
    }

    await cache_service.set(cache_key, report, ttl=SESSION_TTL_SECONDS)

    return IssueReportUploadResponse(
        report_id=report_id,
        status="clip_uploaded",
        mime_type=detected_mime,
        file_size_bytes=file_size_bytes,
    )


@router.post("/{report_id}/finalize", response_model=IssueReportResponse)
async def finalize_issue_report(
    report_id: str,
    payload: IssueReportFinalize,
    current_user: User = Depends(get_current_user),
) -> IssueReportResponse:
    """Finalize issue report metadata after clip upload."""
    cache_key = get_session_cache_key(report_id)
    report = await cache_service.get(cache_key)
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue report session not found or expired",
        )

    if report["owner_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    if report.get("status") != "clip_uploaded":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Clip must be uploaded before finalization",
        )

    submitted_at = datetime.now(UTC)
    report["status"] = "submitted"
    report["submitted_at"] = submitted_at.isoformat()
    report["finalize_payload"] = payload.model_dump()

    await cache_service.set(cache_key, report, ttl=SESSION_TTL_SECONDS)
    
    return IssueReportResponse(
        report_id=report_id,
        status="submitted",
        created_at=datetime.fromisoformat(report["created_at"]),
        submitted_at=submitted_at,
    )
