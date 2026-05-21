import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.enums import RiskLevel


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[uuid.UUID] = mapped_column(
        default=uuid.uuid4, primary_key=True
    )
    region_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("regions.id"), nullable=False, index=True
    )
    risk_level: Mapped[RiskLevel] = mapped_column(
        Enum(RiskLevel), nullable=False
    )
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)
    feature_vector: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    model_version: Mapped[str] = mapped_column(
        String(50), default="v1.0", nullable=False
    )
    predicted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    region: Mapped["Region"] = relationship(back_populates="predictions")  # noqa: F821

    def __repr__(self) -> str:
        return f"<Prediction {self.risk_level.value} for region {self.region_id}>"
