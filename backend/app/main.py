"""FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.exceptions import register_exception_handlers
from app.helpers.cdn import initialize_cdn
from app.helpers.file_utils import ensure_directories
from app.logging_config import setup_logging
from app.routers import design, components
from app.services.component_registry import registry
from app.services.figma_service import initialize_figma_client

setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: initialize all services.  Shutdown: nothing special."""
    logger.info("=" * 60)
    logger.info("Starting %s (env=%s)", settings.service_name, settings.environment)
    logger.info("=" * 60)

    # 1. CDN
    initialize_cdn()

    # 2. Component catalog
    logger.info("Loading component catalog...")
    await registry.load()
    logger.info(
        "Component catalog initialized successfully — %d components (v%s)",
        len(registry.catalog.components),
        registry.catalog.version,
    )

    # 3. Figma client
    await initialize_figma_client()

    # 4. Gemini
    if settings.google_api_key:
        logger.info(
            "Gemini client initialized successfully — model: %s",
            settings.google_model,
        )
    else:
        logger.warning(
            "Gemini client: GOOGLE_API_KEY not set — screenshot/file parsing will use placeholders"
        )

    # 5. Slack
    if settings.slack_bot_token:
        logger.info(
            "Slack client initialized successfully — channel: %s",
            settings.slack_default_channel,
        )
    else:
        logger.info("Slack client: not configured (optional)")

    logger.info("=" * 60)
    logger.info("All services initialized — %s is ready", settings.service_name)
    logger.info("Listening on http://%s:%d", settings.host, settings.port)
    logger.info("=" * 60)

    yield

    logger.info("%s shutting down", settings.service_name)


# In local dev mode, ensure the local CDN directory exists before mounting
_local_cdn = Path(".local_cdn")
if settings.is_dev and not settings.s3_bucket_name:
    ensure_directories([str(_local_cdn)])

app = FastAPI(
    title=settings.service_name,
    description=(
        "Accepts text, screenshots, or files — parses the input, "
        "matches components from your design system library, "
        "generates a context-aware Figma design, extracts HTML, "
        "and returns both links."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

# Register custom exception handlers
register_exception_handlers(app)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(design.router)
app.include_router(components.router)

# In local dev mode, serve .local_cdn/ as static files so HTML export
# URLs are actually accessible in the browser
if settings.is_dev and _local_cdn.exists():
    app.mount("/local_cdn", StaticFiles(directory=str(_local_cdn)), name="local_cdn")


@app.get("/health", tags=["health"])
async def health_check():
    """Simple liveness probe."""
    return {
        "status": "ok",
        "service": settings.service_name,
        "env": settings.environment,
        "catalog_loaded": registry.is_loaded,
        "catalog_components": len(registry.catalog.components),
    }
