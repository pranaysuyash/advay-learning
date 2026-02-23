"""Issue reporting schemas (contract-first foundation)."""

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field

IssueReportStatus = Literal["created", "clip_uploaded", "submitted", "rejected"]


class IssueReportSessionCreate(BaseModel):
    """Create an issue report session before uploading a clip."""

    game_id: str
    activity_id: Optional[str] = None
    issue_tags: List[str] = Field(default_factory=list)
    session_id: Optional[str] = None
    app_version: Optional[str] = None
    device_info: Dict[str, Any] = Field(default_factory=dict)


class IssueReportSession(BaseModel):
    """Session response for newly created issue report."""

    report_id: str
    status: IssueReportStatus = "created"
    created_at: datetime


class IssueReportUploadResponse(BaseModel):
    """Response after uploading a report clip."""

    report_id: str
    status: IssueReportStatus = "clip_uploaded"
    mime_type: str
    file_size_bytes: int


class IssueReportFinalize(BaseModel):
    """Finalize a report after successful clip upload."""

    duration_seconds: Optional[int] = None
    mime_type: Optional[str] = None
    file_size_bytes: Optional[int] = None
    redaction_applied: bool = True
    metadata: Dict[str, Any] = Field(default_factory=dict)


class IssueReportResponse(BaseModel):
    """General issue report response payload."""

    report_id: str
    status: IssueReportStatus
    created_at: datetime
    submitted_at: Optional[datetime] = None
