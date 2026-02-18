from pydantic import BaseModel, Field
from typing import List, Optional

class ClassificationOutput(BaseModel):
    """Used internally by the agent pipeline (no confidence_score required)."""
    task_type: str
    urgency: str
    category: str
    behavioral_segment: str
    intent_summary: str

class ClassificationResponse(ClassificationOutput):
    """Extended schema returned by the classification service (includes confidence)."""
    confidence_score: float = Field(default=0.5, ge=0.0, le=1.0)
