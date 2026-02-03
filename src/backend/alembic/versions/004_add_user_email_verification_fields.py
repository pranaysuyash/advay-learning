"""Add user email verification and password reset fields

Revision ID: 004
Revises: 003
Create Date: 2026-01-29 14:45:00.000000

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add email verification fields to users table
    op.add_column(
        "users",
        sa.Column(
            "email_verified", sa.Boolean(), nullable=False, server_default="false"
        ),
    )
    op.add_column(
        "users", sa.Column("email_verification_token", sa.String(), nullable=True)
    )
    op.add_column(
        "users", sa.Column("email_verification_expires", sa.DateTime(), nullable=True)
    )

    # Add password reset fields to users table
    op.add_column(
        "users", sa.Column("password_reset_token", sa.String(), nullable=True)
    )
    op.add_column(
        "users", sa.Column("password_reset_expires", sa.DateTime(), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("users", "password_reset_expires")
    op.drop_column("users", "password_reset_token")
    op.drop_column("users", "email_verification_expires")
    op.drop_column("users", "email_verification_token")
    op.drop_column("users", "email_verified")
