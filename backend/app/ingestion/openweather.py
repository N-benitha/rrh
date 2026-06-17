"""OpenWeather API data fetcher.

Fetches current weather data for all target regions and stores
it in the sensor_readings table.

Uses the Current Weather API: https://openweathermap.org/current
Requires a free API key (sign up at https://openweathermap.org/api).

Parameters fetched:
  - Rain volume (mm) in last 1h or 3h
  - Temperature (°C)
  - Humidity (%)
  - Wind speed (m/s)

Usage:
    # Fetch current weather for all regions
    python -m app.ingestion.openweather

    # Or call from code
    from app.ingestion.openweather import fetch_openweather_for_all_regions
    fetch_openweather_for_all_regions()
"""

import logging
from datetime import datetime, timezone

import httpx
from sqlalchemy.orm import Session

from app.config import settings
from app.database import SessionLocal
from app.models.region import Region
from app.models.sensor_reading import DataSource, SensorReading

logger = logging.getLogger(__name__)

OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"


def preview_openweather(region: Region) -> dict:
    """Fetch raw OpenWeather API response for one region without storing anything.

    Returns the raw parsed JSON from the API.
    """
    if not settings.OPENWEATHER_API_KEY:
        raise ValueError("OPENWEATHER_API_KEY not set in environment")

    params = {
        "lat": region.latitude,
        "lon": region.longitude,
        "appid": settings.OPENWEATHER_API_KEY,
        "units": "metric",
    }

    with httpx.Client(timeout=30.0) as client:
        response = client.get(OPENWEATHER_URL, params=params)
        response.raise_for_status()
        return response.json()


def fetch_openweather_for_region(region: Region, db: Session) -> int:
    """Fetch current weather from OpenWeather for a single region.

    Returns 1 if a reading was inserted, 0 otherwise.
    """
    if not settings.OPENWEATHER_API_KEY:
        logger.error("OPENWEATHER_API_KEY not set in environment")
        return 0

    params = {
        "lat": region.latitude,
        "lon": region.longitude,
        "appid": settings.OPENWEATHER_API_KEY,
        "units": "metric",  # °C, m/s
    }

    logger.info(f"Fetching OpenWeather data for {region.name}")

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.get(OPENWEATHER_URL, params=params)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPStatusError as e:
        logger.error(
            f"OpenWeather API error for {region.name}: {e.response.status_code}"
        )
        return 0
    except httpx.RequestError as e:
        logger.error(f"OpenWeather request failed for {region.name}: {e}")
        return 0

    # Parse the response
    main = data.get("main", {})
    wind = data.get("wind", {})
    rain = data.get("rain", {})

    # Rain: OpenWeather provides rain volume in mm for last 1h or 3h
    # Prefer 1h, fall back to 3h divided by 3, default to 0
    rainfall = rain.get("1h", rain.get("3h", 0.0))
    if "3h" in rain and "1h" not in rain:
        rainfall = rain["3h"] / 3.0

    temperature = main.get("temp")
    humidity = main.get("humidity")
    wind_speed = wind.get("speed")

    recorded_at = datetime.now(timezone.utc)

    reading = SensorReading(
        region_id=region.id,
        source=DataSource.OPENWEATHER,
        rainfall_mm=float(rainfall) if rainfall is not None else None,
        temperature_c=float(temperature) if temperature is not None else None,
        humidity_pct=float(humidity) if humidity is not None else None,
        wind_speed_ms=float(wind_speed) if wind_speed is not None else None,
        river_level_m=None,  # OpenWeather doesn't provide this
        soil_moisture_pct=None,  # OpenWeather doesn't provide this
        recorded_at=recorded_at,
    )
    db.add(reading)
    logger.info(
        f"Inserted OpenWeather reading for {region.name}: "
        f"rain={rainfall}mm, temp={temperature}°C, "
        f"humidity={humidity}%, wind={wind_speed}m/s"
    )
    return 1


def fetch_openweather_for_all_regions() -> int:
    """Fetch current weather for all regions.

    Returns total number of readings inserted.
    """
    db = SessionLocal()
    try:
        regions = db.query(Region).all()
        total = 0
        for region in regions:
            count = fetch_openweather_for_region(region, db)
            total += count
        db.commit()
        logger.info(f"OpenWeather ingestion complete. Total inserted: {total}")
        return total
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    fetch_openweather_for_all_regions()