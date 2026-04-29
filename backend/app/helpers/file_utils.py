"""File system utilities."""

import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def ensure_directories(dirs: list[str]) -> None:
    """Create directories if they don't already exist."""
    for d in dirs:
        Path(d).mkdir(parents=True, exist_ok=True)
        logger.info("Ensured directory exists: %s", d)
