from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Multi-Agent Content System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "DEVEL_SECRET_KEY"  # To be overridden by .env
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # AI Keys
    OPENROUTER_API_KEY: Optional[str] = None
    HUGGINGFACE_API_KEY: Optional[str] = None
    
    # DB
    DATABASE_URL: str = "sqlite:///./data/sqlite.db"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
