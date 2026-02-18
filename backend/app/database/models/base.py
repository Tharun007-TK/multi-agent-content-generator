from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    hashed_password: str
    is_active: bool = True

class AuditLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    task_type: str
    input_text: str
    output_text: str
    channel: str
    icp_id: str
    priority_score: float
