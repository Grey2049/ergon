"""Reasoning engine — the agent's brain.

This module implements a ReAct-style reasoning loop.  Instead of a
fixed step sequence, the agent:

  1. Observes the current state
  2. Thinks about what to do next (using the LLM or heuristic rules)
  3. Picks a tool to call
  4. Executes the tool
  5. Observes the result
  6. Repeats until the goal is met or it gives up

The reasoning can be driven by:
  - **Heuristic mode** (default): rule-based decisions that are fast,
    deterministic, and don't require an LLM call per step.  Good for
    the common path.
  - **LLM mode** (future): for ambiguous inputs or when self-correction
    is needed, the agent calls Gemini to decide the next step.

The key difference from the old pipeline: the agent can skip steps,
repeat steps, go backwards, and ask for help — it's not locked into
a linear sequence.
"""

import logging
import uuid

from fastapi import UploadFile

from app.models.agent import (
    AgentState,
    AgentPhase,
    ReasoningStep,
    ToolCall,
    ToolName,
)
from app.models.requests import InputType
from app.services.tools import execute_tool

logger = logging.getLogger(__name__)


async def run_agent(
    input_type: InputType,
    text: str | None = None,
    file: UploadFile | None = None,
) -> AgentState:
    """Execute the agent reasoning loop and return the final state.

    This is the main entry point — replaces ``run_design_pipeline``.
    """
    state = AgentState(
        run_id=uuid.uuid4().hex[:12],
        goal=f"Generate a design from {input_type} input",
    )

    logger.info("[Agent %s] Starting — goal: %s", state.run_id, state.goal)

    while not state.is_complete and not state.is_failed:
        state.current_iteration += 1

        if state.current_iteration > state.max_iterations:
            state.is_failed = True
            state.failure_reason = f"Exceeded max iterations ({state.max_iterations})"
            state.phase = AgentPhase.FAILED
            logger.warning("[Agent %s] Max iterations exceeded", state.run_id)
            break

        # --- THINK: decide what to do next ---
        thought, tool_call = _decide_next_action(state)

        if tool_call is None:
            # Agent decided it's done (or stuck)
            step = ReasoningStep(
                step_number=state.current_iteration,
                phase=state.phase,
                thought=thought,
            )
            state.trace.append(step)
            break

        logger.info(
            "[Agent %s] Step %d: %s → %s",
            state.run_id,
            state.current_iteration,
            state.phase,
            tool_call.tool,
        )

        # --- ACT: execute the chosen tool ---
        result = await execute_tool(
            call=tool_call,
            state=state,
            input_type=input_type,
            text=text,
            file=file,
        )

        # --- OBSERVE: record what happened ---
        step = ReasoningStep(
            step_number=state.current_iteration,
            phase=state.phase,
            thought=thought,
            tool_call=tool_call,
            tool_result=result,
        )
        state.trace.append(step)

        if not result.success:
            logger.warning(
                "[Agent %s] Tool %s failed: %s",
                state.run_id,
                tool_call.tool,
                result.error,
            )

        # --- REFLECT: update phase based on result ---
        _update_phase(state, result)

        # Track consecutive failures per tool
        if not result.success:
            state._consecutive_failures[tool_call.tool] = (
                state._consecutive_failures.get(tool_call.tool, 0) + 1
            )
            if state._consecutive_failures[tool_call.tool] >= state.max_tool_retries:
                state.is_failed = True
                state.failure_reason = f"Tool '{tool_call.tool}' failed {state.max_tool_retries} times consecutively: {result.error}"
                state.phase = AgentPhase.FAILED
                logger.warning(
                    "[Agent %s] Tool %s exceeded max retries — failing",
                    state.run_id,
                    tool_call.tool,
                )
                break
        else:
            # Reset failure counter on success
            state._consecutive_failures[tool_call.tool] = 0

        # Check if agent needs clarification (pause the loop)
        if state.needs_clarification:
            logger.info("[Agent %s] Needs clarification — pausing", state.run_id)
            break

    logger.info(
        "[Agent %s] Finished — phase=%s, iterations=%d, complete=%s",
        state.run_id,
        state.phase,
        state.current_iteration,
        state.is_complete,
    )
    return state


# ---------------------------------------------------------------------------
# Decision logic (heuristic mode)
# ---------------------------------------------------------------------------


