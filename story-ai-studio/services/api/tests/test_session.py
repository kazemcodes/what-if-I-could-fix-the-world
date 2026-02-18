"""Tests for session-related endpoints.

Following TDD methodology - these tests define the expected behavior
before implementation.
"""

import pytest
from httpx import AsyncClient


class TestSessionCreation:
    """Tests for session creation endpoint."""

    @pytest.mark.asyncio
    async def test_create_session_success(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test successful session creation."""
        # Register and login
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]

        # Create a story first
        story_data = {
            "title": "Test Story",
            "description": "A test story for sessions",
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
        }
        story_response = await client.post(
            "/api/v1/stories",
            json=story_data,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        story_id = story_response.json()["id"]

        # Create session
        session_data = {
            "story_id": story_id,
            "title": "Epic Adventure Session",
            "description": "A grand adventure awaits",
            "max_players": 4,
            "is_public": True,
        }

        response = await client.post(
            "/api/v1/sessions",
            json=session_data,
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["story_id"] == story_id
        assert data["title"] == "Epic Adventure Session"
        assert data["status"] == "waiting"
        assert data["max_players"] == 4
        assert data["is_public"] is True

    @pytest.mark.asyncio
    async def test_create_session_without_auth(self, client: AsyncClient) -> None:
        """Test session creation without authentication fails."""
        session_data = {
            "story_id": "some-story-id",
            "title": "Test Session",
        }

        response = await client.post("/api/v1/sessions", json=session_data)

        assert response.status_code == 401


class TestSessionListing:
    """Tests for session listing endpoint."""

    @pytest.mark.asyncio
    async def test_list_sessions(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test listing game sessions."""
        # Register and login
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]

        # Create a story
        story_data = {
            "title": "Test Story",
            "description": "A test story",
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
        }
        story_response = await client.post(
            "/api/v1/stories",
            json=story_data,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        story_id = story_response.json()["id"]

        # Create multiple sessions
        for i in range(3):
            await client.post(
                "/api/v1/sessions",
                json={
                    "story_id": story_id,
                    "title": f"Session {i}",
                    "is_public": True,
                },
                headers={"Authorization": f"Bearer {access_token}"},
            )

        # List sessions
        response = await client.get("/api/v1/sessions")

        assert response.status_code == 200
        data = response.json()
        assert len(data["sessions"]) >= 3
        assert data["total"] >= 3

    @pytest.mark.asyncio
    async def test_list_sessions_by_story(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test listing sessions filtered by story."""
        # Register and login
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]

        # Create two stories
        story1_response = await client.post(
            "/api/v1/stories",
            json={
                "title": "Story 1",
                "description": "First story",
                "world_config": {"name": "World 1", "theme": "fantasy"},
                "ai_settings": {"model": "gpt-4o"},
            },
            headers={"Authorization": f"Bearer {access_token}"},
        )
        story1_id = story1_response.json()["id"]

        story2_response = await client.post(
            "/api/v1/stories",
            json={
                "title": "Story 2",
                "description": "Second story",
                "world_config": {"name": "World 2", "theme": "scifi"},
                "ai_settings": {"model": "gpt-4o"},
            },
            headers={"Authorization": f"Bearer {access_token}"},
        )
        story2_id = story2_response.json()["id"]

        # Create sessions for story1
        for i in range(2):
            await client.post(
                "/api/v1/sessions",
                json={"story_id": story1_id, "title": f"Story1 Session {i}", "is_public": True},
                headers={"Authorization": f"Bearer {access_token}"},
            )

        # Create session for story2
        await client.post(
            "/api/v1/sessions",
            json={"story_id": story2_id, "title": "Story2 Session", "is_public": True},
            headers={"Authorization": f"Bearer {access_token}"},
        )

        # List sessions for story1
        response = await client.get(f"/api/v1/sessions?story_id={story1_id}")

        assert response.status_code == 200
        data = response.json()
        assert len(data["sessions"]) == 2
        for s in data["sessions"]:
            assert s["story_id"] == story1_id


class TestSessionOperations:
    """Tests for session operations."""

    @pytest.mark.asyncio
    async def test_get_session(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test getting a specific session."""
        # Register and login
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]

        # Create story and session
        story_response = await client.post(
            "/api/v1/stories",
            json={
                "title": "Test Story",
                "description": "A test story",
                "world_config": {"name": "World", "theme": "fantasy"},
                "ai_settings": {"model": "gpt-4o"},
            },
            headers={"Authorization": f"Bearer {access_token}"},
        )
        story_id = story_response.json()["id"]

        session_response = await client.post(
            "/api/v1/sessions",
            json={"story_id": story_id, "title": "Test Session", "is_public": True},
            headers={"Authorization": f"Bearer {access_token}"},
        )
        session_id = session_response.json()["id"]

        # Get session
        response = await client.get(f"/api/v1/sessions/{session_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == session_id
        assert data["title"] == "Test Session"

    @pytest.mark.asyncio
    async def test_update_session(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test updating a session."""
        # Register and login
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]

        # Create story and session
        story_response = await client.post(
            "/api/v1/stories",
            json={
                "title": "Test Story",
                "description": "A test story",
                "world_config": {"name": "World", "theme": "fantasy"},
                "ai_settings": {"model": "gpt-4o"},
            },
            headers={"Authorization": f"Bearer {access_token}"},
        )
        story_id = story_response.json()["id"]

        session_response = await client.post(
            "/api/v1/sessions",
            json={"story_id": story_id, "title": "Original Title", "is_public": True},
            headers={"Authorization": f"Bearer {access_token}"},
        )
        session_id = session_response.json()["id"]

        # Update session
        response = await client.patch(
            f"/api/v1/sessions/{session_id}",
            json={"title": "Updated Title", "max_players": 6},
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["max_players"] == 6

    @pytest.mark.asyncio
    async def test_delete_session(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test deleting a session."""
        # Register and login
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]

        # Create story and session
        story_response = await client.post(
            "/api/v1/stories",
            json={
                "title": "Test Story",
                "description": "A test story",
                "world_config": {"name": "World", "theme": "fantasy"},
                "ai_settings": {"model": "gpt-4o"},
            },
            headers={"Authorization": f"Bearer {access_token}"},
        )
        story_id = story_response.json()["id"]

        session_response = await client.post(
            "/api/v1/sessions",
            json={"story_id": story_id, "title": "To Delete", "is_public": True},
            headers={"Authorization": f"Bearer {access_token}"},
        )
        session_id = session_response.json()["id"]

        # Delete session
        response = await client.delete(
            f"/api/v1/sessions/{session_id}",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 204

        # Verify deleted
        response = await client.get(f"/api/v1/sessions/{session_id}")
        assert response.status_code == 404


class TestSessionStatusTransitions:
    """Tests for session status transitions."""

    @pytest.mark.asyncio
    async def test_start_session(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test starting a session (waiting -> active)."""
        # Register and login
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]

        # Create story and session
        story_response = await client.post(
            "/api/v1/stories",
            json={
                "title": "Test Story",
                "description": "A test story",
                "world_config": {"name": "World", "theme": "fantasy"},
                "ai_settings": {"model": "gpt-4o"},
            },
            headers={"Authorization": f"Bearer {access_token}"},
        )
        story_id = story_response.json()["id"]

        session_response = await client.post(
            "/api/v1/sessions",
            json={"story_id": story_id, "title": "Status Test", "is_public": True},
            headers={"Authorization": f"Bearer {access_token}"},
        )
        session_id = session_response.json()["id"]

        # Start session
        response = await client.post(
            f"/api/v1/sessions/{session_id}/start",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "active"
        assert data["started_at"] is not None


class TestSessionAuthorization:
    """Tests for session authorization."""

    @pytest.mark.asyncio
    async def test_unauthorized_session_update(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test that non-host cannot update session."""
        # Register first user
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]

        # Create story and session
        story_response = await client.post(
            "/api/v1/stories",
            json={
                "title": "Test Story",
                "description": "A test story",
                "world_config": {"name": "World", "theme": "fantasy"},
                "ai_settings": {"model": "gpt-4o"},
            },
            headers={"Authorization": f"Bearer {access_token}"},
        )
        story_id = story_response.json()["id"]

        session_response = await client.post(
            "/api/v1/sessions",
            json={"story_id": story_id, "title": "Host's Session", "is_public": True},
            headers={"Authorization": f"Bearer {access_token}"},
        )
        session_id = session_response.json()["id"]

        # Register second user
        other_user_data = {
            "email": "other@example.com",
            "username": "otheruser",
            "password": "TestPassword123!",
        }
        await client.post("/api/v1/auth/register", json=other_user_data)
        other_login_response = await client.post(
            "/api/v1/auth/login",
            json={"email": "other@example.com", "password": "TestPassword123!"},
        )
        other_token = other_login_response.json()["access_token"]

        # Try to update session as other user
        response = await client.patch(
            f"/api/v1/sessions/{session_id}",
            json={"title": "Hacked Title"},
            headers={"Authorization": f"Bearer {other_token}"},
        )

        assert response.status_code == 403
