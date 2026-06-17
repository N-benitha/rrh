"""IoT Simulator — generates synthetic sensor readings for all 5 RRH regions.

Authenticates against the API at startup, then POSTs one reading per region
every INTERVAL seconds. Automatically re-authenticates on token expiry (401).

Usage:
    python -m app.simulation.iot_simulator

    # Custom interval and base URL
    SIMULATOR_INTERVAL=30 API_BASE_URL=http://localhost:8000 python -m app.simulation.iot_simulator
"""

import asyncio
import logging
import os
import random
from datetime import datetime, timezone

import httpx

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-5s %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
INTERVAL = int(os.getenv("SIMULATOR_INTERVAL", "60"))
LOGIN_EMAIL = os.getenv("SIMULATOR_EMAIL", os.getenv("SUPERADMIN_EMAIL", ""))
LOGIN_PASSWORD = os.getenv("SIMULATOR_PASSWORD", os.getenv("SUPERADMIN_PASSWORD", ""))


def _generate_reading(region_id: str, region_name: str) -> dict:
    """Generate one synthetic sensor reading with Rwanda-realistic values."""
    # Rainfall is skewed low; occasional spikes simulate storm events
    rainfall = 0.0
    roll = random.random()
    if roll < 0.55:
        rainfall = random.uniform(0.0, 5.0)       # dry / light
    elif roll < 0.80:
        rainfall = random.uniform(5.0, 30.0)      # moderate
    elif roll < 0.95:
        rainfall = random.uniform(30.0, 55.0)     # heavy
    else:
        rainfall = random.uniform(55.0, 80.0)     # extreme spike

    return {
        "region_id": region_id,
        "rainfall_mm": round(rainfall, 2),
        "temperature_c": round(random.uniform(15.0, 30.0), 2),
        "humidity_pct": round(random.uniform(40.0, 95.0), 2),
        "wind_speed_ms": round(random.uniform(0.5, 12.0), 2),
        "soil_moisture_pct": round(random.uniform(20.0, 85.0), 2),
        "river_level_m": round(random.uniform(0.3, 4.5), 2),
        "recorded_at": datetime.now(timezone.utc).isoformat(),
    }


async def _login(client: httpx.AsyncClient) -> str:
    resp = await client.post(
        f"{API_BASE_URL}/api/v1/auth/login",
        json={"email": LOGIN_EMAIL, "password": LOGIN_PASSWORD},
    )
    resp.raise_for_status()
    token = resp.json()["access_token"]
    logger.info("Authenticated as %s", LOGIN_EMAIL)
    return token


async def _fetch_regions(client: httpx.AsyncClient, token: str) -> list[dict]:
    resp = await client.get(
        f"{API_BASE_URL}/api/v1/regions",
        headers={"Authorization": f"Bearer {token}"},
    )
    resp.raise_for_status()
    return resp.json()


async def _post_batch(
    client: httpx.AsyncClient,
    token: str,
    batch: list[dict],
) -> httpx.Response:
    return await client.post(
        f"{API_BASE_URL}/api/v1/ingestion/iot",
        json=batch,
        headers={"Authorization": f"Bearer {token}"},
    )


async def run(interval: int = INTERVAL) -> None:
    if not LOGIN_EMAIL or not LOGIN_PASSWORD:
        raise SystemExit(
            "Set SIMULATOR_EMAIL and SIMULATOR_PASSWORD (or SUPERADMIN_EMAIL/PASSWORD) env vars"
        )

    async with httpx.AsyncClient(timeout=15) as client:
        token = await _login(client)
        regions = await _fetch_regions(client, token)

        if not regions:
            raise SystemExit("No regions found in the database — seed regions first")

        logger.info(
            "Simulator started — %d regions, interval=%ds", len(regions), interval
        )

        while True:
            batch = [
                _generate_reading(str(r["id"]), r["name"]) for r in regions
            ]

            resp = await _post_batch(client, token, batch)

            if resp.status_code == 401:
                logger.warning("Token expired — re-authenticating")
                token = await _login(client)
                resp = await _post_batch(client, token, batch)

            if resp.status_code not in (200, 201):
                logger.error("Ingestion failed: %s %s", resp.status_code, resp.text)
            else:
                for reading in batch:
                    region_name = next(
                        r["name"] for r in regions if str(r["id"]) == reading["region_id"]
                    )
                    logger.info(
                        "%-40s  rainfall=%-6.2f mm  river=%.2f m",
                        region_name,
                        reading["rainfall_mm"],
                        reading["river_level_m"],
                    )

            await asyncio.sleep(interval)


if __name__ == "__main__":
    asyncio.run(run())
