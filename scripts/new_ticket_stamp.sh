#!/usr/bin/env bash
set -euo pipefail

agent="${1:-${AGENT_NAME:-codex}}"
if [[ -z "${agent// }" ]]; then
  echo "usage: scripts/new_ticket_stamp.sh <agent-name>" >&2
  exit 2
fi

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
nonce="$(
  python3 - <<'PY'
import secrets
alphabet = "abcdefghijklmnopqrstuvwxyz0123456789"
print("".join(secrets.choice(alphabet) for _ in range(4)))
PY
)"

echo "STAMP-${timestamp}-${agent}-${nonce}"
