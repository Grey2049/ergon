"""Text processing utilities."""

import re


def extract_elements_from_text(raw: str) -> list[str]:
    """Pull meaningful UI element hints from raw text.

    This is a simple heuristic parser.  Replace or augment with NLP /
    LLM-based extraction for production use.

    Strategies applied:
      1. Lines that look like bullet points or numbered items.
      2. Lines that contain common UI keywords.
    """
    if not raw.strip():
        return []

    elements: list[str] = []
    ui_keywords = re.compile(
        r"\b(button|header|footer|nav|sidebar|card|form|input|image|"
        r"modal|table|list|menu|banner|section|hero|grid|container)\b",
        re.IGNORECASE,
    )

    for line in raw.splitlines():
        stripped = line.strip()
        if not stripped:
            continue

        # Bullet / numbered list items
        if re.match(r"^[-*•]\s+", stripped) or re.match(r"^\d+[.)]\s+", stripped):
            elements.append(re.sub(r"^[-*•\d.)\s]+", "", stripped))
            continue

        # Lines mentioning UI components
        if ui_keywords.search(stripped):
            elements.append(stripped)

    return elements
