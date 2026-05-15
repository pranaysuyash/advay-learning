#!/usr/bin/env bash
# Database Restore Script for Advay Learning Platform
# Usage: ./scripts/restore-database.sh <backup-file.sql.gz>
# Restores PostgreSQL database from backup

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Check arguments
if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <backup-file.sql.gz>"
  echo ""
  echo "Available backups:"
  find "$PROJECT_DIR/backups" -name "advay-db-*.sql.gz" -type f 2>/dev/null | sort | tail -10 || echo "  No backups found"
  exit 1
fi

BACKUP_FILE="$1"

# Validate backup file exists
if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "ERROR: Backup file not found: $BACKUP_FILE"
  exit 1
fi

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

# Get backup size
FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
BACKUP_NAME=$(basename "$BACKUP_FILE")

echo "=== Advay Database Restore ==="
echo "WARNING: This will REPLACE the current database!"
echo "Backup file: $BACKUP_NAME"
echo "Size: $FILE_SIZE"
echo "Target database: $DB_NAME"
echo ""

# Confirm with user
read -rp "Are you sure you want to proceed? Type 'RESTORE' to continue: " confirm
if [[ "$confirm" != "RESTORE" ]]; then
  echo "Restore cancelled."
  exit 0
fi

# Create a pre-restore backup
echo ""
echo "Creating pre-restore backup..."
PRE_RESTORE_BACKUP="$PROJECT_DIR/backups/pre-restore-$(date +%Y%m%d-%H%M%S).sql.gz"
./scripts/backup-database.sh "$PROJECT_DIR/backups" > /dev/null
cp "$PROJECT_DIR"/backups/advay-db-*.sql.gz "$PRE_RESTORE_BACKUP" 2>/dev/null || true
echo "Pre-restore backup: $PRE_RESTORE_BACKUP"

# Determine if we need to decompress
if [[ "$BACKUP_FILE" == *.gz ]]; then
  echo "Decompressing backup..."
  TEMP_DIR=$(mktemp -d)
  gunzip -c "$BACKUP_FILE" > "$TEMP_DIR/restore.sql"
  RESTORE_FILE="$TEMP_DIR/restore.sql"
else
  RESTORE_FILE="$BACKUP_FILE"
fi

# Check if running in Docker Compose context
if docker compose ps "$DB_SERVICE" &>/dev/null; then
  echo "Using Docker Compose for restore..."
  
  # Drop and recreate database
  echo "Dropping and recreating database..."
  docker compose exec "$DB_SERVICE" psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS \"$DB_NAME\";" || true
  docker compose exec "$DB_SERVICE" psql -U "$DB_USER" -d postgres -c "CREATE DATABASE \"$DB_NAME\";"
  
  # Restore from backup
  echo "Restoring database (this may take a while)..."
  docker compose exec -T "$DB_SERVICE" psql -U "$DB_USER" -d "$DB_NAME" < "$RESTORE_FILE"
  
else
  echo "Using direct PostgreSQL connection..."
  
  # Check if psql is available
  if ! command -v psql &>/dev/null; then
    echo "ERROR: psql not found. Install PostgreSQL client tools."
    exit 1
  fi
  
  # Drop and recreate database
  echo "Dropping and recreating database..."
  PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres \
    -c "DROP DATABASE IF EXISTS \"$DB_NAME\";"
  PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres \
    -c "CREATE DATABASE \"$DB_NAME\";"
  
  # Restore from backup
  echo "Restoring database (this may take a while)..."
  PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    < "$RESTORE_FILE"
fi

# Cleanup temp files
if [[ -n "${TEMP_DIR:-}" && -d "$TEMP_DIR" ]]; then
  rm -rf "$TEMP_DIR"
fi

echo ""
echo "=== Restore Complete ==="
echo "Database restored from: $BACKUP_NAME"
echo ""
echo "Next steps:"
echo "1. Verify application is working"
echo "2. Check data integrity"
echo "3. Run smoke tests"
echo ""
exit 0
