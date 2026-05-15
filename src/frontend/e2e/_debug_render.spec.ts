import { test, expect } from '@playwright/test';

test('debug: check login page renders', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:6173/login');
  await page.waitForTimeout(8000);

  const rootInner = await page.evaluate(() => document.getElementById('root')?.innerHTML?.substring(0, 1000));
  console.log('Root inner HTML:', rootInner);
  console.log('Console errors count:', errors.length);
  if (errors.length > 0) console.log('First error:', errors[0].substring(0, 200));

  await page.screenshot({ path: 'test-results/debug-login-render.png' });
  expect(rootInner?.length).toBeGreaterThan(10);
});
