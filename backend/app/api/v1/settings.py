"""
settings.py  –  GET/PATCH /api/v1/settings
Reads from / writes to environment config at runtime.
API keys are never echoed back – only a boolean indicating they are set.
"""
import os
from fastapi import APIRouter, HTTPException
from app.core.config import settings as app_settings
from app.schemas.settings_schemas import SettingsRead, SettingsUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=SettingsRead)
def get_settings():
    return SettingsRead(
        default_llm_model=getattr(app_settings, "DEFAULT_LLM_MODEL", "amazon/nova-micro-v1"),
        smtp_host=getattr(app_settings, "SMTP_HOST", ""),
        smtp_port=getattr(app_settings, "SMTP_PORT", 587),
        smtp_username=getattr(app_settings, "SMTP_USERNAME", ""),
        linkedin_webhook_url=getattr(app_settings, "LINKEDIN_WEBHOOK_URL", ""),
        openrouter_api_key_set=bool(app_settings.OPENROUTER_API_KEY),
        huggingface_api_key_set=bool(app_settings.HUGGINGFACE_API_KEY),
    )


@router.patch("", response_model=SettingsRead)
def update_settings(payload: SettingsUpdate):
    """
    Applies settings in-memory for the current process lifetime.
    For persistence across restarts, values should be written to .env.
    """
    mapping = {
        "default_llm_model": "DEFAULT_LLM_MODEL",
        "smtp_host": "SMTP_HOST",
        "smtp_port": "SMTP_PORT",
        "smtp_username": "SMTP_USERNAME",
        "smtp_password": "SMTP_PASSWORD",
        "linkedin_webhook_url": "LINKEDIN_WEBHOOK_URL",
        "openrouter_api_key": "OPENROUTER_API_KEY",
        "huggingface_api_key": "HUGGINGFACE_API_KEY",
    }
    for field, attr in mapping.items():
        val = getattr(payload, field, None)
        if val is not None:
            setattr(app_settings, attr, val)

    return get_settings()
