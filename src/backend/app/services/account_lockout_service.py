"""Account lockout service for tracking failed login attempts and implementing account lockout."""

import asyncio
import time
from datetime import datetime, timedelta
from typing import Dict, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.user import User


class AccountLockoutService:
    """Service for tracking failed login attempts and implementing account lockout."""

    # In-memory storage for failed attempts (would use Redis in production)
    _failed_attempts: Dict[str, list] = {}
    _account_lockouts: Dict[str, datetime] = {}

    # Configuration
    MAX_FAILED_ATTEMPTS = 5
    LOCKOUT_DURATION_MINUTES = 15
    ATTEMPT_WINDOW_SECONDS = 900  # 15 minutes window

    @classmethod
    async def record_failed_attempt(cls, email: str) -> bool:
        """Record a failed login attempt and check if account should be locked.

        Args:
            email: The email for which login failed

        Returns:
            True if account should be locked, False otherwise
        """
        now = time.time()
        
        # Initialize attempts list if not exists
        if email not in cls._failed_attempts:
            cls._failed_attempts[email] = []
        
        # Add current attempt
        cls._failed_attempts[email].append(now)
        
        # Remove attempts older than the window
        cls._failed_attempts[email] = [
            attempt for attempt in cls._failed_attempts[email]
            if now - attempt <= cls.ATTEMPT_WINDOW_SECONDS
        ]
        
        # Check if we've exceeded the limit
        should_lock = len(cls._failed_attempts[email]) >= cls.MAX_FAILED_ATTEMPTS
        
        if should_lock:
            # Lock the account
            cls._account_lockouts[email] = datetime.now() + timedelta(minutes=cls.LOCKOUT_DURATION_MINUTES)
            
        return should_lock

    @classmethod
    async def is_account_locked(cls, email: str) -> bool:
        """Check if an account is currently locked.

        Args:
            email: The email to check

        Returns:
            True if account is locked, False otherwise
        """
        if email in cls._account_lockouts:
            if datetime.now() < cls._account_lockouts[email]:
                return True
            else:
                # Lockout period expired, remove from lockouts
                del cls._account_lockouts[email]
                
        return False

    @classmethod
    async def get_remaining_lockout_time(cls, email: str) -> Optional[int]:
        """Get remaining lockout time in seconds.

        Args:
            email: The email to check

        Returns:
            Remaining lockout time in seconds, or None if not locked
        """
        if email in cls._account_lockouts:
            remaining = cls._account_lockouts[email] - datetime.now()
            if remaining.total_seconds() > 0:
                return int(remaining.total_seconds())
            else:
                # Lockout period expired, remove from lockouts
                del cls._account_lockouts[email]
                
        return None

    @classmethod
    async def clear_failed_attempts(cls, email: str) -> None:
        """Clear failed attempts for an email after successful login.

        Args:
            email: The email for which to clear attempts
        """
        if email in cls._failed_attempts:
            del cls._failed_attempts[email]
            
        if email in cls._account_lockouts:
            del cls._account_lockouts[email]

    @classmethod
    async def reset_account_lockout(cls, db: AsyncSession, email: str) -> bool:
        """Manually reset account lockout status.

        Args:
            db: Database session
            email: Email of account to unlock

        Returns:
            True if account was locked and unlocked, False otherwise
        """
        was_locked = email in cls._account_lockouts
        
        if email in cls._account_lockouts:
            del cls._account_lockouts[email]
            
        if email in cls._failed_attempts:
            del cls._failed_attempts[email]
            
        return was_locked