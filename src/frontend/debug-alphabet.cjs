const { chromium } = require('playwright');

async function debugAlphabet() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    console.log('CONSOLE:', msg.type(), msg.text());
  });
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
  });
  
  try {
    // Login
    await page.goto('http://localhost:6173/login');
    await page.fill('input[type="email"]', 'testuser1771519713@example.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Go to alphabet game
    console.log('Loading alphabet-tracing...');
    await page.goto('http://localhost:6173/games/alphabet-tracing', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(8000);
    
    console.log('Page loaded');
    
    // Get any error info
    const errorInfo = await page.evaluate(() => {
      return {
        title: document.title,
        bodyText: document.body.innerText.substring(0, 200),
        hasRoot: !!document.getElementById('root'),
        rootHTML: document.getElementById('root')?.innerHTML?.substring(0, 500) || 'NO ROOT'
      };
    });
    
    console.log('Page info:', JSON.stringify(errorInfo, null, 2));
    
  } catch (e) {
    console.log('ERROR:', e.message);
  }
  
  await browser.close();
}

debugAlphabet();
