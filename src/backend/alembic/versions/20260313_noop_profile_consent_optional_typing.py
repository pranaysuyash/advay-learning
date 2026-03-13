"""No-op migration for optional profile consent relationship typing.

Revision ID: 20260313_noop_profile_consent_optional_typing
Revises: 20260313_noop_relationship_typing_restore
Create Date: 2026-03-13 19:06:00.000000

@ticket TCK-20260313-006
"""

from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = "20260313_noop_profile_consent_optional_typing"
down_revision: Union[str, None] = "20260313_noop_relationship_typing_restore"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None
__all__ = ("revision", "down_revision", "branch_labels", "depends_on")


def upgrade() -> None:
    """No schema changes.

    This revision records ORM typing only. The profile-to-consent relationship
    remains nullable in behavior; no database schema change is required.
    """


def downgrade() -> None:
    """No schema changes to revert."""
