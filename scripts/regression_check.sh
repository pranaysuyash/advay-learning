#!/usr/bin/env bash
# regression_check.sh - Pre-commit regression detection system
# Compares old vs new code to detect behavioral changes
# Requires tests to pass before allowing commits

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[regression-check]${NC} $*"; }
log_success() { echo -e "${GREEN}[regression-check]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[regression-check]${NC} $*"; }
log_error() { echo -e "${RED}[regression-check]${NC} $*" >&2; }

usage() {
  cat <<'USAGE'
Usage:
  scripts/regression_check.sh --staged    # Check staged changes (pre-commit)
  scripts/regression_check.sh --skip-tests # Skip running tests (faster)
  scripts/regression_check.sh --help      # Show this help

Purpose:
  Detect regressions and behavioral changes before commits:
  - Runs relevant tests for changed files
  - Compares exports/function signatures with HEAD
  - Classifies changes (FIX, FEATURE, REFACTOR, BREAKING)
  - Warns about undocumented breaking changes

Environment variables:
  SKIP_REGRESSION_TESTS=1  # Skip test execution
  SKIP_EXPORT_CHECK=1      # Skip export comparison
USAGE
}

# Parse arguments
SKIP_TESTS=false
MODE=""
while [[ $# -gt 0 ]]; do
  case $1 in
    --staged)
      MODE="staged"
      shift
      ;;
    --skip-tests)
      SKIP_TESTS=true
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

# Environment variable overrides
if [[ "${SKIP_REGRESSION_TESTS:-}" == "1" ]]; then
  SKIP_TESTS=true
fi

# Get changed files
get_changed_files() {
  if [[ "$MODE" == "staged" ]]; then
    git diff --cached --name-only --diff-filter=ACMR
  else
    git diff HEAD~1 --name-only --diff-filter=ACMR
  fi
}

# Check if we have frontend changes
has_frontend_changes() {
  local changed_files="$1"
  echo "$changed_files" | grep -qE '^src/frontend/src/.*\.(tsx?|jsx?)$' || return 1
}

# Get frontend source files only
get_frontend_source_files() {
  local changed_files="$1"
  echo "$changed_files" | grep -E '^src/frontend/src/.*\.(tsx?|jsx?)$' || true
}

# Map source files to their test files
find_related_tests() {
  local source_files="$1"
  local related_tests=()
  
  while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    
    # Remove path prefix and extension
    local basename
    basename="$(basename "$file" | sed 's/\.[^.]*$//')"
    
    # Look for corresponding test files
    local test_patterns=(
      "src/frontend/src/**/__tests__/${basename}.test.ts"
      "src/frontend/src/**/__tests__/${basename}.test.tsx"
      "src/frontend/src/**/${basename}.test.ts"
      "src/frontend/src/**/${basename}.test.tsx"
    )
    
    for pattern in "${test_patterns[@]}"; do
      # Use find with maxdepth to avoid too many results
      local found
      found=$(find src/frontend/src -name "${basename}.test.ts" -o -name "${basename}.test.tsx" 2>/dev/null || true)
      if [[ -n "$found" ]]; then
        related_tests+=("$found")
      fi
    done
  done <<< "$source_files"
  
  # Return unique test files
  printf '%s\n' "${related_tests[@]}" | sort -u | head -20
}

# Run frontend tests
run_frontend_tests() {
  local test_scope="$1"  # "all" or "related"
  local source_files="$2"
  
  log_info "Running frontend tests..."
  
  cd src/frontend
  
  if [[ "$test_scope" == "related" ]] && [[ -n "$source_files" ]]; then
    # Run only related tests using vitest's --related flag
    log_info "Running tests related to changed files..."
    
    # Build the file list for vitest
    local file_args=""
    while IFS= read -r file; do
      [[ -z "$file" ]] && continue
      # Convert to relative path from frontend dir
      local rel_path="${file#src/frontend/}"
      file_args="$file_args $rel_path"
    done <<< "$source_files"
    
    if [[ -n "$file_args" ]]; then
      npm test -- --run --reporter=dot 2>&1 || {
        cd "$REPO_ROOT"
        return 1
      }
    fi
  else
    # Run all tests
    npm test -- --run --reporter=dot 2>&1 || {
      cd "$REPO_ROOT"
      return 1
    }
  fi
  
  cd "$REPO_ROOT"
  return 0
}

