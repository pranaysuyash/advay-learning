"""Data export schemas for GDPR/COPPA compliance."""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


class UserExportData(BaseModel):
    """User account data for export."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    email: str
    role: str
    email_verified: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ProfileExportData(BaseModel):
    """Profile data for export."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    name: str
    age: Optional[float] = None
    preferred_language: str
    settings: Dict[str, Any]
    created_at: datetime
    updated_at: datetime


class ProgressExportData(BaseModel):
    """Progress data for export."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    profile_id: str
    activity_type: str
    content_id: str
    score: int
    duration_seconds: int
    meta_data: Dict[str, Any]
    completed: bool
    completed_at: datetime
    idempotency_key: Optional[str] = None


class SubscriptionExportData(BaseModel):
    """Subscription data for export."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    status: str
    plan_type: str
    started_at: datetime
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class DataExportResponse(BaseModel):
    """Complete data export response."""
    
    model_config = ConfigDict(from_attributes=True)
    
    export_id: str
    generated_at: datetime
    user: UserExportData
    profiles: List[ProfileExportData]
    progress: List[ProgressExportData]
    subscriptions: List[SubscriptionExportData]
    
    
class DataExportRequest(BaseModel):
    """Request to export user data."""
    
    format: str = "json"  # "json" or "csv"
    include_progress: bool = True
    include_subscriptions: bool = True
