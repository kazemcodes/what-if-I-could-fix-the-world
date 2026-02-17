"""Authentication service for user management."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_token_pair, get_password_hash, verify_password, verify_token
from app.models.user import User
from app.schemas.auth import UserRegisterRequest


class AuthService:
    """Service for authentication operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_email(self, email: str) -> User | None:
        """Get user by email address."""
        result = await self.db.execute(
            select(User).where(User.email == email.lower())
        )
        return result.scalar_one_or_none()

    async def get_user_by_username(self, username: str) -> User | None:
        """Get user by username."""
        result = await self.db.execute(
            select(User).where(User.username == username.lower())
        )
        return result.scalar_one_or_none()

    async def get_user_by_id(self, user_id: str) -> User | None:
        """Get user by ID."""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def create_user(self, user_data: UserRegisterRequest) -> User:
        """Create a new user."""
        # Check for existing email
        existing_email = await self.get_user_by_email(user_data.email)
        if existing_email:
            raise ValueError("Email already registered")

        # Check for existing username
        existing_username = await self.get_user_by_username(user_data.username)
        if existing_username:
            raise ValueError("Username already taken")

        # Create user
        user = User(
            id=str(uuid.uuid4()),
            email=user_data.email.lower(),
            username=user_data.username.lower(),
            hashed_password=get_password_hash(user_data.password),
            display_name=user_data.display_name or user_data.username,
            subscription_tier="free",
            subscription_status="active",
            monthly_credits=25,  # Free tier: 25 turns per day
            credits_used=0,
            player_level=1,
            player_xp=0,
            is_active=True,
            is_verified=False,
            is_superuser=False,
        )

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def authenticate_user(self, email: str, password: str) -> User | None:
        """Authenticate a user by email and password."""
        user = await self.get_user_by_email(email)
        if not user:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        # Update last login
        user.last_login_at = datetime.now(timezone.utc)
        await self.db.commit()

        return user

    async def login(self, email: str, password: str) -> dict[str, str] | None:
        """Login a user and return tokens."""
        user = await self.authenticate_user(email, password)
        if not user:
            return None

        return create_token_pair(user.id)

    async def refresh_tokens(self, refresh_token: str) -> dict[str, str] | None:
        """Refresh access tokens using a refresh token."""
        payload = verify_token(refresh_token, token_type="refresh")
        if not payload:
            return None

        user_id = payload.get("user_id")
        if not user_id:
            return None

        # Verify user still exists and is active
        user = await self.get_user_by_id(user_id)
        if not user or not user.is_active:
            return None

        return create_token_pair(user.id)

    async def get_current_user(self, token: str) -> User | None:
        """Get the current user from an access token."""
        payload = verify_token(token, token_type="access")
        if not payload:
            return None

        user_id = payload.get("user_id")
        if not user_id:
            return None

        return await self.get_user_by_id(user_id)