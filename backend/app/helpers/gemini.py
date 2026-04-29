"""Gemini AI helper — vision analysis and text extraction.

Uses the google-genai SDK to call Gemini for:
  - Screenshot analysis (vision): extract UI elements from images
  - Document understanding: extract structured data from PRDs/docs
"""

import base64
import logging

from google import genai
from google.genai import types

from app.config import settings

logger = logging.getLogger(__name__)

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    """Lazy-init the Gemini client."""
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.google_api_key)
    return _client


# ---------------------------------------------------------------------------
# Screenshot → UI elements
# ---------------------------------------------------------------------------

_VISION_PROMPT = """Analyze this UI screenshot and extract all visible UI elements and sections.

Return a structured list of UI components you can identify. For each element, describe:
- What type of component it is (button, input, card, table, navbar, sidebar, etc.)
- Its purpose or label
- Any notable styling or state

Format your response as a simple bullet list, one element per line, like:
- Sidebar navigation with menu items: Dashboard, Settings, Users
- Top navbar with logo, search input, and user avatar
- Stat card showing "Total Users: 12,345" with green trend arrow
- Data table with columns: Name, Email, Role, Status
- Primary button labeled "Invite User"
- Text input for email address with placeholder "Enter email"

Be specific about what you see. List every distinct UI element."""

_DOC_PROMPT = """Analyze this document and extract all UI/design requirements.

Identify:
1. What type of page or screen is being described (dashboard, form, landing page, etc.)
2. All UI components mentioned (buttons, inputs, tables, cards, navigation, etc.)
3. Layout requirements (sidebar, grid, columns, etc.)
4. Any specific data or content to display

Return a structured bullet list of every UI element and section required, like:
- Sidebar navigation with links: Dashboard, Campaigns, Reporting
- Stat cards showing: Total Spend, Impressions, Taps, Installs
- Data table for campaigns with columns: Name, Status, Budget, Spend, CPI
- Primary button labeled "Launch Campaign"
- Alert banner for budget warnings

Be thorough — extract every UI element mentioned in the document."""


async def analyze_screenshot(image_bytes: bytes, mime_type: str = "image/png") -> str:
    """Send an image to Gemini Vision and get a description of UI elements.

    Args:
        image_bytes: Raw image bytes.
        mime_type: MIME type of the image.

    Returns:
        Text description of UI elements found in the screenshot.
    """
    if not settings.google_api_key:
        logger.warning("GOOGLE_API_KEY not set — returning placeholder analysis")
        return "- Image uploaded (vision analysis unavailable without API key)"

    client = _get_client()

    try:
        response = client.models.generate_content(
            model=settings.google_model,
            contents=[
                types.Content(
                    parts=[
                        types.Part(
                            inline_data=types.Blob(
                                mime_type=mime_type,
                                data=image_bytes,
                            )
                        ),
                        types.Part(text=_VISION_PROMPT),
                    ]
                )
            ],
        )
        result = response.text or ""
        logger.info("Gemini vision analysis: %d chars", len(result))
        return result

    except Exception as e:
        logger.error("Gemini vision call failed: %s", e)
        return f"- Image uploaded (vision analysis failed: {e})"


async def analyze_document(text_content: str) -> str:
    """Send document text to Gemini and extract UI requirements.

    Args:
        text_content: The raw text content of the document.

    Returns:
        Structured description of UI elements extracted from the document.
    """
    if not settings.google_api_key:
        logger.warning("GOOGLE_API_KEY not set — skipping Gemini doc analysis")
        return ""

    if len(text_content.strip()) < 20:
        return ""

    client = _get_client()

    try:
        response = client.models.generate_content(
            model=settings.google_model,
            contents=[
                types.Content(
                    parts=[
                        types.Part(
                            text=f"{_DOC_PROMPT}\n\n---\n\n{text_content[:8000]}"
                        ),
                    ]
                )
            ],
        )
        result = response.text or ""
        logger.info("Gemini document analysis: %d chars", len(result))
        return result

    except Exception as e:
        logger.error("Gemini document analysis failed: %s", e)
        return ""
