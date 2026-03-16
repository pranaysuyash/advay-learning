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
  - Creates codex/wip-<scope> at current HEAD (carries all local-main commits)
  - Resets local main back to origin/main (so main stays clean)
  - Pushes the WIP branch and opens a PR against main
  - Local main is now ready for the next task from other agents

Invariant: agents NEVER push to origin/main directly.
           Branches are the unit of PR review, not main.
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

git_dir="$(git rev-parse --git-dir)"
marker_file="$git_dir/WIP_BRANCH_AUTHORIZED"

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
  # Refresh marker in case it was cleared
  echo "$target_branch" >> "$marker_file"
  exit 0
fi

if [[ "$current_branch" != "main" ]]; then
  die "current branch is '$current_branch'. Switch to 'main' first, then run this script."
fi

# Check for uncommitted changes - stash them so we can reset main cleanly
has_stash=false
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Stashing uncommitted changes..."
  git stash push -m "start_wip_branch: pre-branch stash for $target_branch"
  has_stash=true
fi

# Count how many commits local main is ahead of origin/main
ahead="$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)"

if git show-ref --verify --quiet "refs/heads/$target_branch"; then
  echo "Branch $target_branch already exists. Switching to it."
  git switch "$target_branch"
else
  # Create WIP branch at current HEAD (carries all local-main commits)
  git switch -c "$target_branch"
  echo "Created $target_branch (carrying $ahead local commit(s) from main)"

  # Reset local main back to origin/main so it stays clean for next task
  git checkout main
  git reset --hard origin/main
  echo "Reset local main → origin/main"

  git switch "$target_branch"
fi

# Restore uncommitted changes onto the WIP branch
if [[ "$has_stash" == true ]]; then
  git stash pop
  echo "Restored uncommitted changes onto $target_branch"
fi

# Write the authorization marker so pre-commit and pre-push allow this branch
echo "$target_branch" >> "$marker_file"
echo "Authorized: $target_branch (marker written)"

# Push and open PR
echo ""
echo "Pushing $target_branch..."
git push -u origin "$target_branch"

echo ""
echo "Opening PR..."
gh pr create --base main --head "$target_branch" --fill

echo ""
echo "Done. You are now on $target_branch."
echo "Local main has been reset to origin/main and is ready for the next task."
