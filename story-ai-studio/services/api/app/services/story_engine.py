"""Story Engine service for managing story state and AI generation."""

import json
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.base import AIProvider, ChatMessage, StoryContext
from app.ai.openai_provider import OpenAIProviderFactory
from app.ai.prompts import get_system_prompt, render_prompt
from app.models.session import Session, SessionPlayer, StoryEvent
from app.models.story import Story
from app.models.character import Character


class StoryEngine:
    """Engine for managing story state and AI generation."""

    def __init__(
        self,
        db: AsyncSession,
        ai_provider: AIProvider | None = None,
    ) -> None:
        self.db = db
        self.ai_provider = ai_provider or OpenAIProviderFactory.create_from_settings()

    async def get_session_context(self, session_id: str) -> StoryContext | None:
        """Build story context for a session."""
        # Get session with related data
        result = await self.db.execute(
            select(Session).where(Session.id == session_id)
        )
        session = result.scalar_one_or_none()

        if not session:
            return None

        # Get story
        story_result = await self.db.execute(
            select(Story).where(Story.id == session.story_id)
        )
        story = story_result.scalar_one_or_none()

        if not story:
            return None

        # Get active characters
        characters_result = await self.db.execute(
            select(Character).where(Character.story_id == story.id)
        )
        characters = characters_result.scalars().all()

        # Get recent events
        events_result = await self.db.execute(
            select(StoryEvent)
            .where(StoryEvent.session_id == session_id)
            .order_by(StoryEvent.created_at.desc())
            .limit(10)
        )
        events = events_result.scalars().all()

        # Build context
        return StoryContext(
            story_id=story.id,
            story_title=story.title,
            world_config=story.world_config or {},
            current_scene=session.current_state.get("scene", "The adventure begins...") if session.current_state else "The adventure begins...",
            active_characters=[self._character_to_dict(c) for c in characters],
            recent_events=[self._event_to_dict(e) for e in reversed(events)],
        )

    async def process_player_action(
        self,
        session_id: str,
        player_id: str,
        action: str,
        character_id: str | None = None,
    ) -> dict[str, Any]:
        """Process a player action and generate AI response."""
        if not self.ai_provider:
            raise ValueError("AI provider not configured")

        # Get context
        context = await self.get_session_context(session_id)
        if not context:
            raise ValueError(f"Session not found: {session_id}")

        # Build messages
        messages = [
            ChatMessage(role="system", content=get_system_prompt("default")),
            ChatMessage(role="user", content=action),
        ]

        # Generate response
        result = await self.ai_provider.generate(messages, context)

        # Store event
        event = StoryEvent(
            id=self._generate_id(),
            session_id=session_id,
            character_id=character_id,
            player_id=player_id,
            event_type="action",
            content=action,
            is_ai_generated=False,
        )
        self.db.add(event)

        # Store AI response
        ai_event = StoryEvent(
            id=self._generate_id(),
            session_id=session_id,
            event_type="narration",
            content=result.content,
            is_ai_generated=True,
            ai_model=result.model,
            tokens_used=result.tokens_used,
            metadata={
                "narration": result.narration,
                "dialogue": result.dialogue,
                "actions": result.actions,
            },
        )
        self.db.add(ai_event)

        # Update session
        session_result = await self.db.execute(
            select(Session).where(Session.id == session_id)
        )
        session = session_result.scalar_one_or_none()
        if session:
            session.turn_count += 1
            session.event_count += 2

        await self.db.commit()

        return {
            "narration": result.narration or result.content,
            "dialogue": result.dialogue,
            "suggested_actions": result.actions,
            "tokens_used": result.tokens_used,
        }

    async def start_story(
        self,
        story_id: str,
        host_id: str,
    ) -> dict[str, Any]:
        """Start a new story session and generate opening."""
        if not self.ai_provider:
            raise ValueError("AI provider not configured")

        # Get story
        result = await self.db.execute(
            select(Story).where(Story.id == story_id)
        )
        story = result.scalar_one_or_none()

        if not story:
            raise ValueError(f"Story not found: {story_id}")

        # Create session
        session = Session(
            id=self._generate_id(),
            story_id=story_id,
            host_id=host_id,
            status="active",
            max_players=4,
        )
        self.db.add(session)
        await self.db.flush()

        # Generate opening
        opening_prompt = render_prompt(
            "story_start",
            title=story.title,
            setting=story.world_config.get("setting", "fantasy") if story.world_config else "fantasy",
            themes=", ".join(story.world_config.get("themes", ["adventure"])) if story.world_config else "adventure",
            tone=story.world_config.get("tone", "balanced") if story.world_config else "balanced",
        )

        messages = [
            ChatMessage(role="system", content=get_system_prompt("default")),
            ChatMessage(role="user", content=opening_prompt),
        ]

        context = StoryContext(
            story_id=story.id,
            story_title=story.title,
            world_config=story.world_config or {},
            current_scene="The beginning of the adventure",
            active_characters=[],
            recent_events=[],
        )

        result = await self.ai_provider.generate(messages, context)

        # Store opening event
        event = StoryEvent(
            id=self._generate_id(),
            session_id=session.id,
            event_type="narration",
            content=result.content,
            is_ai_generated=True,
            ai_model=result.model,
            tokens_used=result.tokens_used,
        )
        self.db.add(event)

        # Update session state
        session.current_state = {
            "scene": result.narration or result.content[:500],
            "started": True,
        }
        session.started_at = self._now()
        session.turn_count = 1
        session.event_count = 1

        await self.db.commit()

        return {
            "session_id": session.id,
            "opening": result.content,
            "narration": result.narration,
            "suggested_actions": result.actions,
            "tokens_used": result.tokens_used,
        }

    async def get_session_history(
        self,
        session_id: str,
        limit: int = 50,
    ) -> list[dict[str, Any]]:
        """Get event history for a session."""
        result = await self.db.execute(
            select(StoryEvent)
            .where(StoryEvent.session_id == session_id)
            .order_by(StoryEvent.created_at.asc())
            .limit(limit)
        )
        events = result.scalars().all()
        return [e.to_dict() for e in events]

    def _character_to_dict(self, character: Character) -> dict[str, Any]:
        """Convert character to dictionary for context."""
        return {
            "id": character.id,
            "name": character.name,
            "title": character.title,
            "description": character.description,
            "attributes": character.attributes,
            "character_type": character.character_type,
        }

    def _event_to_dict(self, event: StoryEvent) -> dict[str, Any]:
        """Convert event to dictionary for context."""
        return {
            "id": event.id,
            "type": event.event_type,
            "content": event.content[:200] if event.content else "",
            "summary": event.content[:100] if event.content else "",
        }

    def _generate_id(self) -> str:
        """Generate a unique ID."""
        import uuid
        return str(uuid.uuid4())

    def _now(self):
        """Get current datetime with timezone."""
        from datetime import datetime, timezone
        return datetime.now(timezone.utc)