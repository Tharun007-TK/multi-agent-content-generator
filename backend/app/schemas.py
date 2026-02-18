from pydantic import BaseModel
from typing import Optional, List

class ClassificationResponse(BaseModel):
    task_type: str
    urgency: str
    category: str
    behavioral_segment: str
    intent_summary: str
    confidence_score: float

class ICPMatch(BaseModel):
    icp_id: str
    name: str
    score: float
    likelihood: str

class ICPResponse(BaseModel):
    matches: List[ICPMatch]
    primary_match: ICPMatch

class GenerateRequest(BaseModel):
    context: str

class ContentResponse(BaseModel):
    headline: str
    body: str
    cta: str
    platform: str

class UserLogin(BaseModel) :
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
