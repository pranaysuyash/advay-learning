const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function loginAndCapture() {
  console.log('=== STARTING AUTHENTICATED GAME CAPTURE ===\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']
  });
  
  const context = await browser.newContext({ 
    viewport: { width: 1920, height: 1080 } 
  });
  const page = await context.newPage();
  
  const outDir = '/Users/pranay/Projects/learning_for_kids/docs/screenshots/games-auth';
  fs.mkdirSync(outDir, { recursive: true });
  
  // Step 1: Login
  console.log('1. Logging in...');
  await page.goto('http://localhost:6173/login', { waitUntil: 'networkidle' });
  
  // Fill login form
  await page.fill('input[type="email"], input[name="email"], input[id="email"]', 'testuser1771519713@example.com');
  await page.fill('input[type="password"], input[name="password"], input[id="password"]', 'TestPass123!');
  
  // Click login button
  await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
  
  // Wait for navigation
  await page.waitForTimeout(3000);
  
  const currentUrl = page.url();
  console.log('   Current URL after login:', currentUrl);
  
  // Step 2: Navigate to games
  console.log('\n2. Navigating to games page...');
  await page.goto('http://localhost:6173/games', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Capture games page
  await page.screenshot({ path: outDir + '/00-games-gallery.png', fullPage: true });
  console.log('   Captured: games gallery');
  
  // Step 3: Test each game
  const games = [
    { name: '01-Alphabet-Tracing', slug: 'alphabet-tracing' },
    { name: '02-Finger-Number-Show', slug: 'finger-number-show' },
    { name: '03-Connect-The-Dots', slug: 'connect-the-dots' },
    { name: '04-Letter-Hunt', slug: 'letter-hunt' },
    { name: '05-Music-Pinch-Beat', slug: 'music-pinch-beat' },
    { name: '06-Steady-Hand-Lab', slug: 'steady-hand-lab' },
    { name: '07-Shape-Pop', slug: 'shape-pop' },
    { name: '08-Color-Match-Garden', slug: 'color-match-garden' },
    { name: '09-Number-Tap-Trail', slug: 'number-tap-trail' },
    { name: '10-Shape-Sequence', slug: 'shape-sequence' },
    { name: '11-Yoga-Animals', slug: 'yoga-animals' },
    { name: '12-Freeze-Dance', slug: 'freeze-dance' },
    { name: '13-Simon-Says', slug: 'simon-says' },
    { name: '14-Chemistry-Lab', slug: 'chemistry-lab' },
  ];
  
  console.log('\n3. Capturing games...\n');
  
  for (const game of games) {
    try {
      await page.goto('http://localhost:6173/games/' + game.slug, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(3000);
      
      // Try to dismiss any modal/overlay
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      await page.screenshot({ path: outDir + '/' + game.name + '.png', fullPage: true });
      console.log('   ✅ ' + game.name);
      
    } catch (e) {
      console.log('   ❌ ' + game.name + ': ' + e.message.substring(0, 40));
    }
  }
  
  // Step 4: Check for console errors
  console.log('\n4. Checking for errors...');
  
  await browser.close();
  console.log('\n=== DONE ===');
  console.log('Screenshots saved to: ' + outDir);
}

loginAndCapture().catch(console.error);
