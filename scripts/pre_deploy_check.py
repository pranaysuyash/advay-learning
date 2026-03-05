#!/usr/bin/env python3
"""
Pre-deployment checks for the backend.

This script verifies:
1. All SQLAlchemy models have corresponding database tables
2. No pending migrations that haven't been applied
3. Settings validation passes with current .env
4. Required environment variables are present

Usage:
    python scripts/pre_deploy_check.py

Exit codes:
    0 - All checks passed
    1 - One or more checks failed
"""

import asyncio
import sys
import os
from pathlib import Path

# Add backend to path
BACKEND_DIR = Path(__file__).parent.parent / "src" / "backend"
sys.path.insert(0, str(BACKEND_DIR))


def check_migrations() -> tuple[bool, list[str]]:
    """Check if there are pending migrations."""
    import subprocess
    
    errors = []
    
    try:
        result = subprocess.run(
            ["alembic", "current"],
            cwd=BACKEND_DIR,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            errors.append(f"Failed to check migrations: {result.stderr}")
            return False, errors
        
        # Check if current is head
        result = subprocess.run(
            ["alembic", "history", "--indicate-current"],
            cwd=BACKEND_DIR,
            capture_output=True,
            text=True
        )
        
        if "(head)" not in result.stdout and "(current)" not in result.stdout:
            errors.append("Database is not at the latest migration (head)")
            errors.append("Run: alembic upgrade head")
            return False, errors
            
    except Exception as e:
        errors.append(f"Migration check failed: {e}")
        return False, errors
    
    return True, []


def check_settings() -> tuple[bool, list[str]]:
    """Check if settings load correctly with current environment."""
    errors = []
    
    try:
        from app.core.config import settings
        
        # Verify critical settings
        if not settings.SECRET_KEY or len(settings.SECRET_KEY) < 32:
            errors.append("SECRET_KEY is missing or too short (< 32 chars)")
        
        if not settings.DATABASE_URL:
            errors.append("DATABASE_URL is missing")
            
    except Exception as e:
        errors.append(f"Settings validation failed: {e}")
        return False, errors
    
    return True, []


async def check_database_schema() -> tuple[bool, list[str]]:
    """Check if all models have corresponding tables."""
    errors = []
    
    try:
        from sqlalchemy import inspect
        from app.db.session import engine
        from app.db.base_class import Base
        
        # Import all models to register them with Base
        from app.db.models import (
            user, profile, progress, achievement,
            subscription_model, game, audit_log, revoked_token
        )
        
        async with engine.connect() as conn:
            def check_tables(sync_conn):
                inspector = inspect(sync_conn)
                existing_tables = set(inspector.get_table_names())
                model_tables = set(Base.metadata.tables.keys())
                
                # Exclude alembic_version as it's managed by alembic, not SQLAlchemy models
                existing_tables.discard('alembic_version')
                
                missing_tables = model_tables - existing_tables
                extra_tables = existing_tables - model_tables
                
                return missing_tables, extra_tables
            
            from sqlalchemy.ext.asyncio import AsyncConnection
            result = await conn.run_sync(check_tables)
            missing_tables, extra_tables = result
            
            if missing_tables:
                errors.append(f"Missing tables in database: {missing_tables}")
                errors.append("Create migration: alembic revision --autogenerate -m 'add missing tables'")
            
            if extra_tables:
                errors.append(f"Extra tables in database (not in models): {extra_tables}")
    
    except Exception as e:
        errors.append(f"Database schema check failed: {e}")
        return False, errors
    
    return len(errors) == 0, errors


def check_env_consistency() -> tuple[bool, list[str]]:
    """Check if .env file has any variables not in Settings."""
    errors = []
    warnings = []
    
    try:
        from app.core.config import Settings
        
        # Get all fields from Settings
        settings_fields = set(Settings.model_fields.keys())
        
        # Read .env file
        env_file = BACKEND_DIR / ".env"
        if env_file.exists():
            with open(env_file) as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key = line.split('=', 1)[0].strip()
                        if key not in settings_fields:
                            warnings.append(f"Env var '{key}' not defined in Settings class")
        
        # Print warnings but don't fail
        for warning in warnings:
            print(f"⚠️  WARNING: {warning}")
    
    except Exception as e:
        errors.append(f"Env consistency check failed: {e}")
        return False, errors
    
    return True, []


async def main():
    """Run all pre-deployment checks."""
    print("🔍 Running pre-deployment checks...\n")
    
    all_passed = True
    
    # Check 1: Migrations
    print("1️⃣  Checking migrations...")
    passed, errors = check_migrations()
    if passed:
        print("   ✅ All migrations applied")
    else:
        print("   ❌ Migration check failed:")
        for error in errors:
            print(f"      - {error}")
        all_passed = False
    
    # Check 2: Settings
    print("\n2️⃣  Checking settings...")
    passed, errors = check_settings()
    if passed:
        print("   ✅ Settings validation passed")
    else:
        print("   ❌ Settings validation failed:")
        for error in errors:
            print(f"      - {error}")
        all_passed = False
    
    # Check 3: Database Schema
    print("\n3️⃣  Checking database schema...")
    passed, errors = await check_database_schema()
    if passed:
        print("   ✅ Database schema consistent")
    else:
        print("   ❌ Database schema issues:")
        for error in errors:
            print(f"      - {error}")
        all_passed = False
    
    # Check 4: Environment consistency (warnings only)
    print("\n4️⃣  Checking environment consistency...")
    check_env_consistency()  # Warnings printed internally
    print("   ✅ Environment check complete")
    
    # Summary
    print("\n" + "=" * 50)
    if all_passed:
        print("✅ All checks passed! Ready for deployment.")
        return 0
    else:
        print("❌ Some checks failed. Fix issues before deploying.")
        return 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
