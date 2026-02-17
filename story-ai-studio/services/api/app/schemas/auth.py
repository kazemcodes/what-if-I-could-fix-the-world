"""Authentication schemas for request/response validation."""

import re
from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserRegisterRequest(BaseModel):
    """Request schema for user registration."""

    email: EmailStr
    username: Annotated[str, Field(min_length=3, max_length=50)]
    password: Annotated[str, Field(min_length=8, max_length=100)]
    display_name: Annotated[str | None, Field(max_length=100)] = None

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        """Validate username format."""
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError(
                "Username must contain only letters, numbers, and underscores"
            )
        return v.lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        return v


class UserLoginRequest(BaseModel):
    """Request schema for user login."""

    email: EmailStr
    password: str


class TokenRefreshRequest(BaseModel):
    """Request schema for token refresh."""

    refresh_token: str


class TokenResponse(BaseModel):
    """Response schema for token endpoints."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Response schema for user data."""

    id: str
    email: str
    username: str
    display_name: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
    subscription_tier: str = "free"
    subscription_status: str = "active"
    monthly_credits: int = 0
    credits_used: int = 0
    player_level: int = 1
    player_xp: int = 0
    player_background: str | None = None
    player_superpower: str | None = None
    is_verified: bool = False
    created_at: datetime
    updated_at: datetime
    last_login_at: datetime | None = None

    model_config = {"from_attributes": True}

    @property
    def remaining_credits(self) -> int:
        """Calculate remaining credits."""
        return max(0, self.monthly_credits - self.credits_used)


class UserCreateResponse(BaseModel):
    """Response schema for user creation."""

    id: str
    email: str
    username: str
    display_name: str | None = None
    subscription_tier: str = "free"
    created_at: datetime

    model_config = {"from_attributes": True}