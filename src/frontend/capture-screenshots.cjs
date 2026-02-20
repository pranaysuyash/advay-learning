const { chromium } = require('playwright');

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  
  const baseUrl = 'http://localhost:6173';
  const pages = [
    { name: 'home', url: '/' },
    { name: 'games', url: '/games' },
    { name: 'login', url: '/login' },
    { name: 'register', url: '/register' },
  ];
  
  for (const p of pages) {
    try {
      await page.goto(baseUrl + p.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.screenshot({ path: `./docs/screenshots/${p.name}.png`, fullPage: true });
      console.log(`Captured: ${p.name}`);
    } catch (e) {
      console.error(`Failed: ${p.name} - ${e.message}`);
    }
  }
  
  await browser.close();
}

captureScreenshots();
