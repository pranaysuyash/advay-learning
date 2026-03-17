#!/bin/bash
# Launch Chrome for manual game testing
# Opens your actual Chrome with remote debugging for CDP connection

# Configuration
DEV_URL="${1:-http://localhost:3000}"
CHROME_PROFILE="${2:-}"
GAME_ID="${3:-}"

# Kill any existing Chrome debug sessions
echo "🧹 Cleaning up any existing Chrome debug sessions..."
pkill -f "Chrome.*remote-debugging-port" 2>/dev/null || true
sleep 1

# Build Chrome launch command
CHROME_ARGS=(
    "--remote-debugging-port=9222"
    "--disable-web-security"
    "--disable-features=IsolateOrigins,site-per-process"
    "--use-fake-ui-for-media-stream"
    "--use-fake-device-for-media-stream"
    "--user-data-dir=/tmp/chrome-test-profile"
)

# Add profile if specified
if [ -n "$CHROME_PROFILE" ]; then
    CHROME_ARGS+=("--user-data-dir=$CHROME_PROFILE")
fi

# Determine URL to open
if [ -n "$GAME_ID" ]; then
    URL="$DEV_URL/games/$GAME_ID"
else
    URL="$DEV_URL/games"
fi

echo "🚀 Launching Chrome..."
echo "   URL: $URL"
echo "   Debug Port: 9222"

# Detect OS and launch appropriate Chrome
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if [ -d "/Applications/Google Chrome.app" ]; then
        open -a "Google Chrome" --args "${CHROME_ARGS[@]}" "$URL"
    elif [ -d "/Applications/Google Chrome Canary.app" ]; then
        open -a "Google Chrome Canary" --args "${CHROME_ARGS[@]}" "$URL"
    else
        echo "❌ Chrome not found in /Applications"
        exit 1
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    google-chrome "${CHROME_ARGS[@]}" "$URL" 2>/dev/null || \
    google-chrome-stable "${CHROME_ARGS[@]}" "$URL" 2>/dev/null || \
    chromium "${CHROME_ARGS[@]}" "$URL"
else
    # Windows (Git Bash)
    "/c/Program Files/Google/Chrome/Application/chrome.exe" "${CHROME_ARGS[@]}" "$URL" 2>/dev/null || \
    "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" "${CHROME_ARGS[@]}" "$URL"
fi

echo ""
echo "✅ Chrome launched!"
echo ""
echo "📋 Testing Checklist:"
echo "   □ Visual appeal (colors, animations)"
echo "   □ Instructions are clear"
echo "   □ Controls are responsive"
echo "   □ Feedback on actions (visual/audio)"
echo "   □ Score/progress visible"
echo "   □ Fun factor"
echo "   □ Celebrations on success"
echo ""
echo "💡 Use the interactive tester:"
echo "   open tools/interactive-game-tester.html"
