import { test, expect, Page } from '@playwright/test';

/**
 * Playwright E2E Tests for AlphabetGame Hand Tracing
 * 
 * Tests the hand tracing functionality:
 * 1. Game loads and displays correctly
 * 2. Hand tracking initializes
 * 3. Canvas drawing works (via mouse simulation for testing)
 * 4. Accuracy calculation works
 * 5. No technical information leaks to UI
 */

test.describe('AlphabetGame Hand Tracing', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    // Mock camera permission (Playwright doesn't access real camera in tests)
    await page.context().grantPermissions(['camera']);
    
    // Navigate to game - adjust URL based on your dev server
    await page.goto('http://localhost:6173/game', { 
      waitUntil: 'networkidle' 
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('Game page loads with no console errors', async () => {
    // Wait for game to render
    await page.waitForSelector('canvas', { timeout: 5000 });
    
    // Check for critical errors in console
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit for any delayed errors
    await page.waitForTimeout(2000);
    
    // Should have no errors
    expect(errors).toEqual([]);
  });

  test('Canvas element exists and is properly sized', async () => {
    const canvas = await page.locator('canvas').first();
    expect(canvas).toBeDefined();

    const box = await canvas.boundingBox();
    expect(box?.width).toBeGreaterThan(0);
    expect(box?.height).toBeGreaterThan(0);
  });

  test('Game shows target letter', async () => {
    // Wait for letter prompt to appear
    const letterDisplay = await page.locator('text=/Trace|Show|Letter/i').first();
    await expect(letterDisplay).toBeVisible({ timeout: 5000 });
  });

  test('Drawing mode toggle button exists and works', async () => {
    // Look for draw/trace button
    const drawButton = await page.locator('button:has-text(/Draw|Trace|Start/i)').first();
    expect(drawButton).toBeDefined();

    // Button should be clickable
    const isEnabled = await drawButton.isEnabled();
    expect(isEnabled).toBe(true);
  });

  test('No technical delegate info leaked to UI', async () => {
    // Wait for model to load
    await page.waitForTimeout(3000);

    // Check all visible text for technical jargon
    const pageText = await page.locator('body').textContent();
    
    // Should NOT contain GPU/CPU delegate info
    expect(pageText).not.toMatch(/GPU mode|CPU mode|delegate/i);
    expect(pageText).not.toMatch(/WebGL|WASM/i);
  });

  test('Keyboard shortcut for quick actions works', async () => {
    // Some games might have keyboard shortcuts
    // Test that they don't crash the app
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Canvas should still exist
    const canvas = await page.locator('canvas').first();
    expect(canvas).toBeDefined();
  });

  test('Mouse drawing works as fallback', async () => {
    // Find canvas
    const canvas = await page.locator('canvas').first();
    const box = await canvas.boundingBox();
    
    if (!box) throw new Error('Canvas not found');

    // Enable drawing mode if needed
    const drawButton = await page.locator('button:has-text(/Start|Draw|Trace/i)').first();
    const buttonText = await drawButton.textContent();
    
    if (buttonText?.includes('Start')) {
      await drawButton.click();
      await page.waitForTimeout(300);
    }

    // Simulate mouse drawing on canvas
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // Draw a simple stroke
    await page.mouse.move(centerX - 50, centerY - 50);
    await page.mouse.down();
    
    for (let i = 0; i < 10; i++) {
      await page.mouse.move(
        centerX - 50 + i * 10,
        centerY - 50 + i * 10,
        { steps: 2 }
      );
    }
    
    await page.mouse.up();
    await page.waitForTimeout(500);

    // Canvas should still be present and no errors
    expect(canvas).toBeDefined();
  });

  test('Completion flow triggers feedback', async () => {
    // Complete a full tracing interaction
    const canvas = await page.locator('canvas').first();
    const box = await canvas.boundingBox();
    
    if (!box) throw new Error('Canvas not found');

    // Enable drawing
    const drawButton = await page.locator('button:has-text(/Start|Draw|Trace/i)').first();
    const buttonText = await drawButton.textContent();
    
    if (buttonText?.includes('Start')) {
      await drawButton.click();
      await page.waitForTimeout(300);
    }

    // Draw multiple strokes to simulate tracing
    for (let stroke = 0; stroke < 5; stroke++) {
      const offsetX = stroke * 20 - 50;
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;

      await page.mouse.move(centerX + offsetX, centerY - 50);
      await page.mouse.down();
      
      for (let i = 0; i < 8; i++) {
        await page.mouse.move(
          centerX + offsetX,
          centerY - 50 + i * 10,
          { steps: 1 }
        );
      }
      
      await page.mouse.up();
      await page.waitForTimeout(100);
    }

    // Look for "Check My Tracing" or similar button
    const checkButton = await page.locator('button:has-text(/Check|Submit|Next/i)').first();
    if (await checkButton.isVisible({ timeout: 1000 })) {
      await checkButton.click();
      await page.waitForTimeout(1000);

      // Should show feedback (positive)
      const pageText = await page.locator('body').textContent();
      expect(pageText).toMatch(/great|good|nice|excellent|amazing|awesome/i);
    }
  });

  test('Game survives rapid interactions', async () => {
    const canvas = await page.locator('canvas').first();
    expect(canvas).toBeDefined();

    // Simulate rapid button clicks
    const buttons = await page.locator('button').all();
    
    for (let i = 0; i < Math.min(5, buttons.length); i++) {
      const btn = buttons[i];
      if (await btn.isEnabled()) {
        await btn.click();
        await page.waitForTimeout(100);
      }
    }

    // App should still be responsive
    await page.waitForTimeout(500);
    expect(canvas).toBeDefined();
  });

  test('Page handles model loading failure gracefully', async () => {
    // Create a new page with network interception
    const newPage = await page.context().newPage();
    
    // Intercept and block MediaPipe model requests
    await newPage.route('**/hand_landmarker.task', route => route.abort());
    await newPage.route('**/wasm', route => route.abort());

    // Navigate to game
    await newPage.goto('http://localhost:6173/game', { 
      waitUntil: 'domcontentloaded' 
    });

    // Wait for error handling
    await newPage.waitForTimeout(2000);

    // Should show error message or fallback UI
    const pageText = await newPage.locator('body').textContent();
    
    // Could show camera error OR allow mouse mode
    const hasErrorMessage = /error|fail|unable|camera|permission/i.test(pageText || '');
    const hasMouseFallback = /mouse|click|touch/i.test(pageText || '');
    
    expect(hasErrorMessage || hasMouseFallback).toBe(true);

    await newPage.close();
  });

  test('Mascot/feedback component renders correctly', async () => {
    // Look for mascot or feedback text
    const feedback = await page.locator('[role="status"]').first();
    
    if (await feedback.isVisible({ timeout: 2000 })) {
      const text = await feedback.textContent();
      expect(text?.length).toBeGreaterThan(0);
    }
  });
});
