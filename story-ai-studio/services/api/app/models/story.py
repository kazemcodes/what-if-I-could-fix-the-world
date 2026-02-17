"""Story database model."""

from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.character import Character


class Story(Base):
    """Story/World model for user-created content."""

    __tablename__ = "stories"

    # Primary key
    id: Mapped[str] = mapped_column(String(36), primary_key=True)

    # Foreign key to author
    author_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    # Basic info
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    cover_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # World configuration (stored as JSON)
    world_config: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    # world_config structure:
    # {
    #   "setting": "fantasy" | "scifi" | "modern" | "historical" | "custom",
    #   "themes": ["adventure", "mystery", "romance", ...],
    #   "tone": "serious" | "lighthearted" | "dark" | "balanced",
    #   "content_rating": "everyone" | "teen" | "mature",
    #   "custom_rules": {...}
    # }

    # AI settings (stored as JSON)
    ai_settings: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    # ai_settings structure:
    # {
    #   "provider": "openai" | "anthropic",
    #   "model": "gpt-4o" | "claude-3-opus",
    #   "temperature": 0.7,
    #   "max_tokens": 2000,
    #   "system_prompt": "custom system prompt...",
    #   "response_style": "narrative" | "dialogue" | "mixed"
    # }

    # Publishing status
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Statistics
    play_count: Mapped[int] = mapped_column(Integer, default=0)
    favorite_count: Mapped[int] = mapped_column(Integer, default=0)
    rating_average: Mapped[float] = mapped_column(default=0.0)
    rating_count: Mapped[int] = mapped_column(Integer, default=0)

    # Tags (stored as JSON array)
    tags: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)

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

    # Relationships
    author: Mapped["User"] = relationship(
        "User",
        back_populates="stories",
        lazy="selectin",
    )
    characters: Mapped[list["Character"]] = relationship(
        "Character",
        back_populates="story",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Story {self.title} by {self.author_id}>"

    @property
    def is_draft(self) -> bool:
        """Check if story is a draft."""
        return not self.is_published

    def publish(self) -> None:
        """Publish the story."""
        self.is_published = True
        self.is_public = True
        self.published_at = datetime.now(self.story_tzinfo)

    @property
    def story_tzinfo(self):
        """Get timezone info for datetime operations."""
        from datetime import timezone
        return timezone.utc