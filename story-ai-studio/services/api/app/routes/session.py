"""Session management routes for game sessions."""

from datetime import datetime, timezone
from typing import Annotated, Any
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.user import User
from app.models.story import Story
from app.models.session import Session, SessionPlayer, StoryEvent
from app.schemas.session import (
    SessionCreateRequest,
    SessionUpdateRequest,
    SessionResponse,
    SessionSummary,
    SessionListResponse,
    SessionActionRequest,
    SessionActionResponse,
)
from app.services.auth import AuthService
from app.services.story_engine import StoryEngine

router = APIRouter(prefix="/sessions", tags=["sessions"])
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


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    data: SessionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new game session."""
    # Verify story exists
    story_result = await db.execute(
        select(Story).where(Story.id == data.story_id)
    )
    story = story_result.scalar_one_or_none()
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Story not found"
        )
    
    # Create session
    session = Session(
        id=str(uuid4()),
        story_id=data.story_id,
        host_id=current_user.id,
        title=data.title,
        description=data.description,
        status="waiting",
        max_players=data.max_players,
        is_public=data.is_public,
        allow_spectators=data.allow_spectators,
        password=data.password,
        current_state={},
        ai_context={},
    )
    db.add(session)
    
    # Add host as a player
    host_player = SessionPlayer(
        id=str(uuid4()),
        session_id=session.id,
        user_id=current_user.id,
        role="host",
        player_state={"is_online": True},
    )
    db.add(host_player)
    
    await db.commit()
    await db.refresh(session)
    
    return session


@router.get("", response_model=SessionListResponse)
async def list_sessions(
    story_id: str | None = Query(default=None, description="Filter by story ID"),
    status_filter: str | None = Query(default=None, alias="status", description="Filter by status"),
    is_public: bool | None = Query(default=None, description="Filter public sessions"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List game sessions with optional filters."""
    query = select(Session)
    count_query = select(func.count(Session.id))
    
    if story_id:
        query = query.where(Session.story_id == story_id)
        count_query = count_query.where(Session.story_id == story_id)
    
    if status_filter:
        query = query.where(Session.status == status_filter)
        count_query = count_query.where(Session.status == status_filter)
    
    if is_public is not None:
        query = query.where(Session.is_public == is_public)
        count_query = count_query.where(Session.is_public == is_public)
    
    # Get total count
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.order_by(Session.created_at.desc()).offset(offset).limit(page_size)
    
    result = await db.execute(query)
    sessions = result.scalars().all()
    
    return SessionListResponse(
        sessions=[SessionSummary.model_validate(s) for s in sessions],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific session by ID."""
    result = await db.execute(
        select(Session).where(Session.id == session_id)
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    return session


@router.patch("/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: str,
    data: SessionUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a session (host only)."""
    result = await db.execute(
        select(Session).where(Session.id == session_id)
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    if session.host_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the host can update this session"
        )
    
    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(session, field, value)
    
    await db.commit()
    await db.refresh(session)
    
    return session


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a session (host only)."""
    result = await db.execute(
        select(Session).where(Session.id == session_id)
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    if session.host_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the host can delete this session"
        )
    
    await db.delete(session)
    await db.commit()
    
    return None


@router.post("/{session_id}/start", response_model=SessionResponse)
async def start_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Start a session (host only)."""
    result = await db.execute(
        select(Session).where(Session.id == session_id)
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    if session.host_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the host can start this session"
        )
    
    if session.status != "waiting":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot start session with status '{session.status}'"
        )
    
    session.status = "active"
    session.started_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(session)
    
    return session


@router.post("/{session_id}/pause", response_model=SessionResponse)
async def pause_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Pause a session (host only)."""
    result = await db.execute(
        select(Session).where(Session.id == session_id)
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    if session.host_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the host can pause this session"
        )
    
    if session.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot pause session with status '{session.status}'"
        )
    
    session.status = "paused"
    
    await db.commit()
    await db.refresh(session)
    
    return session


@router.post("/{session_id}/resume", response_model=SessionResponse)
async def resume_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Resume a paused session (host only)."""
    result = await db.execute(
        select(Session).where(Session.id == session_id)
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    if session.host_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the host can resume this session"
        )
    
    if session.status != "paused":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot resume session with status '{session.status}'"
        )
    
    session.status = "active"
    
    await db.commit()
    await db.refresh(session)
    
    return session


