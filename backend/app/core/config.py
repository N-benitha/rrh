from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Rwanda Resilience Hub"
    VERSION: str = "1.0.0"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/rrh_db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # External APIs
    OPENWEATHER_API_KEY: Optional[str] = None
    NASA_POWER_API_URL: str = "https://power.larc.nasa.gov/api/temporal/daily/point"
    
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

settings = Settings()
