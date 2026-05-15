#!/bin/bash
# Bundle size check script
# Runs build and reports chunk sizes for the frontend

set -euo pipefail

echo "📦 Running frontend bundle size analysis..."

# Ensure we are in the frontend directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/../src/frontend"

cd "$FRONTEND_DIR"

# Run build using pnpm
pnpm run build 2>&1 | tail -10

echo ""
echo "📊 Bundle sizes (src/frontend/dist):"

# Report sizes
if [ -d "dist" ]; then
    echo ""
    echo "Main chunks (>100KB):"
    find dist/assets -name "*.js" -size +100k -exec ls -lh {} + | awk '{print $5 "\t" $9}' | sed "s|$FRONTEND_DIR/dist/||" || true
    
    echo ""
    echo "Total JS size (uncompressed):"
    TOTAL_SIZE_KB=$(du -sk dist/assets/*.js 2>/dev/null | awk '{sum+=$1} END {print sum}')
    echo "${TOTAL_SIZE_KB} KB total"
    
    # Warn if too large
    # P1 Threshold: 2.5MB (Audit limit)
    if [ "$TOTAL_SIZE_KB" -gt 2500 ]; then
        echo ""
        echo "⚠️  WARNING: Total JS bundle exceeds 2.5MB"
    else
        echo ""
        echo "✅ Bundle size within acceptable limits (<2.5MB)"
    fi
    
    # Check main index chunk specifically (if it follows common naming)
    MAIN_CHUNK=$(ls dist/assets/index-*.js 2>/dev/null | head -n 1 || true)
    if [ -n "$MAIN_CHUNK" ]; then
        MAIN_SIZE_KB=$(du -sk "$MAIN_CHUNK" | awk '{print $1}')
        echo "Main index chunk size: ${MAIN_SIZE_KB} KB"
        if [ "$MAIN_SIZE_KB" -gt 1000 ]; then
             echo "⚠️  WARNING: Main index chunk exceeds 1MB"
        fi
    fi
else
    echo "❌ Build failed - no dist directory"
    exit 1
fi
