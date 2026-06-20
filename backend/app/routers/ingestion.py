from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.ingestion.nasa_power import fetch_nasa_power_for_all_regions
from app.ingestion.openweather import fetch_openweather_for_all_regions
from app.models.sensor_reading import DataSource, SensorReading
from app.models.user import User
from app.services.auth import require_admin

router = APIRouter(prefix="/api/ingestion", tags=["ingestion"])


class IoTReading(BaseModel):
    region_id: UUID
    rainfall_mm: float | None = None
    temperature_c: float | None = None
    humidity_pct: float | None = None
    wind_speed_ms: float | None = None
    soil_moisture_pct: float | None = None
    river_level_m: float | None = None
    recorded_at: datetime | None = None


@router.post("/iot")
def ingest_iot(
    readings: list[IoTReading],
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
) -> dict[str, Any]:
    """Accept a batch of IoT simulator readings and persist them."""
    if not readings:
        raise HTTPException(status_code=400, detail="Empty batch")

    rows = []
    for r in readings:
        row = SensorReading(
            region_id=r.region_id,
            source=DataSource.IOT_SIM,
            rainfall_mm=r.rainfall_mm,
            temperature_c=r.temperature_c,
            humidity_pct=r.humidity_pct,
            wind_speed_ms=r.wind_speed_ms,
            river_level_m=r.river_level_m,
            soil_moisture_pct=r.soil_moisture_pct,
            recorded_at=r.recorded_at or datetime.now(timezone.utc),
        )
        db.add(row)
        rows.append(row)

    db.commit()

    # Run ML prediction for each reading and auto-alert if critical
    try:
        from app.ml.loader import get_models
        import numpy as np
        from app.models.push_notification import PushNotification

        models = get_models()
        if models:
            for r in readings:
                features = np.array([[
                    r.rainfall_mm or 0,
                    r.river_level_m or 0,
                    r.humidity_pct or 50,
                    r.soil_moisture_pct or 50,
                ]])
                risk = models["rf"].predict(features)[0]
                if risk in ("critical", "high"):
                    notif = PushNotification(
                        title=f"{'🔴' if risk == 'critical' else '🟠'} {risk.upper()} Flood Risk — Sebeya",
                        body=f"River level {r.river_level_m:.1f}m · Rainfall {r.rainfall_mm:.1f}mm — Sensor alert from IoT",
                        level=risk,
                    )
                    db.add(notif)
            db.commit()
    except Exception:
        pass  # ML unavailable — still save the readings

    return {"inserted": len(rows)}


@router.post("/nasa-power")
def trigger_nasa_power(
    days_back: int = Query(default=7, ge=1, le=365),
    _admin: User = Depends(require_admin),
):
    """Manually trigger NASA POWER data fetch. Admin only."""
    count = fetch_nasa_power_for_all_regions(days_back=days_back)
    return {"source": "nasa_power", "readings_inserted": count}


@router.post("/openweather")
def trigger_openweather(
    _admin: User = Depends(require_admin),
):
    """Manually trigger OpenWeather data fetch. Admin only."""
    count = fetch_openweather_for_all_regions()
    return {"source": "openweather", "readings_inserted": count}


@router.post("/all")
def trigger_all(
    days_back: int = Query(default=7, ge=1, le=365),
    _admin: User = Depends(require_admin),
):
    """Manually trigger all data sources. Admin only."""
    nasa_count = fetch_nasa_power_for_all_regions(days_back=days_back)
    ow_count = fetch_openweather_for_all_regions()
    return {
        "nasa_power": {"readings_inserted": nasa_count},
        "openweather": {"readings_inserted": ow_count},
        "total": nasa_count + ow_count,
    }