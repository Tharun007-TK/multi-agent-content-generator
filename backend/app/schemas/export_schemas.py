from pydantic import BaseModel, EmailStr, Field
from typing import Optional


# ── LinkedIn Export ────────────────────────────────────────────────────────────
class LinkedInExportRequest(BaseModel):
    headline: str
    body: str
    cta: str
    campaign_id: Optional[int] = None


class LinkedInExportResponse(BaseModel):
    success: bool
    export_id: int
    message: str


# ── Email Export ───────────────────────────────────────────────────────────────
class EmailExportRequest(BaseModel):
    subject: str
    body: str
    recipient: str          # plain string so it works without email-validator installed
    campaign_id: Optional[int] = None


class EmailExportResponse(BaseModel):
    success: bool
    export_id: int
    message: str


# ── Call Export ────────────────────────────────────────────────────────────────
class CallExportRequest(BaseModel):
    lead_name: str
    phone: str
    script: str
    priority: int = Field(default=5, ge=1, le=10)
    campaign_id: Optional[int] = None


class CallExportResponse(BaseModel):
    success: bool
    queue_id: int
    message: str
