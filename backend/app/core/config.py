from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    APP_NAME: str = "Rwanda Resilience Hub"
    PROJECT_NAME: str = "Rwanda Resilience Hub"
    VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = "sqlite:///./rrh.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # External APIs
    OPENWEATHER_API_KEY: Optional[str] = None
    NASA_POWER_API_URL: str = "https://power.larc.nasa.gov/api/temporal/daily/point"
    NASA_POWER_BASE_URL: str = "https://power.larc.nasa.gov/api/temporal/daily/point"

    # Email
    RESEND_API_KEY: Optional[str] = None
    ALERT_FROM_EMAIL: str = "alerts@yourdomain.com"
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: str = "noreply@rrh.rw"

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    # Rwanda-specific settings
    RWANDA_BOUNDS: dict = {
        "north": 1.0642,
        "south": -2.8426,
        "east": 30.9059,
        "west": 28.8570
    }

    # River basins in Rwanda
    RIVER_BASINS: list = [
        "Nyabarongo",
        "Akanyaru",
        "Mwogo",
        "Rukarara",
        "Sebeya",
        "Base",
        "Kagera",
        "Muvumba",
        "Nyabugogo"
    ]

    # ML Model settings
    MODEL_CONFIDENCE_THRESHOLD: float = 0.75
    PREDICTION_INTERVAL_MINUTES: int = 15

    # Alert settings
    ALERT_COOLDOWN_MINUTES: int = 30
    MAX_ALERTS_PER_REGION_PER_HOUR: int = 3

    # Sensor simulation settings
    SENSOR_UPDATE_INTERVAL_SECONDS: int = 60
    MAX_SENSOR_FAILURE_RATE: float = 0.05

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
