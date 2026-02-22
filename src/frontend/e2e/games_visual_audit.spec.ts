import { test } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:6173';
const outDir = 'docs/screenshots/games_visual_audit';

test.describe('Game Visual Audit - Debug', () => {
  
  test('debug: check what happens after guest login', async ({ page }) => {
    console.log('\n=== Starting guest login debug ===');
    
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    console.log('1. On login page');
    
    // Take screenshot of login page
    await page.screenshot({ path: `${outDir}/debug_01_login.png`, fullPage: true });
    
    // Click guest login
    await page.click('button:has-text("Try without account")');
    console.log('2. Clicked guest login button');
    
    // Wait a bit and check URL
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    console.log(`3. Current URL: ${currentUrl}`);
    
    // Take screenshot after guest login
    await page.screenshot({ path: `${outDir}/debug_02_after_guest_login.png`, fullPage: true });
    
    // Check if we're on dashboard
    if (currentUrl.includes('dashboard')) {
      console.log('4. Successfully on dashboard');
      
      // Look for game elements
      const bodyText = await page.textContent('body');
      console.log(`5. Page content (first 500 chars): ${bodyText?.substring(0, 500)}`);
      
      // Take final screenshot
      await page.screenshot({ path: `${outDir}/debug_03_dashboard.png`, fullPage: true });
    } else {
      console.log('4. NOT on dashboard, still on:', currentUrl);
    }
  });

  test('debug: directly navigate to games', async ({ page }) => {
    console.log('\n=== Testing direct game navigation ===');
    
    const games = [
      { path: '/games/finger-number-show', name: 'finger_counting' },
      { path: '/games/connect-the-dots', name: 'connect_dots' },
      { path: '/games/letter-hunt', name: 'letter_hunt' },
    ];
    
    for (const game of games) {
      console.log(`\n--- Testing ${game.name} ---`);
      
      try {
        await page.goto(`${BASE}${game.path}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(3000);
        
        const url = page.url();
        console.log(`URL: ${url}`);
        
        const title = await page.title();
        console.log(`Title: ${title}`);
        
        // Get visible text
        const bodyText = await page.textContent('body');
        const preview = bodyText?.substring(0, 300).replace(/\s+/g, ' ');
        console.log(`Content: ${preview}...`);
        
        // Take screenshot
        await page.screenshot({ path: `${outDir}/game_${game.name}.png`, fullPage: true });
        console.log(`Screenshot saved: game_${game.name}.png`);
        
      } catch (error) {
        console.log(`ERROR: ${error}`);
      }
    }
  });

  test('capture: all games with proper login', async ({ page }) => {
    console.log('\n=== Capturing all games with proper login ===');
    
    // Login first
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    
    await page.fill('#login-email', 'pranay.suyash@gmail.com');
    await page.fill('#login-password', 'pranaysuyash');
    await page.click('button[type=submit]');
    
    // Wait for dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('1. Logged in successfully');
    await page.screenshot({ path: `${outDir}/final_dashboard.png`, fullPage: true });
    
    // Navigate to each game
    const games = [
      { path: '/games/alphabet-tracing', name: 'alphabet_tracing' },
      { path: '/games/finger-number-show', name: 'finger_counting' },
      { path: '/games/connect-the-dots', name: 'connect_dots' },
      { path: '/games/letter-hunt', name: 'letter_hunt' },
    ];
    
    for (const game of games) {
      console.log(`\n--- Capturing ${game.name} ---`);
      
      try {
        await page.goto(`${BASE}${game.path}`, { timeout: 15000 });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(4000); // Extra time for game to initialize
        
        const url = page.url();
        console.log(`URL: ${url}`);
        
        // Check if we're on the game page or redirected
        if (url.includes(game.path)) {
          const bodyText = await page.textContent('body');
          const preview = bodyText?.substring(0, 200).replace(/\s+/g, ' ');
          console.log(`Content: ${preview}...`);
          
          await page.screenshot({ path: `${outDir}/final_${game.name}.png`, fullPage: true });
          console.log(`✓ Screenshot saved`);
        } else {
          console.log(`✗ Redirected to: ${url}`);
        }
        
      } catch (error) {
        console.log(`✗ ERROR: ${error}`);
      }
    }
  });
});
