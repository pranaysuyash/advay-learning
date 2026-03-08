"""Add quarterly subscription refresh cycle state.

Revision ID: f3c1a2b9d4e7
Revises: e1b4c3a9f7d2
Create Date: 2026-03-08 23:30:00.000000
"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "f3c1a2b9d4e7"
down_revision = "e1b4c3a9f7d2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add last refresh cycle tracking to subscriptions."""
    op.add_column(
        "subscriptions",
        sa.Column(
            "last_refresh_cycle_used",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
    )


def downgrade() -> None:
    """Remove last refresh cycle tracking."""
    op.drop_column("subscriptions", "last_refresh_cycle_used")
