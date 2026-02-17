"""Session database models for game sessions."""

from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.story import Story


class Session(Base):
    """Game session model for active play sessions."""

    __tablename__ = "sessions"

    # Primary key
    id: Mapped[str] = mapped_column(String(36), primary_key=True)

    # Foreign keys
    story_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("stories.id", ondelete="CASCADE"), nullable=False, index=True
    )
    host_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )

    # Basic info
    title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Session status
    status: Mapped[str] = mapped_column(String(20), default="waiting")
    # Statuses: "waiting", "active", "paused", "completed", "archived"

    # Current game state (stored as JSON)
    current_state: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    # current_state structure:
    # {
    #   "scene": "current scene description",
    #   "location_id": "uuid of current location",
    #   "present_characters": ["char_id_1", "char_id_2"],
    #   "active_plot_threads": [...],
    #   "recent_events": [...],
    #   "world_state": {...}
    # }

    # AI context (stored as JSON)
    ai_context: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    # ai_context structure:
    # {
    #   "conversation_history": [...],
    #   "memory_highlights": [...],
    #   "active_npcs": [...],
    #   "pending_actions": [...]
    # }

    # Session settings
    max_players: Mapped[int] = mapped_column(Integer, default=4)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    allow_spectators: Mapped[bool] = mapped_column(Boolean, default=False)
    password: Mapped[str | None] = mapped_column(String(100), nullable=True)  # Optional session password

    # Timing
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_activity_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Statistics
    turn_count: Mapped[int] = mapped_column(Integer, default=0)
    event_count: Mapped[int] = mapped_column(Integer, default=0)

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
    story: Mapped["Story"] = relationship(
        "Story",
        lazy="selectin",
    )
    host: Mapped["User"] = relationship(
        "User",
        foreign_keys=[host_id],
        lazy="selectin",
    )
    players: Mapped[list["SessionPlayer"]] = relationship(
        "SessionPlayer",
        back_populates="session",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    events: Mapped[list["StoryEvent"]] = relationship(
        "StoryEvent",
        back_populates="session",
        lazy="selectin",
        cascade="all, delete-orphan",
        order_by="StoryEvent.created_at",
    )

    def __repr__(self) -> str:
        return f"<Session {self.id} ({self.status})>"

    @property
    def is_active(self) -> bool:
        """Check if session is currently active."""
        return self.status == "active"

    @property
    def is_joinable(self) -> bool:
        """Check if new players can join."""
        if self.status not in ("waiting", "active"):
            return False
        if len(self.players) >= self.max_players:
            return False
        return True

    def start(self) -> None:
        """Start the session."""
        self.status = "active"
        self.started_at = datetime.now(self.session_tzinfo)

    def pause(self) -> None:
        """Pause the session."""
        self.status = "paused"

    def resume(self) -> None:
        """Resume a paused session."""
        self.status = "active"

    def end(self) -> None:
        """End the session."""
        self.status = "completed"
        self.ended_at = datetime.now(self.session_tzinfo)

    @property
    def session_tzinfo(self):
        """Get timezone info for datetime operations."""
        from datetime import timezone
        return timezone.utc


class SessionPlayer(Base):
    """Junction table for session participants."""

    __tablename__ = "session_players"

    # Primary key
    id: Mapped[str] = mapped_column(String(36), primary_key=True)

    # Foreign keys
    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    character_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("characters.id", ondelete="SET NULL"), nullable=True
    )

    # Player role
    role: Mapped[str] = mapped_column(String(20), default="player")
    # Roles: "host", "player", "spectator"

    # Player state (stored as JSON)
    player_state: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    # player_state structure:
    # {
    #   "is_online": true,
    #   "last_action": "described action",
    #   "inventory": [...],
    #   "conditions": [...],
    #   "custom_data": {...}
    # }

    # Timing
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    last_active_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    left_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    session: Mapped["Session"] = relationship(
        "Session",
        back_populates="players",
        lazy="selectin",
    )
    user: Mapped["User"] = relationship(
        "User",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<SessionPlayer {self.user_id} in {self.session_id}>"

    @property
    def is_host(self) -> bool:
        """Check if this player is the host."""
        return self.role == "host"

    @property
    def is_online(self) -> bool:
        """Check if player is currently online."""
        if not self.player_state:
            return False
        return self.player_state.get("is_online", False)


class StoryEvent(Base):
    """Event log for story sessions."""

    __tablename__ = "story_events"

    # Primary key
    id: Mapped[str] = mapped_column(String(36), primary_key=True)

    # Foreign keys
    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    character_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("characters.id", ondelete="SET NULL"), nullable=True
    )
    player_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=True
    )

    # Event data
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # Event types: "narration", "dialogue", "action", "combat", "discovery", "transition", "system"

    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Event metadata (stored as JSON)
    event_metadata: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    # event_metadata structure varies by event_type:
    # {
    #   "location_id": "uuid",
    #   "target_character_id": "uuid",
    #   "dice_roll": {"dice": "d20", "result": 15, "modifier": 3},
    #   "effects": [...],
    #   "custom_data": {...}
    # }

    # AI generation info
    is_ai_generated: Mapped[bool] = mapped_column(Boolean, default=False)
    ai_model: Mapped[str | None] = mapped_column(String(50), nullable=True)
    tokens_used: Mapped[int] = mapped_column(Integer, default=0)

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    session: Mapped["Session"] = relationship(
        "Session",
        back_populates="events",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<StoryEvent {self.event_type} in {self.session_id}>"

    def to_dict(self) -> dict[str, Any]:
        """Convert event to dictionary for API responses."""
        return {
            "id": self.id,
            "event_type": self.event_type,
            "content": self.content,
            "character_id": self.character_id,
            "player_id": self.player_id,
            "metadata": self.metadata,
            "is_ai_generated": self.is_ai_generated,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }