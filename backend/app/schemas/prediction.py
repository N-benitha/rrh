from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.enums import RiskLevel


class PredictionResponse(BaseModel):
    id: UUID
    region_id: UUID
    risk_level: RiskLevel
    confidence_score: float
    model_version: str
    predicted_at: datetime

    model_config = {"from_attributes": True}
