import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://localhost:6173';

const pages = [
  { path: '/', name: 'home' },
  { path: '/dashboard', name: 'dashboard' },
  { path: '/game', name: 'game' },
  { path: '/progress', name: 'progress' },
  { path: '/settings', name: 'settings' },
];

// Visual snapshot tests. To record/update snapshots:
// PLAYWRIGHT_BASE_URL=http://localhost:6173 npx playwright test e2e/ui_visual.spec.ts --update-snapshots --project=chromium

for (const p of pages) {
  test(`visual ${p.name}`, async ({ page }) => {
    await page.goto(`${BASE}${p.path}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Playwright will store snapshots under test-results in the default snapshot folder.
    expect(await page.screenshot({ fullPage: true })).toMatchSnapshot(`${p.name}.png`, { maxDiffPixelRatio: 0.001 });
  });
}
