#!/usr/bin/env bash
set -euo pipefail

: "${DEPLOY_HOST:?DEPLOY_HOST is required}"
: "${DEPLOY_USER:?DEPLOY_USER is required}"
: "${DEPLOY_PATH:?DEPLOY_PATH is required}"
: "${SSH_KEY_PATH:?SSH_KEY_PATH is required}"

DEPLOY_PORT="${DEPLOY_PORT:-22}"
APP_URL="${APP_URL:-}"
FRONTEND_URL="${FRONTEND_URL:-$APP_URL}"
BACKEND_URL="${BACKEND_URL:-$APP_URL}"
BACKUP_BEFORE_DEPLOY="${BACKUP_BEFORE_DEPLOY:-1}"
REMOTE_BACKUP_DIR="${REMOTE_BACKUP_DIR:-${DEPLOY_PATH}/backups}"

SSH_OPTS=(-i "$SSH_KEY_PATH" -p "$DEPLOY_PORT" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null)

if [[ "$BACKUP_BEFORE_DEPLOY" == "1" ]]; then
  ssh "${SSH_OPTS[@]}" "$DEPLOY_USER@$DEPLOY_HOST" "cd '$DEPLOY_PATH' && BACKUP_DIR='$REMOTE_BACKUP_DIR' ./scripts/backup-db.sh"
fi

ssh "${SSH_OPTS[@]}" "$DEPLOY_USER@$DEPLOY_HOST" "cd '$DEPLOY_PATH' && docker compose pull && docker compose up -d --remove-orphans"

if [[ -n "$FRONTEND_URL" || -n "$BACKEND_URL" ]]; then
  FRONTEND_URL="$FRONTEND_URL" BACKEND_URL="$BACKEND_URL" ./scripts/post-deploy-smoke.sh
fi
