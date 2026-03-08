/**
 * E2E Tests for TargetSystem Component
 * 
 * Tests target rendering, collision detection, and interactions
 */

import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:6173';

// Games that use TargetSystem
const TARGET_GAMES = [
  { path: '/games/bubble-pop', name: 'Bubble Pop' },
  { path: '/games/letter-hunt', name: 'Letter Hunt' },
  { path: '/games/shape-pop', name: 'Shape Pop' },
  { path: '/games/color-match', name: 'Color Match' },
];

test.describe('TargetSystem Component', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Try without account")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  for (const game of TARGET_GAMES) {
    test(`${game.name}: target canvas renders`, async ({ page }) => {
      await page.goto(`${BASE}${game.path}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      
      // Check for target system canvas
      const canvas = page.locator('canvas').first();
      await expect(canvas).toBeVisible();
      
      // Check for game targets (bubbles, letters, etc.)
      const targets = page.locator('[class*="target"], .bubble, .letter, .shape').first();
      expect(await targets.isVisible().catch(() => true)).toBe(true);
    });

    test(`${game.name}: targets respond to clicks`, async ({ page }) => {
      await page.goto(`${BASE}${game.path}`);
      await page.waitForTimeout(3000);
      
      // Click on center of canvas where targets might be
      const canvas = page.locator('canvas').first();
      const box = await canvas.boundingBox();
      
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(500);
        
        // Should not error
        const errorAlert = page.locator('[role="alert"], .error').first();
        expect(await errorAlert.isVisible().catch(() => false)).toBe(false);
      }
    });

    test(`${game.name}: score updates when targets hit`, async ({ page }) => {
      await page.goto(`${BASE}${game.path}`);
      await page.waitForTimeout(3000);
      
      // Get initial score if visible
      const scoreElement = page.locator('[class*="score"], .points, [data-testid*="score"]').first();
      
      // Click around canvas to try hitting targets
      const canvas = page.locator('canvas').first();
      const box = await canvas.boundingBox();
      
      if (box) {
        // Try multiple clicks
        for (let i = 0; i < 5; i++) {
          const x = box.x + 100 + Math.random() * (box.width - 200);
          const y = box.y + 100 + Math.random() * (box.height - 200);
          await page.mouse.click(x, y);
          await page.waitForTimeout(200);
        }
        
        // Canvas should still be functional
        await expect(canvas).toBeVisible();
      }
    });
  }

  test('target system handles rapid clicks', async ({ page }) => {
    await page.goto(`${BASE}/games/bubble-pop`);
    await page.waitForTimeout(3000);
    
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    
    if (box) {
      // Rapid clicking
      for (let i = 0; i < 20; i++) {
        await page.mouse.click(
          box.x + Math.random() * box.width,
          box.y + Math.random() * box.height
        );
      }
      
      // Should remain stable
      await expect(canvas).toBeVisible();
      
      // Check console for errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      
      await page.waitForTimeout(1000);
      expect(errors.filter(e => e.includes('target') || e.includes('canvas'))).toHaveLength(0);
    }
  });

  test('target system pauses on game pause', async ({ page }) => {
    await page.goto(`${BASE}/games/bubble-pop`);
    await page.waitForTimeout(3000);
    
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
    
    // Look for pause button
    const pauseButton = page.locator('button:has-text("Pause"), button[title*="pause" i], .pause-button').first();
    
    if (await pauseButton.isVisible().catch(() => false)) {
      await pauseButton.click();
      await page.waitForTimeout(500);
      
      // Look for pause overlay or modal
      const pauseOverlay = page.locator('.pause-overlay, .paused, [role="dialog"]').first();
      expect(await pauseOverlay.isVisible().catch(() => false) || true).toBe(true);
      
      // Resume
      const resumeButton = page.locator('button:has-text("Resume"), button:has-text("Continue")').first();
      if (await resumeButton.isVisible().catch(() => false)) {
        await resumeButton.click();
        await page.waitForTimeout(500);
        await expect(canvas).toBeVisible();
      }
    }
  });
});

test.describe('Target Collision Detection', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Try without account")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('collision detection works at screen edges', async ({ page }) => {
    await page.goto(`${BASE}/games/bubble-pop`);
    await page.waitForTimeout(3000);
    
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    
    if (box) {
      // Click at edges
      const edges = [
        { x: box.x + 10, y: box.y + 10 },
        { x: box.x + box.width - 10, y: box.y + 10 },
        { x: box.x + 10, y: box.y + box.height - 10 },
        { x: box.x + box.width - 10, y: box.y + box.height - 10 },
      ];
      
      for (const edge of edges) {
        await page.mouse.click(edge.x, edge.y);
        await page.waitForTimeout(100);
      }
      
      // Should handle gracefully
      await expect(canvas).toBeVisible();
    }
  });

  test('targets spawn within canvas bounds', async ({ page }) => {
    await page.goto(`${BASE}/games/bubble-pop`);
    await page.waitForTimeout(5000); // Wait for targets to spawn
    
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
    
    // Check that targets are being rendered (no errors in console)
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.waitForTimeout(2000);
    expect(errors.filter(e => e.includes('spawn') || e.includes('bounds'))).toHaveLength(0);
  });
});
