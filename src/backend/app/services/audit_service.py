"""Audit log service for tracking sensitive operations."""

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.audit_log import AuditLog


class AuditService:
    """Service for creating and querying audit logs."""

    @staticmethod
    async def log_action(
        db: AsyncSession,
        *,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        action: str,
        resource_type: str,
        resource_id: Optional[str] = None,
        details: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        verification_required: bool = False,
        verification_method: Optional[str] = None,
    ) -> AuditLog:
        """Log a sensitive action.

        Args:
            db: Database session
            user_id: ID of user performing the action
            user_email: Email of user performing the action
            action: Type of action (e.g., "profile_delete", "user_delete")
            resource_type: Type of resource affected (e.g., "profile", "user")
            resource_id: ID of resource affected
            details: Additional details as string
            ip_address: Client IP address
            user_agent: Client user agent
            verification_required: Whether parent verification was required
            verification_method: Method used for verification

        Returns:
            Created audit log entry
        """
        audit_log = AuditLog(
            user_id=user_id,
            user_email=user_email,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
            verification_required=verification_required,
            verification_method=verification_method,
        )
        db.add(audit_log)
        await db.commit()
        await db.refresh(audit_log)
        return audit_log

    @staticmethod
    async def get_user_actions(
        db: AsyncSession,
        user_id: str,
        limit: int = 100,
        offset: int = 0,
    ) -> list[AuditLog]:
        """Get audit logs for a specific user.

        Args:
            db: Database session
            user_id: User ID to filter by
            limit: Maximum number of results
            offset: Number of results to skip

        Returns:
            List of audit log entries
        """
        result = await db.execute(
            select(AuditLog)
            .where(AuditLog.user_id == user_id)
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_resource_actions(
        db: AsyncSession,
        resource_type: str,
        resource_id: str,
    ) -> list[AuditLog]:
        """Get audit logs for a specific resource.

        Args:
            db: Database session
            resource_type: Type of resource
            resource_id: Resource ID

        Returns:
            List of audit log entries
        """
        result = await db.execute(
            select(AuditLog)
            .where(
                AuditLog.resource_type == resource_type,
                AuditLog.resource_id == resource_id,
            )
            .order_by(AuditLog.created_at.desc())
        )
        return list(result.scalars().all())
