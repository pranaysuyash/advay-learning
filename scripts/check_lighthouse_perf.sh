#!/bin/bash
# Lighthouse performance check script
# Runs lighthouse against the production build

set -euo pipefail

echo "⚡️ Running Lighthouse performance analysis..."

# Ensure we are in the frontend directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/../src/frontend"

cd "$FRONTEND_DIR"

# Ensure build exists
if [ ! -d "dist" ]; then
    echo "📦 Building frontend..."
    pnpm run build
fi

# Start preview server in background
echo "🚀 Starting preview server..."
pnpm run preview --port 4173 &
PREVIEW_PID=$!

# Wait for server to be ready
echo "Wait for server to be ready..."
timeout 30 bash -c 'until curl -s http://localhost:4173 > /dev/null; do sleep 1; done' || (kill $PREVIEW_PID && exit 1)

# Run lighthouse
echo "🕵️ Running Lighthouse..."
mkdir -p "$FRONTEND_DIR/test-results/lighthouse"
lighthouse http://localhost:4173 \
    --quiet \
    --chrome-flags="--headless --no-sandbox" \
    --only-categories=performance \
    --output json --output html \
    --output-path "$FRONTEND_DIR/test-results/lighthouse/report" || true

# Kill preview server
kill $PREVIEW_PID || true

# Analyze results
REPORT_JSON="$FRONTEND_DIR/test-results/lighthouse/report.report.json"
if [ -f "$REPORT_JSON" ]; then
    PERF_SCORE=$(node -e "const report = require('$REPORT_JSON'); console.log(Math.round(report.categories.performance.score * 100))")
    echo "📈 Lighthouse Performance Score: $PERF_SCORE"
    
    if [ "$PERF_SCORE" -lt 80 ]; then
        echo "❌ Performance score is below 80!"
        exit 1
    else
        echo "✅ Performance score OK (>=80)"
    fi
else
    echo "❌ Lighthouse failed to generate report"
    exit 1
fi
