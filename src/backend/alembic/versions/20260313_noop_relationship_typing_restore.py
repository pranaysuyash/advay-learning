"""No-op migration for ORM relationship typing restoration.

Revision ID: 20260313_noop_relationship_typing_restore
Revises: 20260313_noop_model_type_hardening
Create Date: 2026-03-13 18:32:00.000000

@ticket TCK-20260313-006
"""

from typing import Sequence, Union

# revision identifiers, used by Alembic.
revision: str = "20260313_noop_relationship_typing_restore"
down_revision: Union[str, None] = "20260313_noop_model_type_hardening"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None
__all__ = ("revision", "down_revision", "branch_labels", "depends_on")


def upgrade() -> None:
    """No schema changes.

    This revision records model-layer typing updates for SQLAlchemy
    relationships. The ORM metadata and database schema remain unchanged.
    """


def downgrade() -> None:
    """No schema changes to revert."""
