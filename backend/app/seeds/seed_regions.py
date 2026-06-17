"""Seed the database with the 5 target flood-prone regions.

Run once after migrations:
    python -m app.seed
"""

from app.database import SessionLocal
from app.models.enums import RiskLevel
from app.models.region import Region

REGIONS = [
    {
        "name": "Nyabugogo Catchment (Kigali)",
        "latitude": -1.9403,
        "longitude": 29.8739,
        "risk_level": RiskLevel.HIGH,
        "description": (
            "Urban flood-prone zone in Kigali City. The Nyabugogo river "
            "confluence area experiences frequent flooding due to rapid "
            "urbanization and impervious surfaces increasing surface runoff."
        ),
    },
    {
        "name": "Sebeya River Basin (Rubavu)",
        "latitude": -1.7469,
        "longitude": 29.2589,
        "risk_level": RiskLevel.HIGH,
        "description": (
            "Western Province catchment prone to flash floods. The Sebeya "
            "River has repeatedly burst its banks, displacing residents in "
            "Rubavu and Rutsiro districts."
        ),
    },
    {
        "name": "Nyabarongo Basin (Muhanga)",
        "latitude": -2.0844,
        "longitude": 29.7519,
        "risk_level": RiskLevel.MODERATE,
        "description": (
            "Central Rwanda river basin. The Nyabarongo is Rwanda's longest "
            "river and its floodplain affects agricultural communities in "
            "Muhanga and Kamonyi districts."
        ),
    },
    {
        "name": "Rusizi Floodplain (Rusizi)",
        "latitude": -2.4839,
        "longitude": 28.9078,
        "risk_level": RiskLevel.HIGH,
        "description": (
            "Southwestern border region along the Rusizi River and Lake Kivu "
            "outflow. Low-lying terrain makes this area vulnerable to both "
            "river flooding and lake-level fluctuations."
        ),
    },
    {
        "name": "Nyagatare (Control Zone)",
        "latitude": -1.3079,
        "longitude": 30.3256,
        "risk_level": RiskLevel.LOW,
        "description": (
            "Eastern Province reference zone with lower flood risk. Drier "
            "climate and flatter terrain compared to western and central "
            "regions. Included as a control for ML model validation."
        ),
    },
]


def seed_regions():
    db = SessionLocal()
    try:
        existing = db.query(Region).count()
        if existing > 0:
            print(f"Regions table already has {existing} rows. Skipping seed.")
            return

        for data in REGIONS:
            region = Region(**data)
            db.add(region)

        db.commit()
        print(f"Seeded {len(REGIONS)} regions successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_regions()
