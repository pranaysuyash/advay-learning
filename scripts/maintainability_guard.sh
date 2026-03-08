#!/usr/bin/env bash
# maintainability_guard.sh - Block oversized/high-complexity staged source files
#
# Purpose:
# Catch files that exceed static maintainability thresholds even when the
# current diff is small. This complements diff-based regression checks.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

MAX_FILE_LOC="${MAX_FILE_LOC:-1000}"
MAX_FILE_BYTES="${MAX_FILE_BYTES:-60000}"
MAX_FILE_CCN="${MAX_FILE_CCN:-60}"
LOC_WORSEN_DELTA="${LOC_WORSEN_DELTA:-100}"
BYTES_WORSEN_DELTA="${BYTES_WORSEN_DELTA:-4096}"
CCN_WORSEN_DELTA="${CCN_WORSEN_DELTA:-30}"
CCN_ANALYSIS_MIN_LOC="${CCN_ANALYSIS_MIN_LOC:-250}"
CCN_ANALYSIS_MIN_BYTES="${CCN_ANALYSIS_MIN_BYTES:-12000}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[maint-check]${NC} $*"; }
log_success() { echo -e "${GREEN}[maint-check]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[maint-check]${NC} $*"; }
log_error() { echo -e "${RED}[maint-check]${NC} $*" >&2; }

usage() {
  cat <<'USAGE'
Usage:
  scripts/maintainability_guard.sh --staged
  scripts/maintainability_guard.sh --help

Purpose:
  Fail when staged source files exceed static maintainability limits, even if
  the current diff is small. Checks staged file blobs, including newly added files.

Checks:
  - Line count threshold
  - File size threshold (bytes)
  - Optional max cyclomatic complexity via lizard (if installed)

Environment variables:
  SKIP_MAINTAINABILITY_CHECK=1  Skip this check
  MAX_FILE_LOC=N                Override LOC threshold (default: 1000)
  MAX_FILE_BYTES=N              Override byte threshold (default: 60000)
  MAX_FILE_CCN=N                Override max CCN threshold (default: 60)
  CCN_WORSEN_DELTA=N            Override min CCN increase for already-complex files (default: 30)
USAGE
}

MODE=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --staged)
      MODE="staged"
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      log_error "Unknown option: $1"
      usage >&2
      exit 2
      ;;
  esac
done

if [[ -z "$MODE" ]]; then
  MODE="staged"
fi

if [[ "${SKIP_MAINTAINABILITY_CHECK:-}" == "1" ]]; then
  log_info "Skipping maintainability guard (SKIP_MAINTAINABILITY_CHECK=1)"
  exit 0
fi

get_changed_files() {
  git diff --cached --name-only --diff-filter=AM
}

HAS_LIZARD=0
if python3 -c 'import importlib.util, sys; sys.exit(0 if importlib.util.find_spec("lizard") else 1)' >/dev/null 2>&1; then
  HAS_LIZARD=1
fi

# Returns "engine|max_ccn|avg_ccn|function_count".
complexity_metrics_for_path() {
  local blob_path="$1"

  if [[ "$HAS_LIZARD" != "1" ]]; then
    echo "none|0|0|0"
    return
  fi

  python3 - "$blob_path" <<'PY'
import sys
import lizard

path = sys.argv[1]
analysis = lizard.analyze_file(path)
funcs = analysis.function_list
count = len(funcs)
if count == 0:
    print("lizard|0|0.00|0")
else:
    max_ccn = max(f.cyclomatic_complexity for f in funcs)
    avg_ccn = sum(f.cyclomatic_complexity for f in funcs) / count
    print(f"lizard|{max_ccn}|{avg_ccn:.2f}|{count}")
PY
}

file_exists_in_head() {
  local file="$1"
  git cat-file -e "HEAD:$file" 2>/dev/null
}

