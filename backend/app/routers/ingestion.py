from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.ingestion.nasa_power import fetch_nasa_power_for_all_regions, preview_nasa_power
from app.ingestion.openweather import fetch_openweather_for_all_regions, preview_openweather
from app.models.region import Region
from app.models.sensor_reading import DataSource, SensorReading
from app.models.user import Users
from app.schemas.sensor_reading import IoTReadingRequest
from app.services.auth import get_current_user, require_admin

router = APIRouter(prefix="/ingestion", tags=["ingestion"])


@router.get("/nasa-power/preview")
def preview_nasa_power_route(
    db: Session = Depends(get_db),
    _admin: Users = Depends(require_admin),
):
    """Return raw NASA POWER API response for the first region. Admin only."""
    region = db.query(Region).first()
    if not region:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No regions found")
    return preview_nasa_power(region)


@router.get("/openweather/preview")
def preview_openweather_route(
    db: Session = Depends(get_db),
    _admin: Users = Depends(require_admin),
):
    """Return raw OpenWeather API response for the first region. Admin only."""
    region = db.query(Region).first()
    if not region:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No regions found")
    return preview_openweather(region)


@router.post("/nasa-power")
def trigger_nasa_power(
    days_back: int = Query(default=7, ge=1, le=365),
    _admin: Users = Depends(require_admin),
):
    """Manually trigger NASA POWER data fetch. Admin only."""
    count = fetch_nasa_power_for_all_regions(days_back=days_back)
    return {"source": "nasa_power", "readings_inserted": count}


@router.post("/openweather")
def trigger_openweather(
    _admin: Users = Depends(require_admin),
):
    """Manually trigger OpenWeather data fetch. Admin only."""
    count = fetch_openweather_for_all_regions()
    return {"source": "openweather", "readings_inserted": count}


@router.post("/all")
def trigger_all(
    days_back: int = Query(default=7, ge=1, le=365),
    _admin: Users = Depends(require_admin),
):
    """Manually trigger all data sources. Admin only."""
    nasa_count = fetch_nasa_power_for_all_regions(days_back=days_back)
    ow_count = fetch_openweather_for_all_regions()
    return {
        "nasa_power": {"readings_inserted": nasa_count},
        "openweather": {"readings_inserted": ow_count},
        "total": nasa_count + ow_count,
    }


@router.post("/iot", status_code=status.HTTP_201_CREATED)
def ingest_iot_readings(
    readings: list[IoTReadingRequest],
    db: Session = Depends(get_db),
    _current_user: Users = Depends(get_current_user),
):
    """Accept a batch of IoT simulator readings."""
    if not readings:
        return {"readings_inserted": 0}

    region_ids = {r.region_id for r in readings}
    existing_ids = {
        row.id
        for row in db.query(Region.id).filter(Region.id.in_(region_ids)).all()
    }
    unknown = region_ids - existing_ids
    if unknown:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unknown region_id(s): {[str(i) for i in unknown]}",
        )

    for r in readings:
        db.add(SensorReading(
            region_id=r.region_id,
            source=DataSource(r.source),
            rainfall_mm=r.rainfall_mm,
            temperature_c=r.temperature_c,
            humidity_pct=r.humidity_pct,
            wind_speed_ms=r.wind_speed_ms,
            soil_moisture_pct=r.soil_moisture_pct,
            river_level_m=r.river_level_m,
            recorded_at=r.recorded_at,
        ))
    db.commit()
    return {"readings_inserted": len(readings)}
