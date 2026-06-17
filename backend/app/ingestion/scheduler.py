"""Background scheduler for periodic data ingestion.

Runs NASA POWER and OpenWeather fetchers on configurable intervals
using a simple threading approach. No external dependencies (Celery, Redis)
needed — appropriate for a proof-of-concept deployment.

NASA POWER: Runs every 24 hours (daily data, ~2 day lag)
OpenWeather: Runs every 30 minutes (current conditions)
"""

import logging
import threading
import time
from datetime import datetime, timezone

from app.ingestion.nasa_power import fetch_nasa_power_for_all_regions
from app.ingestion.openweather import fetch_openweather_for_all_regions

logger = logging.getLogger(__name__)

# Intervals in seconds
NASA_POWER_INTERVAL = 24 * 60 * 60  # 24 hours
OPENWEATHER_INTERVAL = 30 * 60      # 30 minutes
EMAIL_INTERVAL = 2 * 60             # 2 minutes


def _run_periodic(name: str, func, interval: int):
    """Run a function periodically in a loop."""
    while True:
        try:
            logger.info(f"[Scheduler] Running {name}...")
            func()
            logger.info(f"[Scheduler] {name} complete. Next run in {interval}s")
        except Exception as e:
            logger.error(f"[Scheduler] {name} failed: {e}")
        time.sleep(interval)


def process_pending_email_alerts() -> None:
    from app.database import SessionLocal
    from app.models.alert import Alert, AlertChannel, AlertStatus
    from app.services.email_service import send_flood_alert_email

    db = SessionLocal()
    try:
        pending = (
            db.query(Alert)
            .filter(
                Alert.channel == AlertChannel.EMAIL,
                Alert.status == AlertStatus.PENDING,
            )
            .all()
        )

        if not pending:
            return

        logger.info("[Scheduler] Processing %d pending email alert(s)", len(pending))

        for alert in pending:
            try:
                user_email = alert.user.email
                region_name = alert.region.name
                success = send_flood_alert_email(
                    to_email=user_email,
                    region_name=region_name,
                    risk_level=alert.risk_level.value,
                    confidence_score=alert.confidence_score,
                )
                if success:
                    alert.status = AlertStatus.SENT
                    alert.sent_at = datetime.now(timezone.utc)
                    logger.info(
                        "[Scheduler] Email sent to %s for region '%s'",
                        user_email,
                        region_name,
                    )
                else:
                    alert.status = AlertStatus.FAILED
                    logger.error(
                        "[Scheduler] Email failed for %s (alert %s)",
                        user_email,
                        alert.id,
                    )
                db.commit()
            except Exception as e:
                db.rollback()
                logger.error("[Scheduler] Unexpected error processing alert %s: %s", alert.id, e)
    finally:
        db.close()


def start_scheduler():
    """Start background threads for periodic data ingestion.

    Call this once at application startup.
    """
    logger.info("[Scheduler] Starting background data ingestion threads")

    # NASA POWER — daily fetch (7 days of data to fill gaps)
    nasa_thread = threading.Thread(
        target=_run_periodic,
        args=("NASA POWER fetch", lambda: fetch_nasa_power_for_all_regions(days_back=7), NASA_POWER_INTERVAL),
        daemon=True,  # Dies when main process exits
    )
    nasa_thread.start()

    # OpenWeather — every 30 minutes
    openweather_thread = threading.Thread(
        target=_run_periodic,
        args=("OpenWeather fetch", fetch_openweather_for_all_regions, OPENWEATHER_INTERVAL),
        daemon=True,
    )
    openweather_thread.start()

    # Email delivery — every 2 minutes
    email_thread = threading.Thread(
        target=_run_periodic,
        args=("Email alert delivery", process_pending_email_alerts, EMAIL_INTERVAL),
        daemon=True,
    )
    email_thread.start()

    logger.info("[Scheduler] Background threads started")