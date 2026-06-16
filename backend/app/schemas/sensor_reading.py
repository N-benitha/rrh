from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

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


class IoTReadingRequest(BaseModel):
    region_id: UUID
    rainfall_mm: float | None = Field(default=None, ge=0)
    temperature_c: float | None = None
    humidity_pct: float | None = Field(default=None, ge=0, le=100)
    wind_speed_ms: float | None = Field(default=None, ge=0)
    soil_moisture_pct: float | None = Field(default=None, ge=0, le=100)
    river_level_m: float | None = Field(default=None, ge=0)
    recorded_at: datetime
