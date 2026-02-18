from pydantic import BaseModel
from typing import List

class ClassificationResponse(BaseModel):
    task_type: str
    urgency: str
    category: str
    behavioral_segment: str
    intent_summary: str
    confidence_score: float
