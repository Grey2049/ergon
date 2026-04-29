"""Agent tools — wraps each capability as a callable function.

Each tool:
  - Reads what it needs from ``AgentState``
  - Does its work
  - Writes results back to ``AgentState``
  - Returns a ``ToolResult``

The agent loop calls these through ``execute_tool()``.
"""

import logging
import time

from fastapi import UploadFile

from app.models.agent import (
    AgentState,
    ToolName,
    ToolCall,
    ToolResult,
    ValidationResult,
    ValidationIssue,
)
from app.models.requests import InputType
from app.models.parsed_data import ParsedContent
from app.models.component import DesignContext, MatchedComponent
from app.services.parser import parse_input
from app.services.context_builder import (
    _extract_keywords,
    _detect_page_type,
    _match_components,
    _build_intent_summary,
)
from app.services.context_builder import _LAYOUT_SUGGESTIONS
from app.services.prompt_formatter import format_figma_prompt
from app.services.figma_service import generate_figma_design
from app.services.html_service import extract_html

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Tool dispatcher
# ---------------------------------------------------------------------------


async def execute_tool(
    call: ToolCall,
    state: AgentState,
    input_type: InputType | None = None,
    text: str | None = None,
    file: UploadFile | None = None,
) -> ToolResult:
    """Route a ToolCall to the correct handler and return the result."""
    start = time.monotonic()

    handlers = {
        ToolName.PARSE_INPUT: _tool_parse_input,
        ToolName.ANALYZE_INTENT: _tool_analyze_intent,
        ToolName.MATCH_COMPONENTS: _tool_match_components,
        ToolName.BUILD_LAYOUT: _tool_build_layout,
        ToolName.GENERATE_FIGMA: _tool_generate_figma,
        ToolName.EXPORT_HTML: _tool_export_html,
        ToolName.VALIDATE_OUTPUT: _tool_validate_output,
        ToolName.CLARIFY_INPUT: _tool_clarify_input,
        ToolName.REFINE_COMPONENTS: _tool_refine_components,
        ToolName.REVISE_LAYOUT: _tool_revise_layout,
    }

    handler = handlers.get(call.tool)
    if not handler:
        return ToolResult(
            tool=call.tool, success=False, error=f"Unknown tool: {call.tool}"
        )

    try:
        result = await handler(state, call.arguments, input_type, text, file)
        result.duration_ms = int((time.monotonic() - start) * 1000)
        return result
    except Exception as e:
        logger.exception("Tool %s failed", call.tool)
        return ToolResult(
            tool=call.tool,
            success=False,
            error=str(e),
            duration_ms=int((time.monotonic() - start) * 1000),
        )


# ---------------------------------------------------------------------------
# Individual tool implementations
# ---------------------------------------------------------------------------


async def _tool_parse_input(
    state: AgentState,
    args: dict,
    input_type: InputType | None,
    text: str | None,
    file: UploadFile | None,
) -> ToolResult:
    """Parse raw input into structured ParsedContent."""
    if not input_type:
        return ToolResult(
            tool=ToolName.PARSE_INPUT, success=False, error="No input_type provided"
        )

    parsed = await parse_input(input_type=input_type, text=text, file=file)
    state.parsed = parsed

    return ToolResult(
        tool=ToolName.PARSE_INPUT,
        success=True,
        data={
            "title": parsed.title,
            "elements_count": len(parsed.elements),
            "has_raw_text": bool(parsed.raw_text),
            "has_source_file": bool(parsed.source_cdn_url),
        },
    )


async def _tool_analyze_intent(state: AgentState, args: dict, *_unused) -> ToolResult:
    """Extract keywords and detect page type from parsed content."""
    if not state.parsed:
        return ToolResult(
            tool=ToolName.ANALYZE_INTENT,
            success=False,
            error="No parsed content — run parse_input first",
        )

    keywords = _extract_keywords(state.parsed)
    page_type = _detect_page_type(keywords)
    intent = _build_intent_summary(state.parsed, page_type)

    # Store partial context (components not matched yet)
    state.context = DesignContext(
        intent_summary=intent,
        page_type=page_type,
        raw_elements=state.parsed.elements,
    )

    return ToolResult(
        tool=ToolName.ANALYZE_INTENT,
        success=True,
        data={
            "page_type": page_type,
            "keywords": keywords[:15],
            "intent_summary": intent,
            "element_count": len(state.parsed.elements),
        },
    )


