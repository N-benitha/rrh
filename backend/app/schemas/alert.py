from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.alert import AlertChannel, AlertStatus
from app.models.prediction import RiskLevel


class AlertResponse(BaseModel):
    id: UUID
    region_id: UUID
    risk_level: RiskLevel
    channel: AlertChannel
    status: AlertStatus
    message: str
    created_at: datetime
    sent_at: datetime | None

    model_config = {"from_attributes": True}
