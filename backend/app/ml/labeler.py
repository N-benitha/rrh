"""Synthetic flood risk label generator.

Since we don't have ground-truth flood event records from government sources,
this script generates flood risk labels using a combination of:

1. Environmental threshold rules (based on Rwanda-specific conditions)
2. Known historical flood events (from DesInventar, news reports, EM-DAT)

The generated labels are used as the target variable for ML training.

Risk levels:
  - LOW: Normal conditions
  - MODERATE: Elevated conditions, potential for localized flooding
  - HIGH: Significant flood risk, conditions match historical flood events
  - CRITICAL: Extreme conditions, multiple indicators exceeding thresholds

Thresholds are calibrated to Rwanda's climate:
  - Rwanda avg annual rainfall: ~1,200mm (varies 900-1,600mm by region)
  - Rainy seasons: March-May (Masika) and Sept-Dec (Vuli)
  - Daily rainfall >50mm is considered heavy for Rwanda
  - Daily rainfall >80mm is considered extreme

Usage:
    python -m app.ml.labeler
"""

import logging
from datetime import datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.enums import RiskLevel
from app.models.prediction import Prediction
from app.models.region import Region
from app.models.sensor_reading import DataSource, SensorReading

logger = logging.getLogger(__name__)

# --- Threshold Configuration (Rwanda-calibrated) ---

# Daily rainfall thresholds (mm)
RAINFALL_MODERATE = 30.0   # Above average daily rainfall
RAINFALL_HIGH = 50.0       # Heavy rainfall for Rwanda
RAINFALL_CRITICAL = 80.0   # Extreme rainfall

# Soil moisture thresholds (%) — saturated soil increases runoff
SOIL_MOISTURE_HIGH = 70.0
SOIL_MOISTURE_CRITICAL = 85.0

# Humidity thresholds (%) — high humidity reduces evaporation
HUMIDITY_HIGH = 80.0
HUMIDITY_CRITICAL = 90.0

# Compound risk: number of consecutive heavy rain days
CONSECUTIVE_RAIN_DAYS_HIGH = 3    # 3+ days of >20mm
CONSECUTIVE_RAIN_DAYS_CRITICAL = 5

# Known flood events in Rwanda (from news reports and EM-DAT)
# Format: (year, month, day, affected_region_keyword, severity)
KNOWN_FLOOD_EVENTS = [
    # 2018 events
    (2018, 5, 5, "kigali", "critical"),
    (2018, 5, 6, "kigali", "critical"),
    (2018, 5, 7, "kigali", "high"),
    (2018, 5, 5, "rubavu", "critical"),
    (2018, 5, 6, "rubavu", "critical"),
    (2018, 5, 7, "rubavu", "high"),
    # 2020 events
    (2020, 2, 15, "kigali", "high"),
    (2020, 2, 16, "kigali", "high"),
    (2020, 4, 25, "rusizi", "critical"),
    (2020, 4, 26, "rusizi", "critical"),
    (2020, 5, 1, "muhanga", "high"),
    (2020, 5, 2, "muhanga", "high"),
    # 2023 events
    (2023, 5, 2, "rubavu", "critical"),
    (2023, 5, 3, "rubavu", "critical"),
    (2023, 5, 4, "rubavu", "high"),
    (2023, 5, 2, "kigali", "high"),
    (2023, 5, 3, "kigali", "high"),
    (2023, 11, 10, "rusizi", "high"),
    (2023, 11, 11, "rusizi", "high"),
    # 2024 events
    (2024, 4, 29, "rubavu", "critical"),
    (2024, 4, 30, "rubavu", "critical"),
    (2024, 5, 1, "rubavu", "high"),
    (2024, 5, 2, "kigali", "high"),
    (2024, 5, 3, "kigali", "high"),
]


def _is_rainy_season(month: int) -> bool:
    """Check if the month falls in Rwanda's rainy seasons."""
    return month in (3, 4, 5, 9, 10, 11, 12)


def _check_known_event(date: datetime, region_name: str) -> str | None:
    """Check if this date/region matches a known flood event.

    Returns risk level string or None.
    """
    region_lower = region_name.lower()
    for year, month, day, keyword, severity in KNOWN_FLOOD_EVENTS:
        if (
            date.year == year
            and date.month == month
            and date.day == day
            and keyword in region_lower
        ):
            return severity
    return None


