"""Validation utilities for API inputs."""

import re
from typing import Optional
from uuid import UUID


class ValidationError(Exception):
    """Validation error with message."""
    pass


def validate_uuid(value: str, field_name: str = "id") -> str:
    """Validate UUID format.
    
    Args:
        value: The string to validate
        field_name: Name of the field for error messages
        
    Returns:
        The validated UUID string
        
    Raises:
        ValidationError: If value is not a valid UUID
    """
    if not value:
        raise ValidationError(f"{field_name} is required")
    
    try:
        UUID(value)
        return value
    except ValueError:
        raise ValidationError(f"{field_name} must be a valid UUID")


def validate_email_format(email: str) -> str:
    """Validate email format.
    
    Args:
        email: The email string to validate
        
    Returns:
        The validated email string
        
    Raises:
        ValidationError: If email format is invalid
    """
    if not email:
        raise ValidationError("email is required")
    
    # Basic email regex pattern
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValidationError("email format is invalid")
    
    return email


def validate_age(age: Optional[float], min_age: float = 0, max_age: float = 18) -> Optional[float]:
    """Validate age is within acceptable range.
    
    Args:
        age: The age to validate (can be float for partial years, e.g., 2.5)
        min_age: Minimum acceptable age (default 0)
        max_age: Maximum acceptable age (default 18)
        
    Returns:
        The validated age
        
    Raises:
        ValidationError: If age is out of range
    """
    if age is None:
        return None
    
    if not isinstance(age, (int, float)):
        raise ValidationError("age must be a number")
    
    if age < min_age or age > max_age:
        raise ValidationError(f"age must be between {min_age} and {max_age}")
    
    return float(age)


def validate_language_code(language: Optional[str]) -> Optional[str]:
    """Validate language code is supported.
    
    Args:
        language: The language code to validate
        
    Returns:
        The validated language code
        
    Raises:
        ValidationError: If language code is not supported
    """
    if language is None:
        return None
    
    supported_languages = {"en", "hi", "kn", "te", "ta"}  # English, Hindi, Kannada, Telugu, Tamil
    
    if language not in supported_languages:
        raise ValidationError(f"language must be one of: {', '.join(sorted(supported_languages))}")
    
    return language
