# Story AI Studio API

FastAPI backend for the AI RPG Platform.

## Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -e ".[dev]"

# Copy environment file
cp .env.example .env
# Add your API keys to .env

# Run the API
uvicorn app.main:app --reload --port 8000
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

## Development

```bash
# Run tests
pytest

# Format code
black app tests

# Lint
ruff check app tests

# Type check
mypy app