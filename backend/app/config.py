from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env",
        case_sensitive=True,
        extra="ignore",
    )
    # App
    APP_NAME: str = "Rwanda Resilience Hub"
    APP_DESCRIPTION: str = "Flood risk prediction platform for Rwanda"
    VERSION: str = "0.1.0"
    DEBUG: bool = False

    # Database
    
    DATABASE_URL: str

    # JWT
    JWT_SECRET_KEY: str = "CHANGE-ME-IN-PRODUCTION"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # External APIs
    OPENWEATHER_API_KEY: Optional [str] = None
    NASA_POWER_BASE_URL: str = "https://power.larc.nasa.gov/api/temporal/daily/point"

    # Email (Resend)
    RESEND_API_KEY: Optional[str] = None
    ALERT_FROM_EMAIL: str = "alerts@yourdomain.com"

    # CORS
    FRONTEND_URL: str = ""


settings = Settings()