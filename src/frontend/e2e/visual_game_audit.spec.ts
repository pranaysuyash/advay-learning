import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:6173';
const outDir = 'docs/screenshots/games_visual_audit';

test.describe('Visual Game Audit - Real Login', () => {
  
  test('01 - Login with real account and capture dashboard', async ({ page }) => {
    console.log('\n=== Test 1: Real Login ===');
    
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    
    // Fill in real credentials
    await page.fill('#login-email', 'pranay.suyash@gmail.com');
    await page.fill('#login-password', 'pranaysuyash');
    
    // Click login
    await page.click('button[type=submit]');
    
    // Wait for dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ 
      path: `${outDir}/visual_01_dashboard.png`, 
      fullPage: true 
    });
    console.log('✓ Dashboard screenshot saved');
    
    // Log what's visible
    const content = await page.textContent('body');
    console.log(`Dashboard content length: ${content?.length}`);
  });

  test('02 - Test guest mode navigation', async ({ page }) => {
    console.log('\n=== Test 2: Guest Mode ===');
    
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    
    // Click guest mode button
    await page.click('button:has-text("Try without account")');
    
    // Wait for navigation
    await page.waitForTimeout(2000);
    
    const url = page.url();
    console.log(`URL after guest login: ${url}`);
    
    // Take screenshot
    await page.screenshot({ 
      path: `${outDir}/visual_02_guest_mode.png`, 
      fullPage: true 
    });
    
    if (url.includes('dashboard')) {
      console.log('✓ Guest mode navigated to dashboard');
    } else {
      console.log('✗ Guest mode failed - still on:', url);
    }
  });

  test('03 - Capture Alphabet Tracing game', async ({ page }) => {
    console.log('\n=== Test 3: Alphabet Tracing ===');
    
    // Login first
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.fill('#login-email', 'pranay.suyash@gmail.com');
    await page.fill('#login-password', 'pranaysuyash');
    await page.click('button[type=submit]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(1000);
    
    // Navigate to game
    await page.goto(`${BASE}/games/alphabet-tracing`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    
    // Take screenshot with longer timeout for MediaPipe loading
    await page.screenshot({ 
      path: `${outDir}/visual_03_alphabet_tracing.png`, 
      fullPage: true,
      timeout: 30000
    });
    
    const content = await page.textContent('body');
    console.log(`Alphabet game content preview: ${content?.substring(0, 200)}...`);
  });

  test('04 - Capture Finger Counting game', async ({ page }) => {
    console.log('\n=== Test 4: Finger Counting ===');
    
    // Login first
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.fill('#login-email', 'pranay.suyash@gmail.com');
    await page.fill('#login-password', 'pranaysuyash');
    await page.click('button[type=submit]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(1000);
    
    // Navigate to game
    await page.goto(`${BASE}/games/finger-number-show`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ 
      path: `${outDir}/visual_04_finger_counting.png`, 
      fullPage: true 
    });
    console.log('✓ Finger counting screenshot saved');
  });

  test('05 - Capture Connect Dots game', async ({ page }) => {
    console.log('\n=== Test 5: Connect Dots ===');
    
    // Login first
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.fill('#login-email', 'pranay.suyash@gmail.com');
    await page.fill('#login-password', 'pranaysuyash');
    await page.click('button[type=submit]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(1000);
    
    // Navigate to game
    await page.goto(`${BASE}/games/connect-the-dots`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ 
      path: `${outDir}/visual_05_connect_dots.png`, 
      fullPage: true 
    });
    console.log('✓ Connect dots screenshot saved');
  });

  test('06 - Capture Letter Hunt game', async ({ page }) => {
    console.log('\n=== Test 6: Letter Hunt ===');
    
    // Login first
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.fill('#login-email', 'pranay.suyash@gmail.com');
    await page.fill('#login-password', 'pranaysuyash');
    await page.click('button[type=submit]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(1000);
    
    // Navigate to game
    await page.goto(`${BASE}/games/letter-hunt`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ 
      path: `${outDir}/visual_06_letter_hunt.png`, 
      fullPage: true 
    });
    console.log('✓ Letter hunt screenshot saved');
  });
});
