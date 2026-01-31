#!/bin/bash
# Angel Investor Evaluation - Hands-On Audit for Advay Vision Learning

echo "🚀 Starting Angel Investor Evaluation"
echo "📱 Product: Advay Vision Learning (http://localhost:6173)"
echo "🎯 Stage: Pre-Seed/Angel ($10K-$100K checks)"

# Check if app is running
if ! curl -s http://localhost:6173 > /dev/null 2>&1 | grep -q "Advay"; then
  echo "❌ Error: App not running at http://localhost:6173"
  echo "Please start the frontend first:"
  echo "  cd src/frontend && npm run dev"
  exit 1
fi

echo "✅ App is running, starting evaluation..."

# Run Playwright evaluation script
cd /Users/pranay/Projects/learning_for_kids

# Install Playwright if needed
if ! npx playwright --version > /dev/null 2>&1; then
  echo "📦 Installing Playwright..."
  npm install @playwright/test --timeout=300000
fi

echo "🎬 Running evaluation with Playwright..."
node evaluations/angel-investor-evaluation.js

# Check if evaluation completed
if [ -f "evaluations/angel-investor-evaluation.json" ]; then
  echo ""
  echo "✅ Evaluation complete!"
  echo "📊 Results saved to: evaluations/angel-investor-evaluation.json"
  echo ""
  echo "Next steps:"
  echo "  1. Review evaluation JSON for detailed findings"
  echo "  2. Address top 3 love blockers before demo launch"
  echo "  3. Use findings to refine investor pitch"
else
  echo "❌ Evaluation failed - check logs above"
fi
