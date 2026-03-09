#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

git_dir="$(git rev-parse --git-dir)"
marker_file="$git_dir/auto_pr_threshold.env"

enabled="${AUTO_PR_THRESHOLD_ENABLED:-1}"
threshold="${AUTO_PR_STAGED_THRESHOLD:-130}"

usage() {
  cat <<'USAGE'
Usage:
  scripts/auto_pr_threshold.sh arm
  scripts/auto_pr_threshold.sh run

Environment variables:
  AUTO_PR_THRESHOLD_ENABLED   1 (default) to enable, 0 to disable
  AUTO_PR_STAGED_THRESHOLD    staged file threshold (default: 130)
USAGE
}

ensure_gh_auth() {
  if ! command -v gh >/dev/null 2>&1; then
    echo "[auto-pr-threshold] gh CLI not found; skipping auto PR creation."
    return 1
  fi
  if ! gh auth status >/dev/null 2>&1; then
    echo "[auto-pr-threshold] gh auth missing; skipping auto PR creation."
    return 1
  fi
  return 0
}

arm() {
  if [[ "$enabled" != "1" ]]; then
    return 0
  fi

  local branch staged_count
  branch="$(git rev-parse --abbrev-ref HEAD)"
  staged_count="$(git diff --cached --name-only | sed '/^[[:space:]]*$/d' | wc -l | tr -d '[:space:]')"
  staged_count="${staged_count:-0}"

  if [[ "$staged_count" -lt "$threshold" ]]; then
    rm -f "$marker_file"
    return 0
  fi

  if [[ ! "$branch" =~ ^codex/wip- ]]; then
    echo "[auto-pr-threshold] staged count ($staged_count) >= $threshold but branch is '$branch'."
    echo "[auto-pr-threshold] Auto push/PR is only enabled on codex/wip-* branches."
    rm -f "$marker_file"
    return 0
  fi

  {
    printf 'AUTO_PR_BRANCH=%s\n' "$branch"
    printf 'AUTO_PR_THRESHOLD=%s\n' "$threshold"
    printf 'AUTO_PR_STAGED_COUNT=%s\n' "$staged_count"
  } > "$marker_file"
  echo "[auto-pr-threshold] armed: $staged_count staged files (threshold: $threshold)."
}

run_after_commit() {
  if [[ "$enabled" != "1" ]]; then
    rm -f "$marker_file"
    return 0
  fi

  if [[ ! -f "$marker_file" ]]; then
    return 0
  fi

  local AUTO_PR_BRANCH="" AUTO_PR_THRESHOLD="" AUTO_PR_STAGED_COUNT=""
  while IFS='=' read -r key value; do
    case "$key" in
      AUTO_PR_BRANCH) AUTO_PR_BRANCH="$value" ;;
      AUTO_PR_THRESHOLD) AUTO_PR_THRESHOLD="$value" ;;
      AUTO_PR_STAGED_COUNT) AUTO_PR_STAGED_COUNT="$value" ;;
    esac
  done < "$marker_file"
  rm -f "$marker_file"

  local current_branch
  current_branch="$(git rev-parse --abbrev-ref HEAD)"
  if [[ "${AUTO_PR_BRANCH:-}" != "$current_branch" ]]; then
    echo "[auto-pr-threshold] branch changed; skipping auto push/PR."
    return 0
  fi

  if [[ ! "$current_branch" =~ ^codex/wip- ]]; then
    echo "[auto-pr-threshold] current branch '$current_branch' is not codex/wip-*; skipping."
    return 0
  fi

  echo "[auto-pr-threshold] threshold reached (${AUTO_PR_STAGED_COUNT:-?} files)."
  echo "[auto-pr-threshold] pushing '$current_branch'..."
  git push -u origin "$current_branch"

  if ! ensure_gh_auth; then
    return 0
  fi

  local existing_pr base_branch title body
  existing_pr="$(gh pr list --head "$current_branch" --state open --json number,url --jq '.[0].url // ""')"
  if [[ -n "$existing_pr" ]]; then
    echo "[auto-pr-threshold] open PR already exists: $existing_pr"
    return 0
  fi

  base_branch="main"
  title="$(git log -1 --pretty=%s)"
  body=$(
    cat <<EOF
Auto-created by threshold automation.

- Trigger: staged file count >= ${AUTO_PR_THRESHOLD:-$threshold}
- Branch: $current_branch
- Last commit: $(git rev-parse --short HEAD)
EOF
  )

  echo "[auto-pr-threshold] creating PR -> $base_branch..."
  gh pr create --base "$base_branch" --head "$current_branch" --title "$title" --body "$body"
}

case "${1:-}" in
  arm)
    arm
    ;;
  run)
    run_after_commit
    ;;
  *)
    usage
    exit 2
    ;;
esac
