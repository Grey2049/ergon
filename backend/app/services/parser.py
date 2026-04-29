"""Conditional input parsing.

Depending on the input type the parser delegates to the appropriate
helper to normalise the data into a ``ParsedContent`` object.
Files are uploaded to CDN rather than stored locally.
"""

import logging

from fastapi import UploadFile

from app.models.requests import InputType
from app.models.parsed_data import ParsedContent
from app.helpers.cdn import upload_file_to_cdn
from app.helpers.text_utils import extract_elements_from_text

logger = logging.getLogger(__name__)


async def parse_input(
    input_type: InputType,
    text: str | None = None,
    file: UploadFile | None = None,
) -> ParsedContent:
    """Route to the correct parser based on input type."""

    if input_type == InputType.TEXT:
        return _parse_text(text or "")

    if input_type == InputType.SCREENSHOT:
        return await _parse_screenshot(file)  # type: ignore[arg-type]

    if input_type == InputType.FILE:
        return await _parse_file(file)  # type: ignore[arg-type]

    raise ValueError(f"Unsupported input type: {input_type}")


def _parse_text(raw: str) -> ParsedContent:
    """Extract structured data from raw text input."""
    elements = extract_elements_from_text(raw)
    lines = raw.strip().splitlines()
    title = lines[0] if lines else "Untitled"

    return ParsedContent(
        title=title,
        description=raw,
        elements=elements,
        raw_text=raw,
    )


async def _parse_screenshot(file: UploadFile) -> ParsedContent:
    """Upload the screenshot to CDN and extract visual information.

    TODO: Integrate an OCR / vision model (e.g. Gemini) to pull UI
    elements from the image.  For now we store the file and return a
    placeholder.
    """
    cdn_url = await upload_file_to_cdn(file)
    logger.info("Screenshot uploaded to CDN: %s", cdn_url)

    return ParsedContent(
        title="Screenshot Design",
        description="Design generated from uploaded screenshot.",
        elements=["image_placeholder"],
        source_cdn_url=cdn_url,
        metadata={"original_filename": file.filename},
    )


async def _parse_file(file: UploadFile) -> ParsedContent:
    """Upload a generic file to CDN and attempt to extract text content.

    For text-based files the content is read before uploading so we can
    extract UI elements.  Binary files are uploaded as-is.

    TODO: Add support for PDF, DOCX, and other document formats.
    """
    # Read content before uploading (UploadFile cursor is consumed by CDN helper)
    raw_bytes = await file.read()
    await file.seek(0)  # reset so CDN helper can read again

    cdn_url = await upload_file_to_cdn(file)
    logger.info("File uploaded to CDN: %s", cdn_url)

    # Attempt to decode as text
    raw_text = ""
    try:
        raw_text = raw_bytes.decode("utf-8")
    except (UnicodeDecodeError, ValueError):
        logger.warning("Could not decode file as text: %s", file.filename)

    elements = extract_elements_from_text(raw_text) if raw_text else []

    return ParsedContent(
        title=file.filename or "Uploaded File",
        description=raw_text[:500] if raw_text else "Binary file uploaded.",
        elements=elements,
        raw_text=raw_text,
        source_cdn_url=cdn_url,
        metadata={"original_filename": file.filename},
    )
