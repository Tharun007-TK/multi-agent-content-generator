from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.schemas import ClassificationResponse, GenerateRequest, ContentResponse
from app.services.classification_service import ClassificationService, get_classification_service
from app.api.v1.generate import router as generate_router
from app.api.v1.export import router as export_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.settings import router as settings_router
from app.database.session import init_db

# Ensure new models are registered with SQLModel metadata before init_db()
import app.database.models.base         # noqa: F401
import app.database.models.campaigns    # noqa: F401
import app.database.models.exports      # noqa: F401

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the full multi-agent pipeline at /api/v1/content
app.include_router(generate_router, prefix="/api/v1/content", tags=["content"])
app.include_router(export_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(settings_router, prefix="/api/v1")

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}

@app.post("/api/v1/generate", response_model=ContentResponse)
async def generate_pipeline(
    request: GenerateRequest,
    classification_service: ClassificationService = Depends(get_classification_service)
):
    try:
        # 1. Classification
        classification = await classification_service.classify_intent(request.context)
        
        # Placeholder for other agents as per backend.md skeleton
        # 2. ICP Matching
        # 3. Platform Decision
        # 4. Content Generation
        
        return ContentResponse(
            headline="Sample Post",
            body=f"Draft based on {classification.intent_summary}",
            cta="Click here",
            platform="LinkedIn"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
