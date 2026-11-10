import logging
import json
from typing import Optional, Any
import redis
from app.core.config import settings

logger = logging.getLogger(__name__)

_redis_client: Optional[redis.Redis] = None

def get_redis_client() -> Optional[redis.Redis]:
    """
    Singleton connection manager for Upstash Serverless Redis.
    Supports TLS (rediss://) and standard Redis URIs.
    Gracefully handles connection failures by falling back to None.
    """
    global _redis_client
    if not settings.redis_enabled:
        return None

    if _redis_client is not None:
        return _redis_client

    try:
        _redis_client = redis.from_url(
            settings.redis_url,
            decode_responses=True,
            socket_timeout=5.0,
            socket_connect_timeout=5.0,
            retry_on_timeout=True,
        )
        # Test connection
        _redis_client.ping()
        logger.info("Connected to Upstash Redis cluster successfully.")
        return _redis_client
    except Exception as e:
        logger.warning(f"Unable to connect to Redis at {settings.redis_url}: {e}. Falling back to in-memory operations.")
        _redis_client = None
        return None

def cache_get(key: str) -> Optional[Any]:
    """Retrieve and deserialize a JSON or string value from Redis."""
    client = get_redis_client()
    if not client:
        return None
    try:
        val = client.get(key)
        if val is None:
            return None
        try:
            return json.loads(val)
        except (json.JSONDecodeError, TypeError):
            return val
    except Exception as e:
        logger.warning(f"Redis cache_get error for key {key}: {e}")
        return None

def cache_set(key: str, value: Any, ttl: Optional[int] = None) -> bool:
    """Serialize and store a value in Redis with TTL (seconds)."""
    client = get_redis_client()
    if not client:
        return False
    try:
        ttl = ttl or settings.redis_default_ttl
        serialized = json.dumps(value) if not isinstance(value, (str, int, float, bool)) else str(value)
        return bool(client.set(key, serialized, ex=ttl))
    except Exception as e:
        logger.warning(f"Redis cache_set error for key {key}: {e}")
        return False

def check_rate_limit(key: str, limit: int, window_seconds: int = 60) -> tuple[bool, int]:
    """
    Sliding window / fixed window counter rate limiter.
    Returns (is_allowed, remaining_quota).
    """
    client = get_redis_client()
    if not client or not settings.rate_limit_enabled:
        return True, limit

    try:
        current = client.incr(key)
        if current == 1:
            client.expire(key, window_seconds)
        
        remaining = max(0, limit - current)
        return (current <= limit), remaining
    except Exception as e:
        logger.warning(f"Rate limit check error for key {key}: {e}")
        return True, limit

