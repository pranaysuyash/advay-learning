# Child UX Testing Guide

## Complete Automated Child Simulation Testing Framework

---

## What Is This?

A comprehensive Playwright-based testing framework that **simulates a child (ages 4-8)** exploring your games autonomously. It captures:

- ✅ Every click, drag, and interaction
- ✅ Screenshots at each step
- ✅ Performance timings (lag detection)
- ✅ UX issues from a child's perspective
- ✅ Child-friendliness scoring
- ✅ Detailed analysis report

---

## Files Created

### Test Scripts
```
src/frontend/e2e/
├── child_exploratory_test.spec.ts    # Main exploratory test
└── new_games_smoke.spec.ts           # Basic smoke tests
```

### Documentation
```
docs/
├── UX_ANALYSIS_FRAMEWORK.md          # How testing works
├── CHILD_UX_TESTING_GUIDE.md         # This file
└── ux-analysis/
    ├── ux-analysis-report-SAMPLE.md  # Example output
    └── screenshots/                  # Generated screenshots
```

---

## Quick Start

### Run All Tests
```bash
cd src/frontend
npx playwright test e2e/child_exploratory_test.spec.ts
```

This will:
1. Start the dev server automatically
2. Login as guest user
3. Open each game one by one
4. Simulate child interactions
5. Take screenshots at each step
6. Generate detailed report

### View Results
```bash
# Open the generated report
code docs/ux-analysis/ux-analysis-report.md

# View screenshots
open docs/ux-analysis/screenshots/
```

---

## What Gets Tested

### For Each Game:

1. **Loading Experience**
   - How long until game appears?
   - Is it fast enough for child's attention span?
   - Any errors or broken elements?

2. **First Impressions**
   - Is the game visually engaging?
   - Can child understand what to do?
   - Are instructions clear?

3. **Core Interactions**
   - Can child start the game?
   - Does the main mechanic work?
   - Is feedback immediate?

4. **Performance**
   - Any lag during interactions?
   - Canvas drawing smooth?
   - Audio sync correct?

5. **Child Confusion Points**
   - Where does child get stuck?
   - What isn't clear?
   - Missing visual cues?

---

## Sample Output

### Console Output
```
🧒 Child Exploratory UX Testing

Explore: Story Sequence
  ✅ loads successfully (1.2s)
  ⚠️  instructions could be clearer
  ✅ drag interaction smooth (45ms)
  📸 5 screenshots captured

Explore: Shape Safari
  ✅ loads successfully (2.1s)
  ⚠️  canvas lag detected (180ms)
  ❌ no tutorial for tracing
  📸 3 screenshots captured

... (more games)

✅ UX Analysis Report saved to: docs/ux-analysis/ux-analysis-report.md
```

### Generated Report Includes:
- **Overall Score** (0-100)
- **Game-by-Game Breakdown**
- **Critical Issues List**
- **Performance Analysis**
- **Screenshots with Annotations**
- **Prioritized Recommendations**

---

## Understanding Scores

### Child-Friendliness Score (0-100)

| Score | Grade | Meaning |
|-------|-------|---------|
| 90-100 | A | Child can play independently |
| 80-89 | B | Minor issues, mostly playable |
| 70-79 | C | Needs some adult help |
| 60-69 | D | Frustrating for child |
| <60 | F | Cannot be played by child |

### Issue Severity

- **🔴 Critical** - Game broken or unusable
- **🟠 High** - Major UX problem
- **🟡 Medium** - Minor inconvenience
- **🟢 Low** - Nice to have fix

---

## Interpreting Results

### Example Issue
```
[Shape Safari]
Severity: HIGH
Category: confusion
Issue: No visible instructions on how to trace
Screenshot: shape-safari_02_canvas_interaction.png

Child's Experience:
- Opens game (pretty colors!)
- Sees animals and shapes
- Tries clicking... nothing happens
- Tries dragging... nothing happens
- Gets confused and leaves

Fix Recommendation:
Add animated hand showing tracing motion on first load
```

