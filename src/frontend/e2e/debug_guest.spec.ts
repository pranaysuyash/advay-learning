import { test } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:6173';
const outDir = 'docs/screenshots/games_visual_audit';

test.describe('Debug Guest Mode', () => {
  
  test('debug: capture console and errors during guest login', async ({ page }) => {
    const logs: string[] = [];
    
    page.on('console', msg => {
      const text = `[${msg.type()}] ${msg.text()}`;
      logs.push(text);
      console.log(text);
    });
    
    page.on('pageerror', error => {
      console.log(`[PAGE ERROR] ${error.message}`);
    });
    
    console.log('\n=== Navigating to login ===');
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    console.log('\n=== Clicking guest button ===');
    
    // Get initial URL
    const urlBefore = page.url();
    console.log(`URL before: ${urlBefore}`);
    
    // Check if button exists
    const button = page.locator('button:has-text("Try without account")');
    const buttonCount = await button.count();
    console.log(`Guest button found: ${buttonCount}`);
    
    if (buttonCount > 0) {
      // Click the button
      await button.click();
      console.log('Button clicked');
      
      // Wait a moment
      await page.waitForTimeout(3000);
      
      // Check URL after
      const urlAfter = page.url();
      console.log(`URL after: ${urlAfter}`);
      
      // Take screenshot
      await page.screenshot({ 
        path: `${outDir}/debug_guest_mode.png`, 
        fullPage: true 
      });
      
      // Check auth state in browser
      const authState = await page.evaluate(() => {
        const store = (window as any).__ZUSTAND_AUTH_STORE__;
        return store ? {
          isAuthenticated: store.getState?.().isAuthenticated,
          isGuest: store.getState?.().isGuest,
        } : 'store not found';
      }).catch(() => 'could not get auth state');
      
      console.log(`Auth state: ${JSON.stringify(authState)}`);
      
      // Check if we're still on login
      if (urlAfter.includes('login')) {
        console.log('\n=== Still on login page ===');
        
        // Check for any error messages
        const errorText = await page.locator('.error, .text-red, [role="alert"]').textContent().catch(() => 'none');
        console.log(`Error messages: ${errorText}`);
      }
    }
    
    console.log('\n=== All console logs ===');
    logs.forEach(l => console.log(l));
  });
});
