"""Verification schemas for sensitive operations."""

from pydantic import BaseModel


class ParentVerificationRequest(BaseModel):
    """Request for parent verification via password re-authentication."""
    password: str


class DeleteProfileRequest(BaseModel):
    """Request to delete a profile with parent verification."""
    password: str
    reason: str | None = None


class DeleteAccountRequest(BaseModel):
    """Request to delete user account with parent verification."""
    password: str
    reason: str | None = None
    confirm_delete: bool = False