def classify_risk(
    rainfall_mm: float | None,
    humidity_pct: float | None,
    soil_moisture_pct: float | None,
    consecutive_rain_days: int,
    is_rainy_season: bool,
    known_event_level: str | None,
) -> RiskLevel:
    """Classify flood risk based on environmental indicators.

    Uses a scoring system: each indicator adds points,
    total score maps to risk level.
    """
    # If there's a known historical flood event, use that
    if known_event_level:
        return RiskLevel(known_event_level)

    score = 0

    # Rainfall scoring (most important factor)
    if rainfall_mm is not None:
        if rainfall_mm >= RAINFALL_CRITICAL:
            score += 4
        elif rainfall_mm >= RAINFALL_HIGH:
            score += 3
        elif rainfall_mm >= RAINFALL_MODERATE:
            score += 2
        elif rainfall_mm >= 15.0:
            score += 1

    # Soil moisture scoring
    if soil_moisture_pct is not None:
        if soil_moisture_pct >= SOIL_MOISTURE_CRITICAL:
            score += 3
        elif soil_moisture_pct >= SOIL_MOISTURE_HIGH:
            score += 2
        elif soil_moisture_pct >= 55.0:
            score += 1

    # Humidity scoring
    if humidity_pct is not None:
        if humidity_pct >= HUMIDITY_CRITICAL:
            score += 2
        elif humidity_pct >= HUMIDITY_HIGH:
            score += 1

    # Consecutive rain days scoring
    if consecutive_rain_days >= CONSECUTIVE_RAIN_DAYS_CRITICAL:
        score += 3
    elif consecutive_rain_days >= CONSECUTIVE_RAIN_DAYS_HIGH:
        score += 2
    elif consecutive_rain_days >= 2:
        score += 1

    # Rainy season amplifier
    if is_rainy_season and score >= 2:
        score += 1

    # Map score to risk level
    if score >= 8:
        return RiskLevel.CRITICAL
    elif score >= 5:
        return RiskLevel.HIGH
    elif score >= 3:
        return RiskLevel.MODERATE
    else:
        return RiskLevel.LOW


def _count_consecutive_rain_days(
    db: Session, region_id, current_date: datetime, threshold_mm: float = 20.0
) -> int:
    """Count consecutive days with rainfall above threshold before current_date."""
    from datetime import timedelta

    count = 0
    for days_back in range(1, 15):  # Look back up to 14 days
        check_date = current_date - timedelta(days=days_back)
        reading = (
            db.query(SensorReading)
            .filter(
                SensorReading.region_id == region_id,
                SensorReading.source == DataSource.NASA_POWER,
                func.date(SensorReading.recorded_at) == check_date.date(),
            )
            .first()
        )
        if reading and reading.rainfall_mm is not None and reading.rainfall_mm >= threshold_mm:
            count += 1
        else:
            break  # Streak broken
    return count


def generate_labels_for_region(region: Region, db: Session) -> int:
    """Generate synthetic flood risk labels for all readings in a region.

    Creates prediction records that serve as training labels.

    Returns number of labels generated.
    """
    readings = (
        db.query(SensorReading)
        .filter(
            SensorReading.region_id == region.id,
            SensorReading.source == DataSource.NASA_POWER,  # Use daily data for labels
        )
        .order_by(SensorReading.recorded_at)
        .all()
    )

    if not readings:
        logger.warning(f"No readings found for {region.name}")
        return 0

    generated = 0
    for reading in readings:
        # Skip if label already exists for this region+timestamp
        existing = (
            db.query(Prediction)
            .filter(
                Prediction.region_id == region.id,
                Prediction.predicted_at == reading.recorded_at,
                Prediction.model_version == "synthetic_v1",
            )
            .first()
        )
        if existing:
            continue

        # Check known events
        known_level = _check_known_event(reading.recorded_at, region.name)

        # Count consecutive rain days
        consec_rain = _count_consecutive_rain_days(
            db, region.id, reading.recorded_at
        )

        # Classify
        risk_level = classify_risk(
            rainfall_mm=reading.rainfall_mm,
            humidity_pct=reading.humidity_pct,
            soil_moisture_pct=reading.soil_moisture_pct,
            consecutive_rain_days=consec_rain,
            is_rainy_season=_is_rainy_season(reading.recorded_at.month),
            known_event_level=known_level,
        )

        # Confidence: higher for known events and extreme values
        if known_level:
            confidence = 0.95
        elif risk_level == RiskLevel.CRITICAL:
            confidence = 0.85
        elif risk_level == RiskLevel.HIGH:
            confidence = 0.80
        elif risk_level == RiskLevel.MODERATE:
            confidence = 0.75
        else:
            confidence = 0.70

        prediction = Prediction(
            region_id=region.id,
            risk_level=risk_level,
            confidence_score=confidence,
            feature_vector={
                "rainfall_mm": reading.rainfall_mm,
                "humidity_pct": reading.humidity_pct,
                "soil_moisture_pct": reading.soil_moisture_pct,
                "wind_speed_ms": reading.wind_speed_ms,
                "temperature_c": reading.temperature_c,
                "consecutive_rain_days": consec_rain,
                "is_rainy_season": _is_rainy_season(reading.recorded_at.month),
            },
            model_version="synthetic_v1",
            predicted_at=reading.recorded_at,
        )
        db.add(prediction)
        generated += 1

    return generated


def generate_all_labels() -> dict:
    """Generate synthetic labels for all regions.

    Returns summary dict with counts per region and per risk level.
    """
    db = SessionLocal()
    try:
        regions = db.query(Region).all()
        summary = {}

        for region in regions:
            count = generate_labels_for_region(region, db)
            summary[region.name] = count
            logger.info(f"Generated {count} labels for {region.name}")

        db.commit()

        # Print distribution
        distribution = (
            db.query(Prediction.risk_level, func.count(Prediction.id))
            .filter(Prediction.model_version == "synthetic_v1")
            .group_by(Prediction.risk_level)
            .all()
        )

        logger.info("\nLabel distribution:")
        for level, count in distribution:
            logger.info(f"  {level.value}: {count}")

        total = sum(summary.values())
        logger.info(f"\nTotal labels generated: {total}")

        return summary

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)-5s %(message)s",
        datefmt="%H:%M:%S",
    )
    generate_all_labels()