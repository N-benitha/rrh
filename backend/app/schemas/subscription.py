from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class SubscribeRequest(BaseModel):
    region_id: UUID


class SubscriptionResponse(BaseModel):
    id: UUID
    region_id: UUID
    region_name: str
    created_at: datetime

    model_config = {"from_attributes": True}
