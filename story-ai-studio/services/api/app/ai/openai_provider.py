"""OpenAI provider implementation."""

import json
from typing import Any, AsyncGenerator

from openai import AsyncOpenAI

from app.ai.base import (
    AIProvider,
    ChatMessage,
    GenerationResult,
    StoryContext,
)


class OpenAIProvider(AIProvider):
    """OpenAI API provider for story generation."""

    def __init__(
        self,
        api_key: str,
        model: str = "gpt-4o",
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs: Any,
    ) -> None:
        super().__init__(model, temperature, max_tokens, **kwargs)
        self.client = AsyncOpenAI(api_key=api_key)

    async def generate(
        self,
        messages: list[ChatMessage],
        context: StoryContext | None = None,
        **kwargs: Any,
    ) -> GenerationResult:
        """Generate a response from OpenAI."""
        prepared_messages = self.prepare_messages(messages, context)

        # Merge kwargs with defaults
        temperature = kwargs.get("temperature", self.temperature)
        max_tokens = kwargs.get("max_tokens", self.max_tokens)
        model = kwargs.get("model", self.model)

        response = await self.client.chat.completions.create(
            model=model,
            messages=prepared_messages,
            temperature=temperature,
            max_tokens=max_tokens,
            **{k: v for k, v in kwargs.items() if k not in ["temperature", "max_tokens", "model"]},
        )

        choice = response.choices[0]
        content = choice.message.content or ""

        # Parse structured content if present
        narration, dialogue, actions = self._parse_response(content)

        return GenerationResult(
            content=content,
            tokens_used=response.usage.total_tokens if response.usage else 0,
            model=model,
            provider="openai",
            finish_reason=choice.finish_reason,
            narration=narration,
            dialogue=dialogue,
            actions=actions,
            metadata={
                "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                "completion_tokens": response.usage.completion_tokens if response.usage else 0,
            },
        )

    async def generate_stream(
        self,
        messages: list[ChatMessage],
        context: StoryContext | None = None,
        **kwargs: Any,
    ) -> AsyncGenerator[str, None]:
        """Generate a streaming response from OpenAI."""
        prepared_messages = self.prepare_messages(messages, context)

        temperature = kwargs.get("temperature", self.temperature)
        max_tokens = kwargs.get("max_tokens", self.max_tokens)
        model = kwargs.get("model", self.model)

        stream = await self.client.chat.completions.create(
            model=model,
            messages=prepared_messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    def _parse_response(
        self,
        content: str,
    ) -> tuple[str | None, list[dict[str, str]] | None, list[str] | None]:
        """Parse structured content from response.

        Looks for:
        - Narration blocks
        - Dialogue blocks with character names
        - Action suggestions
        """
        narration = None
        dialogue = []
        actions = []

        lines = content.split("\n")
        narration_lines = []

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Check for dialogue pattern: "Name: dialogue"
            if ":" in line and not line.startswith('"'):
                parts = line.split(":", 1)
                if len(parts) == 2:
                    speaker = parts[0].strip()
                    text = parts[1].strip()
                    # Check if it looks like dialogue
                    if speaker and text and len(speaker) < 50:
                        dialogue.append({
                            "speaker": speaker,
                            "text": text.strip('"'),
                        })
                        continue

            # Check for action suggestions
            if line.startswith("[") and line.endswith("]"):
                action = line[1:-1].strip()
                if action:
                    actions.append(action)
                continue

            if line.startswith("- ") or line.startswith("* "):
                # Could be an action or narration
                actions.append(line[2:])
                continue

            # Otherwise, it's narration
            narration_lines.append(line)

        if narration_lines:
            narration = " ".join(narration_lines)

        return narration, dialogue if dialogue else None, actions if actions else None


class OpenAIProviderFactory:
    """Factory for creating OpenAI providers."""

    @staticmethod
    def create(
        api_key: str,
        model: str = "gpt-4o",
        **kwargs: Any,
    ) -> OpenAIProvider:
        """Create an OpenAI provider instance."""
        return OpenAIProvider(api_key=api_key, model=model, **kwargs)

    @staticmethod
    def create_from_settings() -> OpenAIProvider | None:
        """Create an OpenAI provider from application settings."""
        from app.core.config import settings

        if not settings.openai_api_key:
            return None

        return OpenAIProvider(
            api_key=settings.openai_api_key,
            model=settings.default_ai_model,
            temperature=settings.default_temperature,
            max_tokens=settings.default_max_tokens,
        )