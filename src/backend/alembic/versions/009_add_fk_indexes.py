"""Add indexes to foreign key columns for performance

Revision ID: 009
Revises: 008
Create Date: 2026-02-27 10:30:00.000000

This migration adds indexes to:
1. profiles.parent_id - for faster lookup by parent user
2. achievements.profile_id - for faster lookup by profile

These indexes improve query performance when filtering by foreign keys.
"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "009"
down_revision = "008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add FK indexes for performance."""
    # Index on profiles.parent_id for faster parent lookups
    op.create_index(
        "ix_profiles_parent_id",
        "profiles",
        ["parent_id"],
        unique=False,
    )
    
    # Index on achievements.profile_id for faster profile lookups
    op.create_index(
        "ix_achievements_profile_id",
        "achievements",
        ["profile_id"],
        unique=False,
    )


def downgrade() -> None:
    """Remove FK indexes."""
    op.drop_index("ix_profiles_parent_id", table_name="profiles")
    op.drop_index("ix_achievements_profile_id", table_name="achievements")