async def _tool_match_components(state: AgentState, args: dict, *_unused) -> ToolResult:
    """Match components from the registry based on intent analysis."""
    if not state.context or not state.parsed:
        return ToolResult(
            tool=ToolName.MATCH_COMPONENTS,
            success=False,
            error="No context — run analyze_intent first",
        )

    keywords = _extract_keywords(state.parsed)
    matched = _match_components(keywords, state.context.page_type)
    state.context.matched_components = matched

    return ToolResult(
        tool=ToolName.MATCH_COMPONENTS,
        success=True,
        data={
            "matched_count": len(matched),
            "components": [
                {
                    "id": mc.component.id,
                    "name": mc.component.name,
                    "relevance": mc.relevance,
                }
                for mc in matched
            ],
        },
    )


async def _tool_build_layout(state: AgentState, args: dict, *_unused) -> ToolResult:
    """Determine layout and build the enriched prompt."""
    if not state.context:
        return ToolResult(
            tool=ToolName.BUILD_LAYOUT,
            success=False,
            error="No context — run match_components first",
        )

    layout = _LAYOUT_SUGGESTIONS.get(
        state.context.page_type, "responsive single-column layout"
    )
    # Allow override from args (agent might revise the layout)
    layout = args.get("layout_override", layout)
    state.context.layout_suggestion = layout

    prompt = format_figma_prompt(state.context)
    state.prompt = prompt

    return ToolResult(
        tool=ToolName.BUILD_LAYOUT,
        success=True,
        data={
            "layout": layout,
            "prompt_length": len(prompt),
            "component_count": len(state.context.matched_components),
        },
    )


async def _tool_generate_figma(state: AgentState, args: dict, *_unused) -> ToolResult:
    """Generate the Figma design using the enriched prompt."""
    if not state.parsed or not state.context or not state.prompt:
        return ToolResult(
            tool=ToolName.GENERATE_FIGMA,
            success=False,
            error="Missing parsed/context/prompt — run earlier steps first",
        )

    figma_url = await generate_figma_design(state.parsed, state.context, state.prompt)
    state.figma_url = figma_url

    return ToolResult(
        tool=ToolName.GENERATE_FIGMA,
        success=True,
        data={"figma_url": figma_url},
    )


async def _tool_export_html(state: AgentState, args: dict, *_unused) -> ToolResult:
    """Export the design as an HTML wireframe."""
    if not state.parsed or not state.context or not state.figma_url:
        return ToolResult(
            tool=ToolName.EXPORT_HTML,
            success=False,
            error="Missing figma_url — run generate_figma first",
        )

    html_url = await extract_html(
        figma_url=state.figma_url, parsed=state.parsed, context=state.context
    )
    state.html_url = html_url

    return ToolResult(
        tool=ToolName.EXPORT_HTML,
        success=True,
        data={"html_url": html_url},
    )


async def _tool_validate_output(state: AgentState, args: dict, *_unused) -> ToolResult:
    """Validate the generated output against the original input.

    Checks:
      1. Do we have both URLs?
      2. Does the component selection cover the requested elements?
      3. Is the page type reasonable for the input?
      4. Are there enough components for a meaningful wireframe?
    """
    issues: list[ValidationIssue] = []

    # Check 1: URLs present
    if not state.figma_url:
        issues.append(
            ValidationIssue(
                severity="error",
                category="missing_output",
                message="Figma URL was not generated.",
                suggestion="Re-run generate_figma tool.",
            )
        )
    if not state.html_url:
        issues.append(
            ValidationIssue(
                severity="error",
                category="missing_output",
                message="HTML URL was not generated.",
                suggestion="Re-run export_html tool.",
            )
        )

    # Check 2: Element coverage
    coverage = _compute_element_coverage(state)
    if coverage < 0.3:
        issues.append(
            ValidationIssue(
                severity="error",
                category="low_coverage",
                message=f"Only {coverage:.0%} of requested elements are covered by matched components.",
                suggestion="Run refine_components to find better matches for uncovered elements.",
            )
        )
    elif coverage < 0.6:
        issues.append(
            ValidationIssue(
                severity="warning",
                category="partial_coverage",
                message=f"Element coverage is {coverage:.0%} — some requested elements may be missing.",
                suggestion="Consider running refine_components to improve coverage.",
            )
        )

    # Check 3: Component count
    comp_count = len(state.context.matched_components) if state.context else 0
    if comp_count == 0:
        issues.append(
            ValidationIssue(
                severity="error",
                category="no_components",
                message="No components were matched from the library.",
                suggestion="The input may be too vague. Run clarify_input or refine_components.",
            )
        )
    elif comp_count < 3:
        issues.append(
            ValidationIssue(
                severity="warning",
                category="few_components",
                message=f"Only {comp_count} components matched — wireframe may be sparse.",
                suggestion="Run refine_components with broader keywords.",
            )
        )

    # Check 4: Input quality
    if (
        state.parsed
        and len(state.parsed.raw_text.strip()) < 20
        and not state.parsed.source_cdn_url
    ):
        issues.append(
            ValidationIssue(
                severity="warning",
                category="sparse_input",
                message="Input text is very short — the agent may have made assumptions.",
                suggestion="Run clarify_input to ask the user for more detail.",
            )
        )

    has_errors = any(i.severity == "error" for i in issues)
    passed = not has_errors

    validation = ValidationResult(
        passed=passed,
        coverage_score=coverage,
        issues=issues,
    )
    state.validation = validation

    return ToolResult(
        tool=ToolName.VALIDATE_OUTPUT,
        success=True,
        data={
            "passed": passed,
            "coverage_score": coverage,
            "issue_count": len(issues),
            "error_count": sum(1 for i in issues if i.severity == "error"),
            "issues": [i.model_dump() for i in issues],
        },
    )


