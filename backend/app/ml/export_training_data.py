"""Export training dataset as CSV for ML model training in Colab.

Joins sensor_readings (features) with predictions/synthetic_v1 (labels)
and exports a clean CSV ready for feature engineering and model training.

Output columns:
  - region_name, region_risk_zone (context)
  - recorded_at, month, day_of_year, is_rainy_season (temporal)
  - rainfall_mm, temperature_c, humidity_pct, wind_speed_ms, soil_moisture_pct (features)
  - risk_level (label)

Usage:
    python -m app.ml.export_training_data

    # Custom output path
    python -m app.ml.export_training_data --output data/training_data.csv
"""

import argparse
import csv
import logging
from pathlib import Path

from sqlalchemy import and_

from app.database import SessionLocal
from app.models.prediction import Prediction
from app.models.region import Region
from app.models.sensor_reading import DataSource, SensorReading

logger = logging.getLogger(__name__)

RAINY_MONTHS = {3, 4, 5, 9, 10, 11, 12}

CSV_COLUMNS = [
    "region_name",
    "region_risk_level",
    "recorded_at",
    "year",
    "month",
    "day_of_year",
    "is_rainy_season",
    "rainfall_mm",
    "temperature_c",
    "humidity_pct",
    "wind_speed_ms",
    "soil_moisture_pct",
    "risk_level",
]


def export_training_data(output_path: str = "training_data.csv") -> int:
    """Export joined sensor readings + labels as CSV.

    Returns number of rows exported.
    """
    db = SessionLocal()
    try:
        # Query: join sensor_readings with synthetic labels on region_id + timestamp
        results = (
            db.query(SensorReading, Prediction, Region)
            .join(Region, SensorReading.region_id == Region.id)
            .join(
                Prediction,
                and_(
                    Prediction.region_id == SensorReading.region_id,
                    Prediction.predicted_at == SensorReading.recorded_at,
                    Prediction.model_version == "synthetic_v1",
                ),
            )
            .filter(SensorReading.source == DataSource.NASA_POWER)
            .order_by(Region.name, SensorReading.recorded_at)
            .all()
        )

        if not results:
            logger.error(
                "No data found. Make sure you've run bulk_fetch and labeler first."
            )
            return 0

        # Write CSV
        output = Path(output_path)
        output.parent.mkdir(parents=True, exist_ok=True)

        rows_written = 0
        with open(output, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
            writer.writeheader()

            for reading, prediction, region in results:
                dt = reading.recorded_at
                writer.writerow({
                    "region_name": region.name,
                    "region_risk_level": region.risk_level.value,
                    "recorded_at": dt.strftime("%Y-%m-%d"),
                    "year": dt.year,
                    "month": dt.month,
                    "day_of_year": dt.timetuple().tm_yday,
                    "is_rainy_season": 1 if dt.month in RAINY_MONTHS else 0,
                    "rainfall_mm": reading.rainfall_mm if reading.rainfall_mm is not None else "",
                    "temperature_c": reading.temperature_c if reading.temperature_c is not None else "",
                    "humidity_pct": reading.humidity_pct if reading.humidity_pct is not None else "",
                    "wind_speed_ms": reading.wind_speed_ms if reading.wind_speed_ms is not None else "",
                    "soil_moisture_pct": reading.soil_moisture_pct if reading.soil_moisture_pct is not None else "",
                    "risk_level": prediction.risk_level.value,
                })
                rows_written += 1

        logger.info(f"Exported {rows_written} rows to {output.resolve()}")

        # Print summary stats
        label_counts = {}
        region_counts = {}
        for reading, prediction, region in results:
            label = prediction.risk_level.value
            label_counts[label] = label_counts.get(label, 0) + 1
            region_counts[region.name] = region_counts.get(region.name, 0) + 1

        logger.info("\nLabel distribution:")
        for label in ["low", "moderate", "high", "critical"]:
            count = label_counts.get(label, 0)
            pct = (count / rows_written * 100) if rows_written > 0 else 0
            logger.info(f"  {label}: {count} ({pct:.1f}%)")

        logger.info("\nRows per region:")
        for name, count in sorted(region_counts.items()):
            logger.info(f"  {name}: {count}")

        return rows_written

    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export ML training data as CSV")
    parser.add_argument(
        "--output", type=str, default="training_data.csv",
        help="Output CSV file path (default: training_data.csv)"
    )
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)-5s %(message)s",
        datefmt="%H:%M:%S",
    )

    export_training_data(output_path=args.output)