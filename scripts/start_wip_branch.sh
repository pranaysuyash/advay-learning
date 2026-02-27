#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  ./scripts/start_wip_branch.sh <ticket-or-scope>

Examples:
  ./scripts/start_wip_branch.sh TCK-20260227-013
  ./scripts/start_wip_branch.sh progress-queue-hardening

Behavior:
  - Must be run from branch: main
  - Creates/switches to: codex/wip-<sanitized-scope>
  - Preserves local uncommitted changes when switching
USAGE
}

die() {
  echo "start_wip_branch: $*" >&2
  exit 1
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ $# -lt 1 ]]; then
  usage >&2
  exit 2
fi

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  die "not inside a git repository"
fi

raw_scope="$*"
scope="$(echo "$raw_scope" \
  | tr '[:upper:]' '[:lower:]' \
  | sed -E 's/[^a-z0-9._-]+/-/g; s/^-+//; s/-+$//; s/-{2,}/-/g')"

if [[ -z "$scope" ]]; then
  die "scope became empty after sanitization; use letters/numbers in the name"
fi

target_branch="codex/wip-$scope"
current_branch="$(git rev-parse --abbrev-ref HEAD)"

if [[ "$current_branch" == "$target_branch" ]]; then
  echo "Already on $target_branch"
  exit 0
fi

if [[ "$current_branch" != "main" ]]; then
  die "current branch is '$current_branch'. Switch to 'main' first, then run this script."
fi

if git show-ref --verify --quiet "refs/heads/$target_branch"; then
  git switch "$target_branch"
  echo "Switched to existing branch: $target_branch"
else
  git switch -c "$target_branch"
  echo "Created and switched to: $target_branch"
fi

echo "Next: commit on this branch, push, then open PR -> main."
