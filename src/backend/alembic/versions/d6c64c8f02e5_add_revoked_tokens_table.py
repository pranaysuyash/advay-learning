"""add_revoked_tokens_table

Revision ID: d6c64c8f02e5
Revises: 009
Create Date: 2026-02-27 20:30:32.469544

"""
from datetime import datetime

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = 'd6c64c8f02e5'
down_revision = '009'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create revoked_tokens table for JWT token blacklist feature."""
    op.create_table(
        'revoked_tokens',
        sa.Column('jti', sa.String(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('revoked_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.PrimaryKeyConstraint('jti')
    )
    op.create_index('ix_revoked_tokens_jti', 'revoked_tokens', ['jti'], unique=False)
    op.create_index('ix_revoked_tokens_expires_at', 'revoked_tokens', ['expires_at'], unique=False)


def downgrade() -> None:
    """Drop revoked_tokens table."""
    op.drop_index('ix_revoked_tokens_expires_at', table_name='revoked_tokens')
    op.drop_index('ix_revoked_tokens_jti', table_name='revoked_tokens')
    op.drop_table('revoked_tokens')
