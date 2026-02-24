#!/usr/bin/env bash
# feature_regression_check.sh - Detect feature regressions in large refactors
# 
# Policy: If >10% LOC changed in existing file, compare to previous commits
# to ensure new version is comprehensive/better, not removing functionality
#
# Triggered by: pre-commit for modified files with significant changes

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# Configuration
LOC_CHANGE_THRESHOLD=10  # Percentage
MIN_LOC_ABSOLUTE=20      # Minimum lines to trigger check

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
  For existing files with >10% LOC changes, compares functionality between
  old and new versions to ensure features aren't silently removed.

Checks performed:
  - Function/method count comparison
  - Export count comparison  
  - Component prop interface comparison
  - Hook usage comparison
  - State management comparison

Environment variables:
  SKIP_FEATURE_CHECK=1      # Skip this check entirely
  LOC_THRESHOLD=N           # Override 10% threshold (e.g., 15 for 15%)
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

# Get changed files with modification type
get_modified_files() {
  if [[ "$MODE" == "staged" ]]; then
    # Only modified files (not added/deleted)
    git diff --cached --name-only --diff-filter=M
  else
    git diff HEAD~1 --name-only --diff-filter=M
  fi
}

# Calculate LOC change percentage for a file
calculate_loc_change() {
  local file="$1"
  local old_loc new_loc
  
  # Get old version LOC (from HEAD)
  old_loc=$(git show "HEAD:$file" 2>/dev/null | wc -l || echo "0")
  
  # Get new version LOC (from staged)
  new_loc=$(git show ":$file" 2>/dev/null | wc -l || echo "0")
  
  # If old file doesn't exist, treat as 0 (shouldn't happen with --diff-filter=M)
  if [[ "$old_loc" == "0" ]]; then
    echo "0"
    return
  fi
  
  # Calculate percentage change
  local change_percent
  change_percent=$(echo "scale=2; ($new_loc - $old_loc) / $old_loc * 100" | bc 2>/dev/null || echo "0")
  
  # Use absolute value for threshold comparison
  if (( $(echo "${change_percent#-} >= $LOC_CHANGE_THRESHOLD" | bc -l 2>/dev/null || echo "0") )); then
    echo "${change_percent#-}"  # Return positive percentage
  else
    echo "0"
  fi
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
    sed 's/export //' | sort -u
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
  local change_percent="$2"
  
  log_warn "Significant change detected in: $file (${change_percent}% LOC changed)"
  
  # Get file content
  local old_content new_content
  old_content=$(git show "HEAD:$file" 2>/dev/null || echo "")
  new_content=$(git show ":$file" 2>/dev/null || echo "")
  
  local issues=()
  
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
      issues+=("Functions removed: $(echo "$lost_funcs" | wc -l | tr -d ' ')")
      while IFS= read -r func; do
        [[ -n "$func" ]] && issues+=("  - $func")
      done <<< "$lost_funcs"
    fi
  fi
  
  # Check 2: Exports
  local old_exports new_exports
  old_exports=$(extract_exports "$old_content")
  new_exports=$(extract_exports "$new_content")
  
  local removed_exports
  removed_exports=$(comm -23 <(echo "$old_exports") <(echo "$new_exports") || true)
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
    issues+=("Hooks removed: $(echo "$removed_hooks" | wc -l | tr -d ' ')")
    while IFS= read -r hook; do
      [[ -n "$hook" ]] && issues+=("  - $hook")
    done <<< "$removed_hooks"
  fi
  
  # Check 5: State variables
  local old_state new_state
  old_state=$(extract_state_vars "$old_content")
  new_state=$(extract_state_vars "$new_content")
  
  local removed_state
  removed_state=$(comm -23 <(echo "$old_state") <(echo "$new_state") || true)
  if [[ -n "$removed_state" ]]; then
    issues+=("State variables removed: $(echo "$removed_state" | wc -l | tr -d ' ')")
    while IFS= read -r state; do
      [[ -n "$state" ]] && issues+=("  - $state")
    done <<< "$removed_state"
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
    log_error "If this is intentional refactoring:"
    log_error "  1. Ensure functionality is preserved elsewhere"
    log_error "  2. Document the change in your commit message"
    log_error "  3. Or skip with: git commit --no-verify"
    log_error ""
    return 1
  else
    log_success "✅ No obvious feature regression in $file"
    return 0
  fi
}

# Main execution
main() {
  log_info "Starting feature regression check (threshold: ${LOC_CHANGE_THRESHOLD}%)..."
  
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
  local file_changes=()
  
  # Check each file for LOC threshold
  while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    
    local change_percent
    change_percent=$(calculate_loc_change "$file")
    
    if [[ "$change_percent" != "0" ]]; then
      files_to_check+=("$file")
      file_changes+=("$change_percent")
      log_info "$file: ${change_percent}% changed (exceeds ${LOC_CHANGE_THRESHOLD}% threshold)"
    fi
    
  done <<< "$source_files"
  
  if [[ ${#files_to_check[@]} -eq 0 ]]; then
    log_success "No files exceed ${LOC_CHANGE_THRESHOLD}% change threshold."
    exit 0
  fi
  
  log_warn "${#files_to_check[@]} file(s) exceed threshold - checking for regressions..."
  echo ""
  
  local exit_code=0
  
  # Check each file for feature regression
  for i in "${!files_to_check[@]}"; do
    local file="${files_to_check[$i]}"
    local change="${file_changes[$i]}"
    
    if ! check_feature_regression "$file" "$change"; then
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
