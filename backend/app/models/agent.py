"""Agent state and tool models.

These models define the agent's internal state, the tools it can use,
and the reasoning trace it produces as it works through a design task.
"""

from enum import StrEnum
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.parsed_data import ParsedContent
from app.models.component import DesignContext


# ---------------------------------------------------------------------------
# Tool definitions
# ---------------------------------------------------------------------------


class ToolName(StrEnum):
    """Every capability the agent can invoke."""

    PARSE_INPUT = "parse_input"
    ANALYZE_INTENT = "analyze_intent"
    MATCH_COMPONENTS = "match_components"
    BUILD_LAYOUT = "build_layout"
    GENERATE_FIGMA = "generate_figma"
    EXPORT_HTML = "export_html"
    VALIDATE_OUTPUT = "validate_output"
    CLARIFY_INPUT = "clarify_input"
    REFINE_COMPONENTS = "refine_components"
    REVISE_LAYOUT = "revise_layout"


class ToolCall(BaseModel):
    """A single tool invocation decided by the agent."""

    tool: ToolName
    reasoning: str = ""  # why the agent chose this tool
    arguments: dict = {}  # tool-specific params


class ToolResult(BaseModel):
    """The outcome of executing a tool."""

    tool: ToolName
    success: bool = True
    data: dict = {}  # tool-specific output
    error: str = ""
    duration_ms: int = 0


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------


class ValidationIssue(BaseModel):
    """A single problem found during output validation."""

    severity: str = "warning"  # "error" | "warning" | "info"
    category: str = ""  # e.g. "missing_component", "ambiguous_input"
    message: str = ""
    suggestion: str = ""  # what the agent should do to fix it


class ValidationResult(BaseModel):
    """Output of the validate_output tool."""

    passed: bool = False
    coverage_score: float = 0.0  # 0.0–1.0, how well the output covers the input
    issues: list[ValidationIssue] = []


# ---------------------------------------------------------------------------
# Agent state
# ---------------------------------------------------------------------------


class AgentPhase(StrEnum):
    """High-level phase the agent is in."""

    UNDERSTANDING = "understanding"
    PLANNING = "planning"
    GENERATING = "generating"
    VALIDATING = "validating"
    COMPLETE = "complete"
    FAILED = "failed"


class ReasoningStep(BaseModel):
    """One step in the agent's reasoning trace."""

    step_number: int
    phase: AgentPhase
    thought: str  # the agent's internal reasoning
    tool_call: ToolCall | None = None
    tool_result: ToolResult | None = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class AgentState(BaseModel):
    """Full mutable state of an agent run."""

    # Identity
    run_id: str = ""
    goal: str = ""

    # Phase tracking
    phase: AgentPhase = AgentPhase.UNDERSTANDING
    max_iterations: int = 10
    current_iteration: int = 0

    # Accumulated data (tools write here, later tools read from here)
    parsed: ParsedContent | None = None
    context: DesignContext | None = None
    prompt: str = ""
    figma_url: str = ""
    html_url: str = ""

    # Validation
    validation: ValidationResult | None = None
    revision_count: int = 0
    max_revisions: int = 3

    # Reasoning trace (full log of what the agent did and why)
    trace: list[ReasoningStep] = []

    # Clarification (if the agent needs to ask the user something)
    needs_clarification: bool = False
    clarification_question: str = ""

    # Flags
    is_complete: bool = False
    is_failed: bool = False
    failure_reason: str = ""

    # Consecutive failure tracking per tool
    _consecutive_failures: dict[str, int] = {}
    max_tool_retries: int = 2
