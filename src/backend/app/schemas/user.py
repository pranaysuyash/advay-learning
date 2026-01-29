"""User schemas."""

import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


def validate_password_strength(password: str) -> str:
    """Validate password meets strength requirements.
    
    Requirements:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    
    Args:
        password: The password to validate
        
    Returns:
        The validated password
        
    Raises:
        ValueError: If password doesn't meet requirements
    """
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")
    
    if not re.search(r'[A-Z]', password):
        raise ValueError("Password must contain at least one uppercase letter")
    
    if not re.search(r'[a-z]', password):
        raise ValueError("Password must contain at least one lowercase letter")
    
    if not re.search(r'\d', password):
        raise ValueError("Password must contain at least one digit")
    
    return password


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    is_active: bool = True
    role: str = "parent"
    email_verified: bool = False


class UserCreate(UserBase):
    """User creation schema."""
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength."""
        return validate_password_strength(v)


class UserUpdate(BaseModel):
    """User update schema."""
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: Optional[str]) -> Optional[str]:
        """Validate password strength if provided."""
        if v is not None:
            return validate_password_strength(v)
        return v


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
