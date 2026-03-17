#!/bin/bash
# Test LM Studio connection and configuration

set -e

echo "=========================================="
echo "LM Studio Configuration Test"
echo "=========================================="
echo ""

# Check if LM Studio is running
echo "1. Checking if LM Studio server is accessible..."
if curl -s http://localhost:1234/v1/models > /dev/null 2>&1; then
    echo "   ✓ LM Studio is running at http://localhost:1234/v1"
    echo ""
    echo "   Available models:"
    curl -s http://localhost:1234/v1/models | grep -o '"id": "[^"]*"' | head -5 | sed 's/"id": "/   - /' | sed 's/"$//'
else
    echo "   ✗ Cannot connect to LM Studio at http://localhost:1234/v1"
    echo ""
    echo "   To start LM Studio:"
    echo "   1. Open LM Studio application"
    echo "   2. Load a model (e.g., Qwen 2.5 1.5B Instruct)"
    echo "   3. Click 'Start Server' button (top right)"
    echo "   4. Verify the server is running on port 1234"
    echo ""
    exit 1
fi

echo ""
echo "2. Checking frontend environment configuration..."

FRONTEND_ENV="/Users/pranay/Projects/learning_for_kids/src/frontend/.env"
if [ -f "$FRONTEND_ENV" ]; then
    echo "   ✓ Frontend .env file exists"
    
    if grep -q "VITE_AI_LLM_PROVIDER=lm-studio" "$FRONTEND_ENV" 2>/dev/null; then
        echo "   ✓ VITE_AI_LLM_PROVIDER is set to 'lm-studio'"
    else
        echo "   ⚠ VITE_AI_LLM_PROVIDER is not set to 'lm-studio'"
        echo "     Run: echo 'VITE_AI_LLM_PROVIDER=lm-studio' >> $FRONTEND_ENV"
    fi
    
    if grep -q "VITE_AI_LLM_ENABLED=true" "$FRONTEND_ENV" 2>/dev/null; then
        echo "   ✓ VITE_AI_LLM_ENABLED is set to 'true'"
    else
        echo "   ⚠ VITE_AI_LLM_ENABLED is not set to 'true'"
        echo "     Run: echo 'VITE_AI_LLM_ENABLED=true' >> $FRONTEND_ENV"
    fi
else
    echo "   ✗ Frontend .env file not found at $FRONTEND_ENV"
    echo "     Copy from .env.example and configure"
fi

echo ""
echo "3. Testing LM Studio API..."
# Use placeholder token for local testing (not a real API key)
TEST_TOKEN="local-test-token"
TEST_RESPONSE=$(curl -s -X POST http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TEST_TOKEN}" \
  -d '{
    "model": "local-model",
    "messages": [{"role": "user", "content": "Say hello"}],
    "max_tokens": 20,
    "temperature": 0.7
  }' 2>/dev/null | grep -o '"content": "[^"]*"' | head -1 | sed 's/"content": "//' | sed 's/"$//')

if [ -n "$TEST_RESPONSE" ]; then
    echo "   ✓ LM Studio API test successful"
    echo "   Response: \"$TEST_RESPONSE\""
else
    echo "   ✗ LM Studio API test failed"
fi

echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""
echo "To use LM Studio with this project:"
echo ""
echo "1. Ensure LM Studio is running with a model loaded"
echo "2. Add to src/frontend/.env:"
echo "   VITE_AI_LLM_ENABLED=true"
echo "   VITE_AI_LLM_PROVIDER=lm-studio"
echo "   VITE_AI_LLM_MODEL=qwen3.5-1.5b-instruct"
echo ""
echo "3. Restart the dev server:"
echo "   cd /Users/pranay/Projects/learning_for_kids/src/frontend && npm run dev"
echo ""
