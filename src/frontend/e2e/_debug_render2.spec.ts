import { test, expect } from '@playwright/test';

test('debug: find infinite loop source', async ({ page }) => {
  const errors: string[] = [];
  const consoleMessages: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('Maximum update depth')) {
        errors.push(text.substring(0, 300));
      }
    }
    if (msg.type() === 'warning') {
      consoleMessages.push(msg.text().substring(0, 300));
    }
  });
  
  page.on('pageerror', err => {
    const stack = err.stack ?? err.message;
    errors.push(stack.substring(0, 500));
  });

  await page.goto('http://localhost:6173/login');
  await page.waitForTimeout(5000);

  console.log('Non-MaxUpdateDepth errors:', JSON.stringify(errors.slice(0, 10), null, 2));
  console.log('Warnings:', JSON.stringify(consoleMessages.slice(0, 10), null, 2));
  
  // Try to get React component stack from error
  const pageErrors = await page.evaluate(() => {
    return (window as any).__REACT_ERRORS ?? [];
  });
  console.log('React errors:', pageErrors);
  
  expect(true).toBe(true);
});
