const { chromium } = require('playwright');

async function captureAllGames() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']
  });
  const context = await browser.newContext({ 
    viewport: { width: 1920, height: 1080 } 
  });
  const page = await context.newPage();
  
  const games = [
    { name: '01-alphabet-tracing', url: '/games/alphabet-tracing' },
    { name: '02-finger-number-show', url: '/games/finger-number-show' },
    { name: '03-connect-the-dots', url: '/games/connect-the-dots' },
    { name: '04-letter-hunt', url: '/games/letter-hunt' },
    { name: '05-music-pinch-beat', url: '/games/music-pinch-beat' },
    { name: '06-steady-hand-lab', url: '/games/steady-hand-lab' },
    { name: '07-shape-pop', url: '/games/shape-pop' },
    { name: '08-color-match-garden', url: '/games/color-match-garden' },
    { name: '09-number-tap-trail', url: '/games/number-tap-trail' },
    { name: '10-shape-sequence', url: '/games/shape-sequence' },
    { name: '11-yoga-animals', url: '/games/yoga-animals' },
    { name: '12-freeze-dance', url: '/games/freeze-dance' },
    { name: '13-simon-says', url: '/games/simon-says' },
    { name: '14-chemistry-lab', url: '/games/chemistry-lab' },
  ];
  
  console.log('=== CAPTURING GAME SCREENSHOTS ===\n');
  
  for (const game of games) {
    try {
      // Go to the page
      await page.goto('http://localhost:6173' + game.url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 15000 
      });
      
      // Wait for the page to fully load
      await page.waitForTimeout(3000);
      
      // Try to dismiss any modal or overlay that might block view
      try {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      } catch (e) {}
      
      // Take screenshot
      await page.screenshot({ 
        path: `./docs/screenshots/games/${game.name}.png`,
        fullPage: true 
      });
      
      console.log(`✅ ${game.name}`);
    } catch (e) {
      console.log(`❌ ${game.name}: ${e.message.substring(0, 50)}`);
    }
  }
  
  await browser.close();
  console.log('\nDone! Check docs/screenshots/games/');
}

captureAllGames();
