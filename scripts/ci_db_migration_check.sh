#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

if [[ -n "${DB_MIGRATION_RANGE:-}" ]]; then
  range="$DB_MIGRATION_RANGE"
elif git rev-parse --verify --quiet origin/main >/dev/null; then
  base_sha="$(git merge-base origin/main HEAD)"
  range="${base_sha}..HEAD"
else
  range="HEAD~1..HEAD"
fi

echo "[ci-db-migration-check] Using range: $range"
./scripts/db_migration_guard.sh --range "$range"
