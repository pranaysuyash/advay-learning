#!/bin/bash
# Bundle size check script
# Runs build and reports chunk sizes

set -euo pipefail

echo "📦 Running bundle size analysis..."

cd "$(dirname "$0")/.."

# Run build
npm run build 2>&1 | tail -5

echo ""
echo "📊 Bundle sizes:"

# Report sizes
if [ -d "dist" ]; then
    echo ""
    echo "Main chunks:"
    ls -lh dist/assets/*.js 2>/dev/null | awk '{print $5 "\t" $9}' | sed 's|dist/||' || true
    
    echo ""
    echo "Total JS size:"
    du -sh dist/assets/*.js 2>/dev/null | awk '{sum+=$1} END {print sum "KB total"}' || true
    
    # Warn if too large
    TOTAL_SIZE=$(du -sk dist/assets/*.js 2>/dev/null | awk '{sum+=$1} END {print sum}')
    if [ "$TOTAL_SIZE" -gt 3000 ]; then
        echo ""
        echo "⚠️  WARNING: Total JS bundle exceeds 3MB"
    else
        echo ""
        echo "✅ Bundle size OK (<3MB)"
    fi
else
    echo "❌ Build failed - no dist directory"
    exit 1
fi
