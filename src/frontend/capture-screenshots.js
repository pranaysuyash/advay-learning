import { chromium, devices } from 'playwright';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:6173';

const routes = [
  { name: 'home', path: '/', description: 'Landing page' },
  { name: 'login', path: '/login', description: 'Login page' },
  { name: 'register', path: '/register', description: 'Registration page' },
  { name: 'dashboard', path: '/dashboard', description: 'Main dashboard (auth required)' },
  { name: 'games', path: '/games', description: 'Games selection page' },
  { name: 'alphabet-game', path: '/game', description: 'Alphabet learning game' },
  { name: 'finger-number-show', path: '/games/finger-number-show', description: 'Finger number show game' },
  { name: 'connect-the-dots', path: '/games/connect-the-dots', description: 'Connect the dots game' },
  { name: 'letter-hunt', path: '/games/letter-hunt', description: 'Letter hunt game' },
  { name: 'progress', path: '/progress', description: 'Progress tracking page' },
  { name: 'settings', path: '/settings', description: 'Settings page' },
  { name: 'style-test', path: '/style-test', description: 'Style test page' },
];

const viewports = {
  desktop: { width: 1440, height: 900, name: 'desktop' },
  tablet: { width: 834, height: 1112, name: 'tablet' },
  mobile: { width: 390, height: 844, name: 'mobile' },
};

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const screenshotIndex = [];

  for (const [viewportName, viewport] of Object.entries(viewports)) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    });
    const page = await context.newPage();

    console.log(`\n=== Capturing ${viewportName} (${viewport.width}x${viewport.height}) ===`);

    for (const route of routes) {
      try {
        const url = `${BASE_URL}${route.path}`;
        console.log(`  Capturing: ${route.name} (${route.path})`);

        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1000);

        const filename = `${viewportName}/${route.name}-full.png`;
        const filepath = path.join('screenshots', filename);
        await page.screenshot({ path: filepath, fullPage: true });

        screenshotIndex.push({
          filename,
          route: route.path,
          page: route.name,
          description: route.description,
          viewport: viewportName,
          dimensions: `${viewport.width}x${viewport.height}`,
        });

        const aboveFoldName = `${viewportName}/${route.name}-above-fold.png`;
        const aboveFoldPath = path.join('screenshots', aboveFoldName);
        await page.screenshot({ path: aboveFoldPath, fullPage: false });
      } catch (error) {
        console.log(`    Error capturing ${route.name}: ${error.message}`);
        screenshotIndex.push({
          filename: null,
          route: route.path,
          page: route.name,
          description: route.description,
          viewport: viewportName,
          error: error.message,
        });
      }
    }

    await context.close();
  }

  await browser.close();

  const indexPath = path.join('screenshots', 'screenshot-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(screenshotIndex, null, 2));
  console.log('\nScreenshot index saved to screenshots/screenshot-index.json');

  console.log('\n=== SCREENSHOT INDEX ===');
  screenshotIndex.forEach((item) => {
    console.log(`${item.filename || 'ERROR'}: ${item.page} (${item.route}) - ${item.description}`);
  });
}

captureScreenshots().catch(console.error);
