"""Database configuration and session management.

Supports both PostgreSQL and SQLite:
- PostgreSQL: Full async support with connection pooling
- SQLite: Async support via aiosqlite, suitable for development
"""

from collections.abc import AsyncGenerator
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


def get_database_engine_args() -> dict:
    """Get database engine arguments based on database type."""
    args = {
        "echo": settings.database_echo,
        "future": True,
    }
    
    if settings.is_sqlite:
        # SQLite-specific settings
        args["connect_args"] = {"check_same_thread": False}
    else:
        # PostgreSQL-specific settings
        args["pool_size"] = 5
        args["max_overflow"] = 10
        args["pool_pre_ping"] = True
    
    return args


def ensure_sqlite_directory() -> None:
    """Ensure the SQLite database directory exists."""
    if settings.is_sqlite:
        # Extract path from SQLite URL
        url = settings.async_database_url
        if url.startswith("sqlite+aiosqlite:///"):
            db_path = url.replace("sqlite+aiosqlite:///", "")
            # Handle relative paths
            if not Path(db_path).is_absolute():
                db_path = Path(".") / db_path
            else:
                db_path = Path(db_path)
            # Create parent directory if needed
            db_path.parent.mkdir(parents=True, exist_ok=True)


# Ensure SQLite directory exists before creating engine
ensure_sqlite_directory()

# Create async engine
engine = create_async_engine(
    settings.async_database_url,
    **get_database_engine_args(),
)

# Create async session factory
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Base class for all database models."""

    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides a database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database tables."""
    # Ensure SQLite directory exists
    ensure_sqlite_directory()
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """Close database connections."""
    await engine.dispose()


async def reset_db() -> None:
    """Reset database (drop and recreate all tables). Useful for testing."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
