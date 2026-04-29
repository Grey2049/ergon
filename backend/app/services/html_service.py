"""HTML extraction service.

Now context-aware: uses the ``DesignContext`` to produce a richer HTML
wireframe that reflects the matched components and layout suggestion.
"""

import logging

from app.helpers.cdn import upload_html_to_cdn
from app.models.parsed_data import ParsedContent
from app.models.component import DesignContext, ComponentComplexity

logger = logging.getLogger(__name__)


async def extract_html(
    figma_url: str,
    parsed: ParsedContent,
    context: DesignContext,
) -> str:
    """Generate an HTML wireframe from the design context and upload to CDN.

    Returns:
        Public CDN URL where the exported HTML can be accessed.
    """
    html_content = _render_html(parsed, context, figma_url)
    html_url = await upload_html_to_cdn(html_content)
    logger.info("HTML exported to CDN: %s", html_url)
    return html_url


def _render_html(
    parsed: ParsedContent,
    context: DesignContext,
    figma_url: str,
) -> str:
    """Build an HTML wireframe that mirrors the design context.

    This produces a structural wireframe — not pixel-perfect, but
    useful as a preview and as a starting point for frontend devs.
    """
    # Group matched components by complexity for the wireframe
    organisms = []
    molecules = []
    atoms = []
    for mc in context.matched_components:
        c = mc.component
        if c.complexity == ComponentComplexity.ORGANISM:
            organisms.append(c)
        elif c.complexity == ComponentComplexity.MOLECULE:
            molecules.append(c)
        else:
            atoms.append(c)

    organism_html = "\n".join(
        f'        <section class="wireframe-block organism">'
        f'<span class="label">{c.name}</span>'
        f'<p class="hint">{c.usage_hint or c.description}</p>'
        f"</section>"
        for c in organisms
    )

    molecule_html = "\n".join(
        f'            <div class="wireframe-block molecule">'
        f'<span class="label">{c.name}</span></div>'
        for c in molecules
    )

    atom_html = "\n".join(
        f'                <span class="wireframe-block atom">{c.name}</span>'
        for c in atoms
    )

    component_count = len(context.matched_components)
    meta_info = (
        f"Page type: {context.page_type} | "
        f"Components used: {component_count} | "
        f"Layout: {context.layout_suggestion}"
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{parsed.title} — Wireframe</title>
    <style>
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{ font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; color: #333; }}
        .header {{ background: #1a1a2e; color: #fff; padding: 1.5rem 2rem; }}
        .header h1 {{ font-size: 1.25rem; font-weight: 600; }}
        .header .meta {{ font-size: 0.8rem; color: #aaa; margin-top: 0.5rem; }}
        .main {{ max-width: 1200px; margin: 2rem auto; padding: 0 1rem; }}
        .layout-hint {{ background: #e8f4fd; border-left: 4px solid #0d99ff; padding: 1rem; margin-bottom: 2rem; border-radius: 4px; font-size: 0.9rem; }}
        .wireframe-block {{ border: 2px dashed #ccc; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; background: #fff; }}
        .wireframe-block .label {{ font-weight: 600; color: #0d99ff; font-size: 0.9rem; }}
        .wireframe-block .hint {{ font-size: 0.8rem; color: #888; margin-top: 0.25rem; }}
        .organism {{ border-color: #0d99ff; }}
        .molecule {{ border-color: #f59e0b; display: inline-block; width: calc(50% - 0.5rem); vertical-align: top; margin-right: 0.5rem; }}
        .atom {{ border-color: #10b981; display: inline-block; padding: 0.5rem 1rem; font-size: 0.8rem; margin: 0.25rem; }}
        .section-title {{ font-size: 1rem; font-weight: 600; color: #555; margin: 1.5rem 0 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid #ddd; }}
        .molecules-grid {{ margin-bottom: 1rem; }}
        .atoms-grid {{ margin-bottom: 1rem; }}
        .figma-link {{ text-align: center; margin: 2rem 0; }}
        .figma-link a {{ background: #0d99ff; color: #fff; padding: 0.75rem 2rem; border-radius: 6px; text-decoration: none; font-weight: 500; }}
        .figma-link a:hover {{ background: #0b87e0; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>{parsed.title}</h1>
        <div class="meta">{meta_info}</div>
    </div>
    <div class="main">
        <div class="layout-hint">
            <strong>Layout:</strong> {context.layout_suggestion}
        </div>

        <div class="section-title">Organisms (major sections)</div>
{organism_html}

        <div class="section-title">Molecules (composite elements)</div>
        <div class="molecules-grid">
{molecule_html}
        </div>

        <div class="section-title">Atoms (basic elements)</div>
        <div class="atoms-grid">
{atom_html}
        </div>

        <div class="figma-link">
            <a href="{figma_url}" target="_blank" rel="noopener">Open in Figma</a>
        </div>
    </div>
</body>
</html>"""
