"""Character database model."""

from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.story import Story


class Character(Base):
    """Character model for story characters."""

    __tablename__ = "characters"

    # Primary key
    id: Mapped[str] = mapped_column(String(36), primary_key=True)

    # Foreign keys
    story_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("stories.id", ondelete="CASCADE"), nullable=True, index=True
    )
    owner_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )

    # Basic info
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str | None] = mapped_column(String(100), nullable=True)  # e.g., "The Brave"
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    backstory: Mapped[str | None] = mapped_column(Text, nullable=True)
    personality: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Visual
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    portrait_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Character attributes (stored as JSON)
    attributes: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    # attributes structure:
    # {
    #   "strength": 10,
    #   "dexterity": 14,
    #   "constitution": 12,
    #   "intelligence": 16,
    #   "wisdom": 13,
    #   "charisma": 15,
    #   "custom_attributes": {...}
    # }

    # Skills and abilities (stored as JSON)
    skills: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    # skills structure:
    # {
    #   "combat": ["sword_fighting", "archery"],
    #   "magic": ["fireball", "healing"],
    #   "social": ["persuasion", "intimidation"],
    #   "custom": {...}
    # }

    # Character type
    character_type: Mapped[str] = mapped_column(String(20), default="player")
    # Types: "player", "npc", "enemy", "companion"

    # NPC-specific fields
    is_essential: Mapped[bool] = mapped_column(Boolean, default=False)  # Cannot be killed
    disposition: Mapped[str | None] = mapped_column(String(50), nullable=True)  # friendly, neutral, hostile

    # Location tracking
    current_location_id: Mapped[str | None] = mapped_column(String(36), nullable=True)

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)

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
    story: Mapped["Story | None"] = relationship(
        "Story",
        back_populates="characters",
        lazy="selectin",
    )
    owner: Mapped["User"] = relationship(
        "User",
        back_populates="characters",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Character {self.name} ({self.character_type})>"

    @property
    def is_player(self) -> bool:
        """Check if this is a player character."""
        return self.character_type == "player"

    @property
    def is_npc(self) -> bool:
        """Check if this is an NPC."""
        return self.character_type == "npc"

    def get_attribute(self, attr_name: str, default: int = 10) -> int:
        """Get a specific attribute value."""
        if not self.attributes:
            return default
        return self.attributes.get(attr_name, default)

    def get_modifier(self, attr_name: str) -> int:
        """Calculate D&D-style modifier for an attribute."""
        value = self.get_attribute(attr_name)
        return (value - 10) // 2