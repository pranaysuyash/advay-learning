"""Data export endpoints for GDPR/COPPA compliance."""

import io
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.schemas.data_export import DataExportRequest, DataExportResponse
from app.schemas.user import User
from app.services.data_export_service import DataExportService

router = APIRouter()


@router.get("/export", response_model=DataExportResponse)
async def export_user_data(
    format: str = "json",
    include_progress: bool = True,
    include_subscriptions: bool = True,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DataExportResponse:
    """Export all user data for GDPR/COPPA compliance.
    
    Returns complete export of:
    - User account information
    - Child profiles
    - Learning progress
    - Subscription history
    
    Use format="csv" for CSV export (downloads file).
    """
    export_data = await DataExportService.export_user_data(
        db=db,
        user_id=current_user.id,
        include_progress=include_progress,
        include_subscriptions=include_subscriptions,
    )
    
    return export_data


@router.get("/export/download")
async def download_user_data(
    format: str = "json",
    include_progress: bool = True,
    include_subscriptions: bool = True,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    """Download user data as a file.
    
    Supports JSON and CSV formats.
    """
    export_data = await DataExportService.export_user_data(
        db=db,
        user_id=current_user.id,
        include_progress=include_progress,
        include_subscriptions=include_subscriptions,
    )
    
    timestamp = export_data.generated_at.strftime("%Y%m%d_%H%M%S")
    
    if format.lower() == "csv":
        # Generate CSV content
        csv_content = _generate_csv(export_data)
        filename = f"advay_export_{timestamp}.csv"
        media_type = "text/csv"
        content = csv_content.encode("utf-8")
    else:
        # JSON format
        import json
        
        # Convert datetime objects to ISO strings
        data_dict = export_data.model_dump(mode="json")
        json_content = json.dumps(data_dict, indent=2)
        filename = f"advay_export_{timestamp}.json"
        media_type = "application/json"
        content = json_content.encode("utf-8")
    
    return StreamingResponse(
        io.BytesIO(content),
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.get("/export/summary", response_model=Dict[str, Any])
async def get_export_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Get summary of data that would be exported.
    
    Returns counts of profiles, progress records, and subscriptions
    without returning the actual data.
    """
    summary = await DataExportService.get_data_summary(
        db=db,
        user_id=current_user.id,
    )
    return summary


def _generate_csv(export_data: DataExportResponse) -> str:
    """Generate CSV content from export data."""
    import csv
    import io
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # User info section
    writer.writerow(["USER INFORMATION"])
    writer.writerow(["ID", export_data.user.id])
    writer.writerow(["Email", export_data.user.email])
    writer.writerow(["Role", export_data.user.role])
    writer.writerow(["Email Verified", export_data.user.email_verified])
    writer.writerow(["Active", export_data.user.is_active])
    writer.writerow(["Created At", export_data.user.created_at])
    writer.writerow(["Updated At", export_data.user.updated_at])
    writer.writerow([])
    
    # Profiles section
    writer.writerow(["PROFILES"])
    writer.writerow(["ID", "Name", "Age", "Language", "Settings", "Created", "Updated"])
    for profile in export_data.profiles:
        writer.writerow([
            profile.id,
            profile.name,
            profile.age,
            profile.preferred_language,
            str(profile.settings),
            profile.created_at,
            profile.updated_at,
        ])
    writer.writerow([])
    
    # Progress section
    if export_data.progress:
        writer.writerow(["PROGRESS"])
        writer.writerow(["ID", "Profile ID", "Activity", "Content", "Score", "Duration", "Completed", "Completed At"])
        for progress in export_data.progress:
            writer.writerow([
                progress.id,
                progress.profile_id,
                progress.activity_type,
                progress.content_id,
                progress.score,
                progress.duration_seconds,
                progress.completed,
                progress.completed_at,
            ])
        writer.writerow([])
    
    # Subscriptions section
    if export_data.subscriptions:
        writer.writerow(["SUBSCRIPTIONS"])
        writer.writerow(["ID", "Status", "Plan", "Started", "Expires", "Created"])
        for sub in export_data.subscriptions:
            writer.writerow([
                sub.id,
                sub.status,
                sub.plan_type,
                sub.started_at,
                sub.expires_at,
                sub.created_at,
            ])
    
    return output.getvalue()


@router.post("/export", response_model=DataExportResponse)
async def request_data_export(
    request: DataExportRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DataExportResponse:
    """Request data export with options.
    
    Allows specifying which data to include.
    """
    if request.format.lower() not in ["json", "csv"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Format must be 'json' or 'csv'"
        )
    
    export_data = await DataExportService.export_user_data(
        db=db,
        user_id=current_user.id,
        include_progress=request.include_progress,
        include_subscriptions=request.include_subscriptions,
    )
    
    return export_data
