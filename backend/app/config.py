from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Rwanda Resilience Hub"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql://postgres:admin123@localhost:5432/rrh_db"

    # JWT
    JWT_SECRET_KEY: str = "CHANGE-ME-IN-PRODUCTION"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # External APIs
    OPENWEATHER_API_KEY: str = ""
    NASA_POWER_BASE_URL: str = "https://power.larc.nasa.gov/api/temporal/daily/point"

    # Email (Resend)
    RESEND_API_KEY: str = ""
    ALERT_FROM_EMAIL: str = "alerts@yourdomain.com"

    # SMTP
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_FROM: str = ""
    SMTP_PASSWORD: str = ""

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()