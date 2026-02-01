const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:6173';
const OUTPUT_DIR = path.join(__dirname, '..', '..', '..', 'audit-screenshots');

// Test credentials
const TEST_EMAIL = 'pranay.suyash@gmail.com';
const TEST_PASSWORD = 'pranaysuyash';

// Viewport configurations
const viewports = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 834, height: 1112 },
  mobile: { width: 390, height: 844 }
};

// Routes to capture (now including protected ones)
const routes = [
  { path: '/dashboard', name: 'dashboard', description: 'Parent dashboard with child profiles' },
  { path: '/games', name: 'games', description: 'Games selection page' },
  { path: '/game', name: 'alphabet-game', description: 'Alphabet tracing game - pre-start state' },
  { path: '/progress', name: 'progress', description: 'Learning progress page' },
  { path: '/settings', name: 'settings', description: 'App settings page' }
];

// Screenshot metadata
const screenshotIndex = [];

async function captureAuthenticatedScreenshots() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Starting authenticated screenshot capture...');
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Test user: ${TEST_EMAIL}`);
  console.log('');

  const browser = await chromium.launch({ headless: true });
  
  for (const [device, viewport] of Object.entries(viewports)) {
    console.log(`\n=== ${device.toUpperCase()} VIEWPORT (${viewport.width}x${viewport.height}) ===\n`);
    
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: device === 'mobile' ? 2 : 1
    });
    
    const page = await context.newPage();
    
    // Login first
    console.log('Authenticating...');
    await page.goto(`${BASE_URL}/login`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.fill('#login-email-input', TEST_EMAIL);
    await page.fill('#login-password-input', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL(/dashboard|games|progress/, { timeout: 10000 }).catch(() => {
      console.log('  ! Navigation timeout - may already be logged in or on different page');
    });
    
    console.log('  ✓ Authenticated');
    
    for (const route of routes) {
      try {
        console.log(`Capturing: ${route.name} (${route.path})`);
        
        // Navigate to page
        await page.goto(`${BASE_URL}${route.path}`, {
          waitUntil: 'networkidle',
          timeout: 30000
        });
        
        // Wait for animations and data loading
        await page.waitForTimeout(2000);
        
        // Capture full page
        const fullPageFile = `${device}_${route.name}_full.png`;
        await page.screenshot({
          path: path.join(OUTPUT_DIR, fullPageFile),
          fullPage: true
        });
        
        screenshotIndex.push({
          filename: fullPageFile,
          route: route.path,
          device,
          type: 'full-page',
          description: route.description,
          viewport: `${viewport.width}x${viewport.height}`,
          requiresAuth: true
        });
        
        // Capture viewport (above the fold)
        const viewportFile = `${device}_${route.name}_viewport.png`;
        await page.screenshot({
          path: path.join(OUTPUT_DIR, viewportFile),
          fullPage: false
        });
        
        screenshotIndex.push({
          filename: viewportFile,
          route: route.path,
          device,
          type: 'viewport',
          description: `${route.description} - Above the fold`,
          viewport: `${viewport.width}x${viewport.height}`,
          requiresAuth: true
        });
        
        console.log(`  ✓ Captured: ${fullPageFile}, ${viewportFile}`);
        
      } catch (error) {
        console.error(`  ✗ Failed to capture ${route.name}:`, error.message);
        screenshotIndex.push({
          filename: 'FAILED',
          route: route.path,
          device,
          type: 'error',
          description: `Failed to capture: ${error.message}`,
          viewport: `${viewport.width}x${viewport.height}`,
          requiresAuth: true
        });
      }
    }
    
    await context.close();
  }
  
  await browser.close();
  
  // Write screenshot index
  const indexPath = path.join(OUTPUT_DIR, 'authenticated-screenshot-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(screenshotIndex, null, 2));
  
  console.log('\n=== CAPTURE COMPLETE ===');
  console.log(`Total screenshots: ${screenshotIndex.length}`);
  console.log(`Index saved to: ${indexPath}`);
  
  return screenshotIndex;
}

captureAuthenticatedScreenshots().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
