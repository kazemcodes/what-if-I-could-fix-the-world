"""Tests for location endpoints.

Following TDD methodology - these tests define the expected behavior
before implementation.
"""

import pytest
from httpx import AsyncClient


class TestLocationCreation:
    """Tests for location creation endpoint."""

    @pytest.mark.asyncio
    async def test_create_location_success(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test successful location creation."""
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

        # Create location with proper schema
        location_data = {
            "name": "The Prancing Pony",
            "description": "A famous inn in Bree",
            "location_type": "tavern",
            "coordinates": {"x": 0, "y": 0},
            "atmosphere": {
                "mood": "cozy",
                "lighting": "warm",
                "sounds": "laughter and music",
                "smells": "roasting meat and ale"
            },
            "npc_ids": [],
            "items": [],
            "connections": [],
            "ai_hints": {"importance": "major", "plot_hooks": ["strangers meet here"]}
        }

        response = await client.post(
            f"/api/v1/locations?story_id={story_id}",
            json=location_data,
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 201
        data = response.json()

        assert data["name"] == location_data["name"]
        assert data["location_type"] == location_data["location_type"]
        assert "id" in data

    @pytest.mark.asyncio
    async def test_create_child_location(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test creating a child location (nested location)."""
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

        # Create parent location
        parent_response = await client.post(
            f"/api/v1/locations?story_id={story_id}",
            json={"name": "Castle", "description": "A grand castle", "location_type": "building"},
            headers={"Authorization": f"Bearer {access_token}"},
        )
        parent_id = parent_response.json()["id"]

        # Create child location
        child_response = await client.post(
            f"/api/v1/locations?story_id={story_id}",
            json={
                "name": "Throne Room",
                "description": "The king's throne room",
                "location_type": "room",
                "parent_id": parent_id
            },
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert child_response.status_code == 201
        data = child_response.json()
        assert data["parent_id"] == parent_id


class TestLocationListing:
    """Tests for location listing endpoint."""

    @pytest.mark.asyncio
    async def test_list_locations_by_story(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test listing locations for a story."""
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

        # Create locations
        await client.post(
            f"/api/v1/locations?story_id={story_id}",
            json={"name": "Forest", "description": "A dark forest", "location_type": "wilderness"},
            headers={"Authorization": f"Bearer {access_token}"},
        )
        await client.post(
            f"/api/v1/locations?story_id={story_id}",
            json={"name": "Village", "description": "A peaceful village", "location_type": "settlement"},
            headers={"Authorization": f"Bearer {access_token}"},
        )

        # List locations
        response = await client.get(
            f"/api/v1/locations?story_id={story_id}",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 200
        data = response.json()

        assert "locations" in data
        assert data["total"] == 2


class TestLocationTree:
    """Tests for location tree endpoint."""

    @pytest.mark.asyncio
    async def test_get_location_tree(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test getting hierarchical location tree."""
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

        # Create parent
        parent_response = await client.post(
            f"/api/v1/locations?story_id={story_id}",
            json={"name": "Kingdom", "description": "A vast kingdom", "location_type": "region"},
            headers={"Authorization": f"Bearer {access_token}"},
        )
        parent_id = parent_response.json()["id"]

        # Create children
        await client.post(
            f"/api/v1/locations?story_id={story_id}",
            json={"name": "Castle", "description": "The royal castle", "location_type": "building", "parent_id": parent_id},
            headers={"Authorization": f"Bearer {access_token}"},
        )

        # Get tree
        response = await client.get(
            f"/api/v1/locations/tree?story_id={story_id}",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 200
        data = response.json()

        # Tree should have root locations with children
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["name"] == "Kingdom"
        assert "children" in data[0]


class TestLocationUpdate:
    """Tests for location update endpoint."""

    @pytest.mark.asyncio
    async def test_update_location(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test updating a location."""
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

        location_response = await client.post(
            f"/api/v1/locations?story_id={story_id}",
            json={"name": "Old Name", "description": "Old description", "location_type": "cave"},
            headers={"Authorization": f"Bearer {access_token}"},
        )
        location_id = location_response.json()["id"]

        # Update location
        response = await client.put(
            f"/api/v1/locations/{location_id}",
            json={"name": "Dragon's Lair", "description": "A dragon's treasure hoard"},
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 200
        data = response.json()

        assert data["name"] == "Dragon's Lair"
        assert data["description"] == "A dragon's treasure hoard"


class TestLocationDeletion:
    """Tests for location deletion endpoint."""

    @pytest.mark.asyncio
    async def test_delete_location(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test deleting a location."""
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

        location_response = await client.post(
            f"/api/v1/locations?story_id={story_id}",
            json={"name": "Ruins", "description": "Ancient ruins", "location_type": "dungeon"},
            headers={"Authorization": f"Bearer {access_token}"},
        )
        location_id = location_response.json()["id"]

        # Delete location
        response = await client.delete(
            f"/api/v1/locations/{location_id}",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 204

        # Verify deletion
        get_response = await client.get(
            f"/api/v1/locations/{location_id}",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert get_response.status_code == 404