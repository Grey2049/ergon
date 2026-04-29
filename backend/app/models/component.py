"""Component catalog data models.

These models define the structure of your design system component library
stored on CDN.  The catalog is a single JSON file that acts as the source
of truth for every component available to the generation pipeline.

Catalog JSON structure on CDN (``components/catalog.json``):
```json
{
  "version": "1.0.0",
  "updated_at": "2026-04-28T00:00:00Z",
  "components": [ ... ]
}
```
"""

from enum import StrEnum

from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class ComponentCategory(StrEnum):
    """High-level grouping used for fast filtering."""

    LAYOUT = "layout"
    NAVIGATION = "navigation"
    INPUT = "input"
    DISPLAY = "display"
    FEEDBACK = "feedback"
    DATA = "data"
    MEDIA = "media"
    ACTION = "action"
    OVERLAY = "overlay"
    TYPOGRAPHY = "typography"


class ComponentComplexity(StrEnum):
    """How heavyweight a component is — helps the context builder
    decide how many components to include without overloading the prompt."""

    ATOM = "atom"  # button, icon, badge
    MOLECULE = "molecule"  # search bar, card, form field
    ORGANISM = "organism"  # navbar, sidebar, data table
    TEMPLATE = "template"  # full page layout, dashboard shell


# ---------------------------------------------------------------------------
# Component variant
# ---------------------------------------------------------------------------


class ComponentVariant(BaseModel):
    """A single variant of a component (e.g. ``primary``, ``outlined``)."""

    name: str
    description: str = ""
    figma_node_id: str = ""
    thumbnail_url: str = ""
    props: dict = {}


# ---------------------------------------------------------------------------
# Core component model
# ---------------------------------------------------------------------------


class Component(BaseModel):
    """One entry in the design-system catalog."""

    id: str  # unique slug, e.g. "primary-button"
    name: str  # human-readable, e.g. "Primary Button"
    category: ComponentCategory
    complexity: ComponentComplexity
    description: str = ""
    tags: list[str] = []  # free-form search tags
    figma_component_key: str = ""  # Figma library component key
    figma_file_key: str = ""  # Figma file that hosts this component
    thumbnail_url: str = ""  # CDN URL of a preview image
    variants: list[ComponentVariant] = []
    default_props: dict = {}
    usage_hint: str = ""  # one-liner for the LLM prompt


# ---------------------------------------------------------------------------
# Catalog wrapper
# ---------------------------------------------------------------------------


class ComponentCatalog(BaseModel):
    """Top-level wrapper for the JSON catalog stored on CDN."""

    version: str = "1.0.0"
    updated_at: str = ""
    components: list[Component] = []


# ---------------------------------------------------------------------------
# Context-enriched result (output of the context builder)
# ---------------------------------------------------------------------------


class MatchedComponent(BaseModel):
    """A component selected by the context builder, with a relevance score."""

    component: Component
    relevance: float = 0.0  # 0.0 – 1.0
    match_reason: str = ""  # why this component was selected


class DesignContext(BaseModel):
    """The enriched context passed to the prompt formatter and Figma service."""

    intent_summary: str = ""
    page_type: str = ""  # e.g. "dashboard", "landing", "form"
    matched_components: list[MatchedComponent] = []
    layout_suggestion: str = ""
    raw_elements: list[str] = []
