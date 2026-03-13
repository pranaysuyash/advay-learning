"""add progress idempotency

Revision ID: add_progress_idempotency
Revises: 739ac7e9e4e3
Create Date: 2026-01-30 01:30:00.000000
"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "add_progress_idempotency"
down_revision = "739ac7e9e4e3"
branch_labels = None
depends_on = None


def upgrade():
    # Add idempotency_key column to progress
    op.add_column("progress", sa.Column("idempotency_key", sa.String(), nullable=True))
    # Add unique constraint on (profile_id, idempotency_key)
    try:
        op.create_unique_constraint(
            "uix_profile_id_idempotency_key",
            "progress",
            ["profile_id", "idempotency_key"],
        )
    except Exception:
        # Some DBs (for example SQLite in dev/test) may not support this constraint step.
        pass


def downgrade():
    try:
        op.drop_constraint("uix_profile_id_idempotency_key", "progress", type_="unique")
    except Exception:
        # Some DBs may not have created the unique constraint during upgrade.
        pass
    op.drop_column("progress", "idempotency_key")
