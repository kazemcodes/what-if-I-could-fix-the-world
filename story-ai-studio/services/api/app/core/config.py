"""Application configuration using Pydantic Settings.

Supports both Docker and non-Docker development:
- Docker: PostgreSQL + Redis (use docker-compose up)
- Non-Docker: SQLite + optional Redis (set DATABASE_URL=sqlite+aiosqlite:///./data/story_ai.db)
"""

from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "Story AI Studio"
    app_version: str = "0.1.0"
    debug: bool = False
    environment: Literal["development", "staging", "production"] = "development"

    # API
    api_prefix: str = "/api/v1"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    # Database - supports both PostgreSQL and SQLite
    # Docker: postgresql+asyncpg://postgres:postgres@localhost:5432/story_ai_studio
    # Non-Docker: sqlite+aiosqlite:///./data/story_ai.db
    database_url: str = Field(
        default="sqlite+aiosqlite:///./data/story_ai.db"
    )
    database_echo: bool = False
    
    # Database type (auto-detected from URL, but can be overridden)
    database_type: Literal["sqlite", "postgresql"] | None = None

    # Redis - optional for development
    redis_url: str | None = Field(default=None)
    redis_enabled: bool = False  # Set to True if Redis URL is provided

    # JWT Authentication
    jwt_secret_key: str = Field(default="change-this-in-production")
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    # AI Providers
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None

    # Default AI Settings
    default_ai_provider: str = "openai"
    default_ai_model: str = "gpt-4o"
    default_temperature: float = 0.7
    default_max_tokens: int = 2000

    # Container Settings (Self-Hosting)
    container_registry: str = "registry.storyai.studio"
    container_default_tier: str = "free"

    # Media Storage
    storage_backend: Literal["local", "s3", "r2"] = "local"
    storage_local_path: str = "./uploads"
    s3_bucket: str | None = None
    s3_access_key: str | None = None
    s3_secret_key: str | None = None
    s3_region: str = "us-east-1"

    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_period_seconds: int = 60

    @field_validator("database_type", mode="before")
    @classmethod
    def detect_database_type(cls, v: str | None, info) -> str:
        """Auto-detect database type from URL if not specified."""
        if v:
            return v
        database_url = info.data.get("database_url", "")
        if "sqlite" in database_url.lower():
            return "sqlite"
        elif "postgres" in database_url.lower():
            return "postgresql"
        return "sqlite"  # Default to SQLite

    @field_validator("redis_enabled", mode="before")
    @classmethod
    def check_redis_enabled(cls, v: bool, info) -> bool:
        """Enable Redis if URL is provided."""
        if v:
            return True
        redis_url = info.data.get("redis_url")
        return bool(redis_url)

    @property
    def is_sqlite(self) -> bool:
        """Check if using SQLite database."""
        return self.database_type == "sqlite"

    @property
    def is_postgresql(self) -> bool:
        """Check if using PostgreSQL database."""
        return self.database_type == "postgresql"

    @property
    def async_database_url(self) -> str:
        """Get the async database URL, ensuring proper driver is set."""
        url = self.database_url
        # Ensure SQLite uses aiosqlite
        if url.startswith("sqlite://") and "aiosqlite" not in url:
            url = url.replace("sqlite://", "sqlite+aiosqlite://")
        return url


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
