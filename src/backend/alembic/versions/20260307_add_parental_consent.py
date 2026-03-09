"""Add parental consent tables for DPDPA compliance

Revision ID: 20260307_add_parental_consent
Revises: 
Create Date: 2026-03-07 23:55:00.000000

@ticket TCK-20260307-CRIT-002
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20260307_add_parental_consent'
down_revision: Union[str, None] = 'f3c1a2b9d4e7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create parental consent tables for DPDPA 2023 compliance."""
    
    # Create enum types
    verification_method_type = postgresql.ENUM(
        'email',
        'credit_card',
        'declaration',
        name='verificationmethod',
    )
    verification_method_type.create(op.get_bind(), checkfirst=True)
    verification_method = postgresql.ENUM(
        'email',
        'credit_card',
        'declaration',
        name='verificationmethod',
        create_type=False,
    )
    
    consent_status_type = postgresql.ENUM(
        'pending',
        'verified',
        'withdrawn',
        'expired',
        name='consentstatus',
    )
    consent_status_type.create(op.get_bind(), checkfirst=True)
    consent_status = postgresql.ENUM(
        'pending',
        'verified',
        'withdrawn',
        'expired',
        name='consentstatus',
        create_type=False,
    )
    
    # Create parental_consents table
    op.create_table(
        'parental_consents',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('parent_id', sa.String(), nullable=False),
        sa.Column('child_id', sa.String(), nullable=True),
        sa.Column('parent_email', sa.String(length=255), nullable=False),
        sa.Column('child_name', sa.String(length=100), nullable=True),
        sa.Column('verification_method', verification_method, nullable=False),
        sa.Column('consent_version', sa.String(length=10), nullable=False, server_default='1.0'),
        sa.Column('status', consent_status, nullable=False, server_default='pending'),
        sa.Column('email_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('card_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('declaration_signed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('verification_token', sa.String(length=255), nullable=True),
        sa.Column('card_transaction_id', sa.String(length=255), nullable=True),
        sa.Column('data_processing_purpose', sa.Text(), nullable=True, server_default='Educational activity personalization'),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('consent_timestamp', sa.DateTime(), nullable=True),
        sa.Column('withdrawal_timestamp', sa.DateTime(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['child_id'], ['profiles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['parent_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_parental_consents_parent_id', 'parental_consents', ['parent_id'])
    op.create_index('ix_parental_consents_child_id', 'parental_consents', ['child_id'])
    op.create_index('ix_parental_consents_status', 'parental_consents', ['status'])
    
    # Create consent_audit_logs table
    op.create_table(
        'consent_audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('consent_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('action', sa.String(length=50), nullable=False),
        sa.Column('actor', sa.String(length=50), nullable=False),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('details', sa.JSON(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['consent_id'], ['parental_consents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_consent_audit_logs_consent_id', 'consent_audit_logs', ['consent_id'])
    op.create_index('ix_consent_audit_logs_timestamp', 'consent_audit_logs', ['timestamp'])


def downgrade() -> None:
    """Drop parental consent tables."""
    
    op.drop_table('consent_audit_logs')
    op.drop_table('parental_consents')
    
    # Drop enum types
    postgresql.ENUM(name='verificationmethod').drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name='consentstatus').drop(op.get_bind(), checkfirst=True)
