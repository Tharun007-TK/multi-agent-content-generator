from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.schemas import ClassificationResponse, GenerateRequest, ContentResponse
from app.services.classification_service import ClassificationService, get_classification_service

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
