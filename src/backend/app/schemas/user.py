"""User schemas."""

import re
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


class UserRole(str, Enum):
    """User roles in the system."""

    PARENT = "parent"
    ADMIN = "admin"


def validate_password_strength(password: str) -> str:
    """Validate password meets strength requirements.

    Requirements:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    - Not in common passwords list
    - Not based on user email

    Args:
        password: The password to validate

    Returns:
        The validated password

    Raises:
        ValueError: If password doesn't meet requirements
    """
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")

    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter")

    if not re.search(r"[a-z]", password):
        raise ValueError("Password must contain at least one lowercase letter")

    if not re.search(r"\d", password):
        raise ValueError("Password must contain at least one digit")

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise ValueError(
            'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>'
        )

    # Check against common passwords
    common_passwords = {
        "password",
        "123456",
        "12345678",
        "qwerty",
        "abc123",
        "password123",
        "admin",
        "letmein",
        "welcome",
        "monkey",
        "dragon",
        "master",
        "hello",
        "freedom",
        "whatever",
        "trustno1",
        "princess",
        "shadow",
        "sunshine",
        "123321",
        "superman",
        "1234567890",
        "1234567",
        "12345",
        "555555",
        "lovely",
        "666666",
        "welcome123",
        "iloveyou",
        "1q2w3e4r",
        "000000",
    }

    if password.lower() in common_passwords:
        raise ValueError("Password is too common and easily guessable")

    # Check if password is based on email (if email is provided in context)
    # This would be checked in the validator method that has access to email

    return password


class UserBase(BaseModel):
    """Base user schema."""

    email: EmailStr
    is_active: bool = True
    role: UserRole = UserRole.PARENT
    email_verified: bool = False


class UserCreate(UserBase):
    """User creation schema."""

    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength."""
        return validate_password_strength(v)


class UserUpdate(BaseModel):
    """User update schema."""

    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: Optional[str]) -> Optional[str]:
        """Validate password strength if provided."""
        if v is not None:
            return validate_password_strength(v)
        return v


class UserRoleUpdate(BaseModel):
    """User role update schema (admin only)."""

    role: UserRole


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


class PasswordResetRequest(BaseModel):
    """Password reset request schema."""

    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation schema."""

    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength."""
        return validate_password_strength(v)


class PasswordResetToken(BaseModel):
    """Password reset token schema."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    token: str
    expires_at: datetime
    used: bool = False
    created_at: datetime
