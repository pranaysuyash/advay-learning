"""User schemas."""

from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    is_active: bool = True
    role: str = "parent"
    email_verified: bool = False


class UserCreate(UserBase):
    """User creation schema."""
    password: str


class UserUpdate(BaseModel):
    """User update schema."""
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None


class User(UserBase):
    """User response schema."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    created_at: datetime
    updated_at: datetime


class UserInDB(UserBase):
    """User in database schema."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    hashed_password: str
    created_at: datetime
    updated_at: datetime
