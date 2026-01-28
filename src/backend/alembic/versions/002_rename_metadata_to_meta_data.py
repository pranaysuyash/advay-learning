"""Rename progress.metadata -> progress.meta_data

Revision ID: 002
Revises: 001
Create Date: 2026-01-28 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # SQLite doesn't support direct column rename with ALTER in older versions,
    # so use batch_alter_table which handles it safely across backends.
    with op.batch_alter_table('progress', schema=None) as batch_op:
        batch_op.alter_column('metadata', new_column_name='meta_data', existing_type=sa.JSON())


def downgrade() -> None:
    with op.batch_alter_table('progress', schema=None) as batch_op:
        batch_op.alter_column('meta_data', new_column_name='metadata', existing_type=sa.JSON())
