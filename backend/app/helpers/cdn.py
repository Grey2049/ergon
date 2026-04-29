"""CDN upload helper — S3-backed with local dev fallback.

Path convention (matches your existing CDN structure):
    s3://<bucket>/assets/ergon/{environment}/{upload_type}/{filename}

Upload types:
    - ``uploads``    — user-uploaded files (screenshots, documents)
    - ``exports``    — generated HTML wireframes
    - ``components`` — component catalog JSON + thumbnails

In **dev mode** (``ENVIRONMENT=dev`` and no ``S3_BUCKET_NAME`` set),
all operations fall back to the local filesystem under ``.local_cdn/``.
"""

import logging
import uuid
from pathlib import Path

import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile

from app.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Local-dev fallback
# ---------------------------------------------------------------------------
_LOCAL_CDN_ROOT = Path(".local_cdn")


def _is_local_mode() -> bool:
    """True when we should use the local filesystem instead of S3.

    Local mode activates in dev when no usable AWS credentials exist.
    We check explicit env vars and the shared credentials file — but
    skip the slow EC2 metadata service probe.
    """
    if not settings.is_dev:
        return False
    if not settings.s3_bucket_name:
        return True
    # Explicit creds in env
    if settings.aws_access_key and settings.aws_secret_key:
        return False
    # Shared credentials file (~/.aws/credentials)
    aws_creds = Path.home() / ".aws" / "credentials"
    if aws_creds.exists():
        return False
    # No credentials found — use local mode
    return True


def _ensure_local_dir(prefix: str) -> Path:
    d = _LOCAL_CDN_ROOT / prefix
    d.mkdir(parents=True, exist_ok=True)
    return d


# ---------------------------------------------------------------------------
# S3 client (lazy singleton)
# ---------------------------------------------------------------------------
_s3_client = None


def _get_s3_client():
    """Lazy-initialise and cache the boto3 S3 client."""
    global _s3_client
    if _s3_client is None:
        kwargs = {"region_name": settings.aws_region}
        if settings.aws_access_key and settings.aws_secret_key:
            kwargs["aws_access_key_id"] = settings.aws_access_key
            kwargs["aws_secret_access_key"] = settings.aws_secret_key
        _s3_client = boto3.client("s3", **kwargs)
    return _s3_client


# ---------------------------------------------------------------------------
# URL builders
# ---------------------------------------------------------------------------


def _build_cdn_url(s3_key: str) -> str:
    """Return the public CDN URL for an S3 object."""
    if _is_local_mode():
        return f"http://localhost:{settings.port}/local_cdn/{s3_key}"
    base = settings.cdn_base_url.rstrip("/")
    return f"{base}/{s3_key}"


def generate_presigned_url(s3_key: str, expiration: int | None = None) -> str:
    """Generate a presigned URL for private S3 objects.

    Falls back to the public CDN URL in local mode.
    """
    if _is_local_mode():
        return _build_cdn_url(s3_key)

    client = _get_s3_client()
    exp = expiration or settings.presigned_url_expiration
    url = client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.s3_bucket_name, "Key": s3_key},
        ExpiresIn=exp,
    )
    return url


# ---------------------------------------------------------------------------
# Initialization (called at startup)
# ---------------------------------------------------------------------------


def initialize_cdn() -> None:
    """Verify S3 connectivity and log CDN configuration at startup."""
    if _is_local_mode():
        logger.info(
            "CDN client initialized successfully — local mode (files at %s/)",
            _LOCAL_CDN_ROOT,
        )
        return

    try:
        client = _get_s3_client()
        client.head_bucket(Bucket=settings.s3_bucket_name)
        logger.info(
            "CDN client initialized successfully — S3 bucket '%s', base URL: %s",
            settings.s3_bucket_name,
            settings.cdn_base_url,
        )
    except ClientError as e:
        code = e.response["Error"]["Code"]
        logger.error(
            "CDN client initialization failed — S3 bucket '%s' error: %s",
            settings.s3_bucket_name,
            code,
        )
    except Exception as e:
        logger.error("CDN client initialization failed — %s: %s", type(e).__name__, e)


# ---------------------------------------------------------------------------
# Upload: file
# ---------------------------------------------------------------------------


async def upload_file_to_cdn(
    file: UploadFile,
    upload_type: str = "uploads",
) -> str:
    """Upload a FastAPI ``UploadFile`` to S3 and return its CDN URL.

    The S3 key follows the convention:
        assets/ergon/{environment}/{upload_type}/{unique_filename}
    """
    content = await file.read()

    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise ValueError(
            f"File exceeds maximum upload size of {settings.max_upload_size_mb} MB."
        )

    ext = Path(file.filename or "upload").suffix
    unique_name = f"{uuid.uuid4().hex[:12]}{ext}"
    s3_key = settings.build_s3_key(upload_type, unique_name)

    if _is_local_mode():
        local_dir = _ensure_local_dir(str(Path(s3_key).parent))
        dest = _LOCAL_CDN_ROOT / s3_key
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(content)
        logger.info("Local CDN: saved %s -> %s", file.filename, dest)
    else:
        client = _get_s3_client()
        client.put_object(
            Bucket=settings.s3_bucket_name,
            Key=s3_key,
            Body=content,
            ContentType=file.content_type or "application/octet-stream",
        )
        logger.info(
            "S3: uploaded %s -> s3://%s/%s",
            file.filename,
            settings.s3_bucket_name,
            s3_key,
        )

    return _build_cdn_url(s3_key)


# ---------------------------------------------------------------------------
# Upload: HTML
# ---------------------------------------------------------------------------


async def upload_html_to_cdn(
    html_content: str,
    filename: str | None = None,
) -> str:
    """Upload rendered HTML to S3 and return its CDN URL."""
    name = filename or f"{uuid.uuid4().hex[:10]}.html"
    s3_key = settings.build_s3_key("exports", name)

    if _is_local_mode():
        dest = _LOCAL_CDN_ROOT / s3_key
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(html_content, encoding="utf-8")
        logger.info("Local CDN: exported HTML -> %s", dest)
    else:
        client = _get_s3_client()
        client.put_object(
            Bucket=settings.s3_bucket_name,
            Key=s3_key,
            Body=html_content.encode("utf-8"),
            ContentType="text/html; charset=utf-8",
        )
        logger.info(
            "S3: exported HTML -> s3://%s/%s",
            settings.s3_bucket_name,
            s3_key,
        )

    return _build_cdn_url(s3_key)


# ---------------------------------------------------------------------------
# Download
# ---------------------------------------------------------------------------


async def download_from_cdn(s3_key: str) -> bytes:
    """Download raw bytes of an object from S3 (or local fallback)."""
    if _is_local_mode():
        local_path = _LOCAL_CDN_ROOT / s3_key
        if local_path.exists():
            logger.info("Local CDN: reading %s", local_path)
            return local_path.read_bytes()
        raise FileNotFoundError(f"Local CDN file not found: {local_path}")

    client = _get_s3_client()
    response = client.get_object(
        Bucket=settings.s3_bucket_name,
        Key=s3_key,
    )
    return response["Body"].read()
