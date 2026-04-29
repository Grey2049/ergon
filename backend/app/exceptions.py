"""Custom exception classes and global error handlers."""

import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


class DesignGenerationError(Exception):
    """Raised when the design generation pipeline fails."""

    def __init__(self, detail: str = "Design generation failed."):
        self.detail = detail
        super().__init__(self.detail)


class FigmaAPIError(Exception):
    """Raised when a Figma API call fails."""

    def __init__(self, detail: str = "Figma API error."):
        self.detail = detail
        super().__init__(self.detail)


def register_exception_handlers(app: FastAPI) -> None:
    """Attach custom exception handlers to the app."""

    @app.exception_handler(DesignGenerationError)
    async def design_error_handler(request: Request, exc: DesignGenerationError):
        logger.error("DesignGenerationError: %s", exc.detail)
        return JSONResponse(status_code=500, content={"detail": exc.detail})

    @app.exception_handler(FigmaAPIError)
    async def figma_error_handler(request: Request, exc: FigmaAPIError):
        logger.error("FigmaAPIError: %s", exc.detail)
        return JSONResponse(status_code=502, content={"detail": exc.detail})
