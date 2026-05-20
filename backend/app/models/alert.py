import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.prediction import RiskLevel


class AlertChannel(str, enum.Enum):
    IN_APP = "in_app"
    EMAIL = "email"


class AlertStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    READ = "read"
    FAILED = "failed"


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[uuid.UUID] = mapped_column(
        default=uuid.uuid4, primary_key=True
    )
    region_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("regions.id"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )
    risk_level: Mapped[RiskLevel] = mapped_column(
        Enum(RiskLevel), nullable=False
    )
    channel: Mapped[AlertChannel] = mapped_column(
        Enum(AlertChannel), nullable=False
    )
    status: Mapped[AlertStatus] = mapped_column(
        Enum(AlertStatus), default=AlertStatus.PENDING, nullable=False
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )
    sent_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    region: Mapped["Region"] = relationship(back_populates="alerts")
    user: Mapped["Users"] = relationship(back_populates="alerts")

    def __repr__(self) -> str:
        return f"<Alert {self.risk_level.value} → {self.user_id}>"
