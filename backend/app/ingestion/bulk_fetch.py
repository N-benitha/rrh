"""Bulk historical data fetch from NASA POWER.

Fetches daily meteorological data from 2015 to 2024 for all target regions,
working year-by-year to stay within NASA POWER API limits (~365 days per request).

This is a one-time script to populate historical training data for the ML pipeline.
Run it once, then use the regular scheduler for ongoing ingestion.

Usage:
    python -m app.ingestion.bulk_fetch

    # Custom date range
    python -m app.ingestion.bulk_fetch --start 2018 --end 2024

    # Single region test
    python -m app.ingestion.bulk_fetch --region "Nyabugogo" --start 2023 --end 2024
"""

import argparse
import logging
import time

from app.database import SessionLocal
from app.ingestion.nasa_power import fetch_nasa_power_for_region
from app.models.region import Region

logger = logging.getLogger(__name__)

# NASA POWER API rate limit: be polite, wait between requests
REQUEST_DELAY_SECONDS = 3


def bulk_fetch(start_year: int = 2015, end_year: int = 2024, region_filter: str | None = None):
    """Fetch NASA POWER data year-by-year for all regions.

    Args:
        start_year: First year to fetch (inclusive)
        end_year: Last year to fetch (inclusive)
        region_filter: Optional region name substring to filter by
    """
    db = SessionLocal()
    try:
        regions = db.query(Region).all()

        if region_filter:
            regions = [r for r in regions if region_filter.lower() in r.name.lower()]
            if not regions:
                logger.error(f"No regions matched filter: {region_filter}")
                return

        total_inserted = 0
        total_years = end_year - start_year + 1
        total_tasks = len(regions) * total_years

        logger.info(
            f"Bulk fetch: {len(regions)} regions × {total_years} years = {total_tasks} API calls"
        )
        logger.info(
            f"Estimated time: ~{total_tasks * REQUEST_DELAY_SECONDS // 60} minutes "
            f"(with {REQUEST_DELAY_SECONDS}s delay between requests)"
        )

        task_num = 0
        for region in regions:
            region_total = 0
            for year in range(start_year, end_year + 1):
                task_num += 1
                days_in_year = 366 if _is_leap_year(year) else 365

                logger.info(
                    f"[{task_num}/{total_tasks}] Fetching {region.name} — {year}"
                )

                try:
                    # We use days_back calculated from the end of each year
                    # But it's simpler to just call with the right days_back
                    # that covers exactly one year from the perspective of that year's end
                    count = _fetch_year(region, year, db)
                    region_total += count
                    total_inserted += count

                    logger.info(
                        f"  → Inserted {count} readings (running total: {total_inserted})"
                    )
                except Exception as e:
                    logger.error(f"  → Failed for {region.name} {year}: {e}")

                # Commit after each year to avoid losing everything on a late failure
                db.commit()

                # Rate limiting — be polite to NASA's servers
                time.sleep(REQUEST_DELAY_SECONDS)

            logger.info(
                f"Completed {region.name}: {region_total} readings inserted"
            )

        logger.info(
            f"\nBulk fetch complete. Total readings inserted: {total_inserted}"
        )

    finally:
        db.close()


def _fetch_year(region: Region, year: int, db) -> int:
    """Fetch one year of data for one region using the existing fetcher.

    We override the date calculation to target a specific year.
    """
    from datetime import datetime, timezone

    import httpx

    from app.ingestion.nasa_power import (
        NASA_POWER_BASE_URL,
        PARAMETERS,
        _parse_response,
    )

    start = f"{year}0101"
    end = f"{year}1231"

    url = (
        f"{NASA_POWER_BASE_URL}"
        f"?parameters={PARAMETERS}"
        f"&community=AG"
        f"&longitude={region.longitude}"
        f"&latitude={region.latitude}"
        f"&start={start}"
        f"&end={end}"
        f"&format=JSON"
    )

    try:
        with httpx.Client(timeout=120.0) as client:
            response = client.get(url)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"NASA POWER API error: {e.response.status_code}")
        return 0
    except httpx.RequestError as e:
        logger.error(f"NASA POWER request failed: {e}")
        return 0

    return _parse_response(data, region.id, db)


def _is_leap_year(year: int) -> bool:
    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Bulk fetch NASA POWER historical data")
    parser.add_argument("--start", type=int, default=2015, help="Start year (default: 2015)")
    parser.add_argument("--end", type=int, default=2024, help="End year (default: 2024)")
    parser.add_argument("--region", type=str, default=None, help="Filter by region name")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)-5s %(message)s",
        datefmt="%H:%M:%S",
    )

    logger.info(f"Starting bulk fetch: {args.start}–{args.end}")
    bulk_fetch(start_year=args.start, end_year=args.end, region_filter=args.region)