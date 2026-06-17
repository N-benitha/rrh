from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.alert import AlertChannel, AlertStatus
from app.models.enums import RiskLevel


class AlertResponse(BaseModel):
    id: UUID
    region_id: UUID
    user_id: UUID
    risk_level: RiskLevel
    channel: AlertChannel
    status: AlertStatus
    confidence_score: float | None
    message: str
    created_at: datetime
    sent_at: datetime | None

    model_config = {"from_attributes": True}
