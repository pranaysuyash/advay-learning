#!/bin/bash
# Check for external network calls in source code
# Blocks http(s) URLs except localhost

echo "Checking for external network calls in src/frontend/src/..."

# Check for http/https URLs (excluding localhost and comments)
EXTERNAL_URLS=$(grep -rEn "https?://" src/frontend/src/ 2>/dev/null | \
    grep -v "localhost" | \
    grep -v "127.0.0.1" | \
    grep -v "// " | \
    grep -v "@see" | \
    grep -v "@link" || true)

if [ -n "$EXTERNAL_URLS" ]; then
    echo "❌ ERROR: External network URLs found:"
    echo "$EXTERNAL_URLS"
    echo ""
    echo "All network calls must be local-only."
    echo "If this is intentional, update this script with justification."
    exit 1
fi

echo "✅ No external network calls found"
exit 0
