import math
from datetime import datetime, timezone
from uuid import UUID

import numpy as np
from fastapi import HTTPException, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.ml.loader import get_model_bundle
from app.models.enums import RiskLevel
from app.models.prediction import Prediction
from app.models.region import Region
from app.models.sensor_reading import DataSource, SensorReading
from app.services.alert_engine import trigger_alerts

FEATURE_COLUMNS = [
    "rainfall_mm", "temperature_c", "humidity_pct", "wind_speed_ms",
    "soil_moisture_pct", "rainfall_roll3", "rainfall_roll5", "rainfall_roll7",
    "rainfall_lag1", "rainfall_lag2", "rainfall_lag3", "rainfall_deviation",
    "consec_rainy_days", "month_sin", "month_cos", "is_rainy_season",
    "day_of_year", "region_encoded",
]

_RAINY_MONTHS = {3, 4, 5, 9, 10, 11, 12}
_RAINY_THRESHOLD_MM = 20.0


def _roll_mean(values: list[float], n: int) -> float:
    window = values[-n:] if len(values) >= n else values
    return float(np.mean(window)) if window else 0.0


def run_inference(region_id: UUID, db: Session) -> dict:
    bundle = get_model_bundle()

    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Region not found")

    try:
        region_encoded = int(bundle.region_encoder.transform([region.name])[0])
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Region '{region.name}' is not known to the region encoder",
        )

    latest_ow = (
        db.query(SensorReading)
        .filter(
            SensorReading.region_id == region_id,
            SensorReading.source == DataSource.OPENWEATHER,
        )
        .order_by(desc(SensorReading.recorded_at))
        .first()
    )
    if not latest_ow:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No OpenWeather data available for this region — run data ingestion first",
        )

    latest_soil = (
        db.query(SensorReading)
        .filter(
            SensorReading.region_id == region_id,
            SensorReading.source == DataSource.NASA_POWER,
            SensorReading.soil_moisture_pct.isnot(None),
        )
        .order_by(desc(SensorReading.recorded_at))
        .first()
    )

    history = (
        db.query(SensorReading)
        .filter(SensorReading.region_id == region_id)
        .order_by(desc(SensorReading.recorded_at))
        .limit(7)
        .all()
    )
    history = list(reversed(history))

    rainfalls = [r.rainfall_mm or 0.0 for r in history]

    rainfall_mm = latest_ow.rainfall_mm or 0.0
    temperature_c = latest_ow.temperature_c or 0.0
    humidity_pct = latest_ow.humidity_pct or 0.0
    wind_speed_ms = latest_ow.wind_speed_ms or 0.0
    soil_moisture_pct = latest_soil.soil_moisture_pct if latest_soil else 0.0

    rainfall_roll3 = _roll_mean(rainfalls, 3)
    rainfall_roll5 = _roll_mean(rainfalls, 5)
    rainfall_roll7 = _roll_mean(rainfalls, 7)

    rainfall_lag1 = rainfalls[-2] if len(rainfalls) >= 2 else 0.0
    rainfall_lag2 = rainfalls[-3] if len(rainfalls) >= 3 else 0.0
    rainfall_lag3 = rainfalls[-4] if len(rainfalls) >= 4 else 0.0

    rainfall_deviation = rainfall_mm - rainfall_roll7

    consec_rainy_days = 0
    for r in reversed(history[:-1]):
        if (r.rainfall_mm or 0.0) >= _RAINY_THRESHOLD_MM:
            consec_rainy_days += 1
        else:
            break

    dt = latest_ow.recorded_at
    month_sin = math.sin(2 * math.pi * dt.month / 12)
    month_cos = math.cos(2 * math.pi * dt.month / 12)
    is_rainy_season = 1 if dt.month in _RAINY_MONTHS else 0
    day_of_year = dt.timetuple().tm_yday

    raw_features = [
        rainfall_mm, temperature_c, humidity_pct, wind_speed_ms,
        soil_moisture_pct, rainfall_roll3, rainfall_roll5, rainfall_roll7,
        rainfall_lag1, rainfall_lag2, rainfall_lag3, rainfall_deviation,
        consec_rainy_days, month_sin, month_cos, is_rainy_season,
        day_of_year, region_encoded,
    ]
    feature_array = np.array([raw_features])

    scaled = bundle.scaler.transform(feature_array)
    pred_encoded = bundle.model.predict(scaled)[0]
    pred_proba = bundle.model.predict_proba(scaled)[0]
    confidence = float(pred_proba.max())

    risk_label: str = bundle.label_encoder.inverse_transform([pred_encoded])[0]

    now = datetime.now(timezone.utc)
    prediction = Prediction(
        region_id=region_id,
        risk_level=RiskLevel(risk_label),
        confidence_score=confidence,
        feature_vector={col: float(val) for col, val in zip(FEATURE_COLUMNS, raw_features)},
        model_version="rf_v1",
        predicted_at=now,
    )
    db.add(prediction)
    db.commit()

    trigger_alerts(region_id=region_id, risk_level=RiskLevel(risk_label), confidence_score=confidence, db=db)

    return {
        "zone_id": region.name,
        "risk_level": risk_label,
        "confidence": confidence,
        "timestamp": now,
    }
