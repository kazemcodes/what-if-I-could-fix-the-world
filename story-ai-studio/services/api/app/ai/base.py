"""Base AI provider interface for story generation."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class MessageType(str, Enum):
    """Types of messages in the conversation."""

    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
    NARRATION = "narration"
    CHARACTER = "character"


@dataclass
class ChatMessage:
    """A single message in the conversation."""

    role: str  # system, user, assistant
    content: str
    name: str | None = None  # For character dialogue
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for API calls."""
        result = {"role": self.role, "content": self.content}
        if self.name:
            result["name"] = self.name
        return result


@dataclass
class StoryContext:
    """Context for story generation."""

    story_id: str
    story_title: str
    world_config: dict[str, Any]
    current_scene: str
    active_characters: list[dict[str, Any]]
    recent_events: list[dict[str, Any]]
    player_actions: list[str] = field(default_factory=list)
    custom_context: dict[str, Any] = field(default_factory=dict)

    def to_system_prompt(self) -> str:
        """Generate system prompt from context."""
        parts = [
            f"You are the Game Master for an interactive story titled '{self.story_title}'.",
            "",
            "## World Setting",
        ]

        # Add world configuration
        if setting := self.world_config.get("setting"):
            parts.append(f"Setting: {setting}")
        if themes := self.world_config.get("themes"):
            parts.append(f"Themes: {', '.join(themes)}")
        if tone := self.world_config.get("tone"):
            parts.append(f"Tone: {tone}")

        parts.extend([
            "",
            "## Current Scene",
            self.current_scene,
            "",
            "## Active Characters",
        ])

        # Add character information
        for char in self.active_characters:
            char_info = f"- {char.get('name', 'Unknown')}"
            if title := char.get("title"):
                char_info += f", {title}"
            parts.append(char_info)

        # Add recent events summary
        if self.recent_events:
            parts.extend([
                "",
                "## Recent Events",
            ])
            for event in self.recent_events[-5:]:  # Last 5 events
                parts.append(f"- {event.get('summary', event.get('content', ''))[:100]}")

        return "\n".join(parts)


@dataclass
class GenerationResult:
    """Result from AI generation."""

    content: str
    tokens_used: int
    model: str
    provider: str
    finish_reason: str = "stop"
    metadata: dict[str, Any] = field(default_factory=dict)

    # Optional parsed content
    narration: str | None = None
    dialogue: list[dict[str, str]] | None = None
    actions: list[str] | None = None
    suggested_responses: list[str] | None = None


class AIProvider(ABC):
    """Abstract base class for AI providers."""

    def __init__(
        self,
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs: Any,
    ) -> None:
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.config = kwargs

    @abstractmethod
    async def generate(
        self,
        messages: list[ChatMessage],
        context: StoryContext | None = None,
        **kwargs: Any,
    ) -> GenerationResult:
        """Generate a response from the AI."""
        pass

    @abstractmethod
    async def generate_stream(
        self,
        messages: list[ChatMessage],
        context: StoryContext | None = None,
        **kwargs: Any,
    ):
        """Generate a streaming response from the AI."""
        pass

    def prepare_messages(
        self,
        messages: list[ChatMessage],
        context: StoryContext | None = None,
    ) -> list[dict[str, Any]]:
        """Prepare messages for API call, including context."""
        prepared = []

        # Add context as system message if provided
        if context:
            prepared.append({
                "role": "system",
                "content": context.to_system_prompt(),
            })

        # Add conversation messages
        for msg in messages:
            prepared.append(msg.to_dict())

        return prepared

    @staticmethod
    def estimate_tokens(text: str) -> int:
        """Estimate token count for text (rough approximation)."""
        # Rough estimate: ~4 characters per token for English
        return len(text) // 4

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} model={self.model}>"