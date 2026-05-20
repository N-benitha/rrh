"""Live weather alerts endpoint.

Fetches current conditions from OpenWeather API for Rwanda's key river basins
and generates flood risk alerts based on rainfall and humidity thresholds.
No database dependency — works as long as OPENWEATHER_API_KEY is set.
"""

from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()

RWANDA_BASINS = [
    {"id": 1, "name": "SEBY-DS-03 — Kanama/Rubavu", "zone": "Downstream · Rubavu District",  "lat": -1.6849, "lon": 29.3892},
    {"id": 2, "name": "SEBY-MS-02 — Nyundo",         "zone": "Midstream · Rubavu District",   "lat": -1.5554, "lon": 29.5375},
    {"id": 3, "name": "SEBY-US-01 — Rutsiro",        "zone": "Upstream · Rutsiro District",   "lat": -1.3954, "lon": 29.4849},
]

# Flood risk thresholds matching proposal (rainfall mm/h, humidity %)
THRESHOLDS = [
    ("critical", 70, 92, "Water level exceeds 2.5m critical threshold. Immediate evacuation of riverside communities required."),
    ("high",     50, 85, "Rainfall approaching 70mm/h critical threshold. Downstream impact expected within 2–3 hours."),
    ("moderate", 30, 75, "Sustained rainfall upstream. River level rising — monitor for rapid increase."),
]


def _classify(rainfall_mm: float, humidity: float) -> tuple[str, str]:
    for level, rain_th, hum_th, msg in THRESHOLDS:
        if rainfall_mm >= rain_th or humidity >= hum_th:
            return level, msg
    return "low", "Normal conditions. No immediate flood risk."


def _level_label(level: str) -> str:
    return {"critical": "Critical Flood Risk", "high": "High Flood Risk",
            "moderate": "Elevated Risk", "low": "Normal Conditions"}[level]


def _time_ago(minutes: int) -> str:
    if minutes < 1:
        return "just now"
    if minutes < 60:
        return f"{minutes}m ago"
    return f"{minutes // 60}h ago"


@router.get("/live-alerts")
async def get_live_weather_alerts() -> dict[str, Any]:
    """Fetch real-time weather from OpenWeather and return flood alerts for Rwanda basins."""
    if not settings.OPENWEATHER_API_KEY:
        return {
            "alerts": [],
            "source": "unavailable",
            "message": "OPENWEATHER_API_KEY not configured",
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        }

    alerts = []
    fetched_at = datetime.now(timezone.utc)

    async with httpx.AsyncClient(timeout=12.0) as client:
        for basin in RWANDA_BASINS:
            try:
                r = await client.get(
                    "https://api.openweathermap.org/data/2.5/weather",
                    params={
                        "lat": basin["lat"],
                        "lon": basin["lon"],
                        "appid": settings.OPENWEATHER_API_KEY,
                        "units": "metric",
                    },
                )
                if r.status_code != 200:
                    continue

                data = r.json()
                main = data.get("main", {})
                rain = data.get("rain", {})
                wind = data.get("wind", {})

                rainfall = rain.get("1h", 0.0)
                if not rainfall and "3h" in rain:
                    rainfall = rain["3h"] / 3.0

                humidity = float(main.get("humidity", 0))
                temp = float(main.get("temp", 0))
                wind_speed = float(wind.get("speed", 0))
                weather_desc = data.get("weather", [{}])[0].get("description", "").capitalize()

                level, risk_msg = _classify(rainfall, humidity)

                alerts.append({
                    "id": str(basin["id"]),
                    "level": level,
                    "title": f"{_level_label(level)} — {basin['name']}",
                    "description": (
                        f"{risk_msg} "
                        f"Rainfall: {rainfall:.1f} mm/h · "
                        f"Humidity: {humidity:.0f}% · "
                        f"Temp: {temp:.1f}°C · "
                        f"Wind: {wind_speed:.1f} m/s. "
                        f"{weather_desc}."
                    ),
                    "zone": basin["zone"],
                    "time": fetched_at.strftime("%H:%M UTC"),
                    "status": "active",
                    "source": "OpenWeather Live",
                    "rainfall_mm": round(rainfall, 2),
                    "humidity_pct": humidity,
                    "temperature_c": temp,
                })

            except Exception:
                continue

    alerts.sort(
        key=lambda a: ["critical", "high", "moderate", "low"].index(a["level"])
    )

    return {
        "alerts": alerts,
        "source": "OpenWeather Live",
        "fetched_at": fetched_at.isoformat(),
        "basins_checked": len(RWANDA_BASINS),
    }


# ── NASA POWER: historical rainfall ───────────────────────────────────────────

NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"

# Rwanda basin coordinates for multi-point rainfall averaging
NASA_BASINS = [
    {"name": "Kigali",   "lat": -1.9536, "lon": 30.0605},
    {"name": "Rubavu",   "lat": -1.5097, "lon": 29.6324},
    {"name": "Gitarama", "lat": -2.0786, "lon": 29.8325},
    {"name": "Nyanza",   "lat": -2.3514, "lon": 29.7389},
    {"name": "Rwamagana","lat": -1.9526, "lon": 30.4346},
]


@router.get("/nasa-rainfall")
async def get_nasa_rainfall(days: int = 7) -> dict[str, Any]:
    """Fetch real historical daily rainfall from NASA POWER for Rwanda.

    No API key required. Returns data averaged across 5 basin points.
    Note: NASA POWER has a ~2 day data lag.
    """
    end_date = datetime.now(timezone.utc) - timedelta(days=2)
    start_date = end_date - timedelta(days=days - 1)

    start_str = start_date.strftime("%Y%m%d")
    end_str = end_date.strftime("%Y%m%d")

    # Collect daily totals from each basin point
    daily_totals: dict[str, list[float]] = {}

    async with httpx.AsyncClient(timeout=30.0) as client:
        for basin in NASA_BASINS:
            try:
                r = await client.get(
                    NASA_POWER_URL,
                    params={
                        "parameters": "PRECTOTCORR",
                        "community": "AG",
                        "longitude": basin["lon"],
                        "latitude": basin["lat"],
                        "start": start_str,
                        "end": end_str,
                        "format": "JSON",
                    },
                )
                if r.status_code != 200:
                    continue

                data = r.json()
                precip = (
                    data.get("properties", {})
                    .get("parameter", {})
                    .get("PRECTOTCORR", {})
                )
                for date_str, val in precip.items():
                    if val is None or val in (-999.0, -999):
                        continue
                    daily_totals.setdefault(date_str, []).append(float(val))

            except Exception:
                continue

    if not daily_totals:
        return {"rainfall": [], "source": "NASA POWER", "error": "no data returned"}

    rainfall = []
    for date_str in sorted(daily_totals):
        values = daily_totals[date_str]
        avg_mm = round(sum(values) / len(values), 1)
        dt = datetime.strptime(date_str, "%Y%m%d")
        rainfall.append({"day": dt.strftime("%b %d"), "mm": avg_mm})

    return {
        "rainfall": rainfall,
        "source": "NASA POWER",
        "basins": len(NASA_BASINS),
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }
