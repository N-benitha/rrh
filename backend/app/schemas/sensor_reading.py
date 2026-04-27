from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.sensor_reading import DataSource


class SensorReadingResponse(BaseModel):
    id: UUID
    region_id: UUID
    source: DataSource
    rainfall_mm: float | None
    temperature_c: float | None
    humidity_pct: float | None
    wind_speed_ms: float | None
    river_level_m: float | None
    soil_moisture_pct: float | None
    recorded_at: datetime

    model_config = {"from_attributes": True}
