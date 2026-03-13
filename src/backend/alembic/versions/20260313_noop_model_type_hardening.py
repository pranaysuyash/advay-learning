"""No-op migration for model typing/code-scanning hardening

Revision ID: 20260313_noop_model_type_hardening
Revises: 20260307_add_parental_consent
Create Date: 2026-03-13 17:15:00.000000

@ticket TCK-20260313-006
"""

from typing import Sequence, Union

# revision identifiers, used by Alembic.
revision: str = "20260313_noop_model_type_hardening"
down_revision: Union[str, None] = "20260307_add_parental_consent"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None
__all__ = ("revision", "down_revision", "branch_labels", "depends_on")


def upgrade() -> None:
    """No schema changes.

    This revision records model-layer typing and relationship hardening used to
    satisfy static analysis/code-scanning gates without changing database
    structure.
    """


def downgrade() -> None:
    """No schema changes to revert."""
