"""NASA POWER API data fetcher.

Fetches daily meteorological data for all target regions and stores
it in the sensor_readings table.

NASA POWER API docs: https://power.larc.nasa.gov/docs/services/api/temporal/daily/
No API key required — free and open access.

Parameters used:
  - PRECTOTCORR: Precipitation corrected (mm/day)
  - T2M: Temperature at 2 meters (°C)
  - RH2M: Relative humidity at 2 meters (%)
  - WS2M: Wind speed at 2 meters (m/s)
  - GWETROOT: Root zone soil wetness (0-1, converted to %)

Usage:
    # Fetch last 7 days for all regions
    python -m app.ingestion.nasa_power

    # Or call from code
    from app.ingestion.nasa_power import fetch_nasa_power_for_all_regions
    fetch_nasa_power_for_all_regions(days_back=7)
"""

import logging
from datetime import datetime, timedelta, timezone

import httpx
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.region import Region
from app.models.sensor_reading import DataSource, SensorReading

logger = logging.getLogger(__name__)

NASA_POWER_BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"

# NASA POWER parameter names → our DB column mapping
PARAMETERS = "PRECTOTCORR,T2M,RH2M,WS2M,GWETROOT"


def _build_url(latitude: float, longitude: float, start: str, end: str) -> str:
    """Build the NASA POWER API request URL.

    Args:
        latitude: Region latitude
        longitude: Region longitude
        start: Start date as YYYYMMDD
        end: End date as YYYYMMDD
    """
    return (
        f"{NASA_POWER_BASE_URL}"
        f"?parameters={PARAMETERS}"
        f"&community=AG"
        f"&longitude={longitude}"
        f"&latitude={latitude}"
        f"&start={start}"
        f"&end={end}"
        f"&format=JSON"
    )


def _parse_response(data: dict, region_id, db: Session) -> int:
    """Parse NASA POWER JSON response and insert sensor readings.

    Returns the number of readings inserted.
    """
    properties = data.get("properties", {})
    parameters = properties.get("parameter", {})

    if not parameters:
        logger.warning("No parameter data in NASA POWER response")
        return 0

    # Each parameter is a dict of {YYYYMMDD: value}
    # We need to iterate by date and collect all parameter values
    precip = parameters.get("PRECTOTCORR", {})
    temp = parameters.get("T2M", {})
    humidity = parameters.get("RH2M", {})
    wind = parameters.get("WS2M", {})
    soil = parameters.get("GWETROOT", {})

    # Get all unique dates from any parameter
    all_dates = set()
    for param_data in [precip, temp, humidity, wind, soil]:
        all_dates.update(param_data.keys())

    inserted = 0
    for date_str in sorted(all_dates):
        # Parse date string (YYYYMMDD format)
        try:
            recorded_at = datetime.strptime(date_str, "%Y%m%d").replace(
                tzinfo=timezone.utc
            )
        except ValueError:
            continue

        # NASA POWER uses -999.0 as the missing data sentinel
        def clean(val):
            if val is None or val == -999.0 or val == -999:
                return None
            return float(val)

        rainfall_val = clean(precip.get(date_str))
        temp_val = clean(temp.get(date_str))
        humidity_val = clean(humidity.get(date_str))
        wind_val = clean(wind.get(date_str))
        soil_val = clean(soil.get(date_str))

        # Convert soil wetness from 0-1 fraction to percentage
        soil_pct = soil_val * 100.0 if soil_val is not None else None

        # Check for duplicate: same region, source, and timestamp
        existing = (
            db.query(SensorReading)
            .filter(
                SensorReading.region_id == region_id,
                SensorReading.source == DataSource.NASA_POWER,
                SensorReading.recorded_at == recorded_at,
            )
            .first()
        )
        if existing:
            continue

        reading = SensorReading(
            region_id=region_id,
            source=DataSource.NASA_POWER,
            rainfall_mm=rainfall_val,
            temperature_c=temp_val,
            humidity_pct=humidity_val,
            wind_speed_ms=wind_val,
            soil_moisture_pct=soil_pct,
            river_level_m=None,  # NASA POWER doesn't provide this
            recorded_at=recorded_at,
        )
        db.add(reading)
        inserted += 1

    return inserted


def fetch_nasa_power_for_region(
    region: Region, days_back: int, db: Session
) -> int:
    """Fetch NASA POWER data for a single region.

    Args:
        region: Region ORM object
        days_back: Number of days of historical data to fetch
        db: Database session

    Returns:
        Number of readings inserted
    """
    end_date = datetime.now(timezone.utc) - timedelta(days=2)  # NASA POWER has ~2 day lag
    start_date = end_date - timedelta(days=days_back)

    url = _build_url(
        latitude=region.latitude,
        longitude=region.longitude,
        start=start_date.strftime("%Y%m%d"),
        end=end_date.strftime("%Y%m%d"),
    )

    logger.info(f"Fetching NASA POWER data for {region.name} ({days_back} days)")

    try:
        with httpx.Client(timeout=60.0) as client:
            response = client.get(url)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"NASA POWER API error for {region.name}: {e.response.status_code}")
        return 0
    except httpx.RequestError as e:
        logger.error(f"NASA POWER request failed for {region.name}: {e}")
        return 0

    inserted = _parse_response(data, region.id, db)
    logger.info(f"Inserted {inserted} readings for {region.name}")
    return inserted


def fetch_nasa_power_for_all_regions(days_back: int = 7) -> int:
    """Fetch NASA POWER data for all regions in the database.

    Args:
        days_back: Number of days of historical data to fetch

    Returns:
        Total number of readings inserted
    """
    db = SessionLocal()
    try:
        regions = db.query(Region).all()
        total = 0
        for region in regions:
            count = fetch_nasa_power_for_region(region, days_back, db)
            total += count
        db.commit()
        logger.info(f"NASA POWER ingestion complete. Total inserted: {total}")
        return total
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    fetch_nasa_power_for_all_regions(days_back=7)