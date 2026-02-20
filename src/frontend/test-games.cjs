const { chromium } = require('playwright');

async function detailedAnalysis() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const apiErrors = [];
  const apiCalls = [];
  
  // Capture API calls
  page.on('response', response => {
    const url = response.url();
    if (url.includes('/api/')) {
      const status = response.status();
      if (status >= 400) {
        apiErrors.push({ url, status, statusText: response.statusText() });
      }
      apiCalls.push({ url, status });
    }
  });
  
  console.log('=== TESTING GAMES IN BROWSER ===\n');
  
  const gameTests = [
    { name: 'Alphabet Tracing', url: '/games/alphabet-tracing' },
    { name: 'Finger Number', url: '/games/finger-number-show' },
    { name: 'Shape Pop', url: '/games/shape-pop' },
    { name: 'Connect Dots', url: '/games/connect-the-dots' },
    { name: 'Letter Hunt', url: '/games/letter-hunt' },
    { name: 'Color Match', url: '/games/color-match-garden' },
    { name: 'Number Tap', url: '/games/number-tap-trail' },
    { name: 'Shape Sequence', url: '/games/shape-sequence' },
    { name: 'Music Pinch', url: '/games/music-pinch-beat' },
    { name: 'Steady Hand', url: '/games/steady-hand-lab' },
    { name: 'Yoga Animals', url: '/games/yoga-animals' },
    { name: 'Freeze Dance', url: '/games/freeze-dance' },
    { name: 'Simon Says', url: '/games/simon-says' },
    { name: 'Chemistry Lab', url: '/games/chemistry-lab' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const game of gameTests) {
    try {
      await page.goto('http://localhost:6173' + game.url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      
      // Wait a bit for any JS to execute
      await page.waitForTimeout(2000);
      
      // Check for critical elements
      const title = await page.title();
      const hasContent = await page.locator('body').textContent();
      
      if (hasContent && hasContent.length > 10) {
        console.log(`✅ ${game.name}: Loads OK`);
        passed++;
      } else {
        console.log(`⚠️  ${game.name}: Empty or minimal content`);
        failed++;
      }
    } catch (e) {
      console.log(`❌ ${game.name}: ${e.message.substring(0, 40)}`);
      failed++;
    }
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Passed: ${passed}/${gameTests.length}`);
  console.log(`Failed: ${failed}/${gameTests.length}`);
  
  console.log(`\n=== API ERRORS ===`);
  const uniqueErrors = [...new Set(apiErrors.map(e => `${e.status} - ${e.url.split('/api/')[1]}`))];
  uniqueErrors.forEach(e => console.log(e));
  
  await browser.close();
}

detailedAnalysis();
