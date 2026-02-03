"""Health check utilities."""

import time
from typing import Any, Dict

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def check_database(db: AsyncSession) -> Dict[str, Any]:
    """Check database connectivity with performance metrics.

    Returns:
        Dict with 'status' ('healthy' or 'unhealthy'), optional 'error', and 'response_time_ms'
    """
    start_time = time.time()
    try:
        # Lightweight DB check
        await db.execute(text("SELECT 1"))
        response_time = (time.time() - start_time) * 1000  # Convert to milliseconds
        return {"status": "healthy", "response_time_ms": round(response_time, 2)}
    except Exception as e:
        response_time = (time.time() - start_time) * 1000
        return {
            "status": "unhealthy",
            "error": str(e),
            "response_time_ms": round(response_time, 2),
        }


async def get_health_status(db: AsyncSession) -> Dict[str, Any]:
    """Get comprehensive health status with performance metrics.

    Returns:
        Dict with overall status, component statuses, and performance metrics
    """
    overall_start = time.time()

    db_status = await check_database(db)

    # Overall status is healthy only if all components are healthy
    overall_status = "healthy" if db_status["status"] == "healthy" else "unhealthy"
    overall_response_time = (time.time() - overall_start) * 1000

    return {
        "status": overall_status,
        "response_time_ms": round(overall_response_time, 2),
        "components": {"database": db_status},
        "metadata": {
            "checks_performed": 1,
            "timestamp": time.time(),
        },  # Database only for now
    }
