"""Pydantic schemas for session-related endpoints."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class SessionCreateRequest(BaseModel):
    """Request body for creating a new game session."""
    story_id: str = Field(..., description="Story ID to create session from")
    title: str | None = Field(default=None, max_length=200, description="Session title")
    description: str | None = Field(default=None, max_length=2000, description="Session description")
    max_players: int = Field(default=4, ge=1, le=10, description="Maximum players")
    is_public: bool = Field(default=False, description="Is session publicly visible")
    allow_spectators: bool = Field(default=False, description="Allow spectators")
    password: str | None = Field(default=None, max_length=100, description="Optional session password")


class SessionUpdateRequest(BaseModel):
    """Request body for updating a session."""
    title: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    max_players: int | None = Field(default=None, ge=1, le=10)
    is_public: bool | None = None
    allow_spectators: bool | None = None
    password: str | None = None
    status: str | None = None


class SessionResponse(BaseModel):
    """Response for a single session."""
    id: str
    story_id: str
    host_id: str
    title: str | None
    description: str | None
    status: str
    current_state: dict[str, Any] | None
    max_players: int
    is_public: bool
    allow_spectators: bool
    turn_count: int
    event_count: int
    started_at: datetime | None
    ended_at: datetime | None
    last_activity_at: datetime
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SessionSummary(BaseModel):
    """Summary of a session for listings."""
    id: str
    story_id: str
    host_id: str
    title: str | None
    status: str
    max_players: int
    is_public: bool
    turn_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class SessionListResponse(BaseModel):
    """Response for a list of sessions."""
    sessions: list[SessionSummary]
    total: int
    page: int
    page_size: int


class SessionActionRequest(BaseModel):
    """Request for performing an action in a session."""
    action: str = Field(..., description="Action to perform")
    character_id: str | None = Field(default=None, description="Character performing action")
    target_id: str | None = Field(default=None, description="Target of action (character, location, item)")
    parameters: dict[str, Any] = Field(default_factory=dict, description="Additional parameters")


class SessionActionResponse(BaseModel):
    """Response after performing an action."""
    success: bool
    narrative: str | None = None
    state_changes: dict[str, Any] = Field(default_factory=dict)
    new_events: list[dict[str, Any]] = Field(default_factory=list)
