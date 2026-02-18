"""Character API routes."""

import uuid
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.character import Character
from app.models.story import Story
from app.models.user import User
from app.schemas.character import (
    CharacterCreateRequest,
    CharacterListResponse,
    CharacterResponse,
    CharacterSummary,
    CharacterUpdateRequest,
)
from app.services.auth import AuthService

router = APIRouter(prefix="/characters", tags=["Characters"])
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


@router.post("", response_model=CharacterResponse, status_code=status.HTTP_201_CREATED)
async def create_character(
    character_data: CharacterCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    story_id: str = Query(..., description="Story ID to add character to"),
) -> Character:
    """Create a new character for a story."""
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
            detail="You can only add characters to your own stories",
        )
    
    character = Character(
        id=str(uuid.uuid4()),
        story_id=story_id,
        name=character_data.name,
        description=character_data.description,
        backstory=character_data.backstory,
        race=character_data.race,
        character_class=character_data.character_class,
        level=character_data.level,
        stats=character_data.stats.model_dump(),
        appearance=character_data.appearance.model_dump(),
        personality_traits=character_data.personality_traits,
        ideals=character_data.ideals,
        bonds=character_data.bonds,
        flaws=character_data.flaws,
        abilities=character_data.abilities,
        inventory=character_data.inventory,
        ai_hints=character_data.ai_hints,
        portrait_url=character_data.portrait_url,
        is_npc=character_data.is_npc,
    )
    
    db.add(character)
    await db.commit()
    await db.refresh(character)
    
    return character


@router.get("", response_model=CharacterListResponse)
async def list_characters(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    story_id: str = Query(..., description="Story ID to list characters for"),
    is_npc: bool | None = Query(default=None, description="Filter by NPC/PC status"),
) -> dict[str, Any]:
    """List characters for a story."""
    # Verify story exists and user has access
    story_result = await db.execute(select(Story).where(Story.id == story_id))
    story = story_result.scalar_one_or_none()
    
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Story not found",
        )
    
    # User can view characters if they own the story or it's public
    if story.author_id != current_user.id and not story.is_public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this story",
        )
    
    # Build query
    query = select(Character).where(Character.story_id == story_id)
    
    if is_npc is not None:
        query = query.where(Character.is_npc == is_npc)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Execute query
    query = query.order_by(Character.created_at.desc())
    result = await db.execute(query)
    characters = result.scalars().all()
    
    return {
        "characters": [CharacterSummary.model_validate(c) for c in characters],
        "total": total,
        "story_id": story_id,
    }


@router.get("/{character_id}", response_model=CharacterResponse)
async def get_character(
    character_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Character:
    """Get a specific character by ID."""
    result = await db.execute(
        select(Character).where(Character.id == character_id)
    )
    character = result.scalar_one_or_none()
    
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found",
        )
    
    # Check story access
    story_result = await db.execute(select(Story).where(Story.id == character.story_id))
    story = story_result.scalar_one_or_none()
    
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Story not found",
        )
    
    if story.author_id != current_user.id and not story.is_public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this character",
        )
    
    return character


@router.put("/{character_id}", response_model=CharacterResponse)
async def update_character(
    character_id: str,
    character_data: CharacterUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Character:
    """Update a character."""
    result = await db.execute(
        select(Character).where(Character.id == character_id)
    )
    character = result.scalar_one_or_none()
    
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found",
        )
    
    # Check ownership via story
    story_result = await db.execute(select(Story).where(Story.id == character.story_id))
    story = story_result.scalar_one_or_none()
    
    if not story or story.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit characters in your own stories",
        )
    
    # Update fields
    update_data = character_data.model_dump(exclude_unset=True)
    
    # Handle nested objects
    if "stats" in update_data and update_data["stats"]:
        update_data["stats"] = update_data["stats"].model_dump() if hasattr(update_data["stats"], "model_dump") else update_data["stats"]
    if "appearance" in update_data and update_data["appearance"]:
        update_data["appearance"] = update_data["appearance"].model_dump() if hasattr(update_data["appearance"], "model_dump") else update_data["appearance"]
    
    for field, value in update_data.items():
        setattr(character, field, value)
    
    await db.commit()
    await db.refresh(character)
    
    return character


@router.delete("/{character_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_character(
    character_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Delete a character."""
    result = await db.execute(
        select(Character).where(Character.id == character_id)
    )
    character = result.scalar_one_or_none()
    
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found",
        )
    
    # Check ownership via story
    story_result = await db.execute(select(Story).where(Story.id == character.story_id))
    story = story_result.scalar_one_or_none()
    
    if not story or story.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete characters in your own stories",
        )
    
    await db.delete(character)
    await db.commit()
