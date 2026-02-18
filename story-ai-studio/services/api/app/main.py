"""Main FastAPI application."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core import close_db, init_db, settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan events."""
    # Startup
    await init_db()
    yield        
    # Shutdown
    await close_db()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="AI RPG Platform - Create and play interactive story worlds",
        openapi_url=f"{settings.api_prefix}/openapi.json",
        docs_url=f"{settings.api_prefix}/docs",
        redoc_url=f"{settings.api_prefix}/redoc",
        lifespan=lifespan,
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    from app.routes import auth as auth_routes
    from app.routes import story as story_routes
    from app.routes import character as character_routes
    from app.routes import location as location_routes
    from app.routes import session as session_routes

    app.include_router(auth_routes.router, prefix=settings.api_prefix)
    app.include_router(story_routes.router, prefix=settings.api_prefix)
    app.include_router(character_routes.router, prefix=settings.api_prefix)
    app.include_router(location_routes.router, prefix=settings.api_prefix)
    app.include_router(session_routes.router, prefix=settings.api_prefix)

    @app.get("/health")
    async def health_check() -> dict:
        """Health check endpoint."""
        return {
            "status": "healthy",
            "version": settings.app_version,
            "environment": settings.environment,
        }

    @app.get("/")
    async def root() -> dict:
        """Root endpoint."""
        return {
            "name": settings.app_name,
            "version": settings.app_version,
            "docs": f"{settings.api_prefix}/docs",
        }

    return app


app = create_app()
