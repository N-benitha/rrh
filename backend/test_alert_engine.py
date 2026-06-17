"""Temporary test script — verifies trigger_alerts() creates alert rows.

Run from the backend/ directory:
    python test_alert_engine.py

Delete this file when done testing.
"""

from app.database import SessionLocal
from app.models.alert import Alert
from app.models.enums import RiskLevel
from app.models.region import Region
from app.models.user_region_subscription import UserRegionSubscription
from app.services.alert_engine import trigger_alerts


def main() -> None:
    db = SessionLocal()
    try:
        region = db.query(Region).first()
        if not region:
            print("No regions found — seed regions first (make seed).")
            return

        subs = (
            db.query(UserRegionSubscription)
            .filter(
                UserRegionSubscription.region_id == region.id,
                UserRegionSubscription.is_deleted == False,  # noqa: E712
            )
            .all()
        )
        if not subs:
            print(
                f"Region '{region.name}' has no active subscriptions.\n"
                "Subscribe a user first, then re-run."
            )
            return

        print(f"Region : {region.name} ({region.id})")
        print(f"Active subscribers: {len(subs)}")
        print("Calling trigger_alerts(HIGH, confidence=0.91) ...")

        count = trigger_alerts(
            region_id=region.id,
            risk_level=RiskLevel.HIGH,
            confidence_score=0.91,
            db=db,
        )

        print(f"Alerts created: {count}\n")

        alerts = (
            db.query(Alert)
            .filter(Alert.region_id == region.id)
            .order_by(Alert.created_at.desc())
            .limit(count or 10)
            .all()
        )
        for a in alerts:
            print(
                f"  [{a.channel.value:<6}] user={a.user_id}  "
                f"status={a.status.value}  confidence={a.confidence_score}"
            )
            print(f"           {a.message}")

    finally:
        db.close()


if __name__ == "__main__":
    main()
