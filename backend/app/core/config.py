"""
Application configuration.

Loads settings from .env file with sensible defaults.
The ANTHROPIC_API_KEY here is the app-level default —
users can override it per-session via the UI settings.
"""

import os
from dotenv import load_dotenv

# Load .env from the backend directory
load_dotenv()


class Settings:
    """Central config — reads from environment variables."""

    # Anthropic API key: app-level default, overridable per-request
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

    # SQLite database path
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./lattica.db")

    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # CORS: allow the React dev server during development
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",   # Vite default
        "http://localhost:3000",   # CRA fallback
    ]


# Single instance used throughout the app
settings = Settings()
