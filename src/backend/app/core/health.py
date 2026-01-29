"""Health check utilities."""

from typing import Any, Dict

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def check_database(db: AsyncSession) -> Dict[str, Any]:
    """Check database connectivity.
    
    Returns:
        Dict with 'status' ('healthy' or 'unhealthy') and optional 'error'
    """
    try:
        # Lightweight DB check
        await db.execute(text("SELECT 1"))
        return {"status": "healthy"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


async def get_health_status(db: AsyncSession) -> Dict[str, Any]:
    """Get comprehensive health status.
    
    Returns:
        Dict with overall status and component statuses
    """
    db_status = await check_database(db)

    # Overall status is healthy only if all components are healthy
    overall_status = "healthy" if db_status["status"] == "healthy" else "unhealthy"

    return {
        "status": overall_status,
        "components": {
            "database": db_status
        }
    }
