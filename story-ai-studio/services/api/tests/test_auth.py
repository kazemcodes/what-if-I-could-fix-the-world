"""Tests for authentication endpoints.

Following TDD methodology - these tests define the expected behavior
before implementation.
"""

import pytest
from httpx import AsyncClient


class TestUserRegistration:
    """Tests for user registration endpoint."""

    @pytest.mark.asyncio
    async def test_register_new_user(self, client: AsyncClient, test_user_data: dict) -> None:
        """Test successful user registration."""
        response = await client.post("/api/v1/auth/register", json=test_user_data)
        
        assert response.status_code == 201
        data = response.json()
        
        assert data["email"] == test_user_data["email"]
        assert data["username"] == test_user_data["username"]
        assert data["display_name"] == test_user_data["display_name"]
        assert "id" in data
        assert "password" not in data  # Password should not be returned
        assert "hashed_password" not in data

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, client: AsyncClient, test_user_data: dict) -> None:
        """Test registration with existing email fails."""
        # Register first user
        await client.post("/api/v1/auth/register", json=test_user_data)
        
        # Try to register with same email
        response = await client.post("/api/v1/auth/register", json=test_user_data)
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_register_duplicate_username(self, client: AsyncClient, test_user_data: dict) -> None:
        """Test registration with existing username fails."""
        # Register first user
        await client.post("/api/v1/auth/register", json=test_user_data)
        
        # Try to register with same username but different email
        new_user = test_user_data.copy()
        new_user["email"] = "different@example.com"
        
        response = await client.post("/api/v1/auth/register", json=new_user)
        
        assert response.status_code == 400
        assert "username" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_register_invalid_email(self, client: AsyncClient) -> None:
        """Test registration with invalid email format fails."""
        invalid_user = {
            "email": "not-an-email",
            "username": "testuser",
            "password": "TestPassword123!",
        }
        
        response = await client.post("/api/v1/auth/register", json=invalid_user)
        
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_register_weak_password(self, client: AsyncClient) -> None:
        """Test registration with weak password fails."""
        weak_password_user = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "123",  # Too short
        }
        
        response = await client.post("/api/v1/auth/register", json=weak_password_user)
        
        assert response.status_code == 422  # Validation error


class TestUserLogin:
    """Tests for user login endpoint."""

    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient, test_user_data: dict, test_user_login: dict) -> None:
        """Test successful login returns tokens."""
        # Register user first
        await client.post("/api/v1/auth/register", json=test_user_data)
        
        # Login
        response = await client.post("/api/v1/auth/login", json=test_user_login)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client: AsyncClient, test_user_data: dict) -> None:
        """Test login with wrong password fails."""
        # Register user
        await client.post("/api/v1/auth/register", json=test_user_data)
        
        # Login with wrong password
        wrong_login = {
            "email": test_user_data["email"],
            "password": "WrongPassword123!",
        }
        
        response = await client.post("/api/v1/auth/login", json=wrong_login)
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, client: AsyncClient) -> None:
        """Test login with non-existent user fails."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "SomePassword123!",
        }
        
        response = await client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 401


class TestTokenRefresh:
    """Tests for token refresh endpoint."""

    @pytest.mark.asyncio
    async def test_refresh_token_success(self, client: AsyncClient, test_user_data: dict, test_user_login: dict) -> None:
        """Test successful token refresh."""
        # Register and login
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        refresh_token = login_response.json()["refresh_token"]
        
        # Refresh token
        response = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_refresh_invalid_token(self, client: AsyncClient) -> None:
        """Test refresh with invalid token fails."""
        response = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "invalid-token"},
        )
        
        assert response.status_code == 401


class TestProtectedRoutes:
    """Tests for protected route access."""

    @pytest.mark.asyncio
    async def test_access_protected_route_with_token(
        self, client: AsyncClient, test_user_data: dict, test_user_login: dict
    ) -> None:
        """Test accessing protected route with valid token."""
        # Register and login
        await client.post("/api/v1/auth/register", json=test_user_data)
        login_response = await client.post("/api/v1/auth/login", json=test_user_login)
        access_token = login_response.json()["access_token"]
        
        # Access protected route
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["email"] == test_user_data["email"]
        assert data["username"] == test_user_data["username"]

    @pytest.mark.asyncio
    async def test_access_protected_route_without_token(self, client: AsyncClient) -> None:
        """Test accessing protected route without token fails."""
        response = await client.get("/api/v1/auth/me")
        
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_access_protected_route_with_invalid_token(self, client: AsyncClient) -> None:
        """Test accessing protected route with invalid token fails."""
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid-token"},
        )
        
        assert response.status_code == 401


class TestPasswordValidation:
    """Tests for password validation."""

    @pytest.mark.asyncio
    async def test_password_too_short(self, client: AsyncClient) -> None:
        """Test password shorter than 8 characters fails."""
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "Short1!",
        }
        
        response = await client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_password_no_uppercase(self, client: AsyncClient) -> None:
        """Test password without uppercase fails."""
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "alllowercase1!",
        }
        
        response = await client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_password_no_lowercase(self, client: AsyncClient) -> None:
        """Test password without lowercase fails."""
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "ALLUPPERCASE1!",
        }
        
        response = await client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_password_no_number(self, client: AsyncClient) -> None:
        """Test password without number fails."""
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "NoNumberHere!",
        }
        
        response = await client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 422