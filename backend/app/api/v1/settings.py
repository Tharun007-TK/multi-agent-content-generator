"""
settings.py  –  GET/PATCH /api/v1/settings
Reads from / writes to environment config at runtime.
API keys are never echoed back – only a boolean indicating they are set.
"""
import os
import smtplib
import logging
from fastapi import APIRouter, HTTPException
from dotenv import set_key, find_dotenv
from app.core.config import settings as app_settings
from app.schemas.settings_schemas import SettingsRead, SettingsUpdate, SMTPTestResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=SettingsRead)
def get_settings():
    return SettingsRead(
        default_llm_model=getattr(app_settings, "DEFAULT_LLM_MODEL", "amazon/nova-micro-v1"),
        smtp_host=getattr(app_settings, "SMTP_HOST", ""),
        smtp_port=getattr(app_settings, "SMTP_PORT", 587),
        smtp_username=getattr(app_settings, "SMTP_USERNAME", None),
        linkedin_webhook_url=getattr(app_settings, "LINKEDIN_WEBHOOK_URL", None),
        openrouter_api_key_set=bool(app_settings.OPENROUTER_API_KEY),
        huggingface_api_key_set=bool(app_settings.HUGGINGFACE_API_KEY),
    )


@router.patch("", response_model=SettingsRead)
def update_settings(payload: SettingsUpdate):
    """
    Applies settings in-memory and persists them to the .env file.
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
    
    env_path = find_dotenv()
    if not env_path:
        # Fallback to current working directory if not found by find_dotenv
        env_path = os.path.join(os.getcwd(), ".env")
    
    logger.info(f"Targeting .env file for persistence: {env_path}")
    
    for field, attr in mapping.items():
        val = getattr(payload, field, None)
        if val is not None:
            # Update in-memory
            setattr(app_settings, attr, val)
            # Persist to .env
            try:
                # Ensure we have a string for the value
                str_val = str(val)
                success, key, value = set_key(env_path, attr, str_val)
                if success:
                    logger.info(f"Successfully persisted {attr} to {env_path}")
                else:
                    logger.warning(f"Failed to persist {attr} to {env_path}")
            except Exception as e:
                logger.error(f"Error persisting {attr} to .env: {e}")

    return get_settings()


@router.post("/test-smtp", response_model=SMTPTestResponse)
def test_smtp():
    """
    Attempts to connect and login to the SMTP server to verify credentials.
    """
    if not app_settings.SMTP_USERNAME or not app_settings.SMTP_PASSWORD:
        return SMTPTestResponse(
            success=False, 
            message="SMTP credentials are not configured in .env"
        )
    
    try:
        logger.info(f"Testing SMTP connection to {app_settings.SMTP_HOST}:{app_settings.SMTP_PORT}")
        with smtplib.SMTP(app_settings.SMTP_HOST, app_settings.SMTP_PORT, timeout=10) as server:
            server.ehlo()
            if app_settings.SMTP_PORT == 587:
                server.starttls()
            server.login(app_settings.SMTP_USERNAME, app_settings.SMTP_PASSWORD)
            return SMTPTestResponse(success=True, message="SMTP connection verified successfully.")
            
    except smtplib.SMTPAuthenticationError:
        logger.warning(f"SMTP Authentication failed for {app_settings.SMTP_USERNAME}")
        return SMTPTestResponse(
            success=False, 
            message="Authentication failed. If using Gmail, ensure you are using a 16-character App Password."
        )
    except Exception as e:
        logger.error(f"SMTP Test Error: {str(e)}")
        return SMTPTestResponse(success=False, message=f"Connection failed: {str(e)}")
