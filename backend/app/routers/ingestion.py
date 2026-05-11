from fastapi import APIRouter, Depends, Query

from app.ingestion.nasa_power import fetch_nasa_power_for_all_regions
from app.ingestion.openweather import fetch_openweather_for_all_regions
from app.models.user import Users
from app.services.auth import require_admin

router = APIRouter(prefix="/api/ingestion", tags=["ingestion"])


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