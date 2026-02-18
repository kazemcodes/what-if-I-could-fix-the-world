"""User database model."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.story import Story


class User(Base):
    """User model for authentication and profile data."""

    __tablename__ = "users"

    # Primary key
    id: Mapped[str] = mapped_column(String(36), primary_key=True)

    # Authentication fields
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    # Profile fields
    display_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Subscription fields
    subscription_tier: Mapped[str] = mapped_column(String(20), default="free")
    subscription_status: Mapped[str] = mapped_column(String(20), default="active")
    monthly_credits: Mapped[int] = mapped_column(default=0)
    credits_used: Mapped[int] = mapped_column(default=0)

    # Player Avatar fields (for the Player Avatar System)
    player_level: Mapped[int] = mapped_column(default=1)
    player_xp: Mapped[int] = mapped_column(default=0)
    player_background: Mapped[str | None] = mapped_column(String(100), nullable=True)
    player_superpower: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Status fields
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    stories: Mapped[list["Story"]] = relationship(
        "Story",
        back_populates="author",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<User {self.username} ({self.email})>"

    @property
    def remaining_credits(self) -> int:
        """Calculate remaining credits for the month."""
        return max(0, self.monthly_credits - self.credits_used)

    def has_credits(self, amount: int = 1) -> bool:
        """Check if user has enough credits."""
        if self.subscription_tier == "pro":
            return True  # Pro users have unlimited standard turns
        return self.remaining_credits >= amount

    def use_credits(self, amount: int = 1) -> bool:
        """Use credits if available. Returns True if successful."""
        if not self.has_credits(amount):
            return False
        if self.subscription_tier != "pro":
            self.credits_used += amount
        return True