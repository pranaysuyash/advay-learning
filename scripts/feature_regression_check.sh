#!/usr/bin/env bash
# feature_regression_check.sh - Detect feature regressions in large refactors
#
# Policy: If >10% LOC changed in existing file, compare to previous commits
# to ensure new version is comprehensive/better, not removing functionality
#
# Triggered by: pre-commit for modified files with significant changes
#
# AGENT INSTRUCTIONS:
# When this check triggers (shows warnings about removed functions/state):
# 1. DO NOT just bypass with --no-verify
# 2. Compare old vs new version MANUALLY to understand what changed
# 3. Ask: "Does the new version IMPROVE on the old (not just preserve)?"
#    - New features/functions added? ✅ GOOD
#    - Same functionality but better code? ✅ GOOD  
#    - Same functionality split into multiple files? ✅ CHECK ALL FILES TOGETHER
#    - Less functionality than before? ❌ REGRESSION - FIX IT
# 4. For REFACTORS that split files: Check the SUM of all new files vs original
#    - Functions moved to new file? Ensure they're called/used
#    - State split across components? Ensure no gaps
#    - Verify comprehensiveness: nothing lost in the split
# 5. If functionality was removed unintentionally - RESTORE IT before committing
# 6. If removal was intentional (rare) - document WHY and what replaces it
# 7. When in doubt, ask the user before committing
#
# PRINCIPLE: New code should be ADDITIVE or IMPROVEMENT, never reductive unless
# explicitly discussed. Refactors must be COMPREHENSIVE - all pieces accounted for.
#
# Remember: This automated check is a SAFETY NET, not a replacement for
# thoughtful code review by the agent. Always verify your changes improve the codebase.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# Configuration
LOC_CHANGE_THRESHOLD=10       # Percentage (net LOC delta vs old LOC)
TOUCHED_CHANGE_THRESHOLD=10   # Percentage (added+deleted vs old LOC)
MIN_LOC_ABSOLUTE=20           # Minimum touched lines to trigger review signals
LARGE_FILE_LOC_THRESHOLD=500  # Large file review guard
COMPLEXITY_SIGNAL_THRESHOLD=25
CCN_MAX_THRESHOLD="${CCN_MAX_THRESHOLD:-20}"          # Trigger when max cyclomatic complexity is high
CCN_DELTA_THRESHOLD="${CCN_DELTA_THRESHOLD:-5}"       # Trigger when max complexity increases significantly

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[feature-check]${NC} $*"; }
log_success() { echo -e "${GREEN}[feature-check]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[feature-check]${NC} $*"; }
log_error() { echo -e "${RED}[feature-check]${NC} $*" >&2; }

usage() {
  cat <<'USAGE'
Usage:
  scripts/feature_regression_check.sh --staged    # Check staged changes
  scripts/feature_regression_check.sh --help      # Show this help

Purpose:
  Detect potential feature regressions when large portions of files change.
  For existing files with high net LOC delta OR high touched-line churn,
  compares functionality between old and new versions to ensure features
  aren't silently removed.

Checks performed:
  - Function/method count comparison
  - Export count comparison  
  - Component prop interface comparison
  - Hook usage comparison
  - State management comparison

Environment variables:
  SKIP_FEATURE_CHECK=1         # Skip this check entirely
  LOC_THRESHOLD=N              # Override net LOC threshold (default: 10)
  TOUCHED_LOC_THRESHOLD=N      # Override touched LOC threshold (default: 10)
  CCN_MAX_THRESHOLD=N          # Override max CCN threshold (default: 20)
  CCN_DELTA_THRESHOLD=N        # Override max CCN delta threshold (default: 5)
USAGE
}

