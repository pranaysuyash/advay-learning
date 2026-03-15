const { chromium } = require('playwright');

async function debugMirrorMaze() {
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  // Capture console messages
  const consoleLogs = [];
  const errors = [];

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleLogs.push(`[${type}] ${text}`);
    console.log(`Browser Console [${type}]:`, text);
  });

  page.on('pageerror', error => {
    errors.push(error.message);
    console.error('Browser Error:', error.message);
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      console.error(`HTTP Error ${response.status()}: ${response.url()}`);
    }
  });

  try {
    console.log('Navigating to localhost:6173...');
    await page.goto('http://localhost:6173/', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page loaded successfully');

    // Take initial screenshot
    await page.screenshot({ path: 'debug-01-home.png' });
    console.log('Screenshot saved: debug-01-home.png');

    // Try to navigate directly to the mirror-maze game
    console.log('Navigating to mirror-maze game...');
    await page.goto('http://localhost:6173/games/mirror-maze', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('MirrorMaze page loaded');

    // Wait a bit for any React lazy loading
    await page.waitForTimeout(3000);

    // Take screenshot of the game page
    await page.screenshot({ path: 'debug-02-mirrormaze.png', fullPage: true });
    console.log('Screenshot saved: debug-02-mirrormaze.png');

    // Check if the game container is visible
    const gameVisible = await page.isVisible('text=/Mirror Maze/i').catch(() => false);
    console.log('Mirror Maze text visible:', gameVisible);

    // Get the DOM structure for debugging
    const domStructure = await page.evaluate(() => {
      const gameContainer = document.querySelector('[class*="GameContainer"], [class*="game-container"]');
      if (gameContainer) {
        return {
          found: true,
          className: gameContainer.className,
        };
      }
      return { found: false };
    });
    console.log('Game container:', JSON.stringify(domStructure, null, 2));

    // Get page title
    const title = await page.title();
    console.log('Page title:', title);

    // Get body text
    const bodyText = await page.evaluate(() => {
      return document.body.innerText.substring(0, 1000);
    });
    console.log('Body text preview:', bodyText.substring(0, 200));

    // Wait for any potential face tracking initialization
    await page.waitForTimeout(3000);

    // Final screenshot
    await page.screenshot({ path: 'debug-03-final.png' });
    console.log('Screenshot saved: debug-03-final.png');

  } catch (error) {
    console.error('Navigation error:', error.message);
    await page.screenshot({ path: 'debug-error.png' });
  } finally {
    await browser.close();
  }

  // Summary
  console.log('\n=== DEBUG SUMMARY ===');
  console.log(`Total console logs: ${consoleLogs.length}`);
  console.log(`Total errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nErrors found:');
    errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
  }

  if (consoleLogs.length > 0) {
    console.log('\nConsole logs (last 20):');
    consoleLogs.slice(-20).forEach(log => console.log(`  ${log}`));
  }

  return { consoleLogs, errors };
}

debugMirrorMaze()
  .then(result => {
    console.log('\nDebug complete. Screenshots saved.');
    process.exit(result.errors.length > 0 ? 1 : 0);
  })
  .catch(err => {
    console.error('Debug failed:', err);
    process.exit(1);
  });
