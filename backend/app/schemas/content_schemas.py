from typing import Optional
from pydantic import BaseModel


class GenerateRequest(BaseModel):
    context: str


class ContentOutput(BaseModel):
    """Used internally by agents for generated copy."""

    headline: str
    body: str
    cta: str
    platform: str
    campaign_id: Optional[int] = None


class ContentResponse(ContentOutput):
    """API response model (identical shape, separated for clarity)."""

    pass
