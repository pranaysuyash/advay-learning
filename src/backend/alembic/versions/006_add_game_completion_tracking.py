"""Add game completion tracking

Revision ID: 006
Revises: 2274d5839560
Create Date: 2026-02-25 15:45:00.000000

This migration adds:
1. `completed` BOOLEAN field to progress table for tracking game completion
2. Indexes for efficient game stats queries (game discovery feature)
"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "006"
down_revision = "2274d5839560"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add completed field and game stats indexes."""
    # Add completed column to progress table
    # Default to False for new records, but we'll backfill based on heuristics
    op.add_column(
        "progress",
        sa.Column("completed", sa.Boolean(), nullable=False, server_default=sa.false()),
    )

    # Create indexes for efficient game stats queries
    # Index for stats aggregation by game (content_id when activity_type='game')
    op.create_index(
        "idx_progress_game_stats",
        "progress",
        ["activity_type", "content_id", "completed_at"],
        postgresql_where=sa.text("activity_type = 'game'"),
    )

    # Index for per-profile game history queries
    op.create_index(
        "idx_progress_profile_game",
        "progress",
        ["profile_id", "activity_type", "content_id"],
    )

    # Backfill completed field using heuristic: sessions >60s with score >0
    # This matches the frontend logic for determining completion
    op.execute(
        """
        UPDATE progress
        SET completed = TRUE
        WHERE activity_type = 'game'
          AND duration_seconds > 60
          AND score > 0
        """
    )


def downgrade() -> None:
    """Remove completed field and indexes."""
    # Drop indexes first
    op.drop_index("idx_progress_profile_game", table_name="progress")
    op.drop_index("idx_progress_game_stats", table_name="progress")

    # Drop completed column
    op.drop_column("progress", "completed")
