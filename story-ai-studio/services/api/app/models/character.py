"""Character model for stories."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Character(Base):
    """Character model for stories."""

    __tablename__ = "characters"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    story_id: Mapped[str] = mapped_column(String(36), ForeignKey("stories.id", ondelete="CASCADE"), nullable=False)
    
    # Basic info
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    backstory: Mapped[str] = mapped_column(Text, default="")
    
    # Character details
    race: Mapped[str] = mapped_column(String(50), default="")
    character_class: Mapped[str] = mapped_column(String(50), default="")  # 'class' is reserved
    level: Mapped[int] = mapped_column(Integer, default=1)
    
    # Stats (flexible JSON for different RPG systems)
    stats: Mapped[dict] = mapped_column(JSON, default=dict)
    
    # Appearance
    appearance: Mapped[dict] = mapped_column(JSON, default=dict)
    
    # Personality
    personality_traits: Mapped[list] = mapped_column(JSON, default=list)
    ideals: Mapped[str] = mapped_column(Text, default="")
    bonds: Mapped[str] = mapped_column(Text, default="")
    flaws: Mapped[str] = mapped_column(Text, default="")
    
    # Abilities (class features, spells, etc.)
    abilities: Mapped[list] = mapped_column(JSON, default=list)
    
    # Equipment/Inventory
    inventory: Mapped[list] = mapped_column(JSON, default=list)
    
    # AI-specific settings for this character
    ai_hints: Mapped[dict] = mapped_column(JSON, default=dict)  # How AI should roleplay this character
    
    # Portrait image URL
    portrait_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    # Is this an NPC or player character?
    is_npc: Mapped[bool] = mapped_column(default=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    story = relationship("Story", back_populates="characters")
