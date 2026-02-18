"""Pydantic schemas for story-related endpoints."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class WorldConfig(BaseModel):
    """World configuration for a story."""
    name: str = Field(..., description="Name of the world")
    description: str = Field(default="", description="World description")
    theme: str = Field(default="fantasy", description="World theme (fantasy, sci-fi, horror, etc.)")
    setting_details: dict[str, Any] = Field(default_factory=dict, description="Additional setting details")
    locations: list[dict[str, Any]] = Field(default_factory=list, description="World locations")
    factions: list[dict[str, Any]] = Field(default_factory=list, description="World factions")
    npcs: list[dict[str, Any]] = Field(default_factory=list, description="Notable NPCs")


class AISettings(BaseModel):
    """AI settings for story generation."""
    model: str = Field(default="gpt-4o", description="AI model to use")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0, description="Generation temperature")
    max_tokens: int = Field(default=2000, ge=100, le=8000, description="Max tokens per response")
    system_prompt_override: str | None = Field(default=None, description="Custom system prompt")
    narrative_style: str = Field(default="immersive", description="Narrative style")
    content_rating: str = Field(default="teen", description="Content rating (everyone, teen, mature)")


class StoryCreateRequest(BaseModel):
    """Request body for creating a new story."""
    title: str = Field(..., min_length=1, max_length=200, description="Story title")
    description: str = Field(default="", max_length=5000, description="Story description")
    world_config: WorldConfig = Field(default_factory=WorldConfig, description="World configuration")
    ai_settings: AISettings = Field(default_factory=AISettings, description="AI settings")
    is_public: bool = Field(default=False, description="Whether the story is publicly visible")
    tags: list[str] = Field(default_factory=list, description="Story tags for discovery")


class StoryUpdateRequest(BaseModel):
    """Request body for updating a story."""
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    world_config: WorldConfig | None = None
    ai_settings: AISettings | None = None
    is_public: bool | None = None
    tags: list[str] | None = None


class StoryResponse(BaseModel):
    """Response for a single story."""
    id: str
    author_id: str
    title: str
    description: str
    world_config: dict[str, Any]
    ai_settings: dict[str, Any]
    is_public: bool
    tags: list[str]
    play_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class StoryListResponse(BaseModel):
    """Response for a list of stories."""
    stories: list[StoryResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class StorySummary(BaseModel):
    """Summary of a story for listings."""
    id: str
    title: str
    description: str
    author_id: str
    is_public: bool
    play_count: int
    tags: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}
