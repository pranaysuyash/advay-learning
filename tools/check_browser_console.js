/**
 * Browser Console Error Checker
 * 
 * Checks for console errors on a given URL using Playwright.
 * Usage: node tools/check_browser_console.js [url]
 */
const { chromium } = require('playwright');

const url = process.argv[2] || 'http://localhost:6173/games/rhyme-time';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  const warnings = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    } else if (msg.type() === 'warning') {
      warnings.push(msg.text());
    }
  });
  
  page.on('pageerror', err => {
    errors.push(`PAGE ERROR: ${err.message}`);
  });
  
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(5000);
    
    console.log(`URL: ${url}`);
    console.log(`=== Errors (${errors.length}) ===`);
    errors.forEach(e => console.log(`  ${e}`));
    
    if (warnings.length > 0) {
      console.log(`=== Warnings (${warnings.length}) ===`);
      warnings.slice(0, 10).forEach(w => console.log(`  ${w}`));
    }
  } catch (e) {
    console.error('Failed to load page:', e.message);
  }
  
  await browser.close();
})();
