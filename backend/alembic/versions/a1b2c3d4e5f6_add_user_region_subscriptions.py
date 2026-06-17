"""add_user_region_subscriptions

Revision ID: a1b2c3d4e5f6
Revises: 132d7cef810a
Create Date: 2026-06-16 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "132d7cef810a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user_region_subscriptions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("region_id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["region_id"], ["regions.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "region_id", name="uq_user_region_subscription"),
    )
    op.create_index(
        op.f("ix_user_region_subscriptions_user_id"),
        "user_region_subscriptions",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_user_region_subscriptions_region_id"),
        "user_region_subscriptions",
        ["region_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_user_region_subscriptions_region_id"),
        table_name="user_region_subscriptions",
    )
    op.drop_index(
        op.f("ix_user_region_subscriptions_user_id"),
        table_name="user_region_subscriptions",
    )
    op.drop_table("user_region_subscriptions")
