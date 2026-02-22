import { test } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:6173';
const outDir = 'docs/screenshots/games_visual_audit';

test.describe('Alphabet Tracing Deep Debug', () => {
  
  test('debug: check page state at various points', async ({ page }) => {
    // Capture all console logs
    page.on('console', msg => {
      console.log(`[${msg.type()}] ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
      console.log(`[PAGE ERROR] ${error.message}`);
    });
    
    // Login
    console.log('\n=== Step 1: Login ===');
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    await page.fill('#login-email', 'pranay.suyash@gmail.com');
    await page.fill('#login-password', 'pranaysuyash');
    await page.click('button[type=submit]');
    
    // Wait for navigation
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✓ Logged in and on dashboard');
    
    // Check if we can access the dashboard
    const dashboardContent = await page.locator('body').textContent({ timeout: 5000 });
    console.log(`Dashboard content length: ${dashboardContent?.length}`);
    
    // Navigate to alphabet-tracing
    console.log('\n=== Step 2: Navigate to Alphabet Tracing ===');
    
    // Try to click on the game card if it exists
    const gameCard = page.locator('a[href="/games/alphabet-tracing"]').first();
    const cardCount = await gameCard.count();
    console.log(`Found ${cardCount} alphabet-tracing links on dashboard`);
    
    if (cardCount > 0) {
      console.log('Clicking game card...');
      await gameCard.click();
    } else {
      console.log('No game card found, navigating directly...');
      await page.goto(`${BASE}/games/alphabet-tracing`, { waitUntil: 'domcontentloaded' });
    }
    
    console.log('\n=== Step 3: Wait for page to stabilize ===');
    
    // Wait longer for the page to stabilize
    await page.waitForTimeout(5000);
    
    // Check URL
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    // Check page title
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Try to find specific elements
    console.log('\n=== Step 4: Check for elements ===');
    
    // Check for loading spinners
    const spinners = await page.locator('.animate-spin').count();
    console.log(`Loading spinners: ${spinners}`);
    
    // Check for profile loading text
    const profileLoading = await page.locator('text=Loading your child').count();
    console.log(`Profile loading text: ${profileLoading}`);
    
    // Check for tutorial
    const tutorial = await page.locator('text=Tutorial').count();
    console.log(`Tutorial elements: ${tutorial}`);
    
    // Check for game elements
    const gameElements = await page.locator('text=Trace letters').count();
    console.log(`Game elements: ${gameElements}`);
    
    // Check for any visible text
    const allText = await page.locator('*:visible').first().textContent({ timeout: 5000 }).catch(() => 'Could not get text');
    console.log(`First visible element text: ${allText?.substring(0, 200)}`);
    
    // Take screenshot with longer timeout
    console.log('\n=== Step 5: Screenshot ===');
    await page.screenshot({ 
      path: `${outDir}/deep_debug_alphabet.png`, 
      fullPage: true,
      timeout: 30000 
    });
    console.log('✓ Screenshot saved');
    
    // Get the actual page content
    console.log('\n=== Step 6: Page Content ===');
    const bodyText = await page.evaluate(() => {
      return document.body?.innerText || 'No body text';
    }).catch(e => `Error: ${e}`);
    console.log(`Body text preview: ${bodyText?.substring(0, 500)}`);
    
    // Check if there are any error messages visible
    const errorElements = await page.locator('[role="alert"], .error, .text-red').count();
    console.log(`Error elements: ${errorElements}`);
    
  });
});
