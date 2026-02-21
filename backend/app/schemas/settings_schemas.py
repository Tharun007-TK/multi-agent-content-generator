from pydantic import BaseModel
from typing import Optional


class SettingsRead(BaseModel):
    default_llm_model: str
    smtp_host: str
    smtp_port: int
    smtp_username: Optional[str]
    linkedin_webhook_url: Optional[str]
    openrouter_api_key_set: bool
    huggingface_api_key_set: bool


class SettingsUpdate(BaseModel):
    default_llm_model: Optional[str] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None   # write-only; never echoed back
    linkedin_webhook_url: Optional[str] = None
    openrouter_api_key: Optional[str] = None
    huggingface_api_key: Optional[str] = None


class SMTPTestResponse(BaseModel):
    success: bool
    message: str
