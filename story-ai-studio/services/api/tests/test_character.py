"""Tests for character endpoints.

Following TDD methodology - these tests define the expected behavior
before implementation.
"""

import pytest
from httpx import AsyncClient


class TestCharacterCreation:
    """Tests for character creation endpoint."""

    @pytest.mark.asyncio
    async def test_create_character_success(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test successful character creation."""
        # Register and login
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]

        # Create a story first
        story_response = await client.post(
            "/api/v1/stories",
            json={
                "title": "Test Story",
                "description": "A test story",
                "world_config": {"name": "Test World"},
                "ai_settings": {"model": "gpt-4o"},
            },
            headers={"Authorization": f"Bearer {access_token}"},
        )
        story_id = story_response.json()["id"]

        # Create character with proper schema
        character_data = {
            "name": "Aragorn",
            "description": "A ranger from the North",
            "backstory": "Heir to the throne of Gondor",
            "race": "Human",
            "character_class": "Ranger",
            "level": 10,
            "stats": {
                "strength": 18,
                "dexterity": 16,
                "constitution": 14,
                "intelligence": 12,
                "wisdom": 14,
                "charisma": 16
            },
            "appearance": {
                "height": "6'6\"",
                "weight": "200 lbs",
                "hair_color": "dark",
                "eye_color": "grey",
                "skin_color": "fair",
                "distinguishing_features": "Tall and weathered"
            },
            "personality_traits": ["Brave", "Loyal", "Stoic"],
            "ideals": "Justice and honor",
            "bonds": "Protect the innocent",
            "flaws": "Reluctant to lead",
            "is_npc": False,
        }

        response = await client.post(
            f"/api/v1/characters?story_id={story_id}",
            json=character_data,
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 201
        data = response.json()

        assert data["name"] == character_data["name"]
        assert data["race"] == character_data["race"]
        assert data["character_class"] == character_data["character_class"]
        assert data["level"] == character_data["level"]
        assert "id" in data

    @pytest.mark.asyncio
    async def test_create_character_without_auth(self, client: AsyncClient) -> None:
        """Test character creation without authentication fails."""
        character_data = {"name": "Test Character"}

        response = await client.post(
            "/api/v1/characters?story_id=some-id",
            json=character_data,
        )

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_create_npc_character(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test creating an NPC character."""
        # Register and login
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]

        # Create a story
        story_response = await client.post(
            "/api/v1/stories",
            json={
                "title": "Test Story",
                "description": "A test story",
                "world_config": {"name": "Test World"},
                "ai_settings": {"model": "gpt-4o"},
            },
            headers={"Authorization": f"Bearer {access_token}"},
        )
        story_id = story_response.json()["id"]

        # Create NPC
        character_data = {
            "name": "Gandalf",
            "description": "A wise wizard",
            "race": "Maia",
            "character_class": "Wizard",
            "level": 20,
            "is_npc": True,
        }

        response = await client.post(
            f"/api/v1/characters?story_id={story_id}",
            json=character_data,
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["is_npc"] == True


class TestCharacterListing:
    """Tests for character listing endpoint."""

    @pytest.mark.asyncio
    async def test_list_characters_by_story(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test listing characters for a story."""
        # Register and login
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]

        # Create a story
        story_response = await client.post(
            "/api/v1/stories",
            json={
                "title": "Test Story",
                "description": "A test story",
                "world_config": {"name": "Test World"},
                "ai_settings": {"model": "gpt-4o"},
            },
            headers={"Authorization": f"Bearer {access_token}"},
        )
        story_id = story_response.json()["id"]

        # Create characters
        await client.post(
            f"/api/v1/characters?story_id={story_id}",
            json={"name": "Hero", "race": "Human", "character_class": "Fighter", "level": 5},
            headers={"Authorization": f"Bearer {access_token}"},
        )
        await client.post(
            f"/api/v1/characters?story_id={story_id}",
            json={"name": "Sidekick", "race": "Halfling", "character_class": "Rogue", "level": 3},
            headers={"Authorization": f"Bearer {access_token}"},
        )

        # List characters
        response = await client.get(
            f"/api/v1/characters?story_id={story_id}",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 200
        data = response.json()

        # Response has characters key
        assert "characters" in data
        assert data["total"] == 2
        names = [c["name"] for c in data["characters"]]
        assert "Hero" in names
        assert "Sidekick" in names


class TestCharacterRetrieval:
    """Tests for character retrieval endpoint."""

    @pytest.mark.asyncio
    async def test_get_character_by_id(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test getting a character by ID."""
        # Setup
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]

        story_response = await client.post(
            "/api/v1/stories",
            json={
                "title": "Test Story",
                "description": "A test story",
                "world_config": {"name": "Test World"},
                "ai_settings": {"model": "gpt-4o"},
            },
            headers={"Authorization": f"Bearer {access_token}"},
        )
        story_id = story_response.json()["id"]

        character_response = await client.post(
            f"/api/v1/characters?story_id={story_id}",
            json={"name": "Legolas", "race": "Elf", "character_class": "Archer", "level": 8},
            headers={"Authorization": f"Bearer {access_token}"},
        )
        character_id = character_response.json()["id"]

        # Get character
        response = await client.get(
            f"/api/v1/characters/{character_id}",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 200
        data = response.json()

        assert data["id"] == character_id
        assert data["name"] == "Legolas"
        assert data["race"] == "Elf"


class TestCharacterUpdate:
    """Tests for character update endpoint."""

    @pytest.mark.asyncio
    async def test_update_character(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test updating a character."""
        # Setup
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]

        story_response = await client.post(
            "/api/v1/stories",
            json={
                "title": "Test Story",
                "description": "A test story",
                "world_config": {"name": "Test World"},
                "ai_settings": {"model": "gpt-4o"},
            },
            headers={"Authorization": f"Bearer {access_token}"},
        )
        story_id = story_response.json()["id"]

        character_response = await client.post(
            f"/api/v1/characters?story_id={story_id}",
            json={"name": "Gimli", "race": "Dwarf", "character_class": "Fighter", "level": 6},
            headers={"Authorization": f"Bearer {access_token}"},
        )
        character_id = character_response.json()["id"]

        # Update character
        response = await client.put(
            f"/api/v1/characters/{character_id}",
            json={"level": 7, "description": "Son of Glóin"},
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 200
        data = response.json()

        assert data["level"] == 7
        assert data["description"] == "Son of Glóin"


class TestCharacterDeletion:
    """Tests for character deletion endpoint."""

    @pytest.mark.asyncio
    async def test_delete_character(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test deleting a character."""
        # Setup
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]

        story_response = await client.post(
            "/api/v1/stories",
            json={
                "title": "Test Story",
                "description": "A test story",
                "world_config": {"name": "Test World"},
                "ai_settings": {"model": "gpt-4o"},
            },
            headers={"Authorization": f"Bearer {access_token}"},
        )
        story_id = story_response.json()["id"]

        character_response = await client.post(
            f"/api/v1/characters?story_id={story_id}",
            json={"name": "Boromir", "race": "Human", "character_class": "Warrior", "level": 8},
            headers={"Authorization": f"Bearer {access_token}"},
        )
        character_id = character_response.json()["id"]

        # Delete character
        response = await client.delete(
            f"/api/v1/characters/{character_id}",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 204

        # Verify deletion
        get_response = await client.get(
            f"/api/v1/characters/{character_id}",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert get_response.status_code == 404
