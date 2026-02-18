from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class Export(SQLModel, table=True):
    __tablename__ = "exports"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    campaign_id: Optional[int] = Field(default=None, foreign_key="campaigns.id")
    channel: str            # linkedin | email | call
    status: str             # success | failed | pending
    destination: Optional[str] = None  # email address, webhook url, CRM id
    error_message: Optional[str] = None


class CallQueue(SQLModel, table=True):
    __tablename__ = "call_queue"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    lead_name: str
    phone: str
    script: str
    priority: int = 5       # 1 (highest) – 10 (lowest)
    status: str = "queued"  # queued | dialling | done | failed
