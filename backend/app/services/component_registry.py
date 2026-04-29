"""Component registry — loads, caches, and searches the catalog.

The catalog lives on CDN as a single JSON file:
    ``gs://<bucket>/<component_prefix>/catalog.json``

On first access (or after a manual sync) the registry downloads the
catalog, deserialises it, and builds lightweight in-memory indexes for
fast lookup by category, tag, and keyword.

The registry is a singleton — import ``registry`` and call its methods.
"""

import json
import logging
from collections import defaultdict

from app.config import settings
from app.helpers.cdn import download_from_cdn
from app.models.component import (
    Component,
    ComponentCatalog,
    ComponentCategory,
    ComponentComplexity,
)

logger = logging.getLogger(__name__)


class ComponentRegistry:
    """In-memory, CDN-backed component catalog."""

    def __init__(self) -> None:
        self._catalog: ComponentCatalog | None = None
        # indexes
        self._by_category: dict[ComponentCategory, list[Component]] = defaultdict(list)
        self._by_tag: dict[str, list[Component]] = defaultdict(list)
        self._by_id: dict[str, Component] = {}

    # ------------------------------------------------------------------
    # Loading
    # ------------------------------------------------------------------

    async def load(self) -> None:
        """Download the catalog from CDN and rebuild indexes."""
        s3_key = settings.build_s3_key("components", "catalog.json")
        logger.info("Loading component catalog from CDN: %s", s3_key)

        try:
            raw = await download_from_cdn(s3_key)
            data = json.loads(raw)
            self._catalog = ComponentCatalog(**data)
        except Exception:
            logger.warning(
                "Could not load catalog from CDN — starting with empty catalog"
            )
            self._catalog = ComponentCatalog()

        self._rebuild_indexes()
        logger.info(
            "Component catalog loaded: %d components (v%s)",
            len(self._catalog.components),
            self._catalog.version,
        )

    def _rebuild_indexes(self) -> None:
        """Build fast-lookup dicts from the flat component list."""
        self._by_category.clear()
        self._by_tag.clear()
        self._by_id.clear()

        for comp in self._catalog.components:  # type: ignore[union-attr]
            self._by_id[comp.id] = comp
            self._by_category[comp.category].append(comp)
            for tag in comp.tags:
                self._by_tag[tag.lower()].append(comp)

    @property
    def is_loaded(self) -> bool:
        return self._catalog is not None

    @property
    def catalog(self) -> ComponentCatalog:
        if self._catalog is None:
            return ComponentCatalog()
        return self._catalog

    # ------------------------------------------------------------------
    # Queries
    # ------------------------------------------------------------------

    def get_by_id(self, component_id: str) -> Component | None:
        return self._by_id.get(component_id)

    def get_by_category(self, category: ComponentCategory) -> list[Component]:
        return self._by_category.get(category, [])

    def get_by_complexity(self, complexity: ComponentComplexity) -> list[Component]:
        return [
            c
            for c in (self._catalog.components if self._catalog else [])
            if c.complexity == complexity
        ]

    def search(self, keywords: list[str], limit: int = 20) -> list[Component]:
        """Score every component against the keyword list and return
        the top ``limit`` matches.

        Scoring:
          +3  exact tag match
          +2  keyword appears in component name
          +1  keyword appears in description or usage_hint
        """
        if not self._catalog:
            return []

        scores: dict[str, float] = defaultdict(float)

        for kw in keywords:
            kw_lower = kw.lower()

            # Tag match
            for comp in self._by_tag.get(kw_lower, []):
                scores[comp.id] += 3.0

            # Name / description scan
            for comp in self._catalog.components:
                if kw_lower in comp.name.lower():
                    scores[comp.id] += 2.0
                if kw_lower in comp.description.lower():
                    scores[comp.id] += 1.0
                if kw_lower in comp.usage_hint.lower():
                    scores[comp.id] += 1.0

        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:limit]
        return [self._by_id[cid] for cid, _ in ranked if cid in self._by_id]

    def get_all(self) -> list[Component]:
        if not self._catalog:
            return []
        return list(self._catalog.components)


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------
registry = ComponentRegistry()
