/**
 * Smoke Tests for New Games
 * 
 * Tests basic loading and rendering of:
 * - Story Sequence
 * - Shape Safari
 * - Rhyme Time
 * - Free Draw
 * - Math Monsters
 */

import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:6173';

const NEW_GAMES = [
  { path: '/games/story-sequence', name: 'Story Sequence', expectedText: ['story', 'sequence', 'drag'] },
  { path: '/games/shape-safari', name: 'Shape Safari', expectedText: ['shape', 'safari', 'find'] },
  { path: '/games/rhyme-time', name: 'Rhyme Time', expectedText: ['rhyme', 'word', 'match'] },
  { path: '/games/free-draw', name: 'Free Draw', expectedText: ['draw', 'paint', 'brush'] },
  { path: '/games/math-monsters', name: 'Math Monsters', expectedText: ['math', 'monster', 'finger'] },
];

test.describe('New Games Smoke Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as guest for each test
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    
    // Click guest login
    await page.click('button:has-text("Try without account")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  });

  for (const game of NEW_GAMES) {
    test(`${game.name} loads successfully`, async ({ page }) => {
      // Navigate to game
      await page.goto(`${BASE}${game.path}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000); // Wait for game initialization
      
      // Verify URL
      expect(page.url()).toContain(game.path);
      
      // Verify game title or content appears
      const bodyText = await page.textContent('body');
      const lowerText = bodyText?.toLowerCase() || '';
      
      // Check for at least one expected keyword
      const hasExpectedText = game.expectedText.some(text => 
        lowerText.includes(text.toLowerCase())
      );
      
      expect(hasExpectedText, 
        `Expected one of ${game.expectedText} in page content`
      ).toBe(true);
      
      // Verify no error messages
      expect(lowerText).not.toContain('error');
      expect(lowerText).not.toContain('404');
      expect(lowerText).not.toContain('not found');
    });
    
    test(`${game.name} has game container`, async ({ page }) => {
      await page.goto(`${BASE}${game.path}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      // Check for common game elements
      const gameContainer = await page.locator('[class*="game"]').first();
      expect(await gameContainer.isVisible().catch(() => false)).toBe(true);
    });
    
    test(`${game.name} can navigate back to games list`, async ({ page }) => {
      await page.goto(`${BASE}${game.path}`);
      await page.waitForLoadState('domcontentloaded');
      
      // Look for home/back button
      const backButton = await page.locator('button:has-text("Back"), button:has-text("Home"), [class*="back"]').first();
      
      if (await backButton.isVisible().catch(() => false)) {
        await backButton.click();
        await page.waitForTimeout(1000);
        
        // Should be on games list or dashboard
        const url = page.url();
        expect(url.includes('/games') || url.includes('/dashboard')).toBe(true);
      }
    });
  }
  
  test('all new games appear in games registry', async ({ page }) => {
    await page.goto(`${BASE}/games`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const bodyText = await page.textContent('body');
    const lowerText = bodyText?.toLowerCase() || '';
    
    // Check all new games are listed
    expect(lowerText).toContain('story sequence');
    expect(lowerText).toContain('shape safari');
    expect(lowerText).toContain('rhyme time');
    expect(lowerText).toContain('free draw');
    expect(lowerText).toContain('math monsters');
  });
  
  test('games have proper metadata', async ({ page }) => {
    // Test a few specific games have age ratings and descriptions
    await page.goto(`${BASE}/games`);
    await page.waitForLoadState('networkidle');
    
    const bodyText = await page.textContent('body');
    
    // Check for age ranges (common pattern like "2-6" or "5-8")
    expect(bodyText).toMatch(/\d+-\d+/);
    
    // Check for game categories/worlds
    const lowerText = bodyText?.toLowerCase() || '';
    expect(lowerText).toContain('world');
  });
});

test.describe('New Games Visual Smoke Tests', () => {
  
  test('capture screenshots of all new games', async ({ page }) => {
    const outDir = 'docs/screenshots/new_games_smoke';
    
    // Login
    await page.goto(`${BASE}/login`);
    await page.click('button:has-text("Try without account")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    
    for (const game of NEW_GAMES) {
      try {
        await page.goto(`${BASE}${game.path}`, { timeout: 15000 });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(4000);
        
        const safeName = game.name.toLowerCase().replace(/\s+/g, '_');
        await page.screenshot({ 
          path: `${outDir}/${safeName}_smoke.png`, 
          fullPage: true 
        });
        
        console.log(`✓ Captured ${game.name}`);
      } catch (error) {
        console.log(`✗ Failed to capture ${game.name}: ${error}`);
      }
    }
  });
});
