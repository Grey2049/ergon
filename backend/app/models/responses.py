"""Response models."""

from pydantic import BaseModel


class ReasoningStepSummary(BaseModel):
    """Lightweight summary of one agent reasoning step for the API response."""

    step: int
    phase: str
    thought: str
    tool: str | None = None
    success: bool | None = None
    duration_ms: int = 0


class ValidationSummary(BaseModel):
    """Validation result summary for the API response."""

    passed: bool = False
    coverage_score: float = 0.0
    issue_count: int = 0
    issues: list[dict] = []


class DesignResponse(BaseModel):
    """Returned after a design generation run."""

    figma_url: str
    html_url: str
    message: str = "Design generated successfully."

    # Agent observability (optional — populated when agent runs)
    agent_run_id: str = ""
    iterations: int = 0
    reasoning_trace: list[ReasoningStepSummary] = []
    validation: ValidationSummary | None = None
