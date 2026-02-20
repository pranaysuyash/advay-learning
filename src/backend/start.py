#!/usr/bin/env python3
"""Backend server startup script with proper Python 3.13+ support.

This script ensures proper virtual environment handling for Python 3.13+
which has stricter requirements for multiprocessing with spawn context.

Usage:
    python start.py                    # Start with auto-reload in dev mode
    python start.py --production       # Start without reload in production mode
    python start.py --port 8002        # Start on custom port
    python start.py --workers 4        # Start with 4 workers in production
"""

import argparse
import os
import sys

# Ensure we're running from the backend directory
backend_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(backend_dir)

# Add the backend directory to Python path
sys.path.insert(0, backend_dir)


def main():
    parser = argparse.ArgumentParser(description="Start the backend server")
    parser.add_argument(
        "--production",
        action="store_true",
        help="Run in production mode (no auto-reload, multiple workers)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8001,
        help="Port to run the server on (default: 8001)",
    )
    parser.add_argument(
        "--host",
        default="0.0.0.0",
        help="Host to bind to (default: 0.0.0.0)",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=None,
        help="Number of worker processes (default: 1 dev, 4 production)",
    )
    args = parser.parse_args()

    # Import after path setup
    from app.core.config import settings

    # Determine reload mode and workers
    reload_mode = not args.production and settings.DEBUG

    # Set workers based on mode
    if args.workers:
        workers = args.workers
    elif args.production:
        workers = 4  # Default production workers
    else:
        workers = 1  # Dev mode

    print("🚀 Starting backend server...")
    print(f"   Host: {args.host}")
    print(f"   Port: {args.port}")
    print(f"   Workers: {workers}")
    print(f"   Reload: {reload_mode}")
    print(f"   Python: {sys.version}")
    print()

    # Use uvicorn programmatically with proper import string
    # This avoids multiprocessing spawn issues in Python 3.13+
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=args.host,
        port=args.port,
        reload=reload_mode,
        workers=workers,
        log_level="info",
    )


if __name__ == "__main__":
    main()
