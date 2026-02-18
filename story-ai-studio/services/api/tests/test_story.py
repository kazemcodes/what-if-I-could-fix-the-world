"""Tests for story endpoints.

Following TDD methodology - these tests define the expected behavior
before implementation.
"""

import pytest
from httpx import AsyncClient


class TestStoryCreation:
    """Tests for story creation endpoint."""

    @pytest.mark.asyncio
    async def test_create_story_success(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test successful story creation."""
        # Register and login
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]

        # Create story with all required fields
        story_data = {
            "title": "The Dragon's Quest",
            "description": "An epic adventure to slay a dragon",
            "world_config": {
                "name": "Fantasy Realm",
                "description": "A magical world",
                "theme": "fantasy",
            },
            "ai_settings": {
                "model": "gpt-4o",
                "temperature": 0.7,
                "max_tokens": 2000,
            },
            "tags": ["fantasy", "adventure"],
            "is_public": False,
        }

        response = await client.post(
            "/api/v1/stories",
            json=story_data,
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 201
        data = response.json()

        assert data["title"] == story_data["title"]
        assert data["description"] == story_data["description"]
        assert data["tags"] == story_data["tags"]
        assert data["is_public"] == story_data["is_public"]
        assert "id" in data
        assert "created_at" in data

    @pytest.mark.asyncio
    async def test_create_story_without_auth(self, client: AsyncClient) -> None:
        """Test story creation without authentication fails."""
        story_data = {
            "title": "The Dragon's Quest",
            "description": "An epic adventure",
            "world_config": {"name": "World"},
            "ai_settings": {"model": "gpt-4o"},
        }

        response = await client.post("/api/v1/stories", json=story_data)

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_create_story_missing_title(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test story creation without title fails."""
        # Register and login
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]

        story_data = {
            "description": "An epic adventure",
        }

        response = await client.post(
            "/api/v1/stories",
            json=story_data,
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 422  # Validation error


class TestStoryListing:
    """Tests for story listing endpoints."""

    @pytest.mark.asyncio
    async def test_list_my_stories(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test listing user's own stories."""
        # Register and login
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]

        # Create a story
        await client.post(
            "/api/v1/stories",
            json={
                "title": "My Story",
                "description": "A tale",
                "world_config": {"name": "World"},
                "ai_settings": {"model": "gpt-4o"},
            },
            headers={"Authorization": f"Bearer {access_token}"},
        )

        # List stories
        response = await client.get(
            "/api/v1/stories",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 200
        data = response.json()

        # API returns paginated response
        assert "stories" in data
        assert "total" in data
        assert len(data["stories"]) == 1
        assert data["stories"][0]["title"] == "My Story"

    @pytest.mark.asyncio
    async def test_list_public_stories(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test listing public stories."""
        # Register and login
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]

        # Create a public story
        await client.post(
            "/api/v1/stories",
            json={
                "title": "Public Story",
                "description": "A tale",
                "world_config": {"name": "World"},
                "ai_settings": {"model": "gpt-4o"},
                "is_public": True,
            },
            headers={"Authorization": f"Bearer {access_token}"},
        )

        # Create a private story
        await client.post(
            "/api/v1/stories",
            json={
                "title": "Private Story",
                "description": "Secret",
                "world_config": {"name": "World"},
                "ai_settings": {"model": "gpt-4o"},
                "is_public": False,
            },
            headers={"Authorization": f"Bearer {access_token}"},
        )

        # List public stories (using public_only filter)
        response = await client.get(
            "/api/v1/stories?public_only=true",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 200
        data = response.json()

        # Should only see public story
        assert "stories" in data
        public_stories = [s for s in data["stories"] if s["is_public"]]
        assert len(public_stories) >= 1


class TestStoryRetrieval:
    """Tests for story retrieval endpoint."""

    @pytest.mark.asyncio
    async def test_get_story_by_id(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test getting a story by ID."""
        # Register and login
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]

        # Create a story
        create_response = await client.post(
            "/api/v1/stories",
            json={
                "title": "Test Story",
                "description": "A test",
                "world_config": {"name": "World"},
                "ai_settings": {"model": "gpt-4o"},
            },
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert create_response.status_code == 201, f"Failed to create story: {create_response.json()}"
        story_id = create_response.json()["id"]

        # Get the story
        response = await client.get(
            f"/api/v1/stories/{story_id}",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 200
        data = response.json()

        assert data["id"] == story_id
        assert data["title"] == "Test Story"

    @pytest.mark.asyncio
    async def test_get_nonexistent_story(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test getting a nonexistent story fails."""
        # Register and login
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]

        response = await client.get(
            "/api/v1/stories/nonexistent-id",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 404


class TestStoryUpdate:
    """Tests for story update endpoint."""

    @pytest.mark.asyncio
    async def test_update_story(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test updating a story."""
        # Register and login
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]

        # Create a story
        create_response = await client.post(
            "/api/v1/stories",
            json={
                "title": "Original Title",
                "description": "Original desc",
                "world_config": {"name": "World"},
                "ai_settings": {"model": "gpt-4o"},
            },
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert create_response.status_code == 201, f"Failed to create story: {create_response.json()}"
        story_id = create_response.json()["id"]

        # Update the story
        response = await client.put(
            f"/api/v1/stories/{story_id}",
            json={"title": "Updated Title", "description": "Updated desc"},
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 200
        data = response.json()

        assert data["title"] == "Updated Title"
        assert data["description"] == "Updated desc"

    @pytest.mark.asyncio
    async def test_update_unowned_story(
        self, client: AsyncClient, test_user_data: dict
    ) -> None:
        """Test updating another user's story fails."""
        # Create two users
        user1 = test_user_data.copy()
        user1["email"] = "user1@example.com"
        user1["username"] = "user1"

        user2 = test_user_data.copy()
        user2["email"] = "user2@example.com"
        user2["username"] = "user2"

        await client.post("/api/v1/auth/register", json=user1)
        await client.post("/api/v1/auth/register", json=user2)

        # Login as user1 and create a story
        login1 = await client.post(
            "/api/v1/auth/login",
            json={"email": user1["email"], "password": user1["password"]},
        )
        token1 = login1.json()["access_token"]

        create_response = await client.post(
            "/api/v1/stories",
            json={
                "title": "User1's Story",
                "description": "A tale",
                "world_config": {"name": "World"},
                "ai_settings": {"model": "gpt-4o"},
            },
            headers={"Authorization": f"Bearer {token1}"},
        )
        assert create_response.status_code == 201
        story_id = create_response.json()["id"]

        # Login as user2 and try to update user1's story
        login2 = await client.post(
            "/api/v1/auth/login",
            json={"email": user2["email"], "password": user2["password"]},
        )
        token2 = login2.json()["access_token"]

        response = await client.put(
            f"/api/v1/stories/{story_id}",
            json={"title": "Hacked Title"},
            headers={"Authorization": f"Bearer {token2}"},
        )

        assert response.status_code == 403  # Forbidden


class TestStoryDeletion:
    """Tests for story deletion endpoint."""

    @pytest.mark.asyncio
    async def test_delete_story(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test deleting a story."""
        # Register and login
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]

        # Create a story
        create_response = await client.post(
            "/api/v1/stories",
            json={
                "title": "To Delete",
                "description": "Will be deleted",
                "world_config": {"name": "World"},
                "ai_settings": {"model": "gpt-4o"},
            },
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert create_response.status_code == 201
        story_id = create_response.json()["id"]

        # Delete the story
        response = await client.delete(
            f"/api/v1/stories/{story_id}",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 204

        # Verify it's deleted
        get_response = await client.get(
            f"/api/v1/stories/{story_id}",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert get_response.status_code == 404
