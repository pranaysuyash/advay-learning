#!/bin/bash
# Check PR size against develop branch
# Usage: ./scripts/check_pr_size.sh [branch_name]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get target branch (default: develop)
TARGET_BRANCH="${1:-develop}"
CURRENT_BRANCH=$(git branch --show-current)

echo "📊 Checking PR size for branch: $CURRENT_BRANCH"
echo "Target branch: $TARGET_BRANCH"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not a git repository${NC}"
    exit 1
fi

# Fetch latest from remote
echo "Fetching latest from remote..."
git fetch origin $TARGET_BRANCH > /dev/null 2>&1 || true

# Get statistics
echo ""
echo "=== Files Changed ==="
git diff --name-only origin/$TARGET_BRANCH...HEAD 2>/dev/null || git diff --name-only $TARGET_BRANCH...HEAD

FILE_COUNT=$(git diff --name-only origin/$TARGET_BRANCH...HEAD 2>/dev/null | wc -l || git diff --name-only $TARGET_BRANCH...HEAD | wc -l)
echo ""
echo "Total files changed: $FILE_COUNT"

echo ""
echo "=== LOC Changed ==="
git diff --stat origin/$TARGET_BRANCH...HEAD 2>/dev/null || git diff --stat $TARGET_BRANCH...HEAD

# Calculate total LOC
STATS=$(git diff --numstat origin/$TARGET_BRANCH...HEAD 2>/dev/null || git diff --numstat $TARGET_BRANCH...HEAD)
ADDED=$(echo "$STATS" | awk '{sum+=$1} END {print sum}')
DELETED=$(echo "$STATS" | awk '{sum+=$2} END {print sum}')
TOTAL=$((ADDED + DELETED))

echo ""
echo "=== Summary ==="
echo "Lines added:   $ADDED"
echo "Lines deleted: $DELETED"
echo "Total LOC:     $TOTAL"

# Check against limits
echo ""
echo "=== PR Size Assessment ==="

# Files limit
if [ "$FILE_COUNT" -gt 15 ]; then
    echo -e "${RED}❌ Files changed ($FILE_COUNT) exceeds maximum (15)${NC}"
elif [ "$FILE_COUNT" -gt 8 ]; then
    echo -e "${YELLOW}⚠️  Files changed ($FILE_COUNT) exceeds target (8)${NC}"
else
    echo -e "${GREEN}✅ Files changed ($FILE_COUNT) within target${NC}"
fi

# LOC limit
if [ "$TOTAL" -gt 400 ]; then
    echo -e "${RED}❌ Total LOC ($TOTAL) exceeds maximum (400)${NC}"
elif [ "$TOTAL" -gt 200 ]; then
    echo -e "${YELLOW}⚠️  Total LOC ($TOTAL) exceeds target (200)${NC}"
else
    echo -e "${GREEN}✅ Total LOC ($TOTAL) within target${NC}"
fi

# Recommendations
echo ""
echo "=== Recommendations ==="
if [ "$TOTAL" -gt 400 ] || [ "$FILE_COUNT" -gt 15 ]; then
    echo "Consider splitting this PR into smaller chunks:"
    echo "  1. Extract independent changes into separate PRs"
    echo "  2. Separate refactoring from feature work"
    echo "  3. Split by layer (UI vs logic vs data)"
fi

echo ""
echo "Guidelines:"
echo "  Target: < 200 LOC, < 8 files"
echo "  Warning: 200-400 LOC, 8-15 files"
echo "  Maximum: 400 LOC, 15 files"
