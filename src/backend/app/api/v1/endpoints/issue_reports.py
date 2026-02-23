"""Issue reporting endpoints (contract-first foundation)."""

from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Dict
from uuid import uuid4

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

router = APIRouter()

MAX_VIDEO_SIZE_BYTES = 40 * 1024 * 1024  # 40MB
ALLOWED_VIDEO_MIME_TYPES = {"video/webm", "video/mp4"}
ISSUE_REPORT_STORAGE_DIR = Path("storage/issue_reports")

# Contract-first in-memory store for foundation slice (will move to DB model later)
ISSUE_REPORTS: Dict[str, Dict[str, Any]] = {}


@router.post("/sessions", response_model=IssueReportSession)
async def create_issue_report_session(
    payload: IssueReportSessionCreate,
    current_user: User = Depends(get_current_user),
) -> IssueReportSession:
    """Create an issue report session before clip upload."""
    report_id = str(uuid4())
    created_at = datetime.now(UTC)

    ISSUE_REPORTS[report_id] = {
        "report_id": report_id,
        "owner_id": current_user.id,
        "status": "created",
        "created_at": created_at,
        "payload": payload.model_dump(),
    }

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
    report = ISSUE_REPORTS.get(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue report session not found",
        )

    if report["owner_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    detected_mime = mime_type or clip.content_type or "application/octet-stream"
    if detected_mime not in ALLOWED_VIDEO_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Invalid clip MIME type. Allowed: {', '.join(sorted(ALLOWED_VIDEO_MIME_TYPES))}",
        )

    contents = await clip.read()
    file_size_bytes = len(contents)
    if file_size_bytes > MAX_VIDEO_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Clip exceeds size limit of {MAX_VIDEO_SIZE_BYTES // (1024 * 1024)}MB",
        )

    user_dir = ISSUE_REPORT_STORAGE_DIR / str(current_user.id)
    user_dir.mkdir(parents=True, exist_ok=True)

    extension = "webm" if "webm" in detected_mime else "mp4"
    file_name = f"{report_id}_{datetime.now(UTC).strftime('%Y%m%d%H%M%S%f')}.{extension}"
    file_path = user_dir / file_name

    with open(file_path, "wb") as output:
        output.write(contents)

    report["status"] = "clip_uploaded"
    report["clip"] = {
        "path": str(file_path),
        "mime_type": detected_mime,
        "file_size_bytes": file_size_bytes,
        "uploaded_at": datetime.now(UTC),
    }

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
    report = ISSUE_REPORTS.get(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue report session not found",
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

    report["status"] = "submitted"
    report["submitted_at"] = datetime.now(UTC)
    report["finalize_payload"] = payload.model_dump()

    return IssueReportResponse(
        report_id=report_id,
        status="submitted",
        created_at=report["created_at"],
        submitted_at=report["submitted_at"],
    )
