"""CLI entry points for uv run start / uv run dev."""

import uvicorn
from app.config import settings


def start():
    """Production start: uv run start"""
    uvicorn.run("app.main:app", host=settings.host, port=settings.port)


def dev():
    """Development start with reload: uv run dev"""
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)