def _compute_element_coverage(state: AgentState) -> float:
    """What fraction of requested elements are covered by matched components?"""
    if not state.parsed or not state.context:
        return 0.0

    requested = set(e.lower() for e in state.parsed.elements)
    if not requested:
        # No explicit elements requested — consider it covered
        return 1.0

    covered = set()
    for mc in state.context.matched_components:
        comp = mc.component
        comp_words = set(
            w.lower()
            for w in comp.tags
            + comp.name.lower().split()
            + comp.description.lower().split()
        )
        for elem in requested:
            elem_words = set(elem.lower().split())
            if elem_words & comp_words:
                covered.add(elem)

    return len(covered) / len(requested) if requested else 1.0


async def _tool_clarify_input(state: AgentState, args: dict, *_unused) -> ToolResult:
    """Signal that the agent needs clarification from the user.

    The agent sets a question; the API returns it to the caller.
    """
    question = args.get(
        "question", "Could you provide more detail about what you'd like to build?"
    )
    state.needs_clarification = True
    state.clarification_question = question

    return ToolResult(
        tool=ToolName.CLARIFY_INPUT,
        success=True,
        data={"question": question},
    )


async def _tool_refine_components(
    state: AgentState, args: dict, *_unused
) -> ToolResult:
    """Re-run component matching with adjusted keywords.

    The agent can pass extra keywords or exclude specific components
    to improve coverage.
    """
    if not state.parsed or not state.context:
        return ToolResult(
            tool=ToolName.REFINE_COMPONENTS, success=False, error="No context to refine"
        )

    extra_keywords = args.get("extra_keywords", [])
    exclude_ids = set(args.get("exclude_ids", []))

    keywords = _extract_keywords(state.parsed) + extra_keywords
    matched = _match_components(keywords, state.context.page_type)

    # Filter out excluded
    matched = [mc for mc in matched if mc.component.id not in exclude_ids]
    state.context.matched_components = matched

    # Rebuild prompt
    prompt = format_figma_prompt(state.context)
    state.prompt = prompt

    return ToolResult(
        tool=ToolName.REFINE_COMPONENTS,
        success=True,
        data={
            "matched_count": len(matched),
            "extra_keywords_used": extra_keywords,
            "excluded": list(exclude_ids),
            "prompt_length": len(prompt),
        },
    )


async def _tool_revise_layout(state: AgentState, args: dict, *_unused) -> ToolResult:
    """Change the layout suggestion and rebuild the prompt."""
    if not state.context:
        return ToolResult(
            tool=ToolName.REVISE_LAYOUT, success=False, error="No context to revise"
        )

    new_layout = args.get("layout", "")
    if not new_layout:
        return ToolResult(
            tool=ToolName.REVISE_LAYOUT,
            success=False,
            error="No layout provided in arguments",
        )

    state.context.layout_suggestion = new_layout
    prompt = format_figma_prompt(state.context)
    state.prompt = prompt

    return ToolResult(
        tool=ToolName.REVISE_LAYOUT,
        success=True,
        data={"layout": new_layout, "prompt_length": len(prompt)},
    )
