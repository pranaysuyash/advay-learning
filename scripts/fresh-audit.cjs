const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:6173';
const TODAY = new Date().toISOString().split('T')[0];
const SCREENSHOT_DIR = path.join('/Users/pranay/Projects/learning_for_kids', 'audit-screenshots', `post-fix-audit-${TODAY}`);

const PAGES = [
  { name: '01-home', path: '/' },
  { name: '02-login', path: '/login' },
  { name: '03-register', path: '/register' },
  { name: '04-dashboard', path: '/dashboard', auth: true },
  { name: '05-games', path: '/games', auth: true },
  { name: '06-alphabet-game', path: '/games/alphabet-tracing', auth: true },
  { name: '07-progress', path: '/progress', auth: true },
  { name: '08-settings', path: '/settings', auth: true },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'mobile', width: 390, height: 844 },
];

const CREDENTIALS = {
  email: 'pranay.suyash@gmail.com',
  password: 'pranaysuyash'
};

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function capture() {
  await ensureDir(SCREENSHOT_DIR);
  console.log(`Saving screenshots to: ${SCREENSHOT_DIR}`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  // Login first
  console.log('Logging in...');
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', CREDENTIALS.email);
  await page.fill('input[type="password"]', CREDENTIALS.password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('Logged in');
  
  for (const viewport of VIEWPORTS) {
    console.log(`\nViewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    
    for (const p of PAGES) {
      const screenshotPath = path.join(SCREENSHOT_DIR, `${viewport.name}_${p.name}.png`);
      console.log(`  Capturing: ${p.name} -> ${screenshotPath}`);
      
      try {
        await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: screenshotPath, fullPage: false });
      } catch (e) {
        console.log(`    ERROR: ${e.message}`);
      }
    }
  }
  
  await browser.close();
  console.log(`\n✅ Done! Screenshots saved to: ${SCREENSHOT_DIR}`);
}

capture().catch(e => {
  console.error('Failed:', e);
  process.exit(1);
});
