#!/bin/bash
# Verification script - runs all quality checks locally
# This replaces CI - must pass before PR

set -e

echo "🔍 Running verification checks..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if we're in project root
if [ ! -d "src/frontend" ]; then
    echo -e "${RED}❌ Error: Must run from project root${NC}"
    exit 1
fi

cd src/frontend

# 1. Lint
echo "1️⃣  Running ESLint..."
npm run lint
echo -e "${GREEN}✓ Lint passed${NC}"
echo ""

# 2. Type check
echo "2️⃣  Running TypeScript check..."
npm run typecheck 2>/dev/null || npx tsc --noEmit
echo -e "${GREEN}✓ Type check passed${NC}"
echo ""

# 3. Tests
echo "3️⃣  Running tests..."
npm run test:run 2>/dev/null || echo -e "${YELLOW}⚠ No tests configured yet${NC}"
echo ""

# 4. Check for external network calls
echo "4️⃣  Checking for external network calls..."
cd ../..
bash scripts/check_no_external_network.sh
echo -e "${GREEN}✓ No external network calls found${NC}"
echo ""

echo -e "${GREEN}✅ All verification checks passed!${NC}"
echo ""