### Example Performance Issue
```
[Free Draw]
Severity: HIGH
Category: performance
Issue: Drawing lag detected: 220ms for simple stroke

Child's Experience:
- Tries to draw a line
- Line appears 220ms later
- Feels "disconnected" from action
- Gets frustrated, stops playing

Fix Recommendation:
- Use requestAnimationFrame for rendering
- Implement layered canvas (preview + commit)
- Target <100ms response time
```

---

## Customization

### Test Specific Games
```typescript
// In child_exploratory_test.spec.ts, add:
test.only('Explore: My Game', async ({ page }) => {
  // Test just one game
});
```

### Adjust Child Behavior
```typescript
// Make child more patient
const childDelay = async (page, min = 1000, max = 3000) => {
  await page.waitForTimeout(Math.random() * (max - min) + min);
};
```

### Add New Checks
```typescript
// Check for specific feature
const hasFeature = await page.locator('.feature-class').isVisible();
if (!hasFeature) {
  recordIssue(result, 'high', 'ux', 'Important feature missing');
}
```

---

## CI/CD Integration

### GitHub Actions
```yaml
name: Child UX Testing
on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install
      - name: Run child UX tests
        run: npx playwright test e2e/child_exploratory_test.spec.ts
      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: ux-analysis-report
          path: docs/ux-analysis/
```

---

## Best Practices

### When to Run Tests
- ✅ After adding new game
- ✅ Before major releases
- ✅ After UI changes
- ✅ When performance issues reported

### What to Fix First
1. **Critical Issues** - Game unplayable
2. **Load Times** > 3 seconds - Child loses interest
3. **Missing Instructions** - Child doesn't know what to do
4. **Lag** > 200ms - Feels unresponsive
5. **No Feedback** - Child doesn't know if action worked

### Real Child Testing
While automated tests catch 80% of issues, also test with **real children**:
- Ages 4-6 (early learners)
- Ages 7-8 (independent players)
- Mixed abilities
- First-time users

---

## Troubleshooting

### Tests Failing
```bash
# Check if server is running
curl http://localhost:6173

# Run with debug mode
npx playwright test --debug

# View trace
npx playwright show-trace trace.zip
```

### No Screenshots
```bash
# Create directory
mkdir -p docs/ux-analysis/screenshots

# Check permissions
ls -la docs/ux-analysis/
```

### Report Not Generated
Check console output for errors. Most common:
- Server not starting (check port 6173)
- Login failing (check guest login button selector)
- Game not loading (check routes)

---

## Advanced Usage

### Performance Profiling
```typescript
// Add to test
await page.evaluate(() => {
  performance.mark('game-start');
});

// Later...
const metrics = await page.evaluate(() => {
  performance.mark('game-end');
  performance.measure('game-load', 'game-start', 'game-end');
  return performance.getEntriesByName('game-load');
});
```

### Accessibility Checks
```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

await injectAxe(page);
await checkA11y(page, null, {
  detailedReport: true,
});
```

### Mobile Simulation
```typescript
test.use({
  viewport: { width: 375, height: 667 },  // iPhone SE
  deviceScaleFactor: 2,
  isMobile: true,
});
```

---

## Summary

This testing framework provides:

1. **Objective Analysis** - Data-driven UX assessment
2. **Child Perspective** - Tests assume no prior knowledge
3. **Performance Metrics** - Catches lag and slowness
4. **Visual Documentation** - Screenshots at each step
5. **Actionable Reports** - Prioritized fix list

**Result:** Games that work better for actual children!

---

## Next Steps

1. Run the tests: `npx playwright test e2e/child_exploratory_test.spec.ts`
2. Review the report: `docs/ux-analysis/ux-analysis-report.md`
3. Fix critical issues first
4. Re-run tests to verify improvements
5. Test with real children for final validation

---

*Framework Version: 1.0*  
*Last Updated: 2026-02-22*
