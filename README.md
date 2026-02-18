# Multi-Agent Content Generator

Agentic workflow that classifies user intent, matches to the best ICP, selects the right outreach channel, and generates tailored content. Backend is FastAPI with OpenRouter + embeddings; frontend is a Vite/React client.

## How It Works

- Classification: `ClassificationService` or `ClassificationAgent` turns free-form context into structured intent metadata.
- ICP match: `ICPMatcherAgent` uses sentence-transformer embeddings + FAISS to pick the closest ICP profile.
- Channel decision: `PlatformDecisionAgent` applies weighted scoring (urgency, ICP preference, objectives, engagement) to pick LinkedIn/Email/SMS/Call.
- Content: `ContentService` (via `ContentGeneratorAgent`) prompts OpenRouter for JSON output (headline, body, CTA) with retries and platform-aware templates.
- Audit: `AuditLogger` hooks exist to persist generations (see `app/api/v1/generate.py`).

## Repo Layout

- backend/app/main.py — FastAPI app + simple `/api/v1/generate` pipeline.
- backend/app/api/v1/generate.py — richer multi-agent pipeline (classification → ICP → channel → content → audit).
- backend/app/agents — agent implementations for classification, ICP matching, platform decision, content generation.
- backend/app/services — reusable services (LLM classification, embeddings/FAISS, decision engine, OpenRouter content).
- backend/app/schemas — Pydantic schemas for requests/responses.
- frontend/src — Vite/React UI for submitting context and viewing generated output.

## Prerequisites

- Python 3.9+
- Node.js 18+
- Keys: OpenRouter API key; HuggingFace API key (embeddings)

## Backend Setup

```powershell
cd backend
python -m venv venv
./venv/Scripts/activate
pip install -r requirements.txt
```

Create `backend/.env` (overrides defaults in `app/core/config.py`):
```env
SECRET_KEY=change_me
OPENROUTER_API_KEY=your_openrouter_key
HUGGINGFACE_API_KEY=your_hf_key
DATABASE_URL=sqlite:///./data/sqlite.db
```

Run the API:
```powershell
uvicorn app.main:app --reload
```

## Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

The client expects the API at `http://localhost:8000/api/v1`. Adjust `frontend/src/services/api.js` if needed.

## API

- Health: `GET /` → `{"status": "ok"}`
- Generate (simple): `POST /api/v1/generate` with `{ "context": "..." }` → content stub.
- Generate (multi-agent route in router): `POST /api/v1/content/generate` with `{ "context": "..." }` → full pipeline output (ensure router is included in the FastAPI app).

Sample request:
```bash
curl -X POST http://localhost:8000/api/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"context": "Reach out to AI startups about our new analytics tool"}'
```

Example response shape:
```json
{
  "headline": "AI founders: scale your analytics",
  "body": "Short, platform-aware copy...",
  "cta": "Book a 15-min demo",
  "platform": "LinkedIn"
}
```

## Testing

```powershell
cd backend
pytest
```

## Notes & Next Steps

- Seed FAISS index and ICP profiles under `data/vector_db/` for real matching.
- Wire `app/api/v1/generate.py` router into the FastAPI app to expose `/api/v1/content/generate` used by the frontend.
- Add persistence/logging (AuditLogger) and auth as needed.
