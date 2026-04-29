"""Application configuration loaded from environment variables.

Env var names follow the same conventions as the scheduler_data_services
project so the two can share a single .env when co-located.
"""

from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Central configuration sourced from .env file."""

    # Application
    service_name: str = Field(default="Design Generator")
    environment: str = Field(default="dev")
    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8007)
    reload: bool = Field(default=True)

    # S3 / CDN
    s3_bucket_name: str = Field(default="cdn.newtonco.ai")
    s3_assets_path: str = Field(default="assets/ergon/{environment}/{upload_type}/")
    cdn_base_url: str = Field(default="https://cdn.newtonco.ai/")
    presigned_url_expiration: int = Field(default=3600)
    max_upload_size_mb: int = Field(default=10)

    # AWS (optional — boto3 falls back to env vars / instance profile)
    aws_access_key: str = Field(default="")
    aws_secret_key: str = Field(default="")
    aws_region: str = Field(default="us-east-1")

    # Figma
    figma_api_token: str = Field(default="")
    figma_team_id: str = Field(default="")

    # Google Gemini
    google_api_key: str = Field(default="")
    google_model: str = Field(default="gemini-2.5-flash")

    # Slack
    slack_bot_token: str = Field(default="")
    slack_default_channel: str = Field(default="")

    # Retry / Resilience
    api_client_max_retries: int = Field(default=3)
    api_client_base_delay: int = Field(default=500)
    api_client_max_backoff: int = Field(default=8000)

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @property
    def is_dev(self) -> bool:
        return self.environment == "dev"

    @property
    def debug(self) -> bool:
        return self.is_dev

    def build_s3_key(self, upload_type: str, filename: str) -> str:
        """Build the full S3 object key using the path template.

        Template: assets/ergon/{environment}/{upload_type}/{filename}
        """
        prefix = self.s3_assets_path.format(
            environment=self.environment,
            upload_type=upload_type,
        )
        return f"{prefix}{filename}"


settings = Settings()
