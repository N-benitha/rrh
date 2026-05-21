from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.enums import RiskLevel
from app.schemas.prediction import PredictionResponse
from app.schemas.sensor_reading import SensorReadingResponse


class RegionResponse(BaseModel):
    id: UUID
    name: str
    latitude: float
    longitude: float
    description: str | None
    risk_level: RiskLevel
    latest_prediction: PredictionResponse | None = None

    model_config = {"from_attributes": True}


class RegionDetailResponse(RegionResponse):
    recent_readings: list[SensorReadingResponse] = []
    recent_predictions: list[PredictionResponse] = []
