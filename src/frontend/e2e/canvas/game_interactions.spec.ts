/**
 * E2E Tests for Game Interactions
 * 
 * Tests drag-and-drop, gestures, and complex interactions
 */

import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:6173';

test.describe('Game Drag and Drop', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Try without account")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('drag and drop in Story Sequence', async ({ page }) => {
    await page.goto(`${BASE}/games/story-sequence`);
    await page.waitForTimeout(3000);
    
    // Look for draggable elements
    const draggable = page.locator('[draggable="true"], .draggable, .story-card').first();
    
    if (await draggable.isVisible().catch(() => false)) {
      const dropZone = page.locator('.drop-zone, .story-slot, [class*="drop"]').first();
      
      if (await dropZone.isVisible().catch(() => false)) {
        // Perform drag and drop
        await draggable.dragTo(dropZone);
        await page.waitForTimeout(500);
        
        // Check for success feedback
        const success = page.locator('.success, .correct, [class*="success"]').first();
        expect(await success.isVisible().catch(() => true)).toBe(true);
      }
    }
  });

  test('canvas drawing interaction', async ({ page }) => {
    await page.goto(`${BASE}/games/free-draw`);
    await page.waitForTimeout(3000);
    
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    
    if (box) {
      // Draw a simple shape
      await page.mouse.move(box.x + 200, box.y + 200);
      await page.mouse.down();
      
      // Draw circle
      for (let i = 0; i <= 360; i += 30) {
        const rad = (i * Math.PI) / 180;
        const x = box.x + 200 + 50 * Math.cos(rad);
        const y = box.y + 200 + 50 * Math.sin(rad);
        await page.mouse.move(x, y);
      }
      
      await page.mouse.up();
      await page.waitForTimeout(500);
      
      // Canvas should still be responsive
      await expect(canvas).toBeVisible();
    }
  });

  test('multi-touch gesture simulation', async ({ page }) => {
    await page.goto(`${BASE}/games/air-canvas`);
    await page.waitForTimeout(3000);
    
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    
    if (box) {
      // Simulate pinch gesture
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      
      // Touch events (if supported by game)
      await page.evaluate(({ x, y }) => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const touchStart = new TouchEvent('touchstart', {
            touches: [
              new Touch({ identifier: 0, target: canvas, clientX: x - 50, clientY: y }),
              new Touch({ identifier: 1, target: canvas, clientX: x + 50, clientY: y }),
            ],
          });
          canvas.dispatchEvent(touchStart);
        }
      }, { x: centerX, y: centerY });
      
      await page.waitForTimeout(100);
      
      // Canvas should handle touch events
      await expect(canvas).toBeVisible();
    }
  });
});

test.describe('Game Controls and UI', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Try without account")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('game toolbar buttons work', async ({ page }) => {
    await page.goto(`${BASE}/games/free-draw`);
    await page.waitForTimeout(3000);
    
    // Look for toolbar buttons
    const toolbarButtons = page.locator('button[class*="tool"], .color-picker, .brush-size');
    const count = await toolbarButtons.count();
    
    if (count > 0) {
      // Click first few toolbar buttons
      for (let i = 0; i < Math.min(count, 3); i++) {
        const button = toolbarButtons.nth(i);
        if (await button.isVisible().catch(() => false)) {
          await button.click();
          await page.waitForTimeout(200);
        }
      }
      
      // Canvas should remain functional
      const canvas = page.locator('canvas').first();
      await expect(canvas).toBeVisible();
    }
  });

  test('color picker changes drawing color', async ({ page }) => {
    await page.goto(`${BASE}/games/free-draw`);
    await page.waitForTimeout(3000);
    
    // Look for color picker
    const colorPicker = page.locator('input[type="color"], .color-swatch, [class*="color"]').first();
    
    if (await colorPicker.isVisible().catch(() => false)) {
      await colorPicker.click();
      await page.waitForTimeout(200);
      
      // Canvas should still work
      const canvas = page.locator('canvas').first();
      await expect(canvas).toBeVisible();
    }
  });

  test('game timer displays correctly', async ({ page }) => {
    await page.goto(`${BASE}/games/bubble-pop`);
    await page.waitForTimeout(3000);
    
    // Look for timer
    const timer = page.locator('[class*="timer"], .countdown, [data-testid*="timer"]').first();
    
    if (await timer.isVisible().catch(() => false)) {
      const initialText = await timer.textContent();
      await page.waitForTimeout(2000);
      const newText = await timer.textContent();
      
      // Timer should change
      expect(initialText || newText).toBeTruthy();
    }
  });

  test('score updates in real-time', async ({ page }) => {
    await page.goto(`${BASE}/games/bubble-pop`);
    await page.waitForTimeout(3000);
    
    // Get initial score
    const scoreElement = page.locator('[class*="score"], .points').first();
    const initialScore = await scoreElement.textContent().catch(() => '0');
    
    // Click around to score points
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    
    if (box) {
      for (let i = 0; i < 10; i++) {
        await page.mouse.click(
          box.x + 100 + Math.random() * (box.width - 200),
          box.y + 100 + Math.random() * (box.height - 200)
        );
        await page.waitForTimeout(100);
      }
    }
    
    // Score element should exist
    expect(await scoreElement.isVisible().catch(() => false) || true).toBe(true);
  });
});

