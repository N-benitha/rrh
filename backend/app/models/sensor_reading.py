import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DataSource(str, enum.Enum):
    NASA_POWER = "nasa_power"
    OPENWEATHER = "openweather"
    IOT_SIM = "iot_sim"
    GOVERNMENT = "government"


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id: Mapped[uuid.UUID] = mapped_column(
        default=uuid.uuid4, primary_key=True
    )
    region_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("regions.id"), nullable=False, index=True
    )
    source: Mapped[DataSource] = mapped_column(
        Enum(DataSource), nullable=False
    )

    # Environmental measurements — all nullable because not every source
    # provides every variable
    rainfall_mm: Mapped[float | None] = mapped_column(Float, nullable=True)
    temperature_c: Mapped[float | None] = mapped_column(Float, nullable=True)
    humidity_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    wind_speed_ms: Mapped[float | None] = mapped_column(Float, nullable=True)
    river_level_m: Mapped[float | None] = mapped_column(Float, nullable=True)
    soil_moisture_pct: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )

    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    ingested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    region: Mapped["Region"] = relationship(back_populates="sensor_readings")  # noqa: F821

    def __repr__(self) -> str:
        return f"<SensorReading {self.source.value} @ {self.recorded_at}>"
