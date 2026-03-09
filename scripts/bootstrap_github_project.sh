#!/usr/bin/env bash
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "[ERROR] gh CLI is required."
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "[ERROR] gh is not authenticated. Run: gh auth login"
  exit 1
fi

OWNER="${1:-$(gh repo view --json owner --jq '.owner.login')}"
PROJECT_TITLE="${2:-Advay Engineering Board}"

echo "Owner: $OWNER"
echo "Project title: $PROJECT_TITLE"

existing_number="$(
  gh project list --owner "$OWNER" --limit 200 --format json \
    | jq -r --arg title "$PROJECT_TITLE" '.projects[] | select(.title == $title) | .number' \
    | head -n 1 || true
)"

if [[ -n "${existing_number:-}" ]]; then
  echo "[INFO] Project already exists: #$existing_number"
else
  echo "[INFO] Creating project..."
  gh project create --owner "$OWNER" --title "$PROJECT_TITLE" >/dev/null
fi

project_url="$(
  gh project list --owner "$OWNER" --limit 200 --format json \
    | jq -r --arg title "$PROJECT_TITLE" '.projects[] | select(.title == $title) | .url' \
    | head -n 1
)"
project_number="$(
  gh project list --owner "$OWNER" --limit 200 --format json \
    | jq -r --arg title "$PROJECT_TITLE" '.projects[] | select(.title == $title) | .number' \
    | head -n 1
)"

echo "[OK] Project URL: $project_url"
echo "[OK] Project Number: $project_number"
echo ""
echo "Next (one-time) manual project setup in UI:"
echo "1) Add/rename Status options: Inbox, Ready, In Progress, PR Open, Review, Done"
echo "2) Set repo workflow variable PROJECT_URL=$project_url"
echo "3) Create repo secret PROJECT_TOKEN (classic token with project+repo scopes)"
