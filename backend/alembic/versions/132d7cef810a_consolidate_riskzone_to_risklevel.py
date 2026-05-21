"""consolidate_riskzone_to_risklevel

Revision ID: 132d7cef810a
Revises: d7b3ee73b0bc
Create Date: 2026-05-21 13:06:41.590496

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '132d7cef810a'
down_revision: Union[str, None] = 'd7b3ee73b0bc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

new_enum = sa.Enum('LOW', 'MODERATE', 'HIGH', 'CRITICAL', name='risklevel')
old_enum = sa.Enum('HIGH', 'MODERATE', 'LOW', name='riskzone')


def upgrade() -> None:
    # risklevel type already exists from the predictions table migration
    op.execute("ALTER TABLE regions RENAME COLUMN risk_zone TO risk_level")
    op.execute(
        "ALTER TABLE regions ALTER COLUMN risk_level TYPE risklevel "
        "USING risk_level::text::risklevel"
    )
    old_enum.drop(op.get_bind())


def downgrade() -> None:
    old_enum.create(op.get_bind())
    op.execute(
        "ALTER TABLE regions ALTER COLUMN risk_level TYPE riskzone "
        "USING risk_level::text::riskzone"
    )
    op.execute("ALTER TABLE regions RENAME COLUMN risk_level TO risk_zone")
    # risklevel type is still used by predictions — do not drop it
