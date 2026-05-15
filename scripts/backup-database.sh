#!/usr/bin/env bash
# Database Backup Script for Advay Learning Platform
# Usage: ./scripts/backup-database.sh [backup-dir]
# Creates timestamped PostgreSQL dump

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${1:-${PROJECT_DIR}/backups}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILENAME="advay-db-${TIMESTAMP}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILENAME}"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Load environment variables from .env.production if it exists
if [[ -f "$PROJECT_DIR/.env.production" ]]; then
  # shellcheck source=/dev/null
  set -a && source "$PROJECT_DIR/.env.production" && set +a
fi

# Database connection settings
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-advay}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-}"

# Docker Compose service name
DB_SERVICE="${DB_SERVICE:-postgres}"

echo "=== Advay Database Backup ==="
echo "Timestamp: $TIMESTAMP"
echo "Backup file: $BACKUP_PATH"
echo ""

# Check if running in Docker Compose context
if docker compose ps "$DB_SERVICE" &>/dev/null; then
  echo "Using Docker Compose for backup..."
  
  # Create backup using docker compose exec
  docker compose exec -T "$DB_SERVICE" pg_dump \
    -h localhost \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    --format=plain \
    > "$BACKUP_PATH"
    
else
  echo "Using direct PostgreSQL connection..."
  
  # Check if pg_dump is available
  if ! command -v pg_dump &>/dev/null; then
    echo "ERROR: pg_dump not found. Install PostgreSQL client tools."
    exit 1
  fi
  
  # Create backup using direct connection
  PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    --format=plain \
    > "$BACKUP_PATH"
fi

# Compress the backup
echo "Compressing backup..."
gzip "$BACKUP_PATH"
COMPRESSED_PATH="${BACKUP_PATH}.gz"

# Get file size
FILE_SIZE=$(du -h "$COMPRESSED_PATH" | cut -f1)

echo ""
echo "=== Backup Complete ==="
echo "File: $COMPRESSED_PATH"
echo "Size: $FILE_SIZE"
echo "Timestamp: $TIMESTAMP"

# List recent backups
echo ""
echo "Recent backups:"
ls -lh "$BACKUP_DIR"/*.gz 2>/dev/null | tail -5 || echo "No previous backups found"

# Cleanup old backups (keep last 30 days)
echo ""
echo "Cleaning up backups older than 30 days..."
find "$BACKUP_DIR" -name "advay-db-*.sql.gz" -type f -mtime +30 -delete || true

REMAINING=$(find "$BACKUP_DIR" -name "advay-db-*.sql.gz" -type f | wc -l)
echo "Remaining backups: $REMAINING"

echo ""
echo "=== Done ==="
exit 0
