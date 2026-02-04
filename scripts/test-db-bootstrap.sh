#!/bin/bash
# Test Database Bootstrap Script
# Creates test database and runs migrations before executing tests

set -e

echo "=== Advay Vision Learning - Test Database Setup ==="

# Check if PostgreSQL is running
if ! pg_isready -q 2>/dev/null; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo "   macOS: brew services start postgresql@14"
    echo "   Ubuntu: sudo service postgresql start"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Test database configuration
DB_NAME="advay_learning_test"
DB_USER="${POSTGRES_USER:-postgres}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

echo ""
echo "Test Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo ""

# Create test database if it doesn't exist
echo "Creating test database (if not exists)..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1; then
    echo "✅ Test database already exists"
else
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME"
    echo "✅ Test database created"
fi

# Change to backend directory
BACKEND_DIR="$(dirname "$0")/../src/backend"
cd "$BACKEND_DIR"

# Activate virtual environment
if [ -d ".venv" ]; then
    source .venv/bin/activate
    echo "✅ Activated backend virtual environment"
else
    echo "❌ Backend virtual environment not found. Run setup first: cd src/backend && uv venv"
    exit 1
fi

# Check if alembic is installed
if ! command -v alembic &> /dev/null; then
    echo "Installing alembic..."
    uv pip install alembic
fi

# Run migrations for test database
echo ""
echo "Running database migrations on test database..."
export DATABASE_URL="postgresql+asyncpg://$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
alembic upgrade head

echo ""
echo "✅ Test database setup complete!"
echo ""
echo "You can now run tests:"
echo "  pytest"
echo "  pytest -v"
echo "  pytest tests/test_auth.py"
