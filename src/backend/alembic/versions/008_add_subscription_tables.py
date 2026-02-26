"""Add subscription tables for game pack subscriptions

Revision ID: 008
Revises: 007
Create Date: 2026-02-26 13:00:00.000000

This migration creates:
1. subscriptions table
2. subscription_game_selections table

Plan types: game_pack_5, game_pack_10, full_annual
Status: active, expired, cancelled, upgraded
"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "008"
down_revision = "007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create subscription tables."""
    # Create subscriptions table
    op.create_table(
        "subscriptions",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column(
            "parent_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("plan_type", sa.String(), nullable=False),
        sa.Column("amount_paid", sa.Integer(), nullable=False),  # In paise/cents
        sa.Column("currency", sa.String(), nullable=False, server_default="INR"),
        sa.Column("start_date", sa.DateTime(), nullable=False),
        sa.Column("end_date", sa.DateTime(), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="active"),
        sa.Column("upgraded_to_id", sa.String(), sa.ForeignKey("subscriptions.id"), nullable=True),
        sa.Column("game_swap_used", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("payment_reference", sa.String(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )

    # Create index on parent_id
    op.create_index("idx_subscriptions_parent_id", "subscriptions", ["parent_id"])

    # Create index on status
    op.create_index("idx_subscriptions_status", "subscriptions", ["status"])

    # Create index on end_date for expiry queries
    op.create_index("idx_subscriptions_end_date", "subscriptions", ["end_date"])

    # Create subscription_game_selections table
    op.create_table(
        "subscription_game_selections",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column(
            "subscription_id",
            sa.String(),
            sa.ForeignKey("subscriptions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("game_id", sa.String(), nullable=False),
        sa.Column("selected_at", sa.DateTime(), nullable=False),
        sa.Column("swapped_at", sa.DateTime(), nullable=True),
        sa.Column("original_game_id", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    # Create indexes
    op.create_index(
        "idx_subscription_game_selections_subscription_id",
        "subscription_game_selections",
        ["subscription_id"],
    )
    op.create_index(
        "idx_subscription_game_selections_game_id",
        "subscription_game_selections",
        ["game_id"],
    )


def downgrade() -> None:
    """Drop subscription tables."""
    op.drop_table("subscription_game_selections")
    op.drop_table("subscriptions")
