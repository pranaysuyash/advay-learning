#!/bin/bash
# Database Initialization Script
# Creates database and runs migrations

set -e

echo "=== Advay Vision Learning - Database Initialization ==="

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo "   macOS: brew services start postgresql"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Database configuration
DB_NAME="advay_learning"
DB_USER="${POSTGRES_USER:-postgres}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

echo ""
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo ""

# Create database if it doesn't exist
echo "Creating database (if not exists)..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME"

echo "✅ Database ready"

# Change to backend directory
cd "$(dirname "$0")/../src/backend"

# Activate virtual environment
if [ -d ".venv" ]; then
    source .venv/bin/activate
    echo "✅ Activated backend virtual environment"
else
    echo "❌ Backend virtual environment not found. Run setup first."
    exit 1
fi

# Check if alembic is installed
if ! command -v alembic &> /dev/null; then
    echo "Installing alembic..."
    uv pip install alembic
fi

# Run migrations
echo ""
echo "Running database migrations..."
alembic upgrade head

echo ""
echo "✅ Database initialization complete!"
echo ""
echo "To verify, run:"
echo "  cd src/backend && python -c 'from app.db.session import engine; print(\"DB connection OK\")'"