main() {
  log_info "Starting maintainability guard (LOC>${MAX_FILE_LOC}, bytes>${MAX_FILE_BYTES}, max-CCN>${MAX_FILE_CCN})..."

  local changed_files
  changed_files="$(get_changed_files)"
  if [[ -z "$changed_files" ]]; then
    log_success "No added/modified staged files to check."
    exit 0
  fi

  local source_files
  source_files="$(echo "$changed_files" | grep -E '\.(tsx?|jsx?|py)$' || true)"
  if [[ -z "$source_files" ]]; then
    log_success "No staged source files to check."
    exit 0
  fi

  local violations=0
  local lizard_noted=0

  while IFS= read -r file; do
    [[ -z "$file" ]] && continue

    local ext tmp_blob
    ext="${file##*.}"
    tmp_blob="$(mktemp "/tmp/maint-check-blob.XXXXXX.${ext}")"
    if ! git show ":$file" > "$tmp_blob" 2>/dev/null; then
      rm -f "$tmp_blob"
      continue
    fi

    local loc bytes metrics engine max_ccn avg_ccn function_count
    loc="$(wc -l < "$tmp_blob" | tr -d ' ')"
    bytes="$(wc -c < "$tmp_blob" | tr -d ' ')"

    metrics="none|0|0|0"
    if (( loc >= CCN_ANALYSIS_MIN_LOC || bytes >= CCN_ANALYSIS_MIN_BYTES )); then
      metrics="$(complexity_metrics_for_path "$tmp_blob")"
    fi
    engine="$(echo "$metrics" | cut -d'|' -f1)"
    max_ccn="$(echo "$metrics" | cut -d'|' -f2)"
    avg_ccn="$(echo "$metrics" | cut -d'|' -f3)"
    function_count="$(echo "$metrics" | cut -d'|' -f4)"

    local is_new_file=1
    local old_loc=0
    local old_bytes=0
    local old_max_ccn=0
    local need_old_metrics=0
    if (( loc > MAX_FILE_LOC || bytes > MAX_FILE_BYTES )); then
      need_old_metrics=1
    fi
    if [[ "$engine" == "lizard" ]] && (( max_ccn > MAX_FILE_CCN )); then
      need_old_metrics=1
    fi
    if (( need_old_metrics == 1 )) && file_exists_in_head "$file"; then
      is_new_file=0
      local old_blob
      old_blob="$(mktemp "/tmp/maint-check-old.XXXXXX.${ext}")"
      git show "HEAD:$file" > "$old_blob" 2>/dev/null || true
      old_loc="$(wc -l < "$old_blob" | tr -d ' ')"
      old_bytes="$(wc -c < "$old_blob" | tr -d ' ')"
      if [[ "$engine" == "lizard" ]] && (( max_ccn > MAX_FILE_CCN )); then
        local old_metrics
        old_metrics="$(complexity_metrics_for_path "$old_blob")"
        old_max_ccn="$(echo "$old_metrics" | cut -d'|' -f2)"
      fi
      rm -f "$old_blob"
    elif file_exists_in_head "$file"; then
      is_new_file=0
    fi

    local file_failed=0
    local reasons=()

    if (( loc > MAX_FILE_LOC )) && [[ "$is_new_file" == "1" || "$old_loc" -le "$MAX_FILE_LOC" || "$loc" -ge $((old_loc + LOC_WORSEN_DELTA)) ]]; then
      file_failed=1
      reasons+=("loc=${loc} > ${MAX_FILE_LOC}")
    fi

    if (( bytes > MAX_FILE_BYTES )) && [[ "$is_new_file" == "1" || "$old_bytes" -le "$MAX_FILE_BYTES" || "$bytes" -ge $((old_bytes + BYTES_WORSEN_DELTA)) ]]; then
      file_failed=1
      reasons+=("bytes=${bytes} > ${MAX_FILE_BYTES}")
    fi

    if [[ "$engine" == "lizard" ]] && (( max_ccn > MAX_FILE_CCN )) && [[ "$is_new_file" == "1" || "$old_max_ccn" -le "$MAX_FILE_CCN" || "$max_ccn" -ge $((old_max_ccn + CCN_WORSEN_DELTA)) ]]; then
      file_failed=1
      reasons+=("max_ccn=${max_ccn} > ${MAX_FILE_CCN}")
    fi

    if [[ "$engine" == "none" && "$lizard_noted" == "0" ]]; then
      log_warn "python lizard is not installed; complexity enforcement is skipped for this run."
      lizard_noted=1
    fi

    if [[ "$file_failed" == "1" ]]; then
      violations=1
      log_error "Maintainability threshold exceeded: $file"
      for reason in "${reasons[@]}"; do
        log_error "  - $reason"
      done
      if [[ "$engine" == "lizard" ]]; then
        log_error "  - lizard metrics: functions=${function_count}, max_ccn=${max_ccn}, avg_ccn=${avg_ccn}"
      fi
      log_error "  Action: split the file, reduce embedded data, or explicitly raise the threshold for a justified case."
      echo ""
    fi

    rm -f "$tmp_blob"
  done <<< "$source_files"

  if [[ "$violations" == "0" ]]; then
    log_success "All staged source files are within maintainability thresholds."
    exit 0
  fi

  log_error "Static maintainability guard failed."
  log_error "Temporary override (must be intentional): SKIP_MAINTAINABILITY_CHECK=1 git commit ..."
  log_error "Threshold overrides: MAX_FILE_LOC, MAX_FILE_BYTES, MAX_FILE_CCN"
  exit 1
}

main "$@"
