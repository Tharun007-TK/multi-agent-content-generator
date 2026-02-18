from pydantic import BaseModel

class GenerateRequest(BaseModel):
    context: str

class ContentResponse(BaseModel):
    headline: str
    body: str
    cta: str
    platform: str
