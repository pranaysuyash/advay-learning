const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:6173';
const OUTPUT_DIR = path.join(__dirname, '..', 'audit-screenshots');

// Viewport configurations
const viewports = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 834, height: 1112 },
  mobile: { width: 390, height: 844 }
};

// Routes to capture
const routes = [
  { path: '/', name: 'home', description: 'Landing page with hero and features', public: true },
  { path: '/login', name: 'login', description: 'Login form page', public: true },
  { path: '/register', name: 'register', description: 'Registration form page', public: true },
  { path: '/dashboard', name: 'dashboard', description: 'Parent dashboard with child profiles', public: false },
  { path: '/games', name: 'games', description: 'Games selection page', public: false },
  { path: '/game', name: 'alphabet-game', description: 'Alphabet tracing game', public: false },
  { path: '/games/finger-number-show', name: 'finger-numbers', description: 'Finger counting game', public: false },
  { path: '/games/connect-the-dots', name: 'connect-dots', description: 'Connect the dots game', public: false },
  { path: '/games/letter-hunt', name: 'letter-hunt', description: 'Letter hunt game', public: false },
  { path: '/progress', name: 'progress', description: 'Learning progress page', public: false },
  { path: '/settings', name: 'settings', description: 'App settings page', public: false },
  { path: '/style-test', name: 'style-test', description: 'Component style test page', public: true }
];

// Screenshot metadata for the audit report
const screenshotIndex = [];

async function captureScreenshots() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Starting comprehensive UI/UX audit screenshot capture...');
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log('');

  const browser = await chromium.launch({ headless: true });
  
  for (const [device, viewport] of Object.entries(viewports)) {
    console.log(`\n=== ${device.toUpperCase()} VIEWPORT (${viewport.width}x${viewport.height}) ===\n`);
    
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: device === 'mobile' ? 2 : 1
    });
    
    const page = await context.newPage();
    
    for (const route of routes) {
      try {
        // Skip protected routes for now (would need auth)
        if (!route.public) {
          console.log(`Skipping (requires auth): ${route.name} (${route.path})`);
          continue;
        }
        
        console.log(`Capturing: ${route.name} (${route.path})`);
        
        // Navigate to page
        await page.goto(`${BASE_URL}${route.path}`, {
          waitUntil: 'networkidle',
          timeout: 30000
        });
        
        // Wait for animations to settle
        await page.waitForTimeout(1000);
        
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
          requiresAuth: !route.public
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
          requiresAuth: !route.public
        });
        
        console.log(`  ✓ Captured: ${fullPageFile}, ${viewportFile}`);
        
        // Capture specific states for certain pages
        if (route.path === '/login') {
          try {
            // Capture error state
            await page.fill('#login-email-input', 'invalid@email.com');
            await page.fill('#login-password-input', 'wrongpass');
            await page.click('button[type="submit"]');
            await page.waitForTimeout(500);
            
            const errorFile = `${device}_${route.name}_error.png`;
            await page.screenshot({
              path: path.join(OUTPUT_DIR, errorFile),
              fullPage: true
            });
            
            screenshotIndex.push({
              filename: errorFile,
              route: route.path,
              device,
              type: 'error-state',
              description: 'Login form with error state',
              viewport: `${viewport.width}x${viewport.height}`,
              requiresAuth: false
            });
            
            console.log(`  ✓ Captured error state: ${errorFile}`);
          } catch (e) {
            console.log(`  ! Could not capture error state: ${e.message}`);
          }
        }
        
      } catch (error) {
        console.error(`  ✗ Failed to capture ${route.name}:`, error.message);
        screenshotIndex.push({
          filename: 'FAILED',
          route: route.path,
          device,
          type: 'error',
          description: `Failed to capture: ${error.message}`,
          viewport: `${viewport.width}x${viewport.height}`,
          requiresAuth: !route.public
        });
      }
    }
    
    await context.close();
  }
  
  await browser.close();
  
  // Write screenshot index
  const indexPath = path.join(OUTPUT_DIR, 'screenshot-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(screenshotIndex, null, 2));
  
  console.log('\n=== CAPTURE COMPLETE ===');
  console.log(`Total screenshots: ${screenshotIndex.length}`);
  console.log(`Index saved to: ${indexPath}`);
  
  return screenshotIndex;
}

captureScreenshots().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
