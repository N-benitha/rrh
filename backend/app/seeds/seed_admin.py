"""Seed a super admin user.

Reads credentials from config (set via .env):
    SUPERADMIN_EMAIL
    SUPERADMIN_PASSWORD
    SUPERADMIN_NAME     (default: "Super Admin")
    SUPERADMIN_PHONE    (default: "")

Run once after migrations:
    python -m app.seeds.seed_admin
"""

from app.config import settings
from app.database import SessionLocal
from app.models.enums import UserRole
from app.repositories import user_repository
from app.services.auth import hash_password


def seed_admin() -> None:
    if not settings.SUPERADMIN_EMAIL or not settings.SUPERADMIN_PASSWORD:
        print("SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be set in .env. Skipping.")
        return

    db = SessionLocal()
    try:
        existing = user_repository.get_by_email(db, settings.SUPERADMIN_EMAIL)
        if existing:
            print(f"Admin '{settings.SUPERADMIN_EMAIL}' already exists. Skipping.")
            return

        user = user_repository.create(
            db,
            name=settings.SUPERADMIN_NAME,
            email=settings.SUPERADMIN_EMAIL,
            phone_number=settings.SUPERADMIN_PHONE,
            hashed_password=hash_password(settings.SUPERADMIN_PASSWORD),
            role=UserRole.ADMIN,
        )
        print(f"Super admin created successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()