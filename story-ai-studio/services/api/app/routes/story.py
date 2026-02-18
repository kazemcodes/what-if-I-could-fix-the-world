"""Story API routes."""

import uuid
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.story import Story
from app.models.user import User
from app.schemas.story import (
    StoryCreateRequest,
    StoryListResponse,
    StoryResponse,
    StorySummary,
    StoryUpdateRequest,
)
from app.services.auth import AuthService

router = APIRouter(prefix="/stories", tags=["Stories"])
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


@router.post("", response_model=StoryResponse, status_code=status.HTTP_201_CREATED)
async def create_story(
    story_data: StoryCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Story:
    """Create a new story."""
    story = Story(
        id=str(uuid.uuid4()),
        author_id=current_user.id,
        title=story_data.title,
        description=story_data.description,
        world_config=story_data.world_config.model_dump(),
        ai_settings=story_data.ai_settings.model_dump(),
        is_public=story_data.is_public,
        tags=story_data.tags,
        play_count=0,
    )

    db.add(story)
    await db.commit()
    await db.refresh(story)

    return story


@router.get("", response_model=StoryListResponse)
async def list_stories(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=10, ge=1, le=100, description="Items per page"),
    search: str | None = Query(default=None, description="Search in title and description"),
    tags: str | None = Query(default=None, description="Filter by tags (comma-separated)"),
    public_only: bool = Query(default=False, description="Only show public stories"),
) -> dict[str, Any]:
    """List stories with pagination and filtering."""
    # Build query
    query = select(Story)

    # Filter by user (show user's stories + public stories)
    if public_only:
        query = query.where(Story.is_public == True)
    else:
        query = query.where(
            (Story.author_id == current_user.id) | (Story.is_public == True)
        )

    # Search filter
    if search:
        search_term = f"%{search}%"
        query = query.where(
            (Story.title.ilike(search_term)) | (Story.description.ilike(search_term))
        )

    # Tags filter
    if tags:
        tag_list = [t.strip() for t in tags.split(",")]
        # Use JSON contains for tags (SQLite/PostgreSQL compatible)
        for tag in tag_list:
            query = query.where(Story.tags.contains([tag]))

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Apply pagination
    offset = (page - 1) * page_size
    query = query.order_by(Story.created_at.desc()).offset(offset).limit(page_size)

    # Execute query
    result = await db.execute(query)
    stories = result.scalars().all()

    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size

    return {
        "stories": [StorySummary.model_validate(s) for s in stories],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get("/public", response_model=StoryListResponse)
async def list_public_stories(
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=10, ge=1, le=100, description="Items per page"),
    search: str | None = Query(default=None, description="Search in title and description"),
    tags: str | None = Query(default=None, description="Filter by tags (comma-separated)"),
) -> dict[str, Any]:
    """List public stories (no authentication required)."""
    # Build query for public stories only
    query = select(Story).where(Story.is_public == True)

    # Search filter
    if search:
        search_term = f"%{search}%"
        query = query.where(
            (Story.title.ilike(search_term)) | (Story.description.ilike(search_term))
        )

    # Tags filter
    if tags:
        tag_list = [t.strip() for t in tags.split(",")]
        for tag in tag_list:
            query = query.where(Story.tags.contains([tag]))

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Apply pagination
    offset = (page - 1) * page_size
    query = query.order_by(Story.play_count.desc(), Story.created_at.desc())
    query = query.offset(offset).limit(page_size)

    # Execute query
    result = await db.execute(query)
    stories = result.scalars().all()

    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size

    return {
        "stories": [StorySummary.model_validate(s) for s in stories],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get("/{story_id}", response_model=StoryResponse)
async def get_story(
    story_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Story:
    """Get a specific story by ID."""
    result = await db.execute(select(Story).where(Story.id == story_id))
    story = result.scalar_one_or_none()

    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Story not found",
        )

    # Check access: user must be creator or story must be public
    if story.author_id != current_user.id and not story.is_public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this story",
        )

    return story


@router.put("/{story_id}", response_model=StoryResponse)
async def update_story(
    story_id: str,
    story_data: StoryUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Story:
    """Update a story."""
    result = await db.execute(select(Story).where(Story.id == story_id))
    story = result.scalar_one_or_none()

    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Story not found",
        )

    # Check ownership
    if story.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own stories",
        )

    # Update fields
    update_data = story_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(story, field):
            if hasattr(value, "model_dump"):
                value = value.model_dump()
            setattr(story, field, value)

    await db.commit()
    await db.refresh(story)

    return story


@router.delete("/{story_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_story(
    story_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Delete a story."""
    result = await db.execute(select(Story).where(Story.id == story_id))
    story = result.scalar_one_or_none()

    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Story not found",
        )

    # Check ownership
    if story.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own stories",
        )

    await db.delete(story)
    await db.commit()
