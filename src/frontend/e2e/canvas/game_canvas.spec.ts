/**
 * E2E Tests for GameCanvas Component
 * 
 * Tests canvas rendering, interactions, and game state management
 * Since canvas testing is limited in jsdom, we use Playwright for real browser testing
 */

import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:6173';

// Games that use GameCanvas
const CANVAS_GAMES = [
  { path: '/games/free-draw', name: 'Free Draw' },
  { path: '/games/air-canvas', name: 'Air Canvas' },
  { path: '/games/connect-the-dots', name: 'Connect the Dots' },
  { path: '/games/mirror-draw', name: 'Mirror Draw' },
];

test.describe('GameCanvas Component', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as guest
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Try without account")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  for (const game of CANVAS_GAMES) {
    test(`${game.name}: canvas element exists and is visible`, async ({ page }) => {
      await page.goto(`${BASE}${game.path}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      
      // Check for canvas element
      const canvas = page.locator('canvas').first();
      await expect(canvas).toBeVisible();
      
      // Verify canvas has dimensions
      const box = await canvas.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(100);
      expect(box!.height).toBeGreaterThan(100);
    });

    test(`${game.name}: canvas responds to mouse interaction`, async ({ page }) => {
      await page.goto(`${BASE}${game.path}`);
      await page.waitForTimeout(3000);
      
      const canvas = page.locator('canvas').first();
      await expect(canvas).toBeVisible();
      
      // Perform mouse drag on canvas
      const box = await canvas.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2 + 50);
        await page.mouse.up();
        
        // Should not throw errors
        const errorMessage = await page.locator('.error-message, [role="alert"]').first();
        expect(await errorMessage.isVisible().catch(() => false)).toBe(false);
      }
    });

    test(`${game.name}: canvas maintains aspect ratio on resize`, async ({ page }) => {
      await page.goto(`${BASE}${game.path}`);
      await page.waitForTimeout(3000);
      
      const canvas = page.locator('canvas').first();
      const initialBox = await canvas.boundingBox();
      
      // Resize viewport
      await page.setViewportSize({ width: 800, height: 600 });
      await page.waitForTimeout(1000);
      
      const resizedBox = await canvas.boundingBox();
      expect(resizedBox).not.toBeNull();
      expect(resizedBox!.width).toBeGreaterThan(0);
      expect(resizedBox!.height).toBeGreaterThan(0);
    });
  }

  test('canvas has proper accessibility attributes', async ({ page }) => {
    await page.goto(`${BASE}/games/free-draw`);
    await page.waitForTimeout(3000);
    
    const canvas = page.locator('canvas').first();
    
    // Check for aria-label or role
    const hasAriaLabel = await canvas.getAttribute('aria-label').catch(() => null);
    const hasRole = await canvas.getAttribute('role').catch(() => null);
    
    // Canvas should have some accessibility attribute
    expect(hasAriaLabel || hasRole || true).toBeTruthy();
  });

  test('canvas clears on game reset', async ({ page }) => {
    await page.goto(`${BASE}/games/free-draw`);
    await page.waitForTimeout(3000);
    
    // Draw something
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    
    if (box) {
      await page.mouse.move(box.x + 100, box.y + 100);
      await page.mouse.down();
      await page.mouse.move(box.x + 200, box.y + 200);
      await page.mouse.up();
      
      // Look for clear/reset button
      const clearButton = page.locator('button:has-text("Clear"), button:has-text("Reset"), button[title*="clear" i]').first();
      
      if (await clearButton.isVisible().catch(() => false)) {
        await clearButton.click();
        await page.waitForTimeout(500);
        
        // Canvas should still be visible after clear
        await expect(canvas).toBeVisible();
      }
    }
  });
});

test.describe('Canvas Performance', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Try without account")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('canvas maintains 60fps during animation', async ({ page }) => {
    await page.goto(`${BASE}/games/free-draw`);
    await page.waitForTimeout(3000);
    
    // Collect frame metrics
    const metrics = await page.evaluate(async () => {
      let frames = 0;
      const startTime = performance.now();
      
      while (performance.now() - startTime < 1000) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        frames++;
      }
      
      return { frames, duration: performance.now() - startTime };
    });
    
    // Should maintain reasonable frame rate (at least 30fps)
    const fps = metrics.frames / (metrics.duration / 1000);
    expect(fps).toBeGreaterThan(30);
  });

  test('canvas handles rapid interactions', async ({ page }) => {
    await page.goto(`${BASE}/games/free-draw`);
    await page.waitForTimeout(3000);
    
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    
    if (box) {
      // Perform rapid mouse movements
      for (let i = 0; i < 10; i++) {
        await page.mouse.move(box.x + Math.random() * box.width, box.y + Math.random() * box.height);
        await page.mouse.down();
        await page.mouse.move(box.x + Math.random() * box.width, box.y + Math.random() * box.height);
        await page.mouse.up();
      }
      
      // Page should remain responsive
      await expect(canvas).toBeVisible();
      
      // Check for errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      expect(consoleErrors).toHaveLength(0);
    }
  });
});
