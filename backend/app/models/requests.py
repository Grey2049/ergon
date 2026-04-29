"""Request models and enums."""

from enum import StrEnum


class InputType(StrEnum):
    """Supported input types for the design pipeline."""

    TEXT = "text"
    SCREENSHOT = "screenshot"
    FILE = "file"
