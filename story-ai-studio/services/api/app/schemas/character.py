"""Pydantic schemas for character-related endpoints."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class CharacterStats(BaseModel):
    """Character stats for RPG systems."""
    strength: int = Field(default=10, ge=1, le=30)
    dexterity: int = Field(default=10, ge=1, le=30)
    constitution: int = Field(default=10, ge=1, le=30)
    intelligence: int = Field(default=10, ge=1, le=30)
    wisdom: int = Field(default=10, ge=1, le=30)
    charisma: int = Field(default=10, ge=1, le=30)


class CharacterAppearance(BaseModel):
    """Character appearance details."""
    height: str = Field(default="", description="Character height")
    weight: str = Field(default="", description="Character weight")
    hair_color: str = Field(default="", description="Hair color")
    eye_color: str = Field(default="", description="Eye color")
    skin_color: str = Field(default="", description="Skin color")
    distinguishing_features: str = Field(default="", description="Notable features")


class CharacterCreateRequest(BaseModel):
    """Request body for creating a new character."""
    name: str = Field(..., min_length=1, max_length=100, description="Character name")
    description: str = Field(default="", max_length=2000, description="Brief description")
    backstory: str = Field(default="", max_length=10000, description="Character backstory")
    race: str = Field(default="", max_length=50, description="Character race")
    character_class: str = Field(default="", max_length=50, description="Character class")
    level: int = Field(default=1, ge=1, le=30, description="Character level")
    stats: CharacterStats = Field(default_factory=CharacterStats, description="Character stats")
    appearance: CharacterAppearance = Field(default_factory=CharacterAppearance, description="Appearance")
    personality_traits: list[str] = Field(default_factory=list, description="Personality traits")
    ideals: str = Field(default="", max_length=500, description="Character ideals")
    bonds: str = Field(default="", max_length=500, description="Character bonds")
    flaws: str = Field(default="", max_length=500, description="Character flaws")
    abilities: list[dict[str, Any]] = Field(default_factory=list, description="Abilities and features")
    inventory: list[dict[str, Any]] = Field(default_factory=list, description="Equipment and items")
    ai_hints: dict[str, Any] = Field(default_factory=dict, description="AI roleplay hints")
    portrait_url: str | None = Field(default=None, description="Portrait image URL")
    is_npc: bool = Field(default=False, description="Is this an NPC?")


class CharacterUpdateRequest(BaseModel):
    """Request body for updating a character."""
    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=2000)
    backstory: str | None = Field(default=None, max_length=10000)
    race: str | None = Field(default=None, max_length=50)
    character_class: str | None = Field(default=None, max_length=50)
    level: int | None = Field(default=None, ge=1, le=30)
    stats: CharacterStats | None = None
    appearance: CharacterAppearance | None = None
    personality_traits: list[str] | None = None
    ideals: str | None = Field(default=None, max_length=500)
    bonds: str | None = Field(default=None, max_length=500)
    flaws: str | None = Field(default=None, max_length=500)
    abilities: list[dict[str, Any]] | None = None
    inventory: list[dict[str, Any]] | None = None
    ai_hints: dict[str, Any] | None = None
    portrait_url: str | None = None
    is_npc: bool | None = None


class CharacterResponse(BaseModel):
    """Response for a single character."""
    id: str
    story_id: str
    name: str
    description: str
    backstory: str
    race: str
    character_class: str
    level: int
    stats: dict[str, Any]
    appearance: dict[str, Any]
    personality_traits: list[str]
    ideals: str
    bonds: str
    flaws: str
    abilities: list[dict[str, Any]]
    inventory: list[dict[str, Any]]
    ai_hints: dict[str, Any]
    portrait_url: str | None
    is_npc: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CharacterSummary(BaseModel):
    """Summary of a character for listings."""
    id: str
    story_id: str
    name: str
    description: str
    race: str
    character_class: str
    level: int
    is_npc: bool
    portrait_url: str | None

    model_config = {"from_attributes": True}


class CharacterListResponse(BaseModel):
    """Response for a list of characters."""
    characters: list[CharacterSummary]
    total: int
    story_id: str
