#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/secret_scan.sh --staged
  scripts/secret_scan.sh --range <git-range>

Purpose:
  Block secrets before commit/push using gitleaks.
  - --staged scans staged content from the git index.
  - --range scans commit history over a git revision range.

Environment:
  SKIP_SECRET_SCAN=1   Skip this scanner (not recommended)
USAGE
}

log() {
  echo "[secret-scan] $*"
}

die() {
  echo "[secret-scan] $*" >&2
  exit 1
}

mode="${1:-}"
arg="${2:-}"

if [[ "$mode" != "--staged" && "$mode" != "--range" ]]; then
  usage >&2
  exit 2
fi

if [[ "$mode" == "--range" && -z "$arg" ]]; then
  usage >&2
  exit 2
fi

if [[ "${SKIP_SECRET_SCAN:-}" == "1" ]]; then
  log "Skipping secret scan (SKIP_SECRET_SCAN=1)"
  exit 0
fi

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

has_local_gitleaks=false
if command -v gitleaks >/dev/null 2>&1; then
  has_local_gitleaks=true
fi

has_docker=false
if command -v docker >/dev/null 2>&1; then
  if docker info >/dev/null 2>&1; then
    has_docker=true
  fi
fi

gitleaks_config_args=()
if [[ -f ".gitleaks.toml" ]]; then
  gitleaks_config_args=(--config ".gitleaks.toml")
fi

run_gitleaks_detect_no_git() {
  local source_dir="$1"
  if [[ "$has_local_gitleaks" == true ]]; then
    gitleaks detect --no-git --source "$source_dir" --redact --exit-code 1 "${gitleaks_config_args[@]}"
    return
  fi

  if [[ "$has_docker" == true ]]; then
    docker run --rm \
      -v "${source_dir}:/scan" \
      -w /scan \
      ghcr.io/gitleaks/gitleaks:latest \
      detect --no-git --source . --redact --exit-code 1
    return
  fi

  die "gitleaks unavailable. Install gitleaks or run Docker Desktop and retry."
}

run_gitleaks_git_range() {
  local range="$1"
  if [[ "$has_local_gitleaks" == true ]]; then
    gitleaks git --log-opts "$range" --redact --exit-code 1 "${gitleaks_config_args[@]}"
    return
  fi

  if [[ "$has_docker" == true ]]; then
    docker run --rm \
      -v "${repo_root}:/repo" \
      -w /repo \
      ghcr.io/gitleaks/gitleaks:latest \
      git --log-opts "$range" --redact --exit-code 1 "${gitleaks_config_args[@]}"
    return
  fi

  die "gitleaks unavailable. Install gitleaks or run Docker Desktop and retry."
}

if [[ "$mode" == "--staged" ]]; then
  tmp_dir="$(mktemp -d)"
  trap 'rm -rf "$tmp_dir"' EXIT

  has_files=false
  while IFS= read -r -d '' path; do
    [[ -z "$path" ]] && continue
    has_files=true
    mkdir -p "$tmp_dir/$(dirname "$path")"
    if ! git show ":$path" >"$tmp_dir/$path" 2>/dev/null; then
      rm -f "$tmp_dir/$path"
    fi
  done < <(git diff --cached --name-only --diff-filter=ACMR -z)

  if [[ "$has_files" != true ]]; then
    log "No staged files to scan."
    exit 0
  fi

  log "Scanning staged content for secrets..."
  run_gitleaks_detect_no_git "$tmp_dir"
  log "No secrets detected in staged content."
  exit 0
fi

log "Scanning commit history range: $arg"
run_gitleaks_git_range "$arg"
log "No secrets detected in commit history range."
exit 0
