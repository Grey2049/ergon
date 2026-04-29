"""Streaming design pipeline — yields SSE events as the agent works.

Each event is a dict with an ``event`` key (the SSE event type) and
data fields.  The frontend consumes these via EventSource / fetch.
"""

import logging
import uuid
from typing import AsyncGenerator

from fastapi import UploadFile

from app.models.agent import (
    AgentState,
    AgentPhase,
    ReasoningStep,
    ToolCall,
    ToolName,
)
from app.models.requests import InputType
from app.services.reasoning import _decide_next_action, _update_phase
from app.services.tools import execute_tool

logger = logging.getLogger(__name__)


async def run_design_pipeline_stream(
    input_type: InputType,
    text: str | None = None,
    file: UploadFile | None = None,
) -> AsyncGenerator[dict, None]:
    """Run the agent and yield SSE events for each step."""

    state = AgentState(
        run_id=uuid.uuid4().hex[:12],
        goal=f"Generate a design from {input_type} input",
    )

    # ── Start event ──
    yield {
        "event": "agent:start",
        "run_id": state.run_id,
        "goal": state.goal,
        "phase": state.phase,
    }

    while not state.is_complete and not state.is_failed:
        state.current_iteration += 1

        if state.current_iteration > state.max_iterations:
            state.is_failed = True
            state.failure_reason = f"Exceeded max iterations ({state.max_iterations})"
            state.phase = AgentPhase.FAILED
            yield {
                "event": "agent:error",
                "run_id": state.run_id,
                "error": state.failure_reason,
                "iteration": state.current_iteration,
            }
            break

        # ── Think ──
        thought, tool_call = _decide_next_action(state)

        if tool_call is None:
            step = ReasoningStep(
                step_number=state.current_iteration,
                phase=state.phase,
                thought=thought,
            )
            state.trace.append(step)

            yield {
                "event": "agent:step",
                "run_id": state.run_id,
                "step": state.current_iteration,
                "phase": state.phase,
                "thought": thought,
                "tool": None,
                "success": None,
                "duration_ms": 0,
                "data": {},
            }
            break

        # ── Emit "thinking" event before execution ──
        yield {
            "event": "agent:step",
            "run_id": state.run_id,
            "step": state.current_iteration,
            "phase": state.phase,
            "thought": thought,
            "tool": tool_call.tool,
            "status": "running",
            "data": {},
        }

        # ── Act ──
        result = await execute_tool(
            call=tool_call,
            state=state,
            input_type=input_type,
            text=text,
            file=file,
        )

        # ── Record ──
        step = ReasoningStep(
            step_number=state.current_iteration,
            phase=state.phase,
            thought=thought,
            tool_call=tool_call,
            tool_result=result,
        )
        state.trace.append(step)

        # ── Emit completed step event ──
        yield {
            "event": "agent:step",
            "run_id": state.run_id,
            "step": state.current_iteration,
            "phase": state.phase,
            "thought": thought,
            "tool": tool_call.tool,
            "status": "done",
            "success": result.success,
            "duration_ms": result.duration_ms,
            "error": result.error if not result.success else "",
            "data": result.data,
        }

        # ── Reflect ──
        old_phase = state.phase
        _update_phase(state, result)

        # Track consecutive failures
        if not result.success:
            state._consecutive_failures[tool_call.tool] = (
                state._consecutive_failures.get(tool_call.tool, 0) + 1
            )
            if state._consecutive_failures[tool_call.tool] >= state.max_tool_retries:
                state.is_failed = True
                state.failure_reason = (
                    f"Tool '{tool_call.tool}' failed {state.max_tool_retries} "
                    f"times: {result.error}"
                )
                state.phase = AgentPhase.FAILED
                yield {
                    "event": "agent:error",
                    "run_id": state.run_id,
                    "error": state.failure_reason,
                    "iteration": state.current_iteration,
                }
                break
        else:
            state._consecutive_failures[tool_call.tool] = 0

        # Emit phase change if it happened
        if state.phase != old_phase:
            yield {
                "event": "agent:phase",
                "run_id": state.run_id,
                "from_phase": old_phase,
                "to_phase": state.phase,
                "iteration": state.current_iteration,
            }

        # Clarification needed
        if state.needs_clarification:
            yield {
                "event": "agent:clarify",
                "run_id": state.run_id,
                "question": state.clarification_question,
                "iteration": state.current_iteration,
            }
            break

    # ── Final result event ──
    validation = None
    if state.validation:
        validation = {
            "passed": state.validation.passed,
            "coverage_score": state.validation.coverage_score,
            "issue_count": len(state.validation.issues),
            "issues": [i.model_dump() for i in state.validation.issues],
        }

    message = "Design generated successfully."
    if state.needs_clarification:
        message = state.clarification_question
    elif state.is_failed:
        message = f"Generation failed: {state.failure_reason}"
    elif state.validation and not state.validation.passed:
        message = (
            f"Design generated with {len(state.validation.issues)} validation note(s). "
            f"Coverage: {state.validation.coverage_score:.0%}."
        )

    yield {
        "event": "agent:result",
        "run_id": state.run_id,
        "figma_url": state.figma_url,
        "html_url": state.html_url,
        "message": message,
        "iterations": state.current_iteration,
        "phase": state.phase,
        "is_complete": state.is_complete or state.phase == AgentPhase.COMPLETE,
        "is_failed": state.is_failed,
        "needs_clarification": state.needs_clarification,
        "validation": validation,
    }
