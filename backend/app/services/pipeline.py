"""Design generation pipeline — now agent-driven.

The old fixed pipeline (parse → context → prompt → figma → html) is
replaced by an autonomous reasoning loop.  The agent decides what to
do next based on what it observes, can self-correct, and asks for
clarification when the input is ambiguous.

This module is a thin adapter between the router and the agent.
"""

import logging

from fastapi import UploadFile

from app.models.requests import InputType
from app.models.responses import (
    DesignResponse,
    ReasoningStepSummary,
    ValidationSummary,
)
from app.services.reasoning import run_agent

logger = logging.getLogger(__name__)


async def run_design_pipeline(
    input_type: InputType,
    text: str | None = None,
    file: UploadFile | None = None,
) -> DesignResponse:
    """Run the agent and translate its final state into a response."""

    state = await run_agent(input_type=input_type, text=text, file=file)

    # Build reasoning trace for the response
    trace = [
        ReasoningStepSummary(
            step=s.step_number,
            phase=s.phase,
            thought=s.thought,
            tool=s.tool_call.tool if s.tool_call else None,
            success=s.tool_result.success if s.tool_result else None,
            duration_ms=s.tool_result.duration_ms if s.tool_result else 0,
        )
        for s in state.trace
    ]

    # Build validation summary
    validation = None
    if state.validation:
        validation = ValidationSummary(
            passed=state.validation.passed,
            coverage_score=state.validation.coverage_score,
            issue_count=len(state.validation.issues),
            issues=[i.model_dump() for i in state.validation.issues],
        )

    # Agent needs clarification — return the question
    if state.needs_clarification:
        return DesignResponse(
            figma_url="",
            html_url="",
            message=state.clarification_question,
            agent_run_id=state.run_id,
            iterations=state.current_iteration,
            reasoning_trace=trace,
            validation=validation,
        )

    # Agent failed
    if state.is_failed:
        return DesignResponse(
            figma_url="",
            html_url="",
            message=f"Generation failed: {state.failure_reason}",
            agent_run_id=state.run_id,
            iterations=state.current_iteration,
            reasoning_trace=trace,
            validation=validation,
        )

    # Success
    message = "Design generated successfully."
    if state.validation and not state.validation.passed:
        issue_count = len(state.validation.issues)
        message = (
            f"Design generated with {issue_count} validation note(s). "
            f"Coverage: {state.validation.coverage_score:.0%}."
        )

    return DesignResponse(
        figma_url=state.figma_url,
        html_url=state.html_url,
        message=message,
        agent_run_id=state.run_id,
        iterations=state.current_iteration,
        reasoning_trace=trace,
        validation=validation,
    )
