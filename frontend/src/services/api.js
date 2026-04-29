/**
 * Backend API client for the Ergon design agent.
 *
 * The API base URL is controlled by the VITE_API_BASE_URL env var.
 * - In dev with Vite proxy:  leave empty or set to "" (default)
 * - Direct backend call:     set to "http://localhost:8007"
 * - Production:              set to "https://api.yoursite.com"
 *
 * Set it in frontend/.env or frontend/.env.local:
 *   VITE_API_BASE_URL=http://localhost:8007
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const API_PATH = "/api/v1";

function buildUrl(path) {
    return `${API_BASE_URL}${API_PATH}${path}`;
}

/**
 * Call the design generation agent (standard JSON response).
 */
export async function generateDesign({ inputType, text, file }) {
    const form = new FormData();
    form.append("input_type", inputType);
    if (text) form.append("text", text);
    if (file) form.append("file", file);

    const res = await fetch(buildUrl("/design/generate"), {
        method: "POST",
        body: form,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `API error ${res.status}`);
    }

    return res.json();
}

/**
 * Call the design generation agent with SSE streaming.
 *
 * Returns an object with:
 *   - onEvent(type, callback)  — register a handler for a specific event type
 *   - start()                  — begin the stream
 *   - abort()                  — cancel the stream
 *
 * Event types emitted by the backend:
 *   - "agent:start"   — { run_id, goal, phase }
 *   - "agent:step"    — { step, phase, thought, tool, status, success, data }
 *   - "agent:phase"   — { from_phase, to_phase }
 *   - "agent:result"  — { figma_url, html_url, message, validation, ... }
 *   - "agent:error"   — { error }
 *   - "agent:clarify" — { question }
 *
 * Usage:
 *   const stream = generateDesignStream({ inputType: "text", text: "..." });
 *   stream.onEvent("agent:step", (data) => console.log(data));
 *   stream.onEvent("agent:result", (data) => console.log(data));
 *   await stream.start();
 */
export function generateDesignStream({ inputType, text, file }) {
    const handlers = {};
    const controller = new AbortController();

    function onEvent(type, callback) {
        if (!handlers[type]) handlers[type] = [];
        handlers[type].push(callback);
    }

    function emit(type, data) {
        (handlers[type] || []).forEach((fn) => fn(data));
        (handlers["*"] || []).forEach((fn) => fn(type, data));
    }

    async function start() {
        const form = new FormData();
        form.append("input_type", inputType);
        if (text) form.append("text", text);
        if (file) form.append("file", file);

        const res = await fetch(buildUrl("/design/generate/stream"), {
            method: "POST",
            body: form,
            signal: controller.signal,
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: res.statusText }));
            emit("agent:error", { error: err.detail || `API error ${res.status}` });
            return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Parse SSE frames from the buffer
            const lines = buffer.split("\n");
            buffer = lines.pop(); // keep incomplete line in buffer

            let currentEvent = "message";
            for (const line of lines) {
                if (line.startsWith("event: ")) {
                    currentEvent = line.slice(7).trim();
                } else if (line.startsWith("data: ")) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        emit(currentEvent, data);
                    } catch {
                        // skip malformed JSON
                    }
                    currentEvent = "message";
                }
                // empty line = end of event (already handled by split)
            }
        }
    }

    function abort() {
        controller.abort();
    }

    return { onEvent, start, abort };
}

/**
 * Check backend health.
 */
export async function checkHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    return res.json();
}
