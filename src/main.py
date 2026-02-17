"""Main entry point for Advay's Learning App.

This launcher starts the FastAPI backend server and provides
development/production modes with health checks.
"""

import argparse
import asyncio
import logging
import sys
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent / "backend"))

try:
    import uvicorn
    from app.core.config import get_settings
    from app.core.health import get_health_status
    from app.db.session import async_session
except ImportError as e:
    print(f"❌ Error: Required dependencies not found: {e}")
    print("Please install dependencies: uv pip install -e '.[dev]'")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Advay's Learning App - Backend Server Launcher",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                    # Start in development mode
  %(prog)s --prod            # Start in production mode
  %(prog)s --port 8000       # Start on custom port
  %(prog)s --host 0.0.0.0    # Bind to all interfaces
        """,
    )

    parser.add_argument(
        "--dev",
        action="store_true",
        default=True,
        help="Run in development mode (auto-reload enabled)",
    )

    parser.add_argument(
        "--prod",
        action="store_true",
        help="Run in production mode (no auto-reload, optimized)",
    )

    parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="Host to bind to (default: 127.0.0.1)",
    )

    parser.add_argument(
        "--port",
        type=int,
        default=8001,
        help="Port to bind to (default: 8001)",
    )

    parser.add_argument(
        "--check",
        action="store_true",
        help="Run health checks and exit",
    )

    return parser.parse_args()


async def run_health_checks() -> bool:
    """Run startup health checks.

    Returns:
        True if all checks pass, False otherwise.
    """
    logger.info("🔍 Running startup health checks...")

    checks_passed = True

    # Check 1: Configuration
    try:
        settings = get_settings()
        logger.info(f"✅ Configuration loaded (environment: {settings.APP_ENV})")
    except Exception as e:
        logger.error(f"❌ Configuration error: {e}")
        checks_passed = False

    # Check 2: Database connectivity
    try:
        async with async_session() as session:
            from sqlalchemy import text

            await session.execute(text("SELECT 1"))
            logger.info("✅ Database connection successful")
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        checks_passed = False

    # Check 3: Required directories
    required_dirs = [
        Path(__file__).parent / "frontend" / "dist",
        Path(__file__).parent / "backend" / "app",
    ]
    for dir_path in required_dirs:
        if dir_path.exists():
            logger.info(
                f"✅ Directory exists: {dir_path.relative_to(Path(__file__).parent.parent)}"
            )
        else:
            logger.warning(
                f"⚠️  Directory missing: {dir_path.relative_to(Path(__file__).parent.parent)}"
            )

    return checks_passed


def main() -> int:
    """Main application entry point.

    Returns:
        Exit code (0 for success, non-zero for error)
    """
    args = parse_args()

    # Production mode overrides dev
    is_production = args.prod
    is_development = not is_production

    print("🚀 Advay's Learning App")
    print("=" * 50)
    print(f"Mode: {'Production' if is_production else 'Development'}")
    print(f"Server: http://{args.host}:{args.port}")
    print(f"API Docs: http://{args.host}:{args.port}/docs")
    print("=" * 50)

    # Run health checks if requested
    if args.check:
        success = asyncio.run(run_health_checks())
        return 0 if success else 1

    # Run startup checks
    try:
        success = asyncio.run(run_health_checks())
        if not success:
            logger.error(
                "❌ Startup health checks failed. Fix issues above and try again."
            )
            return 1
    except Exception as e:
        logger.error(f"❌ Unexpected error during health checks: {e}")
        return 1

    # Configure uvicorn
    uvicorn_config = {
        "app": "app.main:app",
        "host": args.host,
        "port": args.port,
        "reload": is_development,
        "log_level": "info",
        "access_log": True,
    }

    if is_production:
        uvicorn_config.update(
            {
                "workers": 1,  # Can be increased based on CPU cores
                "reload": False,
            }
        )

    logger.info(f"🎯 Starting server...")

    try:
        uvicorn.run(**uvicorn_config)
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
        return 0
    except Exception as e:
        logger.error(f"❌ Server error: {e}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
