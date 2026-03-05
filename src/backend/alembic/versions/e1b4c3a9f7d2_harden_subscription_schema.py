"""Harden subscription schema constraints and webhook idempotency

Revision ID: e1b4c3a9f7d2
Revises: d6c64c8f02e5
Create Date: 2026-03-03 18:45:00.000000
"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "e1b4c3a9f7d2"
down_revision = "d6c64c8f02e5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add subscription integrity constraints and webhook event tracking."""
    # Normalize duplicate non-null payment references before enforcing uniqueness.
    # Keep the first row as-is and rewrite subsequent duplicates deterministically.
    op.execute(
        sa.text(
            """
            WITH ranked AS (
                SELECT id, payment_reference,
                       ROW_NUMBER() OVER (
                           PARTITION BY payment_reference
                           ORDER BY created_at NULLS LAST, id
                       ) AS rn
                FROM subscriptions
                WHERE payment_reference IS NOT NULL
            )
            UPDATE subscriptions AS s
            SET payment_reference = ranked.payment_reference || '_dup_' || s.id
            FROM ranked
            WHERE s.id = ranked.id
              AND ranked.rn > 1
            """
        )
    )

    op.create_unique_constraint(
        "uq_payment_reference",
        "subscriptions",
        ["payment_reference"],
    )
    op.create_check_constraint(
        "ck_end_after_start",
        "subscriptions",
        "end_date > start_date",
    )
    op.create_check_constraint(
        "ck_amount_nonneg",
        "subscriptions",
        "amount_paid >= 0",
    )
    op.create_index(
        "ix_unique_active_subscription",
        "subscriptions",
        ["parent_id"],
        unique=True,
        postgresql_where=sa.text("status = 'active'"),
    )

    op.create_unique_constraint(
        "uq_subscription_game",
        "subscription_game_selections",
        ["subscription_id", "game_id"],
    )
    op.create_check_constraint(
        "ck_swap_consistency",
        "subscription_game_selections",
        "(swapped_at IS NULL AND original_game_id IS NULL) OR "
        "(swapped_at IS NOT NULL AND original_game_id IS NOT NULL)",
    )

    op.create_table(
        "dodo_webhook_events",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("webhook_id", sa.String(), nullable=False),
        sa.Column("event_type", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="received"),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("session_id", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("webhook_id", name="uq_webhook_id"),
    )
    op.create_index(
        "ix_dodo_webhook_events_webhook_id",
        "dodo_webhook_events",
        ["webhook_id"],
        unique=False,
    )


def downgrade() -> None:
    """Remove subscription integrity constraints and webhook event tracking."""
    op.drop_index(
        "ix_dodo_webhook_events_webhook_id",
        table_name="dodo_webhook_events",
    )
    op.drop_table("dodo_webhook_events")

    op.drop_constraint(
        "ck_swap_consistency",
        "subscription_game_selections",
        type_="check",
    )
    op.drop_constraint(
        "uq_subscription_game",
        "subscription_game_selections",
        type_="unique",
    )

    op.drop_index(
        "ix_unique_active_subscription",
        table_name="subscriptions",
    )
    op.drop_constraint(
        "ck_amount_nonneg",
        "subscriptions",
        type_="check",
    )
    op.drop_constraint(
        "ck_end_after_start",
        "subscriptions",
        type_="check",
    )
    op.drop_constraint(
        "uq_payment_reference",
        "subscriptions",
        type_="unique",
    )
