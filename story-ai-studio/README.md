# Story AI Studio

An AI-powered RPG platform for creating and playing interactive stories with friends.

## Features

- **AI-Powered Storytelling**: Dynamic narratives powered by GPT-4 and Claude
- **Fantasy UI**: Medieval-themed interface with custom fonts and styling
- **Multiplayer Campaigns**: Invite friends to join your adventures
- **Self-Hosting**: Docker containers for isolated user experiences
- **FoundryVTT Import**: Import content from your FoundryVTT modules

## Quick Start

### Option 1: Local Development (No Docker)

The simplest way to get started - uses SQLite for the database.

```bash
# Clone the repository
git clone https://github.com/your-org/story-ai-studio.git
cd story-ai-studio

# Install dependencies
pnpm install

# Set up the API
cd services/api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -e ".[dev]"

# Copy environment file
cp .env.example .env
# Edit .env and add your OpenAI or Anthropic API key

# Run the API
uvicorn app.main:app --reload --port 8000

# In another terminal, run the web app
cd apps/web
pnpm dev
```

The API will be available at http://localhost:8000 and the web app at http://localhost:3000.

### Option 2: Docker Development

Full PostgreSQL and Redis setup using Docker Compose.

```bash
# Clone and install
git clone https://github.com/your-org/story-ai-studio.git
cd story-ai-studio
pnpm install

# Start infrastructure
docker-compose up -d postgres redis

# Set up the API
cd services/api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -e ".[dev]"

# Copy environment file and update for PostgreSQL
cp .env.example .env
# Edit .env:
# DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/story_ai_studio
# REDIS_URL=redis://localhost:6379/0

# Run the API
uvicorn app.main:app --reload --port 8000

# In another terminal, run the web app
cd apps/web
pnpm dev
```

### Option 3: Full Docker Stack

Run everything in Docker containers.

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Project Structure

```
story-ai-studio/
|-- apps/
|   |-- web/                 # Next.js frontend with Fantasy UI
|       |-- src/
|       |   |-- app/         # App Router pages
|       |   |-- components/  # React components
|       |   |-- styles/      # Tailwind + Fantasy theme
|       |-- tailwind.config.ts
|
|-- packages/
|   |-- shared/              # Shared TypeScript package
|       |-- src/
|       |   |-- types/       # TypeScript interfaces
|       |   |-- constants/   # Game constants, colors, fonts
|       |   |-- utils/       # Utility functions
|
|-- services/
|   |-- api/                 # FastAPI backend
|       |-- app/
|       |   |-- core/        # Config, database
|       |   |-- models/      # SQLAlchemy models
|       |   |-- routes/      # API endpoints
|       |   |-- services/    # Business logic
|       |-- tests/           # Pytest tests
|       |-- .env.example
|
|-- docker-compose.yml       # PostgreSQL, Redis, API, Web
|-- turbo.json               # Turborepo pipeline
|-- package.json             # Monorepo root
```

## Technology Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **Tailwind CSS** - Utility-first styling
- **Custom Fantasy Theme** - Medieval fonts (Cinzel, Crimson Text), parchment textures
- **Tauri** - Desktop app wrapper (future: mobile via Kotlin)

### Backend
- **FastAPI** - Python async web framework
- **SQLAlchemy 2.0** - Async ORM
- **PostgreSQL** - Production database
- **SQLite** - Development database (optional)
- **Redis** - Caching and real-time features (optional for dev)

### AI/ML
- **OpenAI GPT-4** - Primary story generation
- **Anthropic Claude** - Alternative AI provider
- **LangChain** - AI orchestration

### Infrastructure
- **Docker** - Containerization
- **Turborepo** - Monorepo build system
- **pnpm** - Fast package manager

## Development

### Prerequisites

- Node.js 18+
- Python 3.11+
- pnpm 8+
- Docker (optional)

### Running Tests

```bash
# Frontend tests
cd apps/web
pnpm test

# Shared package tests
cd packages/shared
pnpm test

# API tests
cd services/api
pytest
```

### Code Style

- **TypeScript/JavaScript**: ESLint + Prettier
- **Python**: Ruff + Black + MyPy

```bash
# Lint all
pnpm lint

# Format all
pnpm format
```

## Environment Variables

See [`services/api/.env.example`](services/api/.env.example) for all configuration options.

Key variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | SQLite local file |
| `REDIS_URL` | Redis connection (optional) | None |
| `OPENAI_API_KEY` | OpenAI API key | Required for AI features |
| `JWT_SECRET_KEY` | JWT signing key | Change in production! |

## Architecture

For detailed architecture documentation, see:
- [`plans/ai-rpg-platform-architecture.md`](../plans/ai-rpg-platform-architecture.md)
- [`plans/implementation-plan.md`](../plans/implementation-plan.md)
- [`plans/monetization-model.md`](../plans/monetization-model.md)

## License

MIT License - see [LICENSE.md](../LICENSE.md)
