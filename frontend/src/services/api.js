/**
 * Backend API client for the Ergon design agent.
 *
 * All calls go through the Vite proxy (/api → localhost:8007/api)
 * so no CORS issues in dev.
 */

const API_BASE = "/api/v1";

/**
 * Call the design generation agent.
 *
 * @param {Object} params
 * @param {string} params.inputType - "text" | "screenshot" | "file"
 * @param {string} [params.text] - text input (required for inputType=text)
 * @param {File}   [params.file] - file upload (required for screenshot/file)
 * @returns {Promise<Object>} DesignResponse from the backend
 */
export async function generateDesign({ inputType, text, file }) {
    const form = new FormData();
    form.append("input_type", inputType);
    if (text) form.append("text", text);
    if (file) form.append("file", file);

    const res = await fetch(`${API_BASE}/design/generate`, {
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
 * Check backend health.
 * @returns {Promise<Object>}
 */
export async function checkHealth() {
    const res = await fetch("/health");
    return res.json();
}
