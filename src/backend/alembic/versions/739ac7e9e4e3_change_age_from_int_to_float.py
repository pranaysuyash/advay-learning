"""Change age from int to float

Revision ID: 739ac7e9e4e3
Revises: 004
Create Date: 2026-01-29 22:38:51.135838

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "739ac7e9e4e3"
down_revision = "004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Change age column from Integer to Float
    op.alter_column(
        "profiles",
        "age",
        existing_type=sa.Integer(),
        type_=sa.Float(),
        existing_nullable=True,
    )


def downgrade() -> None:
    # Change age column back to Integer
    op.alter_column(
        "profiles",
        "age",
        existing_type=sa.Float(),
        type_=sa.Integer(),
        existing_nullable=True,
    )
