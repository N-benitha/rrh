import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import SoftDeleteMixin


class UserRegionSubscription(SoftDeleteMixin, Base):
    __tablename__ = "user_region_subscriptions"

    __table_args__ = (
        UniqueConstraint("user_id", "region_id", name="uq_user_region_subscription"),
    )

    id: Mapped[uuid.UUID] = mapped_column(default=uuid.uuid4, primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )
    region_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("regions.id"), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped["Users"] = relationship(back_populates="subscriptions")  # noqa: F821
    region: Mapped["Region"] = relationship(back_populates="subscriptions")  # noqa: F821

    @property
    def region_name(self) -> str:
        return self.region.name

    def __repr__(self) -> str:
        return f"<UserRegionSubscription user={self.user_id} region={self.region_id}>"
