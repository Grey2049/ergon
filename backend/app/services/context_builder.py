"""Context builder — bridges parsing and generation.

Takes a ``ParsedContent`` object and produces a ``DesignContext`` that
contains:
  1. An intent summary (what the user wants to build)
  2. A detected page type (dashboard, form, landing, etc.)
  3. A ranked list of matched components from the registry
  4. A layout suggestion

This is the layer that solves Figma Make's context problem: instead of
generating from scratch, the downstream prompt will reference *your*
actual components.

Strategy
--------
1. **Keyword extraction** — pull UI-relevant keywords from the parsed
   elements and raw text.
2. **Page-type detection** — simple heuristic mapping keywords to known
   page archetypes.  Can be upgraded to an LLM call later.
3. **Component matching** — query the registry with extracted keywords,
   then boost/demote based on page type and complexity budget.
4. **Layout suggestion** — pick a layout pattern that fits the page type
   and the number of matched components.
"""

import logging
import re
from collections import Counter

from app.models.parsed_data import ParsedContent
from app.models.component import (
    ComponentCategory,
    ComponentComplexity,
    DesignContext,
    MatchedComponent,
)
from app.services.component_registry import registry

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Page-type detection
# ---------------------------------------------------------------------------

_PAGE_TYPE_SIGNALS: dict[str, list[str]] = {
    "dashboard": [
        "dashboard",
        "analytics",
        "chart",
        "graph",
        "metric",
        "kpi",
        "widget",
        "stats",
        "overview",
        "report",
    ],
    "landing": [
        "landing",
        "hero",
        "cta",
        "call to action",
        "pricing",
        "testimonial",
        "feature",
        "benefit",
    ],
    "form": [
        "form",
        "input",
        "submit",
        "register",
        "signup",
        "login",
        "checkout",
        "contact",
        "survey",
        "wizard",
        "step",
    ],
    "listing": [
        "list",
        "table",
        "grid",
        "catalog",
        "directory",
        "search",
        "filter",
        "sort",
        "pagination",
    ],
    "detail": [
        "detail",
        "profile",
        "product",
        "article",
        "post",
        "view",
        "single",
        "page",
    ],
    "settings": [
        "settings",
        "preferences",
        "config",
        "account",
        "toggle",
        "switch",
        "option",
    ],
}

# Which component categories are most useful per page type
_PAGE_CATEGORY_BOOST: dict[str, list[ComponentCategory]] = {
    "dashboard": [
        ComponentCategory.DATA,
        ComponentCategory.DISPLAY,
        ComponentCategory.LAYOUT,
    ],
    "landing": [
        ComponentCategory.MEDIA,
        ComponentCategory.ACTION,
        ComponentCategory.TYPOGRAPHY,
    ],
    "form": [
        ComponentCategory.INPUT,
        ComponentCategory.FEEDBACK,
        ComponentCategory.ACTION,
    ],
    "listing": [
        ComponentCategory.DATA,
        ComponentCategory.NAVIGATION,
        ComponentCategory.INPUT,
    ],
    "detail": [
        ComponentCategory.DISPLAY,
        ComponentCategory.MEDIA,
        ComponentCategory.ACTION,
    ],
    "settings": [
        ComponentCategory.INPUT,
        ComponentCategory.FEEDBACK,
        ComponentCategory.LAYOUT,
    ],
}

# Complexity budget per page type (max number of organisms/templates)
_COMPLEXITY_BUDGET: dict[str, dict[ComponentComplexity, int]] = {
    "dashboard": {
        ComponentComplexity.TEMPLATE: 1,
        ComponentComplexity.ORGANISM: 4,
        ComponentComplexity.MOLECULE: 8,
        ComponentComplexity.ATOM: 12,
    },
    "landing": {
        ComponentComplexity.TEMPLATE: 1,
        ComponentComplexity.ORGANISM: 3,
        ComponentComplexity.MOLECULE: 6,
        ComponentComplexity.ATOM: 10,
    },
    "form": {
        ComponentComplexity.TEMPLATE: 1,
        ComponentComplexity.ORGANISM: 2,
        ComponentComplexity.MOLECULE: 6,
        ComponentComplexity.ATOM: 8,
    },
    "listing": {
        ComponentComplexity.TEMPLATE: 1,
        ComponentComplexity.ORGANISM: 3,
        ComponentComplexity.MOLECULE: 5,
        ComponentComplexity.ATOM: 8,
    },
    "detail": {
        ComponentComplexity.TEMPLATE: 1,
        ComponentComplexity.ORGANISM: 3,
        ComponentComplexity.MOLECULE: 5,
        ComponentComplexity.ATOM: 8,
    },
    "settings": {
        ComponentComplexity.TEMPLATE: 1,
        ComponentComplexity.ORGANISM: 2,
        ComponentComplexity.MOLECULE: 5,
        ComponentComplexity.ATOM: 6,
    },
}

_DEFAULT_BUDGET: dict[ComponentComplexity, int] = {
    ComponentComplexity.TEMPLATE: 1,
    ComponentComplexity.ORGANISM: 3,
    ComponentComplexity.MOLECULE: 6,
    ComponentComplexity.ATOM: 10,
}

