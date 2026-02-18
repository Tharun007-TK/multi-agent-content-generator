from pydantic import BaseModel


class GenerateRequest(BaseModel):
    context: str


class ContentOutput(BaseModel):
    """Used internally by agents for generated copy."""

    headline: str
    body: str
    cta: str
    platform: str


class ContentResponse(ContentOutput):
    """API response model (identical shape, separated for clarity)."""

    pass
