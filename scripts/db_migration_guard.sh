#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/db_migration_guard.sh --staged
  scripts/db_migration_guard.sh --range <git-range>

Purpose:
  Fail when SQLAlchemy model-layer changes are staged/pushed without an Alembic
  migration update in the same change set.

Examples:
  scripts/db_migration_guard.sh --staged
  scripts/db_migration_guard.sh --range origin/main..HEAD
USAGE
}

mode=""
range=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --staged)
      mode="staged"
      shift
      ;;
    --range)
      mode="range"
      range="${2:-}"
      if [[ -z "$range" ]]; then
        echo "[db-migration-guard] Missing value for --range" >&2
        usage >&2
        exit 2
      fi
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "[db-migration-guard] Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ -z "$mode" ]]; then
  echo "[db-migration-guard] Provide either --staged or --range" >&2
  usage >&2
  exit 2
fi

if [[ "$mode" == "staged" ]]; then
  changed_files="$(git diff --cached --name-only --diff-filter=ACMR)"
else
  changed_files="$(git diff --name-only --diff-filter=ACMR "$range")"
fi

if [[ -z "${changed_files//$'\n'/}" ]]; then
  exit 0
fi

model_changes="$(echo "$changed_files" | rg '^src/backend/app/db/models/.*\.py$|^src/backend/app/db/base_class\.py$' || true)"
migration_changes="$(echo "$changed_files" | rg '^src/backend/alembic/versions/.*\.(py|sql)$' || true)"

if [[ -z "${model_changes//$'\n'/}" ]]; then
  exit 0
fi

if [[ -n "${migration_changes//$'\n'/}" ]]; then
  exit 0
fi

echo "[db-migration-guard] Database model-layer files changed without a migration." >&2
echo "[db-migration-guard] Changed model files:" >&2
echo "$model_changes" | sed 's/^/[db-migration-guard]   - /' >&2
echo "[db-migration-guard] Add an Alembic migration under src/backend/alembic/versions/" >&2
echo "[db-migration-guard] or set SKIP_DB_MIGRATION_CHECK=1 for an explicit emergency bypass." >&2
exit 1
