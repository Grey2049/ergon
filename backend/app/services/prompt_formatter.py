"""Prompt formatter — builds the enriched prompt for Figma Make.

The key insight: Figma Make generates better output when you give it
explicit constraints.  Instead of "make me a dashboard", we send:

    "Create a dashboard page using these specific components from our
     design system: [Sidebar Nav], [Stat Card (4 variants)],
     [Data Table], [Line Chart Widget].  Layout: sidebar-left with
     top navbar, main content area using a 2x2 grid of cards..."

This module takes a ``DesignContext`` and formats it into that kind
of structured, component-aware prompt.
"""

import logging

from app.models.component import DesignContext, MatchedComponent, ComponentComplexity

logger = logging.getLogger(__name__)


def format_figma_prompt(context: DesignContext) -> str:
    """Build the full prompt string to send to Figma Make.

    Structure:
      1. Intent (what to build)
      2. Component palette (what to build with)
      3. Layout directive
      4. Constraints & style rules
    """
    sections = [
        _section_intent(context),
        _section_component_palette(context),
        _section_layout(context),
        _section_constraints(context),
    ]

    prompt = "\n\n".join(s for s in sections if s)
    logger.debug("Formatted Figma prompt (%d chars)", len(prompt))
    return prompt


# ---------------------------------------------------------------------------
# Prompt sections
# ---------------------------------------------------------------------------


def _section_intent(ctx: DesignContext) -> str:
    """Section 1 — what the user wants."""
    return f"## Intent\n{ctx.intent_summary}"


def _section_component_palette(ctx: DesignContext) -> str:
    """Section 2 — the components to use.

    Groups components by complexity tier so the LLM understands the
    hierarchy: templates → organisms → molecules → atoms.
    """
    if not ctx.matched_components:
        return ""

    tiers: dict[ComponentComplexity, list[MatchedComponent]] = {}
    for mc in ctx.matched_components:
        tier = mc.component.complexity
        tiers.setdefault(tier, []).append(mc)

    lines = [
        "## Component Palette",
        "Use ONLY the following components from our design system:",
    ]

    tier_order = [
        ComponentComplexity.TEMPLATE,
        ComponentComplexity.ORGANISM,
        ComponentComplexity.MOLECULE,
        ComponentComplexity.ATOM,
    ]
    tier_labels = {
        ComponentComplexity.TEMPLATE: "Page Templates",
        ComponentComplexity.ORGANISM: "Organisms (complex sections)",
        ComponentComplexity.MOLECULE: "Molecules (composite elements)",
        ComponentComplexity.ATOM: "Atoms (basic elements)",
    }

    for tier in tier_order:
        matches = tiers.get(tier, [])
        if not matches:
            continue
        lines.append(f"\n### {tier_labels[tier]}")
        for mc in matches:
            c = mc.component
            variant_info = ""
            if c.variants:
                vnames = ", ".join(v.name for v in c.variants[:5])
                variant_info = f" — variants: [{vnames}]"
            hint = f" | Hint: {c.usage_hint}" if c.usage_hint else ""
            lines.append(f"- **{c.name}** (`{c.id}`){variant_info}{hint}")

    return "\n".join(lines)


def _section_layout(ctx: DesignContext) -> str:
    """Section 3 — layout directive."""
    if not ctx.layout_suggestion:
        return ""
    return (
        f"## Layout\n"
        f"Arrange the components using this layout pattern:\n"
        f"{ctx.layout_suggestion}"
    )


def _section_constraints(ctx: DesignContext) -> str:
    """Section 4 — hard rules the generation must follow."""
    rules = [
        "Do NOT invent new components — use only the ones listed in the Component Palette above.",
        "Maintain consistent spacing (8px grid) and alignment.",
        "Use the component variants as specified; do not create custom variants.",
        "Keep the design responsive-ready (use auto-layout where possible).",
        "Group related components into clearly named frames.",
    ]

    if ctx.page_type == "form":
        rules.append("Ensure all form inputs have visible labels and helper text.")
    if ctx.page_type == "dashboard":
        rules.append("Leave placeholder areas for charts/graphs with clear labels.")
    if ctx.page_type == "landing":
        rules.append("Ensure the hero section is above the fold (within 900px height).")

    numbered = "\n".join(f"{i + 1}. {r}" for i, r in enumerate(rules))
    return f"## Constraints\n{numbered}"