def _decide_next_action(state: AgentState) -> tuple[str, ToolCall | None]:
    """Examine the current state and decide the next tool to call.

    Returns (thought, tool_call) — thought is the reasoning, tool_call
    is what to execute (or None if done/stuck).

    This is the heuristic decision engine.  Each branch checks what
    data is available and what's missing, then picks the appropriate
    tool.  The key difference from a pipeline: the agent can jump to
    any tool based on state, not just the "next" one.
    """

    # --- UNDERSTANDING PHASE ---
    if state.phase == AgentPhase.UNDERSTANDING:
        if state.parsed is None:
            return (
                "I need to parse the raw input first to understand what the user wants.",
                ToolCall(tool=ToolName.PARSE_INPUT, reasoning="No parsed content yet"),
            )

        # Check if input is too vague to proceed
        has_text = bool(
            state.parsed.raw_text and len(state.parsed.raw_text.strip()) >= 10
        )
        has_file = bool(state.parsed.source_cdn_url)
        has_elements = len(state.parsed.elements) > 0

        if not has_text and not has_file and not has_elements:
            return (
                "The input is too vague — I can't determine what to build. I should ask for clarification.",
                ToolCall(
                    tool=ToolName.CLARIFY_INPUT,
                    reasoning="Input has no meaningful text, file, or elements",
                    arguments={
                        "question": "I couldn't extract enough detail from your input. Could you describe what kind of page or screen you'd like to build? For example: 'A dashboard with user metrics and a data table'."
                    },
                ),
            )

        if state.context is None:
            return (
                "Input is parsed. Now I need to analyze the intent — what page type, what keywords.",
                ToolCall(
                    tool=ToolName.ANALYZE_INTENT,
                    reasoning="Parsed content available, need intent analysis",
                ),
            )

        # Understanding complete, move to planning
        state.phase = AgentPhase.PLANNING
        return _decide_next_action(state)  # re-enter with new phase

    # --- PLANNING PHASE ---
    if state.phase == AgentPhase.PLANNING:
        # Check if match_components was already attempted
        match_attempted = any(
            s.tool_call and s.tool_call.tool == ToolName.MATCH_COMPONENTS
            for s in state.trace
        )

        if not match_attempted:
            return (
                f"Page type is '{state.context.page_type}'. Now I need to find the right components from the library.",
                ToolCall(
                    tool=ToolName.MATCH_COMPONENTS,
                    reasoning="Intent analyzed, need component matching",
                ),
            )

        # match_components ran but found nothing — ask for clarification
        if not state.context.matched_components:
            return (
                "Component matching returned no results — the input doesn't map to any known components. Asking for clarification.",
                ToolCall(
                    tool=ToolName.CLARIFY_INPUT,
                    reasoning="Zero components matched — input is too vague or unrelated to the library",
                    arguments={
                        "question": (
                            "I couldn't match your input to any components in the design library. "
                            "Could you describe the page more specifically? For example: "
                            "'A dashboard with stat cards and a data table' or "
                            "'A login form with email and password fields'."
                        )
                    },
                ),
            )

        if not state.prompt:
            return (
                f"Matched {len(state.context.matched_components)} components. Building the layout and prompt.",
                ToolCall(
                    tool=ToolName.BUILD_LAYOUT,
                    reasoning="Components matched, need layout + prompt",
                ),
            )

        # Planning complete, move to generating
        state.phase = AgentPhase.GENERATING
        return _decide_next_action(state)

    # --- GENERATING PHASE ---
    if state.phase == AgentPhase.GENERATING:
        if not state.figma_url:
            return (
                "Prompt is ready. Generating the Figma design.",
                ToolCall(
                    tool=ToolName.GENERATE_FIGMA,
                    reasoning="Prompt built, ready to generate",
                ),
            )

        if not state.html_url:
            return (
                "Figma design created. Now exporting the HTML wireframe.",
                ToolCall(
                    tool=ToolName.EXPORT_HTML,
                    reasoning="Figma URL available, need HTML export",
                ),
            )

        # Generation complete, move to validation
        state.phase = AgentPhase.VALIDATING
        return _decide_next_action(state)

    # --- VALIDATING PHASE ---
    if state.phase == AgentPhase.VALIDATING:
        if state.validation is None:
            return (
                "Both outputs are ready. Let me validate the result against the original input.",
                ToolCall(
                    tool=ToolName.VALIDATE_OUTPUT,
                    reasoning="Outputs generated, need validation",
                ),
            )

        # Validation ran — check results
        return _handle_validation_result(state)

    # --- COMPLETE ---
    if state.phase == AgentPhase.COMPLETE:
        state.is_complete = True
        return (
            "Goal achieved. Both Figma URL and HTML export are ready and validated.",
            None,
        )

    # --- FAILED ---
    if state.phase == AgentPhase.FAILED:
        state.is_failed = True
        return (f"Agent failed: {state.failure_reason}", None)

    return ("Unexpected state — stopping.", None)


