"""Ensure game completion tracking schema is present

Revision ID: 007
Revises: 005
Create Date: 2026-02-26 12:30:00.000000

This migration safely ensures:
1. progress.completed column exists
2. idx_progress_game_stats exists
3. idx_progress_profile_game exists
"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "007"
down_revision = "005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Ensure completed column and stats indexes exist on progress table."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    columns = {col["name"] for col in inspector.get_columns("progress")}
    if "completed" not in columns:
        op.add_column(
            "progress",
            sa.Column("completed", sa.Boolean(), nullable=False, server_default=sa.false()),
        )

        op.execute(
            """
            UPDATE progress
            SET completed = TRUE
            WHERE activity_type = 'game'
              AND duration_seconds > 60
              AND score > 0
            """
        )

    existing_indexes = {idx["name"] for idx in inspector.get_indexes("progress")}

    if "idx_progress_game_stats" not in existing_indexes:
        op.create_index(
            "idx_progress_game_stats",
            "progress",
            ["activity_type", "content_id", "completed_at"],
            postgresql_where=sa.text("activity_type = 'game'"),
        )

    if "idx_progress_profile_game" not in existing_indexes:
        op.create_index(
            "idx_progress_profile_game",
            "progress",
            ["profile_id", "activity_type", "content_id"],
        )


def downgrade() -> None:
    """Remove completion tracking schema if present."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    existing_indexes = {idx["name"] for idx in inspector.get_indexes("progress")}
    if "idx_progress_profile_game" in existing_indexes:
        op.drop_index("idx_progress_profile_game", table_name="progress")
    if "idx_progress_game_stats" in existing_indexes:
        op.drop_index("idx_progress_game_stats", table_name="progress")

    columns = {col["name"] for col in inspector.get_columns("progress")}
    if "completed" in columns:
        op.drop_column("progress", "completed")
