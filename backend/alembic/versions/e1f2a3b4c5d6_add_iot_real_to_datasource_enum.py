"""add IOT_REAL to datasource enum

Revision ID: e1f2a3b4c5d6
Revises: b2c3d4e5f6a7
Create Date: 2026-06-20

"""
from typing import Union

from alembic import op

revision: str = "e1f2a3b4c5d6"
down_revision: Union[str, None] = "b2c3d4e5f6a7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Postgres allows adding values to a native enum with ALTER TYPE.
    # IF NOT EXISTS prevents failure on re-run.
    op.execute("ALTER TYPE datasource ADD VALUE IF NOT EXISTS 'IOT_REAL'")


def downgrade() -> None:
    # Postgres does not support removing enum values without recreating the type.
    # This migration is intentionally irreversible — downgrade is a no-op.
    pass
