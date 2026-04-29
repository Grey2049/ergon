"""Admin router for the component library.

Provides endpoints to:
  - Sync the catalog from CDN
  - List all components (with optional category filter)
  - Search components by keywords
  - Upload/update the catalog JSON to CDN
"""

import json
import logging

from fastapi import APIRouter, HTTPException, Query, status

from app.helpers.cdn import upload_html_to_cdn, download_from_cdn
from app.models.component import Component, ComponentCatalog, ComponentCategory
from app.services.component_registry import registry
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/components", tags=["components"])


@router.post(
    "/sync",
    status_code=status.HTTP_200_OK,
    summary="Reload the component catalog from CDN",
)
async def sync_catalog():
    """Force-reload the catalog from CDN into memory."""
    await registry.load()
    return {
        "status": "synced",
        "version": registry.catalog.version,
        "component_count": len(registry.catalog.components),
    }


@router.get(
    "/",
    response_model=list[Component],
    summary="List all components",
)
async def list_components(
    category: ComponentCategory | None = Query(
        default=None, description="Filter by category"
    ),
):
    """Return all components, optionally filtered by category."""
    if not registry.is_loaded:
        await registry.load()

    if category:
        return registry.get_by_category(category)
    return registry.get_all()


@router.get(
    "/search",
    response_model=list[Component],
    summary="Search components by keywords",
)
async def search_components(
    q: str = Query(..., min_length=1, description="Space-separated keywords"),
    limit: int = Query(default=10, ge=1, le=50),
):
    """Search the catalog by keywords."""
    if not registry.is_loaded:
        await registry.load()

    keywords = q.lower().split()
    return registry.search(keywords, limit=limit)


@router.get(
    "/{component_id}",
    response_model=Component,
    summary="Get a single component by ID",
)
async def get_component(component_id: str):
    """Fetch a single component by its slug ID."""
    if not registry.is_loaded:
        await registry.load()

    comp = registry.get_by_id(component_id)
    if not comp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Component '{component_id}' not found.",
        )
    return comp


@router.put(
    "/catalog",
    status_code=status.HTTP_200_OK,
    summary="Upload a new catalog JSON to CDN",
    description=(
        "Accepts a full ComponentCatalog JSON body, uploads it to CDN, "
        "and reloads the in-memory registry."
    ),
)
async def upload_catalog(catalog: ComponentCatalog):
    """Replace the catalog on CDN and reload."""
    from app.helpers.cdn import (
        _get_s3_client,
        _build_cdn_url,
        _is_local_mode,
        _LOCAL_CDN_ROOT,
    )

    s3_key = settings.build_s3_key("components", "catalog.json")
    payload = catalog.model_dump_json(indent=2)

    if _is_local_mode():
        from pathlib import Path

        dest = _LOCAL_CDN_ROOT / s3_key
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(payload, encoding="utf-8")
    else:
        client = _get_s3_client()
        client.put_object(
            Bucket=settings.s3_bucket_name,
            Key=s3_key,
            Body=payload.encode("utf-8"),
            ContentType="application/json",
        )

    logger.info("Catalog uploaded to CDN: %s", s3_key)

    # Reload registry
    await registry.load()

    return {
        "status": "uploaded",
        "cdn_url": _build_cdn_url(s3_key),
        "version": catalog.version,
        "component_count": len(catalog.components),
    }
