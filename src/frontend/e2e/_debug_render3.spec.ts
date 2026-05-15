import { test, expect } from '@playwright/test';

test('debug: check if login renders without CV errors', async ({ page }) => {
  let maxDepthCount = 0;
  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().includes('Maximum update depth')) {
      maxDepthCount++;
    }
  });

  // Block mediapipe to see if that's the cause
  await page.route('**/@mediapipe/**', route => route.abort());
  
  await page.goto('http://localhost:6173/login');
  await page.waitForTimeout(8000);

  const rootInner = await page.evaluate(() => document.getElementById('root')?.innerHTML?.substring(0, 500));
  console.log('Root inner HTML:', rootInner);
  console.log('MaxUpdateDepth count:', maxDepthCount);
  
  const hasSubmitButton = await page.locator('button[type="submit"]').count();
  console.log('Submit buttons found:', hasSubmitButton);
  
  expect(true).toBe(true);
});
