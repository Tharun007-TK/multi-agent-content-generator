from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class Campaign(SQLModel, table=True):
    __tablename__ = "campaigns"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    intent: str
    audience: str
    urgency: str
    channel: str
    headline: str
    body: str
    cta: str
    platform: str
    icp_id: Optional[str] = None
    priority_score: float = 0.0
