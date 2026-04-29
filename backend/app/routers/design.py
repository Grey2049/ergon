"""Router for the design generation pipeline.

Provides two endpoints:
  - POST /generate       — standard JSON response (original)
  - POST /generate/stream — SSE stream with real-time agent events
"""

import json
import logging

from fastapi import APIRouter, File, Form, UploadFile, HTTPException, status
from fastapi.responses import StreamingResponse

from app.models.requests import InputType
from app.models.responses import DesignResponse
from app.services.pipeline import run_design_pipeline
from app.services.pipeline_stream import run_design_pipeline_stream

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/design", tags=["design"])


def _validate_input(input_type: InputType, text: str | None, file: UploadFile | None):
    """Shared input validation for both endpoints."""
    if input_type == InputType.TEXT and not text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Field 'text' is required when input_type is 'text'.",
        )
    if input_type in (InputType.SCREENSHOT, InputType.FILE) and file is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A file upload is required when input_type is 'screenshot' or 'file'.",
        )


@router.post(
    "/generate",
    response_model=DesignResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate a design (JSON response)",
)
async def generate_design(
    input_type: InputType = Form(...),
    text: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
):
    """Standard non-streaming endpoint — returns full result as JSON."""
    _validate_input(input_type, text, file)
    result = await run_design_pipeline(input_type=input_type, text=text, file=file)
    return result


@router.post(
    "/generate/stream",
    summary="Generate a design (SSE stream)",
    description="Returns a Server-Sent Events stream with real-time agent events.",
)
async def generate_design_stream(
    input_type: InputType = Form(...),
    text: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
):
    """Streaming endpoint — emits SSE events as the agent works.

    Event types:
      - ``agent:start``     — agent run started
      - ``agent:step``      — one reasoning step completed
      - ``agent:phase``     — agent phase changed
      - ``agent:result``    — final result (figma_url, html_url, etc.)
      - ``agent:error``     — agent failed
      - ``agent:clarify``   — agent needs user clarification
    """
    _validate_input(input_type, text, file)

    async def event_generator():
        async for event in run_design_pipeline_stream(
            input_type=input_type, text=text, file=file
        ):
            event_type = event.get("event", "agent:step")
            data = json.dumps(event, default=str)
            yield f"event: {event_type}\ndata: {data}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
