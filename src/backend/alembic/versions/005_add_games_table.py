"""Add games table

Revision ID: 005
Revises: 004
Create Date: 2025-02-05 00:00:00.000000

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create games table
    op.create_table(
        "games",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False, unique=True),
        sa.Column("description", sa.String(), nullable=False),
        sa.Column("icon", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=False, index=True),
        sa.Column("age_range_min", sa.Integer(), nullable=False),
        sa.Column("age_range_max", sa.Integer(), nullable=False),
        sa.Column("difficulty", sa.String(), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=True),
        sa.Column("game_path", sa.String(), nullable=False),
        sa.Column("is_published", sa.Boolean(), default=True, index=True),
        sa.Column("is_featured", sa.Boolean(), default=False),
        sa.Column("config_json", sa.String(), nullable=True),
        sa.Column("total_plays", sa.Integer(), default=0),
        sa.Column("avg_score", sa.Integer(), nullable=True),
        sa.Column("completion_rate", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column("created_by", sa.String(), nullable=True),
    )

    # Add foreign key to achievements table
    op.add_column(
        "achievements",
        sa.Column("game_id", sa.String(), sa.ForeignKey("games.id", ondelete="CASCADE")),
    )


def downgrade() -> None:
    op.drop_table("games")
    op.drop_column("achievements", "game_id")
