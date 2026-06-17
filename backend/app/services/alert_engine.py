from uuid import UUID

from sqlalchemy.orm import Session

from app.models.alert import Alert, AlertChannel, AlertStatus
from app.models.enums import RiskLevel
from app.models.region import Region
from app.models.user_region_subscription import UserRegionSubscription

_ALERT_LEVELS = {RiskLevel.HIGH, RiskLevel.CRITICAL}


def trigger_alerts(region_id: UUID, risk_level: RiskLevel, confidence_score: float, db: Session) -> int:
    if risk_level not in _ALERT_LEVELS:
        return 0

    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        return 0

    subscriptions = (
        db.query(UserRegionSubscription)
        .filter(
            UserRegionSubscription.region_id == region_id,
            UserRegionSubscription.is_deleted == False,  # noqa: E712
        )
        .all()
    )
    if not subscriptions:
        return 0

    message = (
        f"Flood risk alert: {region.name} is currently at "
        f"{risk_level.value.upper()} risk level "
        f"(confidence: {confidence_score * 100:.0f}%). Take immediate precautions."
    )

    count = 0
    for sub in subscriptions:
        db.add(Alert(
            region_id=region_id,
            user_id=sub.user_id,
            risk_level=risk_level,
            confidence_score=confidence_score,
            channel=AlertChannel.IN_APP,
            status=AlertStatus.PENDING,
            message=message,
        ))
        count += 1

        if sub.user.email_alerts_enabled:
            db.add(Alert(
                region_id=region_id,
                user_id=sub.user_id,
                risk_level=risk_level,
                confidence_score=confidence_score,
                channel=AlertChannel.EMAIL,
                status=AlertStatus.PENDING,
                message=message,
            ))
            count += 1

    db.commit()
    return count
