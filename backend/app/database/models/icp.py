from typing import Optional
from sqlmodel import SQLModel, Field

class ICPProfile(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    industry: str
    size: str
    description: str
    pain_points: str
    embedding_id: Optional[str] = None
