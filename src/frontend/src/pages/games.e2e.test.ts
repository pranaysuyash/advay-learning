import { test, expect } from '@playwright/test';

test.describe('Yoga Animals Game', () => {
  test('should load the game page', async ({ page }) => {
    await page.goto('/games/yoga-animals');

    // Should show loading state first
    await expect(page.locator('text=Loading Yoga Animals')).toBeVisible({
      timeout: 10000,
    });

    // After loading, should show the game start screen
    await expect(page.locator('text=Yoga Animals!')).toBeVisible({
      timeout: 30000,
    });
    await expect(page.locator('text=Copy animal poses')).toBeVisible();
  });
});

test.describe('Freeze Dance Game', () => {
  test('should load the game page', async ({ page }) => {
    await page.goto('/games/freeze-dance');

    // Should show loading state first
    await expect(page.locator('text=Loading Freeze Dance')).toBeVisible({
      timeout: 10000,
    });

    // After loading, should show the game start screen
    await expect(page.locator('text=Freeze Dance!')).toBeVisible({
      timeout: 30000,
    });
    await expect(page.locator('text=Dance when the music plays')).toBeVisible();
  });
});

test.describe('Simon Says Game', () => {
  test('should load the game page', async ({ page }) => {
    await page.goto('/games/simon-says');

    // Should show loading state first
    await expect(page.locator('text=Loading Simon Says')).toBeVisible({
      timeout: 10000,
    });

    // After loading, should show the game start screen
    await expect(page.locator('text=Simon Says!')).toBeVisible({
      timeout: 30000,
    });
    await expect(page.locator('text=Do what Simon says')).toBeVisible();
  });
});