# Compare exports between HEAD and staged changes
check_export_changes() {
  local source_files="$1"
  local breaking_changes=()
  local new_exports=()
  local removed_exports=()
  
  log_info "Checking for export changes..."
  
  while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    [[ ! -f "$file" ]] && continue
    
    # Get exports from old version (HEAD)
    local old_exports
    old_exports=$(git show "HEAD:$file" 2>/dev/null | grep -E '^export (const|function|class|type|interface|enum|default)' | sed 's/export //' | sort || true)
    
    # Get exports from new version (staged)
    local new_exports_list
    new_exports_list=$(git show ":$file" 2>/dev/null | grep -E '^export (const|function|class|type|interface|enum|default)' | sed 's/export //' | sort || true)
    
    # Find removed exports
    local removed
    removed=$(comm -23 <(echo "$old_exports") <(echo "$new_exports_list") || true)
    
    if [[ -n "$removed" ]]; then
      while IFS= read -r export_name; do
        [[ -z "$export_name" ]] && continue
        removed_exports+=("$file: $export_name")
      done <<< "$removed"
    fi
    
    # Find new exports
    local added
    added=$(comm -13 <(echo "$old_exports") <(echo "$new_exports_list") || true)
    
    if [[ -n "$added" ]]; then
      while IFS= read -r export_name; do
        [[ -z "$export_name" ]] && continue
        new_exports+=("$file: $export_name")
      done <<< "$added"
    fi
    
  done <<< "$source_files"
  
  # Report findings
  if [[ ${#removed_exports[@]} -gt 0 ]]; then
    log_warn "⚠️  REMOVED EXPORTS detected (potential breaking changes):"
    for export in "${removed_exports[@]}"; do
      echo "    - $export"
    done
    return 1
  fi
  
  if [[ ${#new_exports[@]} -gt 0 ]]; then
    log_info "New exports added:"
    for export in "${new_exports[@]}"; do
      echo "    + $export"
    done
  fi
  
  return 0
}

# Classify the type of change
classify_changes() {
  local source_files="$1"
  local has_new_files=false
  local has_modified_files=false
  local has_test_changes=false
  
  # Check for new files
  if git diff --cached --name-only --diff-filter=A | grep -qE '\.tsx?$'; then
    has_new_files=true
  fi
  
  # Check for modified files
  if git diff --cached --name-only --diff-filter=M | grep -qE '\.tsx?$'; then
    has_modified_files=true
  fi
  
  # Check for test changes
  if echo "$source_files" | grep -qE '\.test\.(tsx?|jsx?)$'; then
    has_test_changes=true
  fi
  
  # Determine change type
  local change_type="UNKNOWN"
  
  # Read commit message from stdin or use a placeholder
  local commit_msg
  commit_msg=$(git log --format=%B -n 1 HEAD 2>/dev/null || echo "")
  
  if echo "$commit_msg" | grep -qiE '^fix[:(]|bugfix|hotfix'; then
    change_type="BUG_FIX"
  elif echo "$commit_msg" | grep -qiE '^feat[:(]|feature|add'; then
    change_type="FEATURE"
  elif echo "$commit_msg" | grep -qiE '^refactor[:(]|cleanup|reorganize'; then
    change_type="REFACTOR"
  elif echo "$commit_msg" | grep -qiE '^perf[:(]|performance|optimize'; then
    change_type="PERFORMANCE"
  elif [[ "$has_new_files" == true ]]; then
    change_type="FEATURE"
  elif [[ "$has_modified_files" == true ]]; then
    change_type="MODIFICATION"
  fi
  
  log_info "Change classified as: $change_type"
  echo "$change_type"
}

# Main execution
main() {
  log_info "Starting regression check..."
  
  # Get changed files
  local changed_files
  changed_files="$(get_changed_files)"
  
  if [[ -z "$changed_files" ]]; then
    log_success "No files changed, nothing to check."
    exit 0
  fi
  
  log_info "Changed files:"
  echo "$changed_files" | head -20 | sed 's/^/    /'
  if [[ $(echo "$changed_files" | wc -l) -gt 20 ]]; then
    echo "    ... and more"
  fi
  
  # Check if we have frontend source changes
  local frontend_files
  frontend_files="$(get_frontend_source_files "$changed_files")"
  
  if [[ -z "$frontend_files" ]]; then
    log_success "No frontend source changes detected. Skipping frontend checks."
    exit 0
  fi
  
  local exit_code=0
  
  # 1. Run tests
  if [[ "$SKIP_TESTS" != true ]]; then
    if ! run_frontend_tests "all" "$frontend_files"; then
      log_error "❌ Tests failed! Fix tests before committing."
      exit_code=1
    else
      log_success "✅ All tests passed."
    fi
  else
    log_warn "⏭️  Skipping tests (SKIP_TESTS=true)"
  fi
  
  # 2. Check for export changes (unless skip)
  if [[ "${SKIP_EXPORT_CHECK:-}" != "1" ]]; then
    if ! check_export_changes "$frontend_files"; then
      log_warn "⚠️  Removed exports detected. Consider documenting this breaking change."
      # Don't fail on export changes, just warn
    fi
  fi
  
  # 3. Classify the change
  classify_changes "$frontend_files" > /dev/null
  
  # 4. TypeScript check
  log_info "Running TypeScript check..."
  if ! (cd src/frontend && npm run type-check 2>&1); then
    log_error "❌ TypeScript errors found!"
    exit_code=1
  else
    log_success "✅ TypeScript validation passed."
  fi
  
  if [[ $exit_code -eq 0 ]]; then
    log_success "🎉 All regression checks passed!"
  else
    log_error "❌ Some checks failed. Please fix before committing."
  fi
  
  exit $exit_code
}

main "$@"
