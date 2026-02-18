"""Location API routes."""

import uuid
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.location import Location
from app.models.story import Story
from app.models.user import User
from app.schemas.location import (
    LocationCreateRequest,
    LocationListResponse,
    LocationResponse,
    LocationSummary,
    LocationTree,
    LocationUpdateRequest,
)
from app.services.auth import AuthService

router = APIRouter(prefix="/locations", tags=["Locations"])
security = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Dependency to get the current authenticated user."""
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(credentials.credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


@router.post("", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
async def create_location(
    location_data: LocationCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    story_id: str = Query(..., description="Story ID to add location to"),
) -> Location:
    """Create a new location for a story."""
    # Verify story exists and user owns it
    story_result = await db.execute(select(Story).where(Story.id == story_id))
    story = story_result.scalar_one_or_none()
    
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Story not found",
        )
    
    if story.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only add locations to your own stories",
        )
    
    # If parent_id is provided, verify it exists and belongs to same story
    if location_data.parent_id:
        parent_result = await db.execute(
            select(Location).where(Location.id == location_data.parent_id)
        )
        parent = parent_result.scalar_one_or_none()
        if not parent or parent.story_id != story_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent location not found or doesn't belong to this story",
            )
    
    location = Location(
        id=str(uuid.uuid4()),
        story_id=story_id,
        name=location_data.name,
        description=location_data.description,
        location_type=location_data.location_type,
        parent_id=location_data.parent_id,
        coordinates=location_data.coordinates.model_dump(),
        image_url=location_data.image_url,
        connections=location_data.connections,
        points_of_interest=location_data.points_of_interest,
        npc_ids=location_data.npc_ids,
        items=location_data.items,
        atmosphere=location_data.atmosphere.model_dump(),
        ai_hints=location_data.ai_hints,
        is_visible=location_data.is_visible,
    )
    
    db.add(location)
    await db.commit()
    await db.refresh(location)
    
    return location


@router.get("", response_model=LocationListResponse)
async def list_locations(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    story_id: str = Query(..., description="Story ID to list locations for"),
    location_type: str | None = Query(default=None, description="Filter by location type"),
    parent_id: str | None = Query(default=None, description="Filter by parent location"),
) -> dict[str, Any]:
    """List locations for a story."""
    # Verify story exists and user has access
    story_result = await db.execute(select(Story).where(Story.id == story_id))
    story = story_result.scalar_one_or_none()
    
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Story not found",
        )
    
    # User can view locations if they own the story or it's public
    if story.author_id != current_user.id and not story.is_public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this story",
        )
    
    # Build query
    query = select(Location).where(Location.story_id == story_id)
    
    if location_type:
        query = query.where(Location.location_type == location_type)
    
    if parent_id is not None:
        query = query.where(Location.parent_id == parent_id)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Execute query
    query = query.order_by(Location.created_at.desc())
    result = await db.execute(query)
    locations = result.scalars().all()
    
    return {
        "locations": [LocationSummary.model_validate(loc) for loc in locations],
        "total": total,
        "story_id": story_id,
    }


@router.get("/tree", response_model=list[LocationTree])
async def get_location_tree(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    story_id: str = Query(..., description="Story ID to get location tree for"),
) -> list[LocationTree]:
    """Get hierarchical location tree for a story."""
    # Verify story exists and user has access
    story_result = await db.execute(select(Story).where(Story.id == story_id))
    story = story_result.scalar_one_or_none()
    
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Story not found",
        )
    
    if story.author_id != current_user.id and not story.is_public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this story",
        )
    
    # Get all locations for this story
    result = await db.execute(
        select(Location).where(Location.story_id == story_id).order_by(Location.name)
    )
    all_locations = result.scalars().all()
    
    # Build tree structure
    def build_tree(parent_id: str | None = None) -> list[LocationTree]:
        children = [loc for loc in all_locations if loc.parent_id == parent_id]
        return [
            LocationTree(
                id=loc.id,
                name=loc.name,
                location_type=loc.location_type,
                children=build_tree(loc.id),
            )
            for loc in children
        ]
    
    return build_tree()


@router.get("/{location_id}", response_model=LocationResponse)
async def get_location(
    location_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Location:
    """Get a specific location by ID."""
    result = await db.execute(
        select(Location).where(Location.id == location_id)
    )
    location = result.scalar_one_or_none()
    
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found",
        )
    
    # Check story access
    story_result = await db.execute(select(Story).where(Story.id == location.story_id))
    story = story_result.scalar_one_or_none()
    
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Story not found",
        )
    
    if story.author_id != current_user.id and not story.is_public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this location",
        )
    
    return location


@router.put("/{location_id}", response_model=LocationResponse)
async def update_location(
    location_id: str,
    location_data: LocationUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Location:
    """Update a location."""
    result = await db.execute(
        select(Location).where(Location.id == location_id)
    )
    location = result.scalar_one_or_none()
    
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found",
        )
    
    # Check ownership via story
    story_result = await db.execute(select(Story).where(Story.id == location.story_id))
    story = story_result.scalar_one_or_none()
    
    if not story or story.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit locations in your own stories",
        )
    
    # Update fields
    update_data = location_data.model_dump(exclude_unset=True)
    
    # Handle nested objects
    if "coordinates" in update_data and update_data["coordinates"]:
        update_data["coordinates"] = update_data["coordinates"].model_dump() if hasattr(update_data["coordinates"], "model_dump") else update_data["coordinates"]
    if "atmosphere" in update_data and update_data["atmosphere"]:
        update_data["atmosphere"] = update_data["atmosphere"].model_dump() if hasattr(update_data["atmosphere"], "model_dump") else update_data["atmosphere"]
    
    for field, value in update_data.items():
        setattr(location, field, value)
    
    await db.commit()
    await db.refresh(location)
    
    return location


@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_location(
    location_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Delete a location."""
    result = await db.execute(
        select(Location).where(Location.id == location_id)
    )
    location = result.scalar_one_or_none()
    
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found",
        )
    
    # Check ownership via story
    story_result = await db.execute(select(Story).where(Story.id == location.story_id))
    story = story_result.scalar_one_or_none()
    
    if not story or story.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete locations in your own stories",
        )
    
    await db.delete(location)
    await db.commit()