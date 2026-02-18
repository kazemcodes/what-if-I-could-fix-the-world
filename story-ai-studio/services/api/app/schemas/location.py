"""Pydantic schemas for location-related endpoints."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class LocationCoordinates(BaseModel):
    """Location coordinates for map positioning."""
    x: int = Field(default=0, description="X position on map")
    y: int = Field(default=0, description="Y position on map")
    width: int = Field(default=100, description="Width on map")
    height: int = Field(default=100, description="Height on map")


class LocationAtmosphere(BaseModel):
    """Atmospheric details for a location."""
    lighting: str = Field(default="", description="Lighting conditions")
    sounds: str = Field(default="", description="Ambient sounds")
    smells: str = Field(default="", description="Notable smells")
    temperature: str = Field(default="", description="Temperature")
    mood: str = Field(default="", description="Overall mood/feeling")


class LocationCreateRequest(BaseModel):
    """Request body for creating a new location."""
    name: str = Field(..., min_length=1, max_length=100, description="Location name")
    description: str = Field(default="", max_length=5000, description="Detailed description")
    location_type: str = Field(default="", max_length=50, description="Type of location")
    parent_id: str | None = Field(default=None, description="Parent location ID for nested locations")
    coordinates: LocationCoordinates = Field(default_factory=LocationCoordinates, description="Map coordinates")
    image_url: str | None = Field(default=None, description="Location image URL")
    connections: list[str] = Field(default_factory=list, description="Connected location IDs")
    points_of_interest: list[dict[str, Any]] = Field(default_factory=list, description="Points of interest")
    npc_ids: list[str] = Field(default_factory=list, description="NPC character IDs at this location")
    items: list[dict[str, Any]] = Field(default_factory=list, description="Items at this location")
    atmosphere: LocationAtmosphere = Field(default_factory=LocationAtmosphere, description="Atmospheric details")
    ai_hints: dict[str, Any] = Field(default_factory=dict, description="AI description hints")
    is_visible: bool = Field(default=True, description="Is location initially visible")


class LocationUpdateRequest(BaseModel):
    """Request body for updating a location."""
    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=5000)
    location_type: str | None = Field(default=None, max_length=50)
    parent_id: str | None = None
    coordinates: LocationCoordinates | None = None
    image_url: str | None = None
    connections: list[str] | None = None
    points_of_interest: list[dict[str, Any]] | None = None
    npc_ids: list[str] | None = None
    items: list[dict[str, Any]] | None = None
    atmosphere: LocationAtmosphere | None = None
    ai_hints: dict[str, Any] | None = None
    is_visible: bool | None = None


class LocationResponse(BaseModel):
    """Response for a single location."""
    id: str
    story_id: str
    name: str
    description: str
    location_type: str
    parent_id: str | None
    coordinates: dict[str, Any]
    image_url: str | None
    connections: list[str]
    points_of_interest: list[dict[str, Any]]
    npc_ids: list[str]
    items: list[dict[str, Any]]
    atmosphere: dict[str, Any]
    ai_hints: dict[str, Any]
    is_visible: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LocationSummary(BaseModel):
    """Summary of a location for listings."""
    id: str
    story_id: str
    name: str
    description: str
    location_type: str
    parent_id: str | None
    image_url: str | None
    is_visible: bool

    model_config = {"from_attributes": True}


class LocationListResponse(BaseModel):
    """Response for a list of locations."""
    locations: list[LocationSummary]
    total: int
    story_id: str


class LocationTree(BaseModel):
    """Hierarchical tree structure for locations."""
    id: str
    name: str
    location_type: str
    children: list["LocationTree"]

    model_config = {"from_attributes": True}
