"""Router for the design generation pipeline."""

from fastapi import APIRouter, File, Form, UploadFile, HTTPException, status

from app.models.requests import InputType
from app.models.responses import DesignResponse
from app.services.pipeline import run_design_pipeline

router = APIRouter(prefix="/api/v1/design", tags=["design"])


@router.post(
    "/generate",
    response_model=DesignResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate a Figma design and HTML export",
    description=(
        "Accepts text, a screenshot, or a generic file. "
        "The input is parsed, a Figma design is generated, "
        "HTML is extracted, and both URLs are returned."
    ),
)
async def generate_design(
    input_type: InputType = Form(
        ..., description="Type of input: text, screenshot, or file"
    ),
    text: str | None = Form(
        default=None, description="Raw text input (required when input_type is text)"
    ),
    file: UploadFile | None = File(
        default=None,
        description="Uploaded file — image for screenshot, any file for file type",
    ),
):
    """Orchestrate the full design-generation pipeline."""
    # --- Input validation ---------------------------------------------------
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

    result = await run_design_pipeline(input_type=input_type, text=text, file=file)
    return result
