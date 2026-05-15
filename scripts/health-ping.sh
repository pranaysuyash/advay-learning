#!/usr/bin/env bash
# Health Ping Script for Healthchecks.io
# Usage: ./scripts/health-ping.sh [start|success|failure]
# Sends ping to Healthchecks.io to report job status

set -euo pipefail

# Configuration
HEALTHCHECKS_URL="${HEALTHCHECKS_URL:-https://hc-ping.com}"
API_UUID="${HEALTHCHECKS_API_UUID:-}"
BACKUP_UUID="${HEALTHCHECKS_BACKUP_UUID:-}"

# Parse arguments
CHECK_TYPE="${1:-api}"  # api or backup
STATUS="${2:-success}"   # start, success, or failure

# Select UUID based on check type
case "$CHECK_TYPE" in
  api)
    UUID="$API_UUID"
    CHECK_NAME="API Health"
    ;;
  backup)
    UUID="$BACKUP_BACKUP_UUID"
    CHECK_NAME="Database Backup"
    ;;
  *)
    echo "Usage: $0 [api|backup] [start|success|failure]"
    exit 1
    ;;
esac

# Validate UUID
if [ -z "$UUID" ]; then
  echo "ERROR: HEALTHCHECKS_${CHECK_TYPE^^}_UUID not set"
  echo "Set this environment variable in .env.production"
  exit 1
fi

# Build URL based on status
case "$STATUS" in
  start)
    PING_URL="${HEALTHCHECKS_URL}/${UUID}/start"
    ;;
  success)
    PING_URL="${HEALTHCHECKS_URL}/${UUID}"
    ;;
  failure)
    PING_URL="${HEALTHCHECKS_URL}/${UUID}/fail"
    ;;
  *)
    echo "Invalid status: $STATUS (use start, success, or failure)"
    exit 1
    ;;
esac

# Send ping
echo "Sending $STATUS ping for $CHECK_NAME..."
if curl -fsS -m 10 --retry 5 -o /dev/null "$PING_URL"; then
  echo "✅ Ping sent successfully"
  exit 0
else
  echo "❌ Failed to send ping"
  exit 1
fi
