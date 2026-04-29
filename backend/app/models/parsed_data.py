"""Internal data models used between pipeline stages."""

from pydantic import BaseModel


class ParsedContent(BaseModel):
    """Normalized representation of parsed input data."""

    title: str = ""
    description: str = ""
    elements: list[str] = []
    raw_text: str = ""
    source_cdn_url: str | None = None
    metadata: dict = {}
