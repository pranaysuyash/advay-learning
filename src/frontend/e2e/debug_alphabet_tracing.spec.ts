import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:6173';
const outDir = 'docs/screenshots/games_visual_audit';

test.describe('Alphabet Tracing Debug', () => {
  
  test('debug: capture console logs and errors for alphabet tracing', async ({ page }) => {
    const consoleLogs: string[] = [];
    const errors: string[] = [];
    
    page.on('console', msg => {
      const text = `[${msg.type()}] ${msg.text()}`;
      consoleLogs.push(text);
      console.log('Browser Console:', text);
    });
    
    page.on('pageerror', error => {
      const text = `Page Error: ${error.message}\n${error.stack}`;
      errors.push(text);
      console.log('Page Error:', text);
    });
    
    // Login first
    console.log('\n=== Logging in ===');
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    
    await page.fill('#login-email', 'pranay.suyash@gmail.com');
    await page.fill('#login-password', 'pranaysuyash');
    await page.click('button[type=submit]');
    
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('Logged in successfully');
    
    // Navigate to alphabet tracing
    console.log('\n=== Navigating to alphabet-tracing ===');
    
    try {
      await page.goto(`${BASE}/games/alphabet-tracing`, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      console.log('Page loaded (domcontentloaded)');
      
      // Wait a bit for React to render
      await page.waitForTimeout(3000);
      
      // Try to get page content with longer timeout
      console.log('Attempting to get page content...');
      const body = await page.locator('body');
      const html = await body.innerHTML({ timeout: 10000 }).catch(e => `Error: ${e}`);
      console.log(`Body HTML length: ${html.length}`);
      console.log(`Body HTML preview: ${html.substring(0, 500)}...`);
      
      // Take screenshot
      await page.screenshot({ path: `${outDir}/debug_alphabet_tracing.png`, fullPage: true });
      console.log('Screenshot saved');
      
      // Check for specific elements
      const loadingSpinner = await page.locator('.animate-spin').count();
      console.log(`Loading spinners found: ${loadingSpinner}`);
      
      const profileText = await page.locator('text=Loading your child').count();
      console.log(`Profile loading text found: ${profileText}`);
      
      const tutorialText = await page.locator('text=Tutorial').count();
      console.log(`Tutorial text found: ${tutorialText}`);
      
    } catch (error) {
      console.log(`Navigation error: ${error}`);
    }
    
    // Log all console messages
    console.log('\n=== All Console Logs ===');
    consoleLogs.forEach(log => console.log(log));
    
    console.log('\n=== All Page Errors ===');
    errors.forEach(err => console.log(err));
    
    // Save logs to file
    const reportContent = `
# Alphabet Tracing Debug Report

## Console Logs
${consoleLogs.map(l => `- ${l}`).join('\n')}

## Page Errors
${errors.length > 0 ? errors.map(e => `### Error\n\`\`\`\n${e}\n\`\`\``).join('\n') : 'No page errors'}

## Test completed at: ${new Date().toISOString()}
`;
    
    // Write report using page.evaluate
    console.log('\n=== Report ===');
    console.log(reportContent);
  });
});
