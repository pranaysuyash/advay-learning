#!/usr/bin/env bash
set -euo pipefail

APP_URL="${1:-${APP_URL:-}}"
FRONTEND_URL="${FRONTEND_URL:-$APP_URL}"
BACKEND_URL="${BACKEND_URL:-$APP_URL}"

if [[ -z "$FRONTEND_URL" && -z "$BACKEND_URL" ]]; then
  echo "APP_URL or FRONTEND_URL/BACKEND_URL environment variables are required" >&2
  exit 1
fi

if [[ -n "$BACKEND_URL" ]]; then
  curl --fail --silent --show-error --max-time 20 "$BACKEND_URL/health" >/dev/null
fi

if [[ -n "$FRONTEND_URL" ]]; then
  curl --fail --silent --show-error --max-time 20 "$FRONTEND_URL" >/dev/null
fi

echo "Post-deploy smoke checks passed for frontend=${FRONTEND_URL:-unset} backend=${BACKEND_URL:-unset}"
