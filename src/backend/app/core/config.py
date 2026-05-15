"""Application configuration.

Defines the environment-contract for the Advay Vision Learning backend.
This module exports `get_settings()` only — do not import `settings` at
module level.
"""

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    Use ``get_settings()`` to obtain a cached instance.  Do **not** import
    ``Settings`` directly outside this module.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )

    # ── App ────────────────────────────────────────────────────────────
    APP_ENV: Literal["development", "test", "staging", "production"] = "development"
    DEBUG: bool = False
    SECRET_KEY: str
    API_V1_PREFIX: str = "/api/v1"

    @field_validator("DEBUG", mode="before")
    @classmethod
    def coerce_debug(cls, v: object) -> bool:
        """Support legacy DEBUG env values like 'release'/'development'."""
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            normalized = v.strip().lower()
            if normalized in {"1", "true", "yes", "on", "debug", "development", "dev"}:
                return True
            if normalized in {
                "0",
                "false",
                "no",
                "off",
                "release",
                "production",
                "prod",
            }:
                return False
        raise ValueError("DEBUG must be a boolean-compatible value")

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if v != v.strip():
            raise ValueError(
                "SECRET_KEY must not contain leading or trailing whitespace"
            )
        weak_keys = [
            "dev-secret-key-change-in-production",
            "your-super-secret-key-change-this-in-production",
            "secret",
            "test",
            "123456",
        ]
        if v.lower() in weak_keys:
            raise ValueError(
                "SECRET_KEY is set to a weak/default value. "
                "Generate one with: openssl rand -hex 32"
            )
        if len(v) < 32:
            raise ValueError(
                f"SECRET_KEY must be at least 32 characters long (got {len(v)}). "
                "Generate one with: openssl rand -hex 32"
            )
        return v

    # ── Database ───────────────────────────────────────────────────────
    DATABASE_URL: str

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("DATABASE_URL must not be empty")
        if not any(
            v.startswith(prefix)
            for prefix in [
                "postgresql+asyncpg://",
                "postgresql://",
                "sqlite+aiosqlite://",
                "sqlite://",
            ]
        ):
            raise ValueError(
                "DATABASE_URL must use a supported scheme "
                "(postgresql+asyncpg://, postgresql://, "
                "sqlite+aiosqlite://, or sqlite://)"
            )
        return v

    # ── JWT / Auth ─────────────────────────────────────────────────────
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    JWT_ALGORITHM: Literal["HS256", "RS256"] = "HS256"
    REFRESH_TOKEN_ROTATION_ENABLED: bool = True
    TOKEN_BLACKLIST_BACKEND: Literal["database", "redis", "memory"] = "database"
    ENABLE_ACCESS_TOKEN_BLACKLIST: bool = True

    @field_validator("ACCESS_TOKEN_EXPIRE_MINUTES")
    @classmethod
    def validate_access_token_expiry(cls, v: int) -> int:
        if v < 1 or v > 60:
            raise ValueError(
                "ACCESS_TOKEN_EXPIRE_MINUTES must be between 1 and 60"
            )
        return v

    @field_validator("REFRESH_TOKEN_EXPIRE_DAYS")
    @classmethod
    def validate_refresh_token_expiry(cls, v: int) -> int:
        if v < 1 or v > 90:
            raise ValueError(
                "REFRESH_TOKEN_EXPIRE_DAYS must be between 1 and 90"
            )
        return v

    # ── CORS ───────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:6173",
        "http://localhost:3000",
    ]
    CORS_ALLOW_CREDENTIALS: bool = True

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v: object) -> list[str]:
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            v_stripped = v.strip()
            if v_stripped.startswith("[") and v_stripped.endswith("]"):
                import json
                return json.loads(v_stripped)
            return [origin.strip() for origin in v_stripped.split(",") if origin.strip()]
        raise ValueError(
            "ALLOWED_ORIGINS must be a JSON array or comma-separated string"
        )

    # ── Frontend / Email ──────────────────────────────────────────────
    FRONTEND_URL: str = "http://localhost:6173"
    SUPPORT_EMAIL: str = "support@advay.app"
    EMAIL_FROM: str = "Advay Learning <onboarding@resend.dev>"
    EMAIL_ENABLED: bool = False
    BETA_FREE_ACCESS: bool = False

    # ── Storage ────────────────────────────────────────────────────────
    STORAGE_BACKEND: Literal["local", "s3"] = "local"
    LOCAL_STORAGE_PATH: Path = Path("./storage")
    MAX_UPLOAD_BYTES: int = 8 * 1024 * 1024
    ALLOWED_IMAGE_MIME_TYPES: list[str] = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ]
    STORE_RAW_UPLOADS: bool = False
    RAW_UPLOAD_RETENTION_HOURS: int = 0
    PROCESSED_DATA_RETENTION_DAYS: int = 90
    IMAGE_PROCESSING_TIMEOUT_SECONDS: int = 30

    # AWS S3 (required when STORAGE_BACKEND == "s3")
    AWS_ACCESS_KEY_ID: str | None = None
    AWS_SECRET_ACCESS_KEY: str | None = None
    S3_BUCKET_NAME: str | None = None
    S3_REGION: str | None = None

    # ── Redis ──────────────────────────────────────────────────────────
    REDIS_URL: str | None = None

    # ── Email (Resend) ─────────────────────────────────────────────────
    RESEND_API_KEY: str | None = None

    # ── Child photos / privacy ─────────────────────────────────────────
    CHILD_PHOTO_UPLOADS_ENABLED: bool = False
    CHILD_PHOTO_STORE_RAW: bool = False
    CHILD_PHOTO_RETENTION_HOURS: int = 0
    MAX_IMAGE_UPLOAD_MB: int = 8
    ALLOW_CHILD_IMAGE_CLOUD_PROCESSING: bool = False

    # ── MediaPipe ──────────────────────────────────────────────────────
    MEDIAPIPE_ENABLED: bool = True
    MEDIAPIPE_TASK: Literal["pose", "face", "hands", "holistic"] = "hands"
    MEDIAPIPE_MODEL_PATH: str | None = None
    MEDIAPIPE_RUNNING_MODE: Literal["image", "video", "live_stream"] = "live_stream"
    MEDIAPIPE_MIN_DETECTION_CONFIDENCE: float = 0.5
    MEDIAPIPE_MIN_TRACKING_CONFIDENCE: float = 0.5
    MEDIAPIPE_TIMEOUT_SECONDS: int = 15
    MEDIAPIPE_USE_GPU: bool = False

    @field_validator(
        "MEDIAPIPE_MIN_DETECTION_CONFIDENCE",
        "MEDIAPIPE_MIN_TRACKING_CONFIDENCE",
    )
    @classmethod
    def validate_confidence(cls, v: float) -> float:
        if not 0.0 <= v <= 1.0:
            raise ValueError("Confidence must be between 0.0 and 1.0")
        return v

    # ── Progress event-time handling ───────────────────────────────────
    USE_CLIENT_EVENT_TIME: bool = False
    MAX_CLIENT_EVENT_CLOCK_SKEW_SECONDS: int = 300

    # ── AI / LLM ──────────────────────────────────────────────────────
    GEMINI_API_KEY: str | None = None
    OPENAI_API_KEY: str | None = None
    LOCAL_LLM_BASE_URL: str | None = None

    AI_LLM_ENABLED: bool = False
    AI_LLM_PROVIDER: Literal["mock", "openai", "gemini", "local"] = "mock"
    AI_LLM_MODEL: str = "qwen3.5-1.5b-instruct"
    AI_LLM_FALLBACK_MODEL: str = "qwen3.5-0.5b-instruct"
    AI_LLM_MAX_RESPONSE_LENGTH: int = 220
    AI_LLM_TIMEOUT_SECONDS: int = 20
    AI_LLM_MAX_RETRIES: int = 1
    AI_CLOUD_FALLBACK_ENABLED: bool = False

    @field_validator("AI_LLM_MAX_RESPONSE_LENGTH")
    @classmethod
    def validate_max_response_length(cls, v: int) -> int:
        if v < 1 or v > 4096:
            raise ValueError("AI_LLM_MAX_RESPONSE_LENGTH must be between 1 and 4096")
        return v

    @field_validator("AI_LLM_TIMEOUT_SECONDS")
    @classmethod
    def validate_ai_timeout(cls, v: int) -> int:
        if v < 1 or v > 300:
            raise ValueError("AI_LLM_TIMEOUT_SECONDS must be between 1 and 300")
        return v

    # ── Cross-field production safety ──────────────────────────────────
    @model_validator(mode="after")
    def validate_production_safety(self) -> "Settings":
        is_prod = self.APP_ENV == "production"

        if is_prod and self.DEBUG:
            raise ValueError("DEBUG must be false when APP_ENV is production")

        if is_prod and self.AI_LLM_ENABLED and self.AI_LLM_PROVIDER == "mock":
            raise ValueError(
                "AI_LLM_PROVIDER must not be 'mock' when AI_LLM_ENABLED and "
                "APP_ENV is production"
            )

        if is_prod and self.BETA_FREE_ACCESS:
            raise ValueError("BETA_FREE_ACCESS cannot be enabled in production")

        if is_prod and self.TOKEN_BLACKLIST_BACKEND == "memory":
            raise ValueError(
                "TOKEN_BLACKLIST_BACKEND must not be 'memory' in production"
            )

        # CORS with credentials must not use wildcard
        if self.CORS_ALLOW_CREDENTIALS and "*" in self.ALLOWED_ORIGINS:
            raise ValueError(
                "Cannot use wildcard CORS origin '*' when "
                "CORS_ALLOW_CREDENTIALS is true"
            )

        # Production CORS origins must be HTTPS, not localhost
        if is_prod:
            for origin in self.ALLOWED_ORIGINS:
                if origin != "*":
                    if not origin.startswith("https://"):
                        raise ValueError(
                            f"CORS origin must use HTTPS in production: {origin}"
                        )

            # Frontend URL must be HTTPS in production
            if not self.FRONTEND_URL.startswith("https://"):
                raise ValueError(
                    "FRONTEND_URL must use HTTPS in production"
                )

        # AI provider / key consistency
        if self.AI_LLM_ENABLED:
            if self.AI_LLM_PROVIDER == "openai" and not self.OPENAI_API_KEY:
                raise ValueError(
                    "OPENAI_API_KEY is required when AI_LLM_PROVIDER is 'openai'"
                )
            if self.AI_LLM_PROVIDER == "gemini" and not self.GEMINI_API_KEY:
                raise ValueError(
                    "GEMINI_API_KEY is required when AI_LLM_PROVIDER is 'gemini'"
                )
            if self.AI_LLM_PROVIDER == "local" and not self.LOCAL_LLM_BASE_URL:
                raise ValueError(
                    "LOCAL_LLM_BASE_URL is required when AI_LLM_PROVIDER is 'local'"
                )

        # Cloud fallback should not process child data unless explicitly allowed
        if (
            self.AI_CLOUD_FALLBACK_ENABLED
            and self.CHILD_PHOTO_UPLOADS_ENABLED
            and not self.ALLOW_CHILD_IMAGE_CLOUD_PROCESSING
        ):
            raise ValueError(
                "AI_CLOUD_FALLBACK_ENABLED requires "
                "ALLOW_CHILD_IMAGE_CLOUD_PROCESSING=true when "
                "CHILD_PHOTO_UPLOADS_ENABLED is true"
            )

        # Token blacklist backend validation
        if self.TOKEN_BLACKLIST_BACKEND == "redis" and not self.REDIS_URL:
            raise ValueError(
                "REDIS_URL is required when TOKEN_BLACKLIST_BACKEND is 'redis'"
            )

        # S3 group validation
        if self.STORAGE_BACKEND == "s3":
            if not self.S3_BUCKET_NAME or not self.S3_REGION:
                raise ValueError(
                    "S3_BUCKET_NAME and S3_REGION are required when "
                    "STORAGE_BACKEND is 's3'"
                )

        # Raw upload retention must be > 0 if STORE_RAW_UPLOADS is true
        if self.STORE_RAW_UPLOADS and self.RAW_UPLOAD_RETENTION_HOURS <= 0:
            raise ValueError(
                "RAW_UPLOAD_RETENTION_HOURS must be > 0 when STORE_RAW_UPLOADS is true"
            )

        return self

    def safe_dict(self) -> dict[str, object]:
        """Return non-sensitive settings for debugging / introspection.

        Secret values (keys, passwords, tokens) are replaced with
        ``"***set***"`` or ``"***not-set***"`` markers.
        """
        secret_fields = frozenset(
            {
                "SECRET_KEY",
                "DATABASE_URL",
                "AWS_ACCESS_KEY_ID",
                "AWS_SECRET_ACCESS_KEY",
                "RESEND_API_KEY",
                "GEMINI_API_KEY",
                "OPENAI_API_KEY",
                "REDIS_URL",
                "LOCAL_LLM_BASE_URL",
            }
        )

        result: dict[str, object] = {}
        for name in self.model_fields:
            if name in secret_fields:
                raw = getattr(self, name)
                result[name] = "***set***" if raw else "***not-set***"
            else:
                result[name] = getattr(self, name)
        return result


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance.

    Use this function instead of importing the ``Settings`` class or the
    deprecated module-level ``settings`` object.
    """
    return Settings()
