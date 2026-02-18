# Multi-Agent Content Generator

Agentic outbound copilot that classifies intent, matches ICPs, selects channels, and generates tailored content — then exports directly to LinkedIn, Email, or a Call Queue. Built with FastAPI + SQLite on the backend and Vite/React on the frontend.

## How It Works

1. **Classification** — `ClassificationAgent` turns free-form context into structured intent metadata.
2. **ICP Match** — `ICPMatcherAgent` uses sentence-transformer embeddings + FAISS to find the closest ICP profile.
3. **Channel Decision** — `PlatformDecisionAgent` applies weighted scoring (urgency, ICP preference, objectives, engagement) to choose LinkedIn / Email / SMS / Call.
4. **Content Generation** — `ContentGeneratorAgent` prompts OpenRouter for JSON output (headline, body, CTA) with retries and platform-aware templates.
5. **Export** — Generated content can be pushed to LinkedIn (webhook), sent via Gmail SMTP, or added to a prioritised call queue — all persisted to SQLite.
6. **Dashboard** — Live stats on campaigns generated, exports by channel, and full agent pipeline history.

## Repo Layout

```
backend/
  app/
    agents/           # A1 ClassificationAgent, A2 ICPMatcher, A3 PlatformDecision, A4 ContentGenerator
    api/v1/
      generate.py     # POST /content/generate — full 4-agent pipeline
      export.py       # POST /export/{linkedin,email,call}
      dashboard.py    # GET  /dashboard/{stats,pipelines,activity}
      settings.py     # GET/PATCH /settings
    core/config.py    # Pydantic Settings (reads .env)
    database/models/  # User, AuditLog, Campaign, Export, CallQueue (SQLModel/SQLite)
    schemas/          # Pydantic request/response schemas
    services/         # export_service, dashboard_service, activity_service, classification, embeddings, …
    utils/            # AuditLogger
frontend/src/
  components/         # ExportMenu, DashboardStats, ActivityTable, PipelineHistory, SettingsForm, Toast
  pages/NewRequest    # Multi-agent generate form
  services/api.js     # contentApi, exportApi, dashboardApi, settingsApi
```

## Prerequisites

- Python 3.9+
- Node.js 18+
- OpenRouter API key
- HuggingFace API key (for embeddings)
- Gmail App Password if using email export (see below)

## Backend Setup

```powershell
cd backend
python -m venv venv
./venv/Scripts/activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_hex(32))">
OPENROUTER_API_KEY=your_openrouter_key
HUGGINGFACE_API_KEY=your_hf_key
DATABASE_URL=sqlite:///./data/sqlite.db

# Optional — Email export (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=you@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx   # 16-char App Password

# Optional — LinkedIn export
LINKEDIN_WEBHOOK_URL=https://hooks.zapier.com/...
```

> **Gmail note:** Regular account passwords are rejected by Gmail. Enable 2-Step Verification, then generate a 16-character App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).

Start the API — the SQLite database and all tables are created automatically on first run:

```powershell
uvicorn app.main:app --reload
```

## Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

The client points to `http://localhost:8000/api/v1`. To change this, edit `frontend/src/services/api.js`.

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/api/v1/content/generate` | Run full 4-agent pipeline |
| `POST` | `/api/v1/export/linkedin` | Export content to LinkedIn |
| `POST` | `/api/v1/export/email` | Send content via SMTP |
| `POST` | `/api/v1/export/call` | Add lead to call queue |
| `GET` | `/api/v1/dashboard/stats` | Campaign + export counts |
| `GET` | `/api/v1/dashboard/pipelines` | Agent run history |
| `GET` | `/api/v1/dashboard/activity` | Export log (filterable by channel) |
| `GET` | `/api/v1/settings` | Read current settings |
| `PATCH` | `/api/v1/settings` | Update settings in-memory |

Sample generate request:

```bash
curl -X POST http://localhost:8000/api/v1/content/generate \
  -H "Content-Type: application/json" \
  -d '{"context": "Reach out to AI startups about our new analytics tool"}'
```

Response shape:

```json
{
  "headline": "AI founders: scale your analytics",
  "body": "Short, platform-aware copy...",
  "cta": "Book a 15-min demo",
  "platform": "LinkedIn"
}
```

## Database

SQLite at `backend/data/sqlite.db`. Tables are created on startup:

| Table | Purpose |
|-------|---------|
| `user` | Auth users |
| `audit_logs` | Every generation and export action |
| `campaigns` | Persisted pipeline runs |
| `exports` | LinkedIn / Email / Call export records |
| `call_queue` | Prioritised call entries |

## Testing

```powershell
cd backend
pytest
```

## Notes

- Seed FAISS index and ICP profiles under `data/vector_db/` for real ICP matching.
- Settings PATCH updates values in-memory only; write them to `.env` for persistence across restarts.
- LinkedIn export is simulated (logs + DB record) unless `LINKEDIN_WEBHOOK_URL` is configured.