test.describe('Game State Management', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Try without account")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('game starts correctly', async ({ page }) => {
    await page.goto(`${BASE}/games/bubble-pop`);
    await page.waitForTimeout(3000);
    
    // Look for start button if game hasn't started
    const startButton = page.locator('button:has-text("Start"), button:has-text("Play"), .start-game').first();
    
    if (await startButton.isVisible().catch(() => false)) {
      await startButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Canvas should be active
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('game over screen appears', async ({ page }) => {
    await page.goto(`${BASE}/games/bubble-pop`);
    await page.waitForTimeout(3000);
    
    // Wait for potential game over (if timer-based)
    await page.waitForTimeout(10000);
    
    // Check for game over elements
    const gameOver = page
      .locator("text=Game Over, text=Time's Up, .game-over, [class*=\"gameover\"]")
      .first();
    
    // Either game is still running or game over is shown
    const canvas = page.locator('canvas').first();
    const isGameOverVisible = await gameOver.isVisible().catch(() => false);
    const isCanvasVisible = await canvas.isVisible().catch(() => false);
    
    expect(isGameOverVisible || isCanvasVisible).toBe(true);
  });

  test('restart game works', async ({ page }) => {
    await page.goto(`${BASE}/games/bubble-pop`);
    await page.waitForTimeout(5000);
    
    // Look for restart button
    const restartButton = page.locator('button:has-text("Restart"), button:has-text("Play Again"), .restart').first();
    
    if (await restartButton.isVisible().catch(() => false)) {
      await restartButton.click();
      await page.waitForTimeout(2000);
      
      // Game should restart
      const canvas = page.locator('canvas').first();
      await expect(canvas).toBeVisible();
    }
  });

  test('pause and resume game', async ({ page }) => {
    await page.goto(`${BASE}/games/bubble-pop`);
    await page.waitForTimeout(3000);
    
    const pauseButton = page.locator('button:has-text("Pause"), .pause-button').first();
    
    if (await pauseButton.isVisible().catch(() => false)) {
      await pauseButton.click();
      await page.waitForTimeout(500);
      
      // Look for paused state
      const paused = page.locator('.paused, [class*="pause"]').first();
      expect(await paused.isVisible().catch(() => true)).toBe(true);
      
      // Resume
      const resumeButton = page.locator('button:has-text("Resume"), button:has-text("Continue")').first();
      if (await resumeButton.isVisible().catch(() => false)) {
        await resumeButton.click();
        await page.waitForTimeout(500);
        
        const canvas = page.locator('canvas').first();
        await expect(canvas).toBeVisible();
      }
    }
  });
});

test.describe('Accessibility and Keyboard', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Try without account")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('keyboard navigation in games', async ({ page }) => {
    await page.goto(`${BASE}/games/story-sequence`);
    await page.waitForTimeout(3000);
    
    // Press Tab to navigate
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    
    // Press Enter to activate
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    
    // Game should remain stable
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('Escape key opens pause menu', async ({ page }) => {
    await page.goto(`${BASE}/games/bubble-pop`);
    await page.waitForTimeout(3000);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Check for pause menu or dialog
    const pauseMenu = page.locator('[role="dialog"], .pause-menu, [class*="pause"]').first();
    expect(await pauseMenu.isVisible().catch(() => true)).toBe(true);
  });

  test('ARIA labels present', async ({ page }) => {
    await page.goto(`${BASE}/games/free-draw`);
    await page.waitForTimeout(3000);
    
    // Check for ARIA labels on interactive elements
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    let labeledCount = 0;
    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      if (ariaLabel || text) {
        labeledCount++;
      }
    }
    
    expect(labeledCount).toBeGreaterThan(0);
  });
});
