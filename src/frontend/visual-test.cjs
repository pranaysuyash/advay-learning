const { chromium } = require('playwright');

async function visualTest() {
  console.log('=== STARTING VISUAL GAME TEST ===\n');
  
  // Launch visible browser
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  const context = await browser.newContext({ 
    viewport: { width: 1920, height: 1080 } 
  });
  const page = await context.newPage();
  
  const outDir = '/Users/pranay/Projects/learning_for_kids/docs/screenshots/games-visual-test';
  const fs = require('fs');
  fs.mkdirSync(outDir, { recursive: true });
  
  const gameNames = [
    'Draw Letters',
    'Finger Counting', 
    'Connect The Dots',
    'Letter Hunt',
    'Music Pinch Beat',
    'Steady Hand Lab',
    'Shape Pop',
    'Color Match Garden',
    'Number Tap Trail',
    'Shape Sequence',
    'Yoga Animals',
    'Freeze Dance',
    'Simon Says',
    'Chemistry Lab'
  ];
  
  // Step 1: Login
  console.log('1. Logging in...');
  await page.goto('http://localhost:6173/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'testuser1771519713@example.com');
  await page.fill('input[type="password"]', 'TestPass123!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('   Logged in');
  
  console.log('\n2. Testing games (clicking Play buttons)...\n');
  
  for (let i = 0; i < gameNames.length; i++) {
    try {
      // Go to games page
      await page.goto('http://localhost:6173/games');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Click the nth Play Game button
      const button = page.locator('button:has-text("Play Game")').nth(i);
      await button.click();
      await page.waitForTimeout(4000);
      
      // Take screenshot
      const filename = String(i + 1).padStart(2, '0') + '-' + gameNames[i].toLowerCase().replace(/\s+/g, '-') + '.png';
      await page.screenshot({ path: outDir + '/' + filename, fullPage: true });
      console.log('   ✅ ' + gameNames[i]);
      
    } catch (e) {
      console.log('   ❌ ' + gameNames[i] + ': ' + e.message.substring(0, 40));
    }
  }
  
  console.log('\n=== DONE ===');
  console.log('Screenshots saved to: ' + outDir);
  
  await page.waitForTimeout(3000);
  await browser.close();
}

visualTest().catch(console.error);
