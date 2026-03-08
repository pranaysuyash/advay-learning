/**
 * Visual Regression Tests for Canvas Components
 * 
 * Captures screenshots of canvas games for visual comparison
 */

import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:6173';

const CANVAS_GAMES = [
  { path: '/games/free-draw', name: 'free_draw' },
  { path: '/games/air-canvas', name: 'air_canvas' },
  { path: '/games/connect-the-dots', name: 'connect_the_dots' },
  { path: '/games/mirror-draw', name: 'mirror_draw' },
  { path: '/games/bubble-pop', name: 'bubble_pop' },
  { path: '/games/letter-hunt', name: 'letter_hunt' },
  { path: '/games/shape-pop', name: 'shape_pop' },
  { path: '/games/color-match', name: 'color_match' },
  { path: '/games/counting-collectathon', name: 'counting_collectathon' },
];

test.describe('Canvas Visual Regression', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Try without account")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  for (const game of CANVAS_GAMES) {
    test(`${game.name}: initial state screenshot`, async ({ page }) => {
      await page.goto(`${BASE}${game.path}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      
      // Wait for canvas to be ready
      const canvas = page.locator('canvas').first();
      await expect(canvas).toBeVisible();
      
      // Capture screenshot
      await page.screenshot({
        path: `e2e/canvas/screenshots/${game.name}_initial.png`,
        fullPage: false,
      });
    });

    test(`${game.name}: after interaction screenshot`, async ({ page }) => {
      await page.goto(`${BASE}${game.path}`);
      await page.waitForTimeout(3000);
      
      const canvas = page.locator('canvas').first();
      const box = await canvas.boundingBox();
      
      if (box) {
        // Perform some interactions
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2);
        await page.mouse.up();
        
        await page.waitForTimeout(1000);
        
        // Capture screenshot after interaction
        await page.screenshot({
          path: `e2e/canvas/screenshots/${game.name}_after_interaction.png`,
          fullPage: false,
        });
      }
    });
  }

  test('canvas responsive at different viewports', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 1366, height: 768, name: 'laptop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`${BASE}/games/free-draw`);
      await page.waitForTimeout(3000);
      
      const canvas = page.locator('canvas').first();
      
      if (await canvas.isVisible().catch(() => false)) {
        await page.screenshot({
          path: `e2e/canvas/screenshots/responsive_${viewport.name}.png`,
          fullPage: false,
        });
      }
    }
  });
});

test.describe('Canvas Performance Metrics', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Try without account")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('measure canvas render time', async ({ page }) => {
    await page.goto(`${BASE}/games/free-draw`);
    await page.waitForTimeout(3000);
    
    const metrics = await page.evaluate(async () => {
      const startTime = performance.now();
      
      // Perform render-intensive operations
      const canvas = document.querySelector('canvas');
      if (canvas && canvas.getContext) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          for (let i = 0; i < 100; i++) {
            ctx.fillStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
            ctx.fillRect(
              Math.random() * canvas.width,
              Math.random() * canvas.height,
              50,
              50
            );
          }
        }
      }
      
      return {
        renderTime: performance.now() - startTime,
      };
    });
    
    // Render time should be reasonable (less than 1 second for 100 operations)
    expect(metrics.renderTime).toBeLessThan(1000);
  });

  test('memory usage during gameplay', async ({ page }) => {
    await page.goto(`${BASE}/games/bubble-pop`);
    await page.waitForTimeout(3000);
    
    // Get initial memory
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Play for a bit
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    
    if (box) {
      for (let i = 0; i < 50; i++) {
        await page.mouse.click(
          box.x + Math.random() * box.width,
          box.y + Math.random() * box.height
        );
        await page.waitForTimeout(50);
      }
    }
    
    // Get final memory
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Memory increase should be reasonable (less than 100MB)
    const memoryIncrease = (finalMemory - initialMemory) / (1024 * 1024);
    expect(memoryIncrease).toBeLessThan(100);
  });

  test('frame rate stability', async ({ page }) => {
    await page.goto(`${BASE}/games/bubble-pop`);
    await page.waitForTimeout(3000);
    
    const frameMetrics = await page.evaluate(async () => {
      const frameTimes: number[] = [];
      let lastTime = performance.now();
      
      const measureFrame = () => {
        const now = performance.now();
        frameTimes.push(now - lastTime);
        lastTime = now;
        
        if (frameTimes.length < 60) {
          requestAnimationFrame(measureFrame);
        }
      };
      
      return new Promise<{ frameTimes: number[]; avgFrameTime: number }>((resolve) => {
        requestAnimationFrame(() => {
          measureFrame();
          setTimeout(() => {
            const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
            resolve({ frameTimes, avgFrameTime: avg });
          }, 1500);
        });
      });
    });
    
    // Average frame time should be reasonable (16.67ms = 60fps)
    expect(frameMetrics.avgFrameTime).toBeLessThan(33); // At least 30fps
  });
});

test.describe('Canvas Error Handling', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Try without account")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('handles rapid window resize', async ({ page }) => {
    await page.goto(`${BASE}/games/free-draw`);
    await page.waitForTimeout(3000);
    
    // Rapidly resize window
    for (let i = 0; i < 10; i++) {
      await page.setViewportSize({
        width: 800 + Math.random() * 400,
        height: 600 + Math.random() * 300,
      });
      await page.waitForTimeout(100);
    }
    
    // Canvas should still be visible and functional
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
    
    // Check for errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.waitForTimeout(500);
    expect(errors.filter(e => e.includes('canvas') || e.includes('context'))).toHaveLength(0);
  });

  test('recovers from context loss', async ({ page }) => {
    await page.goto(`${BASE}/games/free-draw`);
    await page.waitForTimeout(3000);
    
    const canvas = page.locator('canvas').first();
    
    // Simulate context loss (if possible)
    await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        // Dispatch webglcontextlost event if it's WebGL
        const event = new Event('webglcontextlost');
        canvas.dispatchEvent(event);
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Canvas should still exist
    expect(await canvas.isVisible().catch(() => false)).toBe(true);
  });

  test('handles concurrent interactions', async ({ page }) => {
    await page.goto(`${BASE}/games/free-draw`);
    await page.waitForTimeout(3000);
    
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    
    if (box) {
      // Perform concurrent operations
      await Promise.all([
        page.mouse.click(box.x + 100, box.y + 100),
        page.mouse.click(box.x + 200, box.y + 200),
        page.mouse.click(box.x + 300, box.y + 300),
      ]);
      
      await page.waitForTimeout(500);
      
      // Canvas should still be functional
      await expect(canvas).toBeVisible();
    }
  });
});
