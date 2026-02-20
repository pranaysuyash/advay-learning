#!/bin/bash
# Database Backup Script
# Usage: ./scripts/backup-db.sh
# Schedule with cron: 0 2 * * * /path/to/backup-db.sh

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="${DB_NAME:-advay_learning}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "=========================================="
echo "Database Backup - $DATE"
echo "=========================================="

# Build pg_dump command
PGPASSWORD="${DB_PASSWORD}" pg_dump \
    --host "$DB_HOST" \
    --port "$DB_PORT" \
    --username "$DB_USER" \
    --format=custom \
    --compress=9 \
    --verbose \
    --file "$BACKUP_DIR/${DB_NAME}_${DATE}.dump"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup created: $BACKUP_DIR/${DB_NAME}_${DATE}.dump"
    
    # Get file size
    SIZE=$(du -h "$BACKUP_DIR/${DB_NAME}_${DATE}.dump" | cut -f1)
    echo "Backup size: $SIZE"
    
    # Create symlink to latest backup
    ln -sf "${DB_NAME}_${DATE}.dump" "$BACKUP_DIR/latest.dump"
    echo "Latest backup linked: $BACKUP_DIR/latest.dump"
else
    echo "ERROR: Backup failed!"
    exit 1
fi

# Clean up old backups
echo ""
echo "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "*.dump" -mtime +$RETENTION_DAYS -delete
echo "Cleanup complete"

# List remaining backups
echo ""
echo "Current backups:"
ls -lh "$BACKUP_DIR"/*.dump 2>/dev/null || echo "No backups found"

echo ""
echo "=========================================="
echo "Backup completed successfully!"
echo "=========================================="
