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

from app.ingestion.nasa_power import fetch_nasa_power_for_all_regions
from app.ingestion.openweather import fetch_openweather_for_all_regions

logger = logging.getLogger(__name__)

# Intervals in seconds
NASA_POWER_INTERVAL = 24 * 60 * 60  # 24 hours
OPENWEATHER_INTERVAL = 30 * 60      # 30 minutes


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

    logger.info("[Scheduler] Background threads started")