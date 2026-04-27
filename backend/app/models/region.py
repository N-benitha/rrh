import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, Float, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

class RiskZone(str, enum.Enum):
    HIGH = "high"
    MODERATE = "moderate"
    LOW = "low"

class Region(Base):
    __tablename__ = "regions"

    id: Mapped[uuid.UUID] = mapped_column(
        default=uuid.uuid4, primary_key=True
    )
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=False)
    risk_zone: Mapped[RiskZone] = mapped_column(
        Enum(RiskZone), default=RiskZone.MODERATE, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    sensor_readings: Mapped[list["SensorReading"]] = relationship(
        back_populates="region"
    )
    predictions: Mapped[list["Prediction"]] = relationship(
        back_populates="region"
    )
    alerts: Mapped[list["Alert"]] = relationship(back_populates="region") 

    def __repr__(self):
        return f"<Region {self.name}>"