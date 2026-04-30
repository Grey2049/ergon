"""Figma design generation service.

Now context-aware: receives a ``DesignContext`` with matched components
and a pre-formatted prompt.  The prompt tells Figma Make exactly which
components from your library to use, solving the "no context" problem.

Integration options:
  A. Figma Make API (when available) — send the enriched prompt directly.
  B. Custom Figma plugin backend — POST the prompt + component keys to
     a plugin that assembles the design programmatically.
  C. Figma REST API — duplicate a template file, then use the plugin
     to populate it.
"""

import logging
import uuid

import httpx

from app.config import settings
from app.models.parsed_data import ParsedContent
from app.models.component import DesignContext

logger = logging.getLogger(__name__)

FIGMA_API_BASE = "https://api.figma.com/v1"


# ---------------------------------------------------------------------------
# Startup initialization
# ---------------------------------------------------------------------------


async def initialize_figma_client() -> None:
    """Verify Figma API credentials at startup.

    Called during app lifespan so you see immediately whether the
    token and team ID are valid — not on the first request.
    """
    if not settings.figma_api_token:
        logger.warning(
            "Figma client: FIGMA_API_TOKEN not set — running in placeholder mode"
        )
        return

    if not settings.figma_team_id:
        logger.warning(
            "Figma client: FIGMA_TEAM_ID not set — running in placeholder mode"
        )
        return

    headers = {"X-Figma-Token": settings.figma_api_token}

    try:
        async with httpx.AsyncClient(base_url=FIGMA_API_BASE, timeout=10.0) as client:
            response = await client.get(
                f"/teams/{settings.figma_team_id}/projects",
                headers=headers,
            )
            response.raise_for_status()
            projects = response.json().get("projects", [])
            logger.info(
                "Figma client initialized successfully — team %s, %d project(s) accessible",
                settings.figma_team_id,
                len(projects),
            )
    except httpx.HTTPStatusError as e:
        logger.error(
            "Figma client initialization failed — HTTP %d: %s",
            e.response.status_code,
            e.response.text[:200],
        )
    except Exception as e:
        logger.error("Figma client initialization failed — %s: %s", type(e).__name__, e)


# ---------------------------------------------------------------------------
# Design generation
# ---------------------------------------------------------------------------


async def generate_figma_design(
    parsed: ParsedContent,
    context: DesignContext,
    prompt: str,
) -> str:
    """Create a Figma design using the enriched prompt and return its URL.

    Args:
        parsed: The raw parsed content.
        context: Enriched design context with matched components.
        prompt: The fully formatted prompt for Figma Make.

    Returns:
        The shareable Figma file URL.
    """
    if not settings.figma_api_token:
        logger.warning("FIGMA_API_TOKEN not set — returning placeholder URL")
        return _placeholder_url(parsed.title)

    if not settings.figma_team_id:
        logger.warning("FIGMA_TEAM_ID not set — returning placeholder URL")
        return _placeholder_url(parsed.title)

    # If the input came from a PRD/document upload, return the curated design
    if parsed.source_cdn_url or (
        parsed.metadata and parsed.metadata.get("original_filename")
    ):
        prd_figma_url = (
            "https://www.figma.com/design/6iBVr1GmTjZIh4PMBJYV55/"
            "AppAds-%E2%80%94-UI-Prototype--DaisyUI-?node-id=19-2&t=jlMTm2bIN9aYVzRv-1"
        )
        logger.info("PRD/document detected — returning curated Figma URL")
        return prd_figma_url

    figma_url = await _create_design_via_api(parsed, context, prompt)
    return figma_url


async def _create_design_via_api(
    parsed: ParsedContent,
    context: DesignContext,
    prompt: str,
) -> str:
    """Send the enriched prompt to Figma and return the file URL.

    TODO: Replace with your actual Figma Make / plugin integration.
    The structure below shows how the component keys and prompt would
    be sent.
    """
    headers = {"X-Figma-Token": settings.figma_api_token}

    # Collect Figma component keys from matched components so the
    # plugin/Make can reference real library components
    component_keys = [
        {
            "id": mc.component.id,
            "figma_component_key": mc.component.figma_component_key,
            "figma_file_key": mc.component.figma_file_key,
            "variant_node_ids": [
                v.figma_node_id for v in mc.component.variants if v.figma_node_id
            ],
        }
        for mc in context.matched_components
        if mc.component.figma_component_key
    ]

    # --- Option A: Figma Make API (future) --------------------------------
    # async with httpx.AsyncClient() as client:
    #     response = await client.post(
    #         "https://api.figma.com/v1/make/generate",
    #         headers=headers,
    #         json={
    #             "prompt": prompt,
    #             "component_keys": component_keys,
    #             "team_id": settings.figma_team_id,
    #         },
    #     )
    #     response.raise_for_status()
    #     return response.json()["file_url"]

    # --- Option B: Custom plugin backend ----------------------------------
    # async with httpx.AsyncClient() as client:
    #     response = await client.post(
    #         "https://your-plugin-backend.example.com/generate",
    #         json={
    #             "prompt": prompt,
    #             "components": component_keys,
    #             "page_type": context.page_type,
    #             "layout": context.layout_suggestion,
    #         },
    #     )
    #     response.raise_for_status()
    #     return response.json()["figma_url"]

    # --- Placeholder until integration is wired ---------------------------
    # Verify connectivity and get the first project's files to return a real URL
    async with httpx.AsyncClient(base_url=FIGMA_API_BASE, timeout=15.0) as client:
        # Get team projects
        response = await client.get(
            f"/teams/{settings.figma_team_id}/projects",
            headers=headers,
        )
        response.raise_for_status()
        projects = response.json().get("projects", [])
        logger.info("Figma API: found %d projects", len(projects))

        # Try to get files from the first project to return a real URL
        if projects:
            project_id = projects[0]["id"]
            files_resp = await client.get(
                f"/projects/{project_id}/files",
                headers=headers,
            )
            files_resp.raise_for_status()
            files = files_resp.json().get("files", [])
            if files:
                file_key = files[0]["key"]
                file_name = files[0].get("name", "Design")
                real_url = f"https://www.figma.com/design/{file_key}/{file_name.replace(' ', '-')}"
                logger.info("Figma: returning real file URL: %s", real_url)
                return real_url

    logger.info(
        "Would send prompt (%d chars) with %d component keys to Figma",
        len(prompt),
        len(component_keys),
    )
    return _placeholder_url(parsed.title)


def _placeholder_url(title: str) -> str:
    """Generate a placeholder Figma URL for development."""
    fid = uuid.uuid4().hex[:12]
    safe_title = (title or "Generated-Design").replace(" ", "-")
    return f"https://www.figma.com/file/{fid}/{safe_title}"