def _handle_validation_result(state: AgentState) -> tuple[str, ToolCall | None]:
    """Decide what to do after validation.

    This is where self-correction happens.  If validation failed, the
    agent doesn't just report the error — it figures out which specific
    tool to re-run to fix the problem.
    """
    v = state.validation
    if v.passed:
        state.phase = AgentPhase.COMPLETE
        return (
            f"Validation passed (coverage: {v.coverage_score:.0%}). Design is ready.",
            None,
        )

    # Validation failed — can we self-correct?
    if state.revision_count >= state.max_revisions:
        # We've tried enough — deliver what we have with a warning
        state.phase = AgentPhase.COMPLETE
        return (
            f"Validation has issues but max revisions ({state.max_revisions}) reached. "
            f"Delivering current output with {len(v.issues)} known issues.",
            None,
        )

    state.revision_count += 1
    state.validation = None  # clear so we re-validate after fix

    # Analyze the issues and pick the right corrective action
    error_categories = {i.category for i in v.issues if i.severity == "error"}

    if "missing_output" in error_categories:
        # Something didn't generate — go back to generating phase
        state.phase = AgentPhase.GENERATING
        if not state.figma_url:
            return (
                "Figma URL is missing. Re-running generation.",
                ToolCall(
                    tool=ToolName.GENERATE_FIGMA,
                    reasoning="Validation found missing Figma output",
                ),
            )
        if not state.html_url:
            return (
                "HTML export is missing. Re-running export.",
                ToolCall(
                    tool=ToolName.EXPORT_HTML,
                    reasoning="Validation found missing HTML output",
                ),
            )

    if "low_coverage" in error_categories or "no_components" in error_categories:
        # Components don't cover the input well — refine
        state.phase = AgentPhase.PLANNING
        # Extract uncovered elements to use as extra keywords
        uncovered = _find_uncovered_elements(state)
        return (
            f"Component coverage is too low ({v.coverage_score:.0%}). "
            f"Refining component selection with extra keywords: {uncovered}",
            ToolCall(
                tool=ToolName.REFINE_COMPONENTS,
                reasoning=f"Low coverage — adding keywords for uncovered elements",
                arguments={"extra_keywords": uncovered},
            ),
        )

    if "sparse_input" in {i.category for i in v.issues}:
        return (
            "Input is sparse — asking the user for more detail.",
            ToolCall(
                tool=ToolName.CLARIFY_INPUT,
                reasoning="Validation flagged sparse input",
                arguments={
                    "question": "Your input was quite brief. Could you add more detail about the sections, components, or functionality you'd like in the design?"
                },
            ),
        )

    # Generic fallback: try refining components
    state.phase = AgentPhase.PLANNING
    return (
        f"Validation found {len(v.issues)} issues. Attempting to refine components.",
        ToolCall(
            tool=ToolName.REFINE_COMPONENTS,
            reasoning="Generic validation failure — trying broader component match",
            arguments={
                "extra_keywords": state.parsed.elements[:5] if state.parsed else []
            },
        ),
    )


def _find_uncovered_elements(state: AgentState) -> list[str]:
    """Return elements from the input that aren't covered by any matched component."""
    if not state.parsed or not state.context:
        return []

    covered_words = set()
    for mc in state.context.matched_components:
        comp = mc.component
        covered_words.update(t.lower() for t in comp.tags)
        covered_words.update(comp.name.lower().split())

    uncovered = []
    for elem in state.parsed.elements:
        elem_words = set(elem.lower().split())
        if not elem_words & covered_words:
            uncovered.append(elem)

    return uncovered[:10]


def _update_phase(state: AgentState, result) -> None:
    """Update the agent phase based on tool execution results.

    Most phase transitions happen in _decide_next_action, but some
    tool failures need immediate phase changes.
    """
    if not result.success and result.tool == ToolName.PARSE_INPUT:
        state.is_failed = True
        state.failure_reason = f"Failed to parse input: {result.error}"
        state.phase = AgentPhase.FAILED