# Parse arguments
MODE=""
while [[ $# -gt 0 ]]; do
  case $1 in
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

# Allow override
if [[ "${SKIP_FEATURE_CHECK:-}" == "1" ]]; then
  log_info "Skipping feature regression check (SKIP_FEATURE_CHECK=1)"
  exit 0
fi

if [[ -n "${LOC_THRESHOLD:-}" ]]; then
  LOC_CHANGE_THRESHOLD="$LOC_THRESHOLD"
fi
if [[ -n "${TOUCHED_LOC_THRESHOLD:-}" ]]; then
  TOUCHED_CHANGE_THRESHOLD="$TOUCHED_LOC_THRESHOLD"
fi
# Get changed files with modification type
get_modified_files() {
  if [[ "$MODE" == "staged" ]]; then
    # Only modified files (not added/deleted)
    git diff --cached --name-only --diff-filter=M
  else
    git diff HEAD~1 --name-only --diff-filter=M
  fi
}

# Calculate net LOC change percentage for a file.
calculate_net_loc_change() {
  local file="$1"
  local old_loc new_loc change_percent abs_percent
  
  # Get old version LOC (from HEAD)
  old_loc=$(git show "HEAD:$file" 2>/dev/null | wc -l || echo "0")
  
  # Get new version LOC (from staged)
  new_loc=$(git show ":$file" 2>/dev/null | wc -l || echo "0")
  
  # If old file doesn't exist, treat as 0 (shouldn't happen with --diff-filter=M)
  if [[ "$old_loc" == "0" ]]; then
    echo "0|0|0"
    return
  fi
  
  # Calculate percentage change
  change_percent=$(echo "scale=2; ($new_loc - $old_loc) / $old_loc * 100" | bc 2>/dev/null || echo "0")
  abs_percent="${change_percent#-}"
  echo "${abs_percent}|${old_loc}|${new_loc}"
}

# Calculate touched LOC percentage for a file using staged diff.
calculate_touched_change() {
  local file="$1"
  local old_loc add del touched touched_percent

  old_loc=$(git show "HEAD:$file" 2>/dev/null | wc -l || echo "0")
  if [[ "$old_loc" == "0" ]]; then
    echo "0|0|0|0"
    return
  fi

  # numstat prints: added<TAB>deleted<TAB>path
  local numstat
  numstat="$(git diff --cached --numstat -- "$file" | awk '{print $1"|"$2}' | head -n1)"
  add="${numstat%%|*}"
  del="${numstat##*|}"
  add="${add:-0}"
  del="${del:-0}"
  [[ "$add" == "-" ]] && add=0
  [[ "$del" == "-" ]] && del=0
  touched=$((add + del))
  touched_percent=$(echo "scale=2; ($touched / $old_loc) * 100" | bc 2>/dev/null || echo "0")
  echo "${touched_percent}|${touched}|${add}|${del}"
}

# Tool detection (prefer lizard; fallback to heuristic).
HAS_LIZARD=0
if python3 - <<'PY' >/dev/null 2>&1
import lizard  # noqa: F401
PY
then
  HAS_LIZARD=1
fi

heuristic_complexity_signal_count() {
  local content="$1"
  local file="$2"
  if [[ "$file" =~ \.(tsx?|jsx?)$ ]]; then
    echo "$content" | rg -n "useState\\(|useReducer\\(|useEffect\\(|useMemo\\(|useCallback\\(|useRef\\(" | wc -l | tr -d ' '
  elif [[ "$file" =~ \.py$ ]]; then
    echo "$content" | rg -n "^\\s*(def|class|if|for|while|try|except|with)\\b" | wc -l | tr -d ' '
  else
    echo 0
  fi
}

# Returns: engine|function_count|max_ccn|avg_ccn
complexity_metrics_for_blob() {
  local blob_ref="$1"
  local file="$2"
  local content
  content="$(git show "$blob_ref" 2>/dev/null || echo "")"

  if [[ -z "$content" ]]; then
    echo "none|0|0|0"
    return
  fi

  if [[ "$HAS_LIZARD" == "1" ]]; then
    local ext tmp
    ext="${file##*.}"
    tmp="$(mktemp "/tmp/feature-check-ccn.XXXXXX.${ext}")"
    printf "%s" "$content" > "$tmp"
    python3 - "$tmp" <<'PY'
import sys
import lizard

path = sys.argv[1]
analysis = lizard.analyze_file(path)
funcs = analysis.function_list
count = len(funcs)
if count == 0:
    print("lizard|0|0|0.00")
else:
    max_ccn = max(f.cyclomatic_complexity for f in funcs)
    avg_ccn = sum(f.cyclomatic_complexity for f in funcs) / count
    print(f"lizard|{count}|{max_ccn}|{avg_ccn:.2f}")
PY
    rm -f "$tmp"
    return
  fi

  local heuristic
  heuristic="$(heuristic_complexity_signal_count "$content" "$file")"
  echo "heuristic|${heuristic}|${heuristic}|${heuristic}"
}

# Extract functions/methods from TypeScript/JavaScript file
extract_functions() {
  local content="$1"
  # Match function declarations, arrow functions, methods
  echo "$content" | grep -E '^(export )?(function|const|async function)|:\s*\(.*\)\s*=>|\b\w+\s*\([^)]*\)\s*\{' | \
    sed 's/.*function \([a-zA-Z0-9_]*\).*/\1/; s/.*const \([a-zA-Z0-9_]*\).*/\1/' | \
    sort -u | grep -v '^$'
}

# Extract exports from file
extract_exports() {
  local content="$1"
  echo "$content" | grep -E '^export (const|function|class|type|interface|enum)' | \
    sed -E 's/^export[[:space:]]+(const|function|class|type|interface|enum)[[:space:]]+([A-Za-z0-9_]+).*/\1 \2/' | \
    sort -u
}

extract_export_names() {
  local content="$1"
  echo "$content" | grep -E '^export (const|function|class|type|interface|enum)' | \
    sed -E 's/^export[[:space:]]+(const|function|class|type|interface|enum)[[:space:]]+([A-Za-z0-9_]+).*/\2/' | \
    sort -u
}

# Extract component props interfaces
extract_props() {
  local content="$1"
  echo "$content" | grep -E '(interface|type)\s+.*Props' -A 20 | \
    grep -E '^\s+\w+\?:' | \
    sed 's/^\s*\([a-zA-Z0-9_?]*\):.*/\1/' | \
    sort -u
}

# Extract hook usage
extract_hooks() {
  local content="$1"
  echo "$content" | grep -oE 'use[A-Z][a-zA-Z0-9_]*' | sort -u
}

# Extract state management (useState, useReducer, etc.)
extract_state_vars() {
  local content="$1"
  # Extract useState declarations
  echo "$content" | grep -E 'useState\(|useReducer\(' | \
    sed 's/.*\[\([a-zA-Z0-9_]*\).*/\1/' | \
    sort -u
}

# Compare features between old and new version
check_feature_regression() {
  local file="$1"
  local reason="$2"
  local metrics="$3"
  
  log_warn "Significant refactor-risk change detected in: $file"
  log_warn "  reason: $reason"
  log_warn "  metrics: $metrics"
  
  # Get file content
  local old_content new_content
  old_content=$(git show "HEAD:$file" 2>/dev/null || echo "")
  new_content=$(git show ":$file" 2>/dev/null || echo "")
  
  local issues=()
  local advisories=()
  
  # Check 1: Function count
  local old_funcs new_funcs
  old_funcs=$(extract_functions "$old_content")
  new_funcs=$(extract_functions "$new_content")
  
  local old_func_count new_func_count
  old_func_count=$(echo "$old_funcs" | grep -c '^' || echo "0")
  new_func_count=$(echo "$new_funcs" | grep -c '^' || echo "0")
  
  if [[ "$new_func_count" -lt "$old_func_count" ]]; then
    local lost_funcs
    lost_funcs=$(comm -23 <(echo "$old_funcs") <(echo "$new_funcs") || true)
    if [[ -n "$lost_funcs" ]]; then
      advisories+=("Functions changed/removed: $(echo "$lost_funcs" | wc -l | tr -d ' ')")
      while IFS= read -r func; do
        [[ -n "$func" ]] && advisories+=("  - $func")
      done <<< "$lost_funcs"
    fi
  fi
  
  # Check 2: Exports
  local old_exports new_exports old_export_names new_export_names
  old_exports=$(extract_exports "$old_content")
  new_exports=$(extract_exports "$new_content")
  old_export_names=$(extract_export_names "$old_content")
  new_export_names=$(extract_export_names "$new_content")
  
  local removed_exports
  removed_exports=$(comm -23 <(echo "$old_export_names") <(echo "$new_export_names") || true)
  if [[ -n "$removed_exports" ]]; then
    issues+=("Exports removed: $(echo "$removed_exports" | wc -l | tr -d ' ')")
    while IFS= read -r exp; do
      [[ -n "$exp" ]] && issues+=("  - $exp")
    done <<< "$removed_exports"
  fi
  
  # Check 3: Component props (for .tsx files)
  if [[ "$file" == *.tsx ]]; then
    local old_props new_props
    old_props=$(extract_props "$old_content")
    new_props=$(extract_props "$new_content")
    
    local removed_props
    removed_props=$(comm -23 <(echo "$old_props") <(echo "$new_props") || true)
    if [[ -n "$removed_props" ]]; then
      issues+=("Component props removed: $(echo "$removed_props" | wc -l | tr -d ' ')")
      while IFS= read -r prop; do
        [[ -n "$prop" ]] && issues+=("  - $prop")
      done <<< "$removed_props"
    fi
  fi
  
  # Check 4: Hooks usage
  local old_hooks new_hooks
  old_hooks=$(extract_hooks "$old_content")
  new_hooks=$(extract_hooks "$new_content")
  
  local removed_hooks
  removed_hooks=$(comm -23 <(echo "$old_hooks") <(echo "$new_hooks") || true)
  if [[ -n "$removed_hooks" ]]; then
    advisories+=("Hooks changed/removed: $(echo "$removed_hooks" | wc -l | tr -d ' ')")
    while IFS= read -r hook; do
      [[ -n "$hook" ]] && advisories+=("  - $hook")
    done <<< "$removed_hooks"
  fi
  
  # Check 5: State variables
  local old_state new_state
  old_state=$(extract_state_vars "$old_content")
  new_state=$(extract_state_vars "$new_content")
  
  local removed_state
  removed_state=$(comm -23 <(echo "$old_state") <(echo "$new_state") || true)
  if [[ -n "$removed_state" ]]; then
    advisories+=("State variables changed/removed: $(echo "$removed_state" | wc -l | tr -d ' ')")
    while IFS= read -r state; do
      [[ -n "$state" ]] && advisories+=("  - $state")
    done <<< "$removed_state"
  fi

  if [[ ${#advisories[@]} -gt 0 ]]; then
    log_warn "Implementation changes detected in $file (manual review recommended):"
    for advisory in "${advisories[@]}"; do
      log_warn "  $advisory"
    done
  fi
  
  # Report findings
  if [[ ${#issues[@]} -gt 0 ]]; then
    log_error "⚠️  POTENTIAL REGRESSION DETECTED in $file"
    log_error ""
    log_error "The following features appear to have been removed:"
    for issue in "${issues[@]}"; do
      log_error "  $issue"
    done
    log_error ""
    log_error "═══════════════════════════════════════════════════════════════"
    log_error "AGENT ACTION REQUIRED - DO NOT JUST BYPASS"
    log_error "═══════════════════════════════════════════════════════════════"
    log_error ""
    log_error "You MUST verify this manually before committing:"
    log_error ""
    log_error "1. COMPARE versions side-by-side:"
    log_error "   git diff HEAD -- $file"
    log_error ""
    log_error "2. VERIFY THE CHANGE IS IMPROVEMENT (not just different):"
    log_error "   ✅ NEW features/functions added? GOOD - commit it"
    log_error "   ✅ BETTER code quality with same features? GOOD - commit it"
    log_error "   ✅ SPLIT into multiple files? Check ALL files together for completeness"
    log_error "   ❌ LESS functionality than before? REGRESSION - FIX IT"
    log_error ""
    log_error "3. FOR REFACTORS THAT SPLIT FILES:"
    log_error "   - Check all related files in the same commit"
    log_error "   - Ensure functions moved are properly imported/used"
    log_error "   - Verify state is comprehensively handled (no gaps)"
    log_error "   - Ask: 'Is the SUM of new files ≥ original file?'"
    log_error ""
    log_error "4. IF REGRESSION (functionality lost):"
    log_error "   → RESTORE the missing functionality"
    log_error "   → OR document WHY and what replaces it"
    log_error ""
    log_error "5. WHEN IN DOUBT: Ask the user before committing"
    log_error ""
    log_error "PRINCIPLE: Code should be ADDITIVE or IMPROVEMENT, never reductive."
    log_error "═══════════════════════════════════════════════════════════════"
    log_error ""
    log_error "To bypass ONLY if you've verified thoroughly:"
    log_error "   git commit --no-verify"
    log_error ""
    return 1
  else
    log_success "✅ No obvious feature regression in $file"
    return 0
  fi
}

# Main execution
main() {
  log_info "Starting feature regression check (net threshold: ${LOC_CHANGE_THRESHOLD}%, touched threshold: ${TOUCHED_CHANGE_THRESHOLD}%)..."
  
  # Get modified files only
  local modified_files
  modified_files=$(get_modified_files)
  
  if [[ -z "$modified_files" ]]; then
    log_success "No modified files to check."
    exit 0
  fi
  
  # Filter to source files only
  local source_files
  source_files=$(echo "$modified_files" | grep -E '\.(tsx?|jsx?|py)$' || true)
  
  if [[ -z "$source_files" ]]; then
    log_success "No source files modified."
    exit 0
  fi
  
  log_info "Checking $(echo "$source_files" | wc -l | tr -d ' ') modified source files..."
  
  local files_to_check=()
  local file_reasons=()
  local file_metrics=()
  
  # Check each file for LOC threshold
  while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    
    local net_info net_pct old_loc new_loc
    local touched_info touched_pct touched_lines add_lines del_lines
    local old_complexity new_complexity
    local complexity_engine new_fn_count old_ccn_max new_ccn_max new_ccn_avg ccn_delta
    local trigger=false
    local reasons=()

    net_info=$(calculate_net_loc_change "$file")
    net_pct="${net_info%%|*}"
    old_loc="$(echo "$net_info" | cut -d'|' -f2)"
    new_loc="$(echo "$net_info" | cut -d'|' -f3)"

    touched_info=$(calculate_touched_change "$file")
    touched_pct="${touched_info%%|*}"
    touched_lines="$(echo "$touched_info" | cut -d'|' -f2)"
    add_lines="$(echo "$touched_info" | cut -d'|' -f3)"
    del_lines="$(echo "$touched_info" | cut -d'|' -f4)"

    old_complexity="$(complexity_metrics_for_blob "HEAD:$file" "$file")"
    new_complexity="$(complexity_metrics_for_blob ":$file" "$file")"
    complexity_engine="$(echo "$new_complexity" | cut -d'|' -f1)"
    new_fn_count="$(echo "$new_complexity" | cut -d'|' -f2)"
    old_ccn_max="$(echo "$old_complexity" | cut -d'|' -f3)"
    new_ccn_max="$(echo "$new_complexity" | cut -d'|' -f3)"
    new_ccn_avg="$(echo "$new_complexity" | cut -d'|' -f4)"
    ccn_delta="$(echo "$new_ccn_max - $old_ccn_max" | bc 2>/dev/null || echo "0")"

    if (( $(echo "$net_pct >= $LOC_CHANGE_THRESHOLD" | bc -l 2>/dev/null || echo "0") )); then
      trigger=true
      reasons+=("net_loc%:${net_pct}")
    fi
    if (( $(echo "$touched_pct >= $TOUCHED_CHANGE_THRESHOLD" | bc -l 2>/dev/null || echo "0") )); then
      trigger=true
      reasons+=("touched_loc%:${touched_pct}")
    fi
    if (( touched_lines >= MIN_LOC_ABSOLUTE && old_loc >= LARGE_FILE_LOC_THRESHOLD )); then
      trigger=true
      reasons+=("large_file+touch:${touched_lines}")
    fi
    if (( touched_lines >= MIN_LOC_ABSOLUTE && $(echo "$new_ccn_max >= $CCN_MAX_THRESHOLD" | bc -l 2>/dev/null || echo "0") )); then
      trigger=true
      reasons+=("max_ccn:${new_ccn_max}")
    fi
    if (( touched_lines >= MIN_LOC_ABSOLUTE && $(echo "$ccn_delta >= $CCN_DELTA_THRESHOLD" | bc -l 2>/dev/null || echo "0") )); then
      trigger=true
      reasons+=("ccn_delta:+${ccn_delta}")
    fi
    if [[ "$complexity_engine" == "heuristic" && touched_lines -ge MIN_LOC_ABSOLUTE && new_ccn_max -ge COMPLEXITY_SIGNAL_THRESHOLD ]]; then
      trigger=true
      reasons+=("heuristic_complexity:${new_ccn_max}")
    fi

    if [[ "$trigger" == true ]]; then
      files_to_check+=("$file")
      file_reasons+=("$(IFS=,; echo "${reasons[*]}")")
      file_metrics+=("old=${old_loc},new=${new_loc},added=${add_lines},deleted=${del_lines},touched=${touched_lines},net%=${net_pct},touched%=${touched_pct},engine=${complexity_engine},fn=${new_fn_count},max_ccn_old=${old_ccn_max},max_ccn_new=${new_ccn_max},avg_ccn_new=${new_ccn_avg}")
      log_info "$file: review required (${reasons[*]})"
    fi
    
  done <<< "$source_files"
  
  if [[ ${#files_to_check[@]} -eq 0 ]]; then
    log_success "No files exceeded refactor-risk thresholds."
    exit 0
  fi
  
  log_warn "${#files_to_check[@]} file(s) exceed threshold - checking for regressions..."
  echo ""
  
  # Detect potential file splits (new files in same directory as modified files)
  local new_files
  new_files=$(git diff --cached --name-only --diff-filter=A | grep -E '\.(tsx?|jsx?|py)$' || true)
  
  if [[ -n "$new_files" && ${#files_to_check[@]} -gt 0 ]]; then
    log_info "New files detected - checking for potential file splits..."
    
    # For each significantly modified file, check if new files are in same directory
    for i in "${!files_to_check[@]}"; do
      local modified_file="${files_to_check[$i]}"
      local metrics="${file_metrics[$i]}"
      local dir
      dir=$(dirname "$modified_file")
      
      # Check if any new files are in the same directory or subdirectory
      local related_new_files
      related_new_files=$(echo "$new_files" | grep "^$dir/" || true)
      
      local touched_pct
      touched_pct="$(echo "$metrics" | sed -E 's/.*touched%=([^,]+).*/\1/')"
      if [[ -n "$related_new_files" && $(echo "$touched_pct > 30" | bc -l 2>/dev/null || echo "0") -eq 1 ]]; then
        log_warn ""
        log_warn "⚠️  POTENTIAL FILE SPLIT DETECTED:"
        log_warn "   Modified: $modified_file (touched ${touched_pct}%)"
        log_warn "   New files in same directory:"
        echo "$related_new_files" | while read -r new_file; do
          [[ -n "$new_file" ]] && log_warn "     + $new_file"
        done
        log_warn ""
        log_warn "   AGENT: Verify the SUM of all files preserves original functionality!"
        log_warn "   Check: Are all functions from the original file accounted for?"
        log_warn ""
      fi
    done
    echo ""
  fi
  
  local exit_code=0
  
  # Check each file for feature regression
  for i in "${!files_to_check[@]}"; do
    local file="${files_to_check[$i]}"
    local reason="${file_reasons[$i]}"
    local metrics="${file_metrics[$i]}"
    
    if ! check_feature_regression "$file" "$reason" "$metrics"; then
      exit_code=1
    fi
    echo ""
  done
  
  if [[ $exit_code -eq 0 ]]; then
    log_success "🎉 No feature regressions detected!"
    log_info "Large changes were made, but all functionality appears preserved."
  else
    log_error "❌ Potential regressions detected!"
    log_error ""
    log_error "To bypass this check (if changes are intentional):"
    log_error "  git commit --no-verify"
    log_error ""
    log_error "To adjust threshold:"
    log_error "  LOC_THRESHOLD=20 git commit"
  fi
  
  exit $exit_code
}

main "$@"
