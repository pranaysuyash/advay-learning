import { test, expect } from '@playwright/test';

test('login flow does not show transient native validation messages', async ({ page }) => {
  await page.goto('/login');

  // Type and submit
  await page.fill("#login-email-input", 'pranay.suyash@gmail.com');
  await page.fill("#login-password-input", 'pranaysuyash');
  await page.click('button[type=submit]');

  // Wait for navigation to dashboard
  await page.waitForURL('/dashboard', { timeout: 5000 });

  // Ensure there are no native 'Field required' messages or inline error visible
  const pageText = await page.textContent('body');
  expect(pageText).not.toContain('Field required');
  expect(await page.locator('#login-error').textContent()).toBe('');
});