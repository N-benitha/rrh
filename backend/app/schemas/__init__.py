from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.region import RegionResponse, RegionDetailResponse
from app.schemas.sensor_reading import SensorReadingResponse
from app.schemas.prediction import PredictionResponse
from app.schemas.alert import AlertResponse

__all__ = [
    "LoginRequest",
    "RegisterRequest",
    "TokenResponse",
    "UserResponse",
    "RegionResponse",
    "RegionDetailResponse",
    "SensorReadingResponse",
    "PredictionResponse",
    "AlertResponse",
]