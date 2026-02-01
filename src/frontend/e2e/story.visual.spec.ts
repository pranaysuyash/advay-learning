import { test, expect } from '@playwright/test';

test.describe('Story visual tests', () => {
  test('map unlock + celebration modal', async ({ page }) => {
    // login as demo user if on dev server with known credentials
    await page.goto('/login');
    await page.fill("input[name='email']", 'pranay.suyash@gmail.com');
    await page.fill("input[name='password']", 'pranaysuyash');
    await page.click('button[type=submit]');
    await page.waitForURL('/dashboard');

    // Ensure the map is visible
    const map = page.locator('text=Pip\'s Adventure Map');
    await expect(map).toBeVisible();

    // Click Start Demo Quest
    await page.click('text=Start Demo Quest');

    // Wait for celebration modal and snapshot
    const modal = page.locator('text=Quest Complete');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Capture visual snapshots
    await page.screenshot({ path: 'e2e-snapshots/story-map.png', fullPage: true });
    await page.screenshot({ path: 'e2e-snapshots/story-modal.png', fullPage: true });
  });
});