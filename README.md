# Ergon

**AI Agent for UI/UX System Design**

> Going from a PRD to a wireframe takes roughly 30 working hours of back-and-forth between PMs and designers, and existing AI tools like Figma Make produce generic output with no awareness of your design system — making the result unusable without significant manual rework.

Ergon is an autonomous AI design agent that takes text descriptions, PRD documents, or screenshots and produces Figma design URLs and HTML wireframes in seconds — using your own component library as context.

---

## System Design

<p align="center">
  <img src="docs/images/ergon-system-design.png" alt="Ergon System Design" width="100%" />
</p>

> Save the system design image to `docs/images/ergon-system-design.png`

[View interactive system design on Whimsical →](https://whimsical.com/affle44/ergon-4EA5hV4AxatzSih5848UW5)

---

## How It Works

Ergon is not a fixed pipeline. It's a **ReAct-style reasoning loop** where the AI decides what to do next based on what it observes:

```
User Input → THINK → ACT → OBSERVE → repeat until done
```

1. **User provides input** — text prompt, PRD document, or screenshot
2. **Agent parses input** — Gemini Vision for images, Gemini document analysis for PRDs, heuristic extraction for text
3. **Agent analyzes intent** — detects page type (dashboard, form, landing, etc.) and extracts keywords
4. **Agent matches components** — queries a 30-component DaisyUI catalog, scores and ranks matches with page-type boosts and complexity budgets
5. **Agent builds prompt** — structured prompt with component palette, layout directive, and constraints
6. **Agent generates Figma design** — calls Figma REST API, returns real design file URL
7. **Agent exports HTML** — renders wireframe, uploads to S3 CDN
8. **Agent validates output** — checks element coverage, component count, output completeness
9. **Agent self-corrects** — if validation fails, loops back to refine components or ask for clarification

The entire flow streams real-time SSE events to the frontend so the user sees each step as it happens.

---

## Agent Decision Points

What makes Ergon an agent instead of a pipeline:

| Situation | Agent Behavior |
|---|---|
| Vague or unclear input | Stops and asks a clarification question |
| Zero component matches | Asks for more specific description |
| Low validation coverage | Loops back to refine components with adjusted keywords |
| Tool failure | Retries once, then fails gracefully with error details |
| Clear, complete input | Goes straight through 8 steps in ~3 seconds |

---

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | React 18 · Vite · Tailwind CSS · DaisyUI |
| Backend | FastAPI · Python 3.12 · uv |
| AI | Google Gemini (gemini-2.5-flash) |
| Storage | AWS S3 (cdn.newtonco.ai) |
| Design | Figma REST API |
| Streaming | Server-Sent Events (SSE) |

---

## Project Structure

```
ergon/
├── backend/                  # FastAPI AI agent
│   ├── app/
│   │   ├── main.py           # App entry, CORS, lifespan
│   │   ├── config.py         # Env-based settings
│   │   ├── cli.py            # uv run start / uv run dev
│   │   ├── routers/
│   │   │   ├── design.py     # /generate + /generate/stream endpoints
│   │   │   └── components.py # Component catalog CRUD
│   │   ├── services/
│   │   │   ├── reasoning.py       # ReAct reasoning loop
│   │   │   ├── tools.py          # 10 callable agent tools
│   │   │   ├── pipeline.py       # JSON response adapter
│   │   │   ├── pipeline_stream.py # SSE streaming adapter
│   │   │   ├── parser.py         # Input parsing (text/image/file)
│   │   │   ├── context_builder.py # Intent analysis + component matching
│   │   │   ├── prompt_formatter.py # Structured prompt builder
│   │   │   ├── figma_service.py   # Figma API integration
│   │   │   ├── html_service.py    # HTML wireframe generator
│   │   │   └── component_registry.py # In-memory component catalog
│   │   ├── models/
│   │   │   ├── agent.py      # AgentState, tools, validation
│   │   │   ├── component.py  # DaisyUI component catalog models
│   │   │   ├── parsed_data.py
│   │   │   ├── requests.py
│   │   │   └── responses.py
│   │   └── helpers/
│   │       ├── cdn.py        # S3 upload/download + local fallback
│   │       ├── gemini.py     # Gemini Vision + document analysis
│   │       ├── text_utils.py # Heuristic UI element extraction
│   │       └── file_utils.py
│   ├── docs/
│   │   └── sample_catalog.json  # 30 DaisyUI components
│   ├── pyproject.toml
│   └── vercel.json
├── frontend/                 # React chat UI
│   ├── src/
│   │   ├── pages/AiChatPage.jsx  # AI chat with SSE streaming
│   │   ├── services/api.js       # API client (configurable base URL)
│   │   └── ...
│   ├── .env.example
│   ├── package.json
│   └── vercel.json
└── docs/
    ├── sample_prd.txt        # Example PRD for testing
    └── images/
```

---

## Quick Start

### Backend

```bash
cd backend
cp .env.example .env   # fill in your keys
uv sync
uv run start           # starts on PORT from .env
```

### Frontend

```bash
cd frontend
cp .env.example .env   # set VITE_API_BASE_URL if needed
npm install
npm run dev            # starts on localhost:5173
```

Open `http://localhost:5173/ai-chat` and try:

```
Build an analytics dashboard with sidebar navigation, stat cards showing
total users and revenue, a data table for recent orders, and a progress bar
```

Or upload `docs/sample_prd.txt` and type "Generate wireframe from this PRD".

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Server port |
| `ENVIRONMENT` | Yes | `dev` or `production` |
| `S3_BUCKET_NAME` | Yes | S3 bucket for file storage |
| `AWS_ACCESS_KEY` | Yes | AWS credentials |
| `AWS_SECRET_KEY` | Yes | AWS credentials |
| `AWS_REGION` | Yes | AWS region |
| `CDN_BASE_URL` | Yes | Public CDN URL prefix |
| `FIGMA_API_TOKEN` | Yes | Figma personal access token |
| `FIGMA_TEAM_ID` | Yes | Figma team ID |
| `GOOGLE_API_KEY` | Yes | Gemini API key for vision + doc analysis |
| `GOOGLE_MODEL` | No | Gemini model (default: `gemini-2.5-flash`) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | No | Backend URL. Empty = use Vite proxy (local dev) |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/design/generate` | Generate design (JSON response) |
| `POST` | `/api/v1/design/generate/stream` | Generate design (SSE stream) |
| `GET` | `/api/v1/components/` | List all components |
| `GET` | `/api/v1/components/search?q=...` | Search components |
| `POST` | `/api/v1/components/sync` | Reload catalog from S3 |
| `PUT` | `/api/v1/components/catalog` | Upload new catalog |
| `GET` | `/health` | Health check |

---

## SSE Event Stream

The `/generate/stream` endpoint returns real-time events:

```
agent:start   → { run_id, goal, phase }
agent:step    → { tool, status: "running" }
agent:step    → { tool, status: "done", success, duration_ms, data }
agent:phase   → { from_phase, to_phase }
agent:result  → { figma_url, html_url, message, validation }
agent:error   → { error }
agent:clarify → { question }
```

---

## Deploy to Vercel

```bash
# Backend
cd backend && vercel --prod
# Add env vars in Vercel dashboard, then redeploy

# Frontend
cd frontend && vercel --prod
# Set VITE_API_BASE_URL to your backend URL
```

---

## License

MIT
