"""Conditional input parsing.

Depending on the input type the parser delegates to the appropriate
helper to normalise the data into a ``ParsedContent`` object.

- **Text**: heuristic keyword extraction
- **Screenshot**: Gemini Vision analyzes the image → extracts UI elements
- **File**: reads text content, then Gemini extracts UI requirements
"""

import logging

from fastapi import UploadFile

from app.models.requests import InputType
from app.models.parsed_data import ParsedContent
from app.helpers.cdn import upload_file_to_cdn
from app.helpers.text_utils import extract_elements_from_text
from app.helpers.gemini import analyze_screenshot, analyze_document

logger = logging.getLogger(__name__)


async def parse_input(
    input_type: InputType,
    text: str | None = None,
    file: UploadFile | None = None,
) -> ParsedContent:
    """Route to the correct parser based on input type."""

    if input_type == InputType.TEXT:
        return await _parse_text(text or "")

    if input_type == InputType.SCREENSHOT:
        return await _parse_screenshot(file, text)  # type: ignore[arg-type]

    if input_type == InputType.FILE:
        return await _parse_file(file, text)  # type: ignore[arg-type]

    raise ValueError(f"Unsupported input type: {input_type}")


async def _parse_text(raw: str) -> ParsedContent:
    """Extract structured data from raw text input.

    For longer text (PRD-like), also runs Gemini document analysis
    to get richer element extraction.
    """
    elements = extract_elements_from_text(raw)

    # If the text is substantial, use Gemini to extract UI requirements
    if len(raw.strip()) > 100:
        logger.info(
            "Text is substantial (%d chars) — running Gemini analysis", len(raw)
        )
        gemini_analysis = await analyze_document(raw)
        if gemini_analysis:
            gemini_elements = _parse_gemini_bullets(gemini_analysis)
            # Merge: Gemini elements first, then heuristic ones (deduplicated)
            seen = set(e.lower() for e in gemini_elements)
            for e in elements:
                if e.lower() not in seen:
                    gemini_elements.append(e)
                    seen.add(e.lower())
            elements = gemini_elements

    lines = raw.strip().splitlines()
    title = lines[0] if lines else "Untitled"

    return ParsedContent(
        title=title,
        description=raw,
        elements=elements,
        raw_text=raw,
    )


async def _parse_screenshot(
    file: UploadFile, user_text: str | None = None
) -> ParsedContent:
    """Upload the screenshot to CDN and analyze it with Gemini Vision.

    The vision model extracts UI elements from the image. If the user
    also provided text (e.g. "improve this invite page"), that text
    is combined with the vision output for richer context.
    """
    # Read image bytes before uploading
    image_bytes = await file.read()
    await file.seek(0)

    # Upload to CDN
    cdn_url = await upload_file_to_cdn(file)
    logger.info("Screenshot uploaded to CDN: %s", cdn_url)

    # Determine MIME type
    mime = file.content_type or "image/png"

    # Analyze with Gemini Vision
    logger.info("Analyzing screenshot with Gemini Vision...")
    vision_result = await analyze_screenshot(image_bytes, mime)
    logger.info("Vision analysis complete: %d chars", len(vision_result))

    # Parse the vision output into element list
    elements = _parse_gemini_bullets(vision_result)

    # Combine with user text if provided
    raw_text = vision_result
    title = "Screenshot Design"
    if user_text and user_text.strip():
        raw_text = f"{user_text.strip()}\n\n--- Vision Analysis ---\n{vision_result}"
        title = user_text.strip().split("\n")[0][:80]
        # Also extract elements from user text
        user_elements = extract_elements_from_text(user_text)
        seen = set(e.lower() for e in elements)
        for e in user_elements:
            if e.lower() not in seen:
                elements.append(e)
                seen.add(e.lower())

    return ParsedContent(
        title=title,
        description=raw_text[:500],
        elements=elements,
        raw_text=raw_text,
        source_cdn_url=cdn_url,
        metadata={
            "original_filename": file.filename,
            "vision_analysis": vision_result,
        },
    )


async def _parse_file(file: UploadFile, user_text: str | None = None) -> ParsedContent:
    """Upload a file to CDN and extract content.

    For text-based files (PRDs, docs, CSVs), reads the content and
    runs Gemini document analysis for rich element extraction.
    For images uploaded as "file" type, falls back to vision analysis.
    """
    raw_bytes = await file.read()
    await file.seek(0)

    # Check if this is actually an image
    mime = file.content_type or ""
    if mime.startswith("image/"):
        await file.seek(0)
        return await _parse_screenshot(file, user_text)

    cdn_url = await upload_file_to_cdn(file)
    logger.info("File uploaded to CDN: %s", cdn_url)

    # Try to decode as text
    raw_text = ""
    try:
        raw_text = raw_bytes.decode("utf-8")
    except (UnicodeDecodeError, ValueError):
        logger.warning("Could not decode file as text: %s", file.filename)

    # Start with heuristic extraction
    elements = extract_elements_from_text(raw_text) if raw_text else []

    # Run Gemini document analysis for richer extraction
    if raw_text and len(raw_text.strip()) > 50:
        logger.info("Running Gemini document analysis on %s...", file.filename)
        gemini_analysis = await analyze_document(raw_text)
        if gemini_analysis:
            gemini_elements = _parse_gemini_bullets(gemini_analysis)
            seen = set(e.lower() for e in gemini_elements)
            for e in elements:
                if e.lower() not in seen:
                    gemini_elements.append(e)
                    seen.add(e.lower())
            elements = gemini_elements

    # Combine with user text if provided
    description = raw_text[:500] if raw_text else "Binary file uploaded."
    title = file.filename or "Uploaded File"
    if user_text and user_text.strip():
        description = f"{user_text.strip()}\n\n{description}"
        title = user_text.strip().split("\n")[0][:80]
        user_elements = extract_elements_from_text(user_text)
        seen = set(e.lower() for e in elements)
        for e in user_elements:
            if e.lower() not in seen:
                elements.append(e)
                seen.add(e.lower())

    return ParsedContent(
        title=title,
        description=description,
        elements=elements,
        raw_text=raw_text + ("\n\n" + user_text if user_text else ""),
        source_cdn_url=cdn_url,
        metadata={"original_filename": file.filename},
    )


def _parse_gemini_bullets(text: str) -> list[str]:
    """Parse Gemini's bullet-list response into a list of element strings."""
    elements = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        # Remove bullet markers: -, *, •, 1., 1)
        import re

        cleaned = re.sub(r"^[-*•]\s+", "", stripped)
        cleaned = re.sub(r"^\d+[.)]\s+", "", cleaned)
        if cleaned and len(cleaned) > 3:
            elements.append(cleaned)
    return elements