@router.post("/{session_id}/end", response_model=SessionResponse)
async def end_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """End a session (host only)."""
    result = await db.execute(
        select(Session).where(Session.id == session_id)
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    if session.host_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the host can end this session"
        )
    
    if session.status not in ("active", "paused"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot end session with status '{session.status}'"
        )
    
    session.status = "completed"
    session.ended_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(session)
    
    return session


@router.post("/{session_id}/join", response_model=SessionResponse)
async def join_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Join a session as a player."""
    result = await db.execute(
        select(Session).where(Session.id == session_id)
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    if not session.is_joinable:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This session is not accepting new players"
        )
    
    # Check if already joined
    existing_result = await db.execute(
        select(SessionPlayer).where(
            SessionPlayer.session_id == session_id,
            SessionPlayer.user_id == current_user.id
        )
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already joined this session"
        )
    
    # Add player
    player = SessionPlayer(
        id=str(uuid4()),
        session_id=session_id,
        user_id=current_user.id,
        role="player",
        player_state={"is_online": True},
    )
    db.add(player)
    
    await db.commit()
    await db.refresh(session)
    
    return session


@router.post("/{session_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
async def leave_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Leave a session."""
    result = await db.execute(
        select(SessionPlayer).where(
            SessionPlayer.session_id == session_id,
            SessionPlayer.user_id == current_user.id
        )
    )
    player = result.scalar_one_or_none()
    
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not a member of this session"
        )
    
    if player.role == "host":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Host cannot leave the session. Transfer host or delete the session."
        )
    
    player.left_at = datetime.now(timezone.utc)
    await db.commit()
    
    return None


@router.post("/{session_id}/action", response_model=SessionActionResponse)
async def perform_action(
    session_id: str,
    data: SessionActionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Perform an action in a session."""
    result = await db.execute(
        select(Session).where(Session.id == session_id)
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    if session.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is not active"
        )
    
    # Verify player is in session
    player_result = await db.execute(
        select(SessionPlayer).where(
            SessionPlayer.session_id == session_id,
            SessionPlayer.user_id == current_user.id
        )
    )
    if not player_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this session"
        )
    
    # Use StoryEngine for AI narrative generation
    try:
        engine = StoryEngine(db)
        ai_result = await engine.process_player_action(
            session_id=session_id,
            player_id=current_user.id,
            action=data.action,
            character_id=data.character_id,
        )
        
        return SessionActionResponse(
            success=True,
            narrative=ai_result.get("narration"),
            state_changes={},
            new_events=[{
                "type": "narration",
                "content": ai_result.get("narration"),
            }],
        )
    except ValueError as e:
        # AI provider not configured, fall back to placeholder
        # Create event for the action
        event = StoryEvent(
            id=str(uuid4()),
            session_id=session_id,
            character_id=data.character_id,
            player_id=current_user.id,
            event_type="action",
            content=data.action,
            event_metadata=data.parameters,
            is_ai_generated=False,
        )
        db.add(event)
        
        # Update session stats
        session.turn_count += 1
        session.event_count += 1
        session.last_activity_at = datetime.now(timezone.utc)
        
        await db.commit()
        
        # Return a placeholder response
        return SessionActionResponse(
            success=True,
            narrative=f"You {data.action}. The story continues...",
            state_changes={},
            new_events=[{
                "id": event.id,
                "type": "action",
                "content": data.action,
            }]
        )


@router.get("/{session_id}/events")
async def get_session_events(
    session_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Get events for a session."""
    result = await db.execute(
        select(Session).where(Session.id == session_id)
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    offset = (page - 1) * page_size
    events_result = await db.execute(
        select(StoryEvent)
        .where(StoryEvent.session_id == session_id)
        .order_by(StoryEvent.created_at)
        .offset(offset)
        .limit(page_size)
    )
    events = events_result.scalars().all()
    
    return {
        "events": [
            {
                "id": e.id,
                "event_type": e.event_type,
                "content": e.content,
                "character_id": e.character_id,
                "player_id": e.player_id,
                "metadata": e.event_metadata,
                "is_ai_generated": e.is_ai_generated,
                "created_at": e.created_at.isoformat() if e.created_at else None,
            }
            for e in events
        ],
        "page": page,
        "page_size": page_size,
    }
