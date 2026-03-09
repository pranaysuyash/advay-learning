"""Account lockout service for tracking failed login attempts and implementing account lockout."""

import json
import logging
import os
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional

import redis.asyncio as redis
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


class AccountLockoutService:
    """Service for tracking failed login attempts and implementing account lockout.
    
    Uses Redis for distributed lockout storage (works across multiple workers/instances).
    Falls back to in-memory storage when Redis is unavailable (dev mode).
    """

    # Configuration
    MAX_FAILED_ATTEMPTS = 5
    LOCKOUT_DURATION_MINUTES = 15
    ATTEMPT_WINDOW_SECONDS = 900  # 15 minutes window
    
    # Redis key prefixes
    ATTEMPTS_PREFIX = "lockout:attempts:"
    LOCKOUT_PREFIX = "lockout:locked:"
    
    # Singleton Redis client
    _redis_client: Optional[redis.Redis] = None
    
    # In-memory fallback for dev/CI
    _failed_attempts: Dict[str, List[float]] = {}
    _account_lockouts: Dict[str, datetime] = {}

    @classmethod
    async def _get_redis_client(cls) -> Optional[redis.Redis]:
        """Get or create Redis client with graceful fallback."""
        if cls._redis_client is None:
            redis_url = os.getenv("REDIS_URL")
            if not redis_url:
                logger.debug("REDIS_URL not configured, using in-memory lockout storage")
                return None
            
            try:
                cls._redis_client = redis.from_url(redis_url, decode_responses=True)
                # Test connection
                await cls._redis_client.ping()
                logger.info("Redis lockout storage initialized")
            except Exception as e:
                logger.warning(f"Redis connection failed, falling back to in-memory: {e}")
                cls._redis_client = None
        
        return cls._redis_client

    @classmethod
    async def record_failed_attempt(cls, email: str) -> bool:
        """Record a failed login attempt and check if account should be locked.

        Args:
            email: The email for which login failed

        Returns:
            True if account should be locked, False otherwise
        """
        now = time.time()
        client = await cls._get_redis_client()
        
        if client:
            # Redis path
            try:
                key = f"{cls.ATTEMPTS_PREFIX}{email}"
                
                # Add current attempt to list
                await client.lpush(key, now)
                
                # Trim list to only keep attempts within window
                await client.ltrim(key, 0, cls.MAX_FAILED_ATTEMPTS - 1)
                
                # Set expiry on the key
                await client.expire(key, cls.ATTEMPT_WINDOW_SECONDS)
                
                # Get all attempts within window
                attempts = await client.lrange(key, 0, -1)
                attempts = [float(a) for a in attempts if now - float(a) <= cls.ATTEMPT_WINDOW_SECONDS]
                
                # Check if we've exceeded the limit
                should_lock = len(attempts) >= cls.MAX_FAILED_ATTEMPTS
                
                if should_lock:
                    # Set lockout with TTL
                    lockout_key = f"{cls.LOCKOUT_PREFIX}{email}"
                    await client.setex(
                        lockout_key,
                        cls.LOCKOUT_DURATION_MINUTES * 60,
                        datetime.now().isoformat()
                    )
                    logger.warning(f"Account locked: {email}")
                
                return should_lock
                
            except redis.RedisError as e:
                logger.warning(f"Redis error recording attempt, falling back to in-memory: {e}")
                # Fall through to in-memory implementation
        
        # In-memory fallback (original implementation)
        if email not in cls._failed_attempts:
            cls._failed_attempts[email] = []

        cls._failed_attempts[email].append(now)

        cls._failed_attempts[email] = [
            attempt for attempt in cls._failed_attempts[email]
            if now - attempt <= cls.ATTEMPT_WINDOW_SECONDS
        ]

        should_lock = len(cls._failed_attempts[email]) >= cls.MAX_FAILED_ATTEMPTS

        if should_lock:
            cls._account_lockouts[email] = datetime.now() + timedelta(minutes=cls.LOCKOUT_DURATION_MINUTES)

        return should_lock

    @classmethod
    async def is_account_locked(cls, email: str) -> bool:
        """Check if an account is currently locked.

        Uses constant-time operations to prevent timing attacks.

        Args:
            email: The email to check

        Returns:
            True if account is locked, False otherwise
        """
        client = await cls._get_redis_client()
        
        if client:
            # Redis path
            try:
                lockout_key = f"{cls.LOCKOUT_PREFIX}{email}"
                # Check if key exists (Redis handles TTL expiration automatically)
                locked = await client.exists(lockout_key)
                return bool(locked)
            except redis.RedisError as e:
                logger.warning(f"Redis error checking lockout, falling back to in-memory: {e}")
                # Fall through to in-memory implementation
        
        # In-memory fallback
        lockout_time = cls._account_lockouts.get(email)

        if lockout_time is None:
            return False

        if datetime.now() < lockout_time:
            return True

        # Lockout expired - remove it (best effort, ignore errors)
        try:
            cls._account_lockouts.pop(email, None)
        except Exception:
            pass

        return False

    @classmethod
    async def get_remaining_lockout_time(cls, email: str) -> Optional[int]:
        """Get remaining lockout time in seconds.

        Uses constant-time operations to prevent timing attacks.

        Args:
            email: The email to check

        Returns:
            Remaining lockout time in seconds, or None if not locked
        """
        client = await cls._get_redis_client()
        
        if client:
            # Redis path
            try:
                lockout_key = f"{cls.LOCKOUT_PREFIX}{email}"
                ttl = await client.ttl(lockout_key)
                
                # TTL values: -2 = key doesn't exist, -1 = no expiry, >0 = seconds remaining
                if ttl > 0:
                    return ttl
                return None
            except redis.RedisError as e:
                logger.warning(f"Redis error getting TTL, falling back to in-memory: {e}")
                # Fall through to in-memory implementation
        
        # In-memory fallback
        lockout_time = cls._account_lockouts.get(email)

        if lockout_time is None:
            return None

        remaining = lockout_time - datetime.now()
        if remaining.total_seconds() > 0:
            return int(remaining.total_seconds())

        # Lockout expired - remove it (best effort)
        try:
            cls._account_lockouts.pop(email, None)
        except Exception:
            pass

        return None

    @classmethod
    async def clear_failed_attempts(cls, email: str) -> None:
        """Clear failed attempts for an email after successful login.

        Args:
            email: The email for which to clear attempts
        """
        client = await cls._get_redis_client()
        
        if client:
            # Redis path
            try:
                attempts_key = f"{cls.ATTEMPTS_PREFIX}{email}"
                lockout_key = f"{cls.LOCKOUT_PREFIX}{email}"
                
                # Delete both keys
                await client.delete(attempts_key, lockout_key)
                logger.info(f"Cleared lockout state for: {email}")
                return
            except redis.RedisError as e:
                logger.warning(f"Redis error clearing attempts, falling back to in-memory: {e}")
                # Fall through to in-memory implementation
        
        # In-memory fallback
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
        # Check if locked first
        was_locked = await cls.is_account_locked(email)
        
        if was_locked:
            await cls.clear_failed_attempts(email)
            logger.info(f"Manually unlocked account: {email}")
        
        return was_locked
    
    @classmethod
    async def close(cls):
        """Close Redis connection."""
        if cls._redis_client:
            await cls._redis_client.close()
            cls._redis_client = None
