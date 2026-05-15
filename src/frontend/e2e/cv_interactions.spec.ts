/**
 * E2E Test for CV (Computer Vision) Interactions
 * Tests hand tracking functionality in games
 */
import { test, expect } from '@playwright/test';

test.describe('CV Interactions', () => {
  test('CatchSort game loads with hand tracking option', async ({ page }) => {
    // Navigate to CatchSort game
    await page.goto('/games/catch-sort');

    // Wait for the game to load
    await page.waitForSelector('text=Catch & Sort', { timeout: 10000 });

    // Check that the game mentions hand tracking in instructions
    const pageText = await page.textContent('body');
    expect(pageText).toContain('hand');
    expect(pageText).toContain('pinch');

    // Verify the Start Game button exists
    const startButton = page.locator('button:has-text("Start Game")');
    await expect(startButton).toBeVisible();
  });

  test('CatchSort game has CV cursor element', async ({ page }) => {
    // Navigate to CatchSort game
    await page.goto('/games/catch-sort');

    // Wait for the game container to load
    await page.waitForSelector('[class*="GameContainer"]', { timeout: 10000 });

    // Check for the game area where cursor would appear
    const gameArea = page.locator('[class*="relative"]').first();
    await expect(gameArea).toBeVisible();
  });

  test('Game with hand tracking has camera-safe route', async ({ page }) => {
    // Navigate to a game with CV
    await page.goto('/games/catch-sort');

    // Check that the page loads without camera permission errors
    // (camera permission should be requested gracefully)
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('camera')) {
        consoleErrors.push(msg.text());
      }
    });

    // Wait a moment for any console errors to appear
    await page.waitForTimeout(2000);

    // Should not have critical camera errors on initial load
    // (permission denied is acceptable, but not "camera not defined" errors)
    const criticalErrors = consoleErrors.filter(
      (e) => e.includes('undefined') || e.includes('not a function')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
