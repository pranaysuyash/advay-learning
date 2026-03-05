/**
 * Visual Testing Script for Improved Games
 * Captures screenshots of game states for verification
 */

const { chromium } = require('playwright');
const path = require('path');

const BASE_URL = 'http://localhost:6173';
const OUTPUT_DIR = path.join(__dirname, '..', 'test-screenshots');

// Games to test (sample of 5 representative ones)
const GAMES = [
  { name: 'Emoji Match', path: '/games/emoji-match', id: 'emoji-match' },
  { name: 'Memory Match', path: '/games/memory-match', id: 'memory-match' },
  { name: 'Letter Hunt', path: '/games/letter-hunt', id: 'letter-hunt' },
  { name: 'Pattern Play', path: '/games/pattern-play', id: 'pattern-play' },
  { name: 'Shape Safari', path: '/games/shape-safari', id: 'shape-safari' },
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureGame(page, game) {
  console.log(`\n📸 Testing ${game.name}...`);
  
  try {
    // Navigate to game
    await page.goto(`${BASE_URL}${game.path}`, { waitUntil: 'networkidle' });
    await delay(2000);
    
    // Screenshot 1: Initial state
    await page.screenshot({ 
      path: path.join(OUTPUT_DIR, `${game.id}-01-initial.png`),
      fullPage: false 
    });
    console.log(`  ✅ Initial state captured`);
    
    // Screenshot 2: Start game (if start button exists)
    const startButton = await page.locator('button:has-text("Start"), button:has-text("Play"), button:has-text("Begin")').first();
    if (await startButton.isVisible().catch(() => false)) {
      await startButton.click();
      await delay(1500);
      await page.screenshot({ 
        path: path.join(OUTPUT_DIR, `${game.id}-02-playing.png`),
        fullPage: false 
      });
      console.log(`  ✅ Playing state captured`);
    }
    
    // Screenshot 3: Look for HUD elements
    const heartImages = await page.locator('img[src*="hud_heart"]').count();
    if (heartImages > 0) {
      console.log(`  ✅ Found ${heartImages} heart HUD elements`);
    }
    
    return { success: true, game: game.name, hearts: heartImages };
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return { success: false, game: game.name, error: error.message };
  }
}

async function runVisualTests() {
  console.log('🎮 Starting Visual Tests');
  console.log('=' .repeat(50));
  
  // Ensure output directory exists
  const fs = require('fs');
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  const results = [];
  
  for (const game of GAMES) {
    const result = await captureGame(page, game);
    results.push(result);
  }
  
  await browser.close();
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  for (const result of results) {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.game}`);
    if (result.hearts !== undefined) {
      console.log(`   Hearts found: ${result.hearts}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    if (result.success) passed++;
    else failed++;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`Total: ${passed} passed, ${failed} failed`);
  console.log(`Screenshots saved to: ${OUTPUT_DIR}`);
  console.log('='.repeat(50));
  
  process.exit(failed > 0 ? 1 : 0);
}

runVisualTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
