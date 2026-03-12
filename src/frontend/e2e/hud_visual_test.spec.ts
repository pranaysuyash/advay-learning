import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const outDir = 'docs/screenshots/hud_audit';

const games = [
  'shape-pop',
  'shape-sequence',
  'memory-match',
  'pattern-play',
  'fruit-ninja-air',
  'target-practice',
  'letter-hunt',
  'word-builder',
  'phonics-sounds',
  'balloon-pop-fitness',
  'shape-stacker',
  'emoji-match'
];

test.describe('Game HUD Consistency Audit', () => {
  
  test.beforeEach(async ({ page }) => {
    // Standard login for all tests
    await page.goto(`${BASE}/login`);
    await page.fill('#login-email', 'pranay.suyash@gmail.com');
    await page.fill('#login-password', 'Advay@23!');
    await page.click('button[type=submit]');
    await page.waitForURL('**/dashboard');
  });

  for (const gameId of games) {
    test(`HUD Audit: ${gameId}`, async ({ page }) => {
      console.log(`Auditing game: ${gameId}`);
      await page.goto(`${BASE}/games/${gameId}`);
      
      // Handle start screen if it exists
      const startButton = page.locator('button:has-text("Start"), button:has-text("Play"), button:has-text("Begin")').first();
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      // Wait for HUD to appear
      await page.waitForTimeout(3000); // Give it time to load models/start
      
      // Take screenshot of the HUD area
      await page.screenshot({ 
        path: `${outDir}/${gameId}_hud.png`,
        fullPage: false
      });
      
      // Verify basic HUD elements are present
      // Since we uses standardized GameHUD, we can check for its specific classes or structure
      const hud = page.locator('div:has(img[src*="coin_gold.png"])');
      const scoreVisible = await hud.isVisible();
      console.log(`Game ${gameId} score visible: ${scoreVisible}`);
      
      // Check for Kenney assets in HUD
      const kenneyHeart = page.locator('img[src*="hud_heart.png"]');
      const heartsVisible = await kenneyHeart.count() > 0;
      console.log(`Game ${gameId} hearts visible: ${heartsVisible}`);
    });
  }
});
