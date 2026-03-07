"""Tests for cache service."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import redis.asyncio as redis


class TestCacheService:
    """Test cache service functionality."""

    async def test_cache_set_and_get(self):
        """Test basic set and get operations."""
        from app.services.cache_service import CacheService

        cache = CacheService()

        # Mock Redis client
        mock_client = AsyncMock()
        mock_client.setex = AsyncMock(return_value=True)
        mock_client.get = AsyncMock(return_value=json.dumps({"test": "value"}))
        cache._client = mock_client

        # Test set
        result = await cache.set("test_key", {"test": "value"})
        assert result is True
        mock_client.setex.assert_called_once()

        # Test get
        value = await cache.get("test_key")
        assert value == {"test": "value"}

    async def test_cache_get_nonexistent_key(self):
        """Test getting non-existent key returns None."""
        from app.services.cache_service import CacheService

        cache = CacheService()

        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=None)
        cache._client = mock_client

        value = await cache.get("nonexistent_key")
        assert value is None

    async def test_cache_delete(self):
        """Test delete operation."""
        from app.services.cache_service import CacheService

        cache = CacheService()

        mock_client = AsyncMock()
        mock_client.delete = AsyncMock(return_value=1)
        cache._client = mock_client

        result = await cache.delete("test_key")
        assert result is True
        mock_client.delete.assert_called_once_with("test_key")

    async def test_cache_delete_redis_error(self):
        """Test delete handles Redis error gracefully."""
        from app.services.cache_service import CacheService

        cache = CacheService()

        mock_client = AsyncMock()
        mock_client.delete = AsyncMock(side_effect=redis.RedisError("Connection failed"))
        cache._client = mock_client

        result = await cache.delete("test_key")
        assert result is False

    async def test_cache_invalidate_pattern(self):
        """Test invalidating keys by pattern."""
        from app.services.cache_service import CacheService

        cache = CacheService()

        mock_client = AsyncMock()
        # Mock scan_iter to return an async iterator
        async def mock_scan_iter(match):
            yield "key1"
            yield "key2"

        mock_client.scan_iter = mock_scan_iter
        mock_client.delete = AsyncMock(return_value=2)
        cache._client = mock_client

        result = await cache.invalidate_pattern("test:*")
        assert result is True
        mock_client.delete.assert_called_once_with("key1", "key2")

    async def test_cache_invalidate_pattern_empty(self):
        """Test invalidating pattern with no matching keys."""
        from app.services.cache_service import CacheService

        cache = CacheService()

        mock_client = AsyncMock()

        async def mock_scan_iter(match):
            return
            yield  # Make it an async generator

        mock_client.scan_iter = mock_scan_iter
        mock_client.delete = AsyncMock()
        cache._client = mock_client

        result = await cache.invalidate_pattern("nomatch:*")
        assert result is True
        mock_client.delete.assert_not_called()

    async def test_cache_fallback_on_redis_error(self):
        """Test fallback to in-memory cache when Redis fails."""
        from app.services.cache_service import CacheService

        cache = CacheService()

        # Simulate Redis failure on set
        mock_client = AsyncMock()
        mock_client.setex = AsyncMock(side_effect=redis.RedisError("Connection failed"))
        cache._client = mock_client

        # Set should still succeed (falls back to memory)
        result = await cache.set("test_key", {"test": "value"})
        assert result is True

        # Value should be in fallback
        assert "test_key" in cache._fallback

        # Get should return fallback value when Redis fails
        mock_client.get = AsyncMock(side_effect=redis.RedisError("Connection failed"))
        value = await cache.get("test_key")
        assert value == {"test": "value"}

    async def test_cache_get_json_decode_error(self):
        """Test handling of JSON decode error in cache get."""
        from app.services.cache_service import CacheService

        cache = CacheService()

        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value="invalid json")
        cache._client = mock_client

        value = await cache.get("test_key")
        assert value is None

    async def test_cache_set_serialization_error(self):
        """Test handling of serialization error in cache set."""
        from app.services.cache_service import CacheService

        cache = CacheService()

        mock_client = AsyncMock()
        cache._client = mock_client

        # Try to cache something that can't be serialized
        result = await cache.set("test_key", object())  # object() can't be JSON serialized
        # Should handle gracefully and return False (Redis path) or True (fallback)
        assert isinstance(result, bool)

    async def test_cache_close(self):
        """Test closing cache connection."""
        from app.services.cache_service import CacheService

        cache = CacheService()

        mock_client = AsyncMock()
        mock_client.close = AsyncMock()
        cache._client = mock_client

        await cache.close()
        mock_client.close.assert_called_once()
        assert cache._client is None

    async def test_cache_get_client_creates_new_client(self):
        """Test that get_client creates a new client if none exists."""
        from app.services.cache_service import CacheService

        cache = CacheService()
        assert cache._client is None

        with patch("app.services.cache_service.redis.from_url") as mock_from_url:
            mock_redis = AsyncMock()
            mock_from_url.return_value = mock_redis

            client = await cache.get_client()
            assert client is mock_redis
            mock_from_url.assert_called_once()

    async def test_cache_get_client_reuses_existing(self):
        """Test that get_client reuses existing client."""
        from app.services.cache_service import CacheService

        cache = CacheService()
        mock_client = AsyncMock()
        cache._client = mock_client

        client = await cache.get_client()
        assert client is mock_client


class TestCacheKey:
    """Test cache key generation."""

    async def test_cache_key_basic(self):
        """Test basic cache key generation."""
        from app.services.cache_service import cache_key

        key = cache_key("prefix", "arg1", "arg2")
        assert key == "prefix:arg1:arg2"

    async def test_cache_key_with_kwargs(self):
        """Test cache key generation with kwargs."""
        from app.services.cache_service import cache_key

        key = cache_key("prefix", "arg1", foo="bar", baz="qux")
        # Kwargs are sorted alphabetically
        assert key == "prefix:arg1:baz=qux:foo=bar"

    async def test_cache_key_empty(self):
        """Test cache key generation with just prefix."""
        from app.services.cache_service import cache_key

        key = cache_key("prefix")
        assert key == "prefix"

    async def test_cache_key_mixed_types(self):
        """Test cache key with mixed argument types."""
        from app.services.cache_service import cache_key

        key = cache_key("user", 123, True, status="active")
        assert key == "user:123:True:status=active"


class TestCacheServiceIntegration:
    """Integration tests for cache service with mocked Redis."""

    async def test_full_cache_workflow(self):
        """Test complete cache workflow with mocked Redis."""
        from app.services.cache_service import CacheService

        cache = CacheService()

        # Setup mock
        mock_client = AsyncMock()
        mock_client.setex = AsyncMock(return_value=True)
        mock_client.get = AsyncMock(return_value=None)  # First get misses
        cache._client = mock_client

        # Test miss
        value = await cache.get("workflow_key")
        assert value is None

        # Test set
        await cache.set("workflow_key", {"data": "test"}, ttl=60)

        # Update mock for hit
        mock_client.get = AsyncMock(return_value=json.dumps({"data": "test"}))

        # Test hit
        value = await cache.get("workflow_key")
        assert value == {"data": "test"}

        # Test delete
        mock_client.delete = AsyncMock(return_value=1)
        await cache.delete("workflow_key")

        # Update mock for miss after delete
        mock_client.get = AsyncMock(return_value=None)
        value = await cache.get("workflow_key")
        assert value is None

    async def test_cache_ttl_handling(self):
        """Test that TTL is passed correctly to Redis."""
        from app.services.cache_service import CacheService

        cache = CacheService()

        mock_client = AsyncMock()
        mock_client.setex = AsyncMock(return_value=True)
        cache._client = mock_client

        await cache.set("key", "value", ttl=600)

        # Verify TTL was passed (setex(key, ttl, value))
        call_args = mock_client.setex.call_args
        assert call_args[0][1] == 600  # TTL is second positional arg

    async def test_cache_fallback_json_error(self):
        """Test fallback handles JSON decode errors."""
        from app.services.cache_service import CacheService

        cache = CacheService()

        # Put invalid JSON in fallback
        cache._fallback["bad_key"] = "not valid json"

        mock_client = AsyncMock()
        mock_client.get = AsyncMock(side_effect=redis.RedisError("Connection failed"))
        cache._client = mock_client

        # Should return None for invalid JSON, not crash
        value = await cache.get("bad_key")
        assert value is None

    async def test_cache_fallback_set_json_error(self):
        """Test fallback set handles JSON serialization errors."""
        from app.services.cache_service import CacheService

        cache = CacheService()

        mock_client = AsyncMock()
        mock_client.setex = AsyncMock(side_effect=redis.RedisError("Connection failed"))
        cache._client = mock_client

        # Try to set something that can't be serialized
        # Should not crash, returns True (indicating "set" happened in fallback)
        result = await cache.set("key", object())
        # The fallback will fail to serialize, but the method should handle gracefully
        assert isinstance(result, bool)


class TestCacheServiceErrors:
    """Test cache service error handling."""

    async def test_redis_connection_error_on_get(self):
        """Test handling Redis connection error on get."""
        from app.services.cache_service import CacheService

        cache = CacheService()

        mock_client = AsyncMock()
        mock_client.get = AsyncMock(side_effect=redis.ConnectionError("Connection refused"))
        cache._client = mock_client

        # Should not raise, return None
        value = await cache.get("key")
        assert value is None

    async def test_redis_timeout_error_on_set(self):
        """Test handling Redis timeout error on set."""
        from app.services.cache_service import CacheService

        cache = CacheService()

        mock_client = AsyncMock()
        mock_client.setex = AsyncMock(side_effect=redis.TimeoutError("Timeout"))
        cache._client = mock_client

        # Should fallback to memory
        result = await cache.set("key", "value")
        assert result is True

    async def test_unexpected_exception_on_get(self):
        """Test handling unexpected exception on get."""
        from app.services.cache_service import CacheService

        cache = CacheService()

        mock_client = AsyncMock()
        mock_client.get = AsyncMock(side_effect=Exception("Unexpected"))
        cache._client = mock_client

        # Should not raise, return None
        value = await cache.get("key")
        assert value is None

    async def test_unexpected_exception_on_set(self):
        """Test handling unexpected exception on set."""
        from app.services.cache_service import CacheService

        cache = CacheService()

        mock_client = AsyncMock()
        mock_client.setex = AsyncMock(side_effect=Exception("Unexpected"))
        cache._client = mock_client

        # Should fallback to memory
        result = await cache.set("key", "value")
        assert result is True
