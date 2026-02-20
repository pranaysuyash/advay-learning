const { chromium } = require('playwright');

async function testGame(index, name) {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const page = await browser.newPage();
  
  try {
    // Login
    await page.goto('http://localhost:6173/login', { timeout: 10000 });
    await page.fill('input[type="email"]', 'testuser1771519713@example.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Go to games and click
    await page.goto('http://localhost:6173/games', { timeout: 10000 });
    await page.waitForTimeout(1500);
    
    // Click the index-th Play button
    await page.locator('button:has-text("Play Game")').nth(index).click();
    await page.waitForTimeout(4000);
    
    // Screenshot
    const filename = String(index + 1).padStart(2, '0') + '-' + name.toLowerCase().replace(/\s+/g, '-') + '.png';
    await page.screenshot({ path: '/Users/pranay/Projects/learning_for_kids/docs/screenshots/games-visual-test/' + filename });
    console.log('✅ ' + name);
    
  } catch (e) {
    console.log('❌ ' + name + ': ' + e.message.substring(0, 30));
  }
  
  await browser.close();
}

const games = [
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

(async () => {
  console.log('Testing ' + games.length + ' games...\n');
  for (let i = 0; i < games.length; i++) {
    await testGame(i, games[i]);
  }
  console.log('\nDone!');
})();
