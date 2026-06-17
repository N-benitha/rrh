"""Seed a super admin user directly via SQLite."""

import sqlite3
from pathlib import Path

from app.config import settings
from app.core.security import get_password_hash

DB_PATH = Path(__file__).parents[2] / "rrh.db"


def seed_admin() -> None:
    if not settings.SUPERADMIN_EMAIL or not settings.SUPERADMIN_PASSWORD:
        print("SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be set in .env. Skipping.")
        return

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE email = ?", (settings.SUPERADMIN_EMAIL,))
    if cur.fetchone():
        print(f"Admin '{settings.SUPERADMIN_EMAIL}' already exists. Skipping.")
        conn.close()
        return

    hashed = get_password_hash(settings.SUPERADMIN_PASSWORD)
    cur.execute(
        "INSERT INTO users (email, full_name, institution, hashed_password, role, is_active) VALUES (?, ?, ?, ?, ?, ?)",
        (settings.SUPERADMIN_EMAIL, "Super Admin", "Rwanda Resilience Hub", hashed, "ADMIN", 1),
    )
    conn.commit()
    conn.close()
    print(f"Super admin '{settings.SUPERADMIN_EMAIL}' created successfully.")


if __name__ == "__main__":
    seed_admin()
