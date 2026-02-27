"""Redis cache service for API response caching."""

import json
import logging
import os
from typing import Any, Optional

import redis.asyncio as redis

logger = logging.getLogger(__name__)


class CacheService:
    """Redis-based caching service with optional in-memory fallback.

    In development and CI we often don't have a Redis instance running, so
    the service automatically falls back to a simple dictionary.  Any errors
    communicating with Redis (connection issues, closed event loops, etc.)
    will be logged and handled gracefully.
    """

    def __init__(self):
        self._client: Optional[redis.Redis] = None
        # simple in-memory cache for fallback when Redis is unavailable
        self._fallback: dict[str, str] = {}

    async def get_client(self) -> redis.Redis:
        """Get or create Redis client."""
        if self._client is None:
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
            self._client = redis.from_url(redis_url, decode_responses=True)
        return self._client

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        try:
            client = await self.get_client()
            value = await client.get(key)
            if value:
                return json.loads(value)
            return None
        except json.JSONDecodeError as e:
            logger.warning("Cache decoding error for key %s: %s", key, e)
            return None
        except redis.RedisError as e:
            logger.warning("Redis error getting key %s: %s", key, e)
        except Exception as e:  # catch any unexpected errors (e.g. event loop issues)
            logger.warning("Unexpected cache error getting key %s: %s", key, e)
        # fall back to in-memory store if available
        if key in self._fallback:
            try:
                return json.loads(self._fallback[key])
            except json.JSONDecodeError:
                return None
        return None

    async def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """Set value in cache with TTL (default 5 minutes)."""
        try:
            client = await self.get_client()
            await client.setex(key, ttl, json.dumps(value))
            return True
        except TypeError as e:
            logger.warning("Cache serialization error for key %s: %s", key, e)
            return False
        except redis.RedisError as e:
            logger.warning("Redis error setting key %s: %s", key, e)
        except Exception as e:
            logger.warning("Unexpected cache error setting key %s: %s", key, e)
        # if we reached here it means redis failed; store in fallback
        try:
            self._fallback[key] = json.dumps(value)
        except Exception:
            pass
        return True

    async def delete(self, key: str) -> bool:
        """Delete key from cache."""
        try:
            client = await self.get_client()
            await client.delete(key)
            return True
        except redis.RedisError as e:
            logger.warning("Redis error deleting key %s: %s", key, e)
            return False

    async def invalidate_pattern(self, pattern: str) -> bool:
        """Invalidate all keys matching pattern."""
        try:
            client = await self.get_client()
            keys = []
            async for key in client.scan_iter(match=pattern):
                keys.append(key)
            if keys:
                await client.delete(*keys)
            return True
        except redis.RedisError as e:
            logger.warning("Redis error invalidating pattern %s: %s", pattern, e)
            return False

    async def close(self):
        """Close Redis connection."""
        if self._client:
            await self._client.close()
            self._client = None


cache_service = CacheService()


def cache_key(prefix: str, *args: object, **kwargs: object) -> str:
    """Generate cache key from prefix and arguments."""
    parts = [prefix]
    parts.extend(str(arg) for arg in args)
    for k, v in sorted(kwargs.items()):
        parts.append(f"{k}={v}")
    return ":".join(parts)