# Layout suggestions
_LAYOUT_SUGGESTIONS: dict[str, str] = {
    "dashboard": "sidebar-left with top navbar, main content area using a responsive grid of cards/widgets",
    "landing": "single-column, full-width hero at top, alternating content sections, CTA footer",
    "form": "centered single-column form with grouped fieldsets, sticky submit bar at bottom",
    "listing": "top filter bar, main content as grid or table with pagination at bottom",
    "detail": "two-column layout — main content left, metadata sidebar right",
    "settings": "sidebar navigation with tabbed content panels",
}

# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


async def build_design_context(parsed: ParsedContent) -> DesignContext:
    """Analyse parsed input and return an enriched ``DesignContext``.

    This is the main entry point called by the pipeline.
    """
    # 1. Extract keywords from all available text signals
    keywords = _extract_keywords(parsed)
    logger.info("Extracted %d keywords: %s", len(keywords), keywords[:15])

    # 2. Detect page type
    page_type = _detect_page_type(keywords)
    logger.info("Detected page type: %s", page_type)

    # 3. Match components from registry
    matched = _match_components(keywords, page_type)
    logger.info("Matched %d components", len(matched))

    # 4. Build intent summary
    intent = _build_intent_summary(parsed, page_type)

    # 5. Layout suggestion
    layout = _LAYOUT_SUGGESTIONS.get(page_type, "responsive single-column layout")

    return DesignContext(
        intent_summary=intent,
        page_type=page_type,
        matched_components=matched,
        layout_suggestion=layout,
        raw_elements=parsed.elements,
    )


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _extract_keywords(parsed: ParsedContent) -> list[str]:
    """Pull unique, meaningful keywords from all text fields."""
    blob = " ".join(
        [
            parsed.title,
            parsed.description,
            parsed.raw_text,
            " ".join(parsed.elements),
        ]
    ).lower()

    # Tokenise: keep alphanumeric words 3+ chars
    tokens = re.findall(r"\b[a-z][a-z0-9]{2,}\b", blob)

    # Remove very common stop words
    stop = {
        "the",
        "and",
        "for",
        "with",
        "that",
        "this",
        "from",
        "are",
        "was",
        "were",
        "been",
        "have",
        "has",
        "had",
        "not",
        "but",
        "can",
        "will",
        "should",
        "would",
        "could",
        "may",
        "also",
        "into",
        "about",
        "than",
        "then",
        "when",
        "where",
        "which",
    }
    filtered = [t for t in tokens if t not in stop]

    # Return by frequency, most common first, deduplicated
    counts = Counter(filtered)
    return [word for word, _ in counts.most_common(50)]


def _detect_page_type(keywords: list[str]) -> str:
    """Score each page type against the keyword list."""
    scores: dict[str, int] = {}
    kw_set = set(keywords)

    for ptype, signals in _PAGE_TYPE_SIGNALS.items():
        scores[ptype] = sum(1 for s in signals if s in kw_set)

    best = max(scores, key=lambda k: scores[k])
    return best if scores[best] > 0 else "general"


def _match_components(
    keywords: list[str],
    page_type: str,
) -> list[MatchedComponent]:
    """Query the registry, apply page-type boosts, and enforce the
    complexity budget so we don't overload the prompt."""

    # Raw search from registry
    candidates = registry.search(keywords, limit=40)

    if not candidates:
        return []

    # Score each candidate with page-type category boost
    boosted_categories = set(_PAGE_CATEGORY_BOOST.get(page_type, []))
    scored: list[tuple[float, str, object]] = []

    for comp in candidates:
        base_score = 1.0
        reason_parts: list[str] = []

        # Tag/keyword relevance (already ranked by registry.search)
        base_score += 0.5
        reason_parts.append("keyword match")

        # Category boost
        if comp.category in boosted_categories:
            base_score += 1.5
            reason_parts.append(f"category '{comp.category}' fits '{page_type}' page")

        # Prefer molecules/organisms over raw atoms for richer output
        if comp.complexity in (
            ComponentComplexity.MOLECULE,
            ComponentComplexity.ORGANISM,
        ):
            base_score += 0.5
            reason_parts.append("mid-complexity preferred")

        scored.append((base_score, ", ".join(reason_parts), comp))

    # Sort by score descending
    scored.sort(key=lambda x: x[0], reverse=True)

    # Enforce complexity budget
    budget = dict(_COMPLEXITY_BUDGET.get(page_type, _DEFAULT_BUDGET))
    result: list[MatchedComponent] = []

    for score, reason, comp in scored:
        remaining = budget.get(comp.complexity, 0)
        if remaining <= 0:
            continue
        budget[comp.complexity] = remaining - 1
        result.append(
            MatchedComponent(
                component=comp,
                relevance=round(min(score / 5.0, 1.0), 2),
                match_reason=reason,
            )
        )

    return result


def _build_intent_summary(parsed: ParsedContent, page_type: str) -> str:
    """One-paragraph summary of what the user wants to build."""
    title = parsed.title or "Untitled design"
    desc = (parsed.description or parsed.raw_text or "")[:300]
    elements = ", ".join(parsed.elements[:10]) if parsed.elements else "not specified"

    return (
        f"Build a '{page_type}' page titled '{title}'. "
        f"Description: {desc}. "
        f"Key UI elements requested: {elements}."
    )
