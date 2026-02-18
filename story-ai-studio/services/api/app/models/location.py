"""Location model for stories."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Location(Base):
    """Location model for story worlds."""

    __tablename__ = "locations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    story_id: Mapped[str] = mapped_column(String(36), ForeignKey("stories.id", ondelete="CASCADE"), nullable=False)
    
    # Basic info
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    
    # Location type (city, dungeon, forest, etc.)
    location_type: Mapped[str] = mapped_column(String(50), default="")
    
    # Parent location (for nested locations like rooms in a building)
    parent_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("locations.id", ondelete="SET NULL"), nullable=True)
    
    # Map/visual info
    coordinates: Mapped[dict] = mapped_column(JSON, default=dict)  # x, y, width, height for map
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    # Connected locations (for navigation)
    connections: Mapped[list] = mapped_column(JSON, default=list)  # List of location IDs
    
    # Points of interest within this location
    points_of_interest: Mapped[list] = mapped_column(JSON, default=list)
    
    # NPCs present at this location
    npc_ids: Mapped[list] = mapped_column(JSON, default=list)  # List of character IDs
    
    # Items/objects at this location
    items: Mapped[list] = mapped_column(JSON, default=list)
    
    # Atmosphere and sensory details
    atmosphere: Mapped[dict] = mapped_column(JSON, default=dict)  # lighting, sounds, smells, etc.
    
    # AI-specific settings for this location
    ai_hints: Mapped[dict] = mapped_column(JSON, default=dict)  # How AI should describe this location
    
    # Is this location initially visible/known?
    is_visible: Mapped[bool] = mapped_column(default=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    story = relationship("Story", back_populates="locations")
    parent = relationship("Location", remote_side=[id], backref="children")
