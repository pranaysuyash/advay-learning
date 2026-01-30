import { test } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:6173';
const outDir = 'docs/screenshots/ui_contrast/after';

const pages = [
  { path: '/', name: 'home' },
  { path: '/dashboard', name: 'dashboard' },
  { path: '/game', name: 'game' },
  { path: '/progress', name: 'progress' },
  { path: '/settings', name: 'settings' },
];

for (const p of pages) {
  test(`screenshot ${p.name}`, async ({ page }) => {
    await page.goto(`${BASE}${p.path}`);
    // Wait for main content to render
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${outDir}/${p.name}.png`, fullPage: true });
  });
}
