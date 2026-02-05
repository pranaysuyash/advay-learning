#!/usr/bin/env node
/**
 * Visual Audit Playwright Script
 * Logs in with credentials and captures screenshots of all key pages
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:6173';
const API_URL = 'http://localhost:8001';

// Credentials
const CREDENTIALS = {
  email: 'pranay.suyash@gmail.com',
  password: 'pranaysuyash'
};

// Screenshot directory
const SCREENSHOT_DIR = path.join(__dirname, '..', '..', 'audit-screenshots', `visual-audit-${new Date().toISOString().split('T')[0]}`);

// Pages to capture
const PAGES = [
  { name: '01-home', path: '/', waitFor: '.text-center' },
  { name: '02-login', path: '/login', waitFor: 'form' },
  { name: '03-register', path: '/register', waitFor: 'form' },
  { name: '04-dashboard', path: '/dashboard', waitFor: 'h1, .dashboard', auth: true },
  { name: '05-games', path: '/games', waitFor: '.grid, h1', auth: true },
  { name: '06-alphabet-game-menu', path: '/games/alphabet-tracing', waitFor: 'button, section', auth: true },
  { name: '07-progress', path: '/progress', waitFor: 'h1, section', auth: true },
  { name: '08-settings', path: '/settings', waitFor: 'form, h1', auth: true },
];

// Viewports to test
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'mobile', width: 390, height: 844 },
];

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function capturePage(page, pageConfig, viewport) {
  const screenshotPath = path.join(SCREENSHOT_DIR, `${pageConfig.name}-${viewport.name}.png`);
  
  try {
    // Navigate to page
    await page.goto(`${BASE_URL}${pageConfig.path}`, { waitUntil: 'networkidle' });
    
    // Wait for specific element
    if (pageConfig.waitFor) {
      try {
        await page.waitForSelector(pageConfig.waitFor, { timeout: 5000 });
      } catch (e) {
        console.log(`  ⚠️  Selector not found: ${pageConfig.waitFor}, taking screenshot anyway`);
      }
    }
    
    // Additional wait for animations
    await page.waitForTimeout(1000);
    
    // Take screenshot
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true,
      type: 'png'
    });
    
    console.log(`  ✅ ${pageConfig.name} (${viewport.name})`);
    return { success: true, path: screenshotPath };
  } catch (error) {
    console.log(`  ❌ ${pageConfig.name} (${viewport.name}): ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function login(page) {
  console.log('🔐 Logging in...');
  
  await page.goto(`${BASE_URL}/login`);
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  
  // Fill credentials
  await page.fill('input[type="email"]', CREDENTIALS.email);
  await page.fill('input[type="password"]', CREDENTIALS.password);
  
  // Click login
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL(/.*dashboard.*/, { timeout: 10000 });
  console.log('✅ Login successful');
  
  // Wait for dashboard to load
  await page.waitForTimeout(2000);
}

async function runAudit() {
  console.log('🎭 Starting Visual Audit\n');
  console.log(`📁 Screenshots will be saved to: ${SCREENSHOT_DIR}\n`);
  
  ensureDir(SCREENSHOT_DIR);
  
  const results = [];
  
  for (const viewport of VIEWPORTS) {
    console.log(`\n📱 Viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
    console.log('='.repeat(60));
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height }
    });
    const page = await context.newPage();
    
    // Login first if needed
    let isLoggedIn = false;
    
    for (const pageConfig of PAGES) {
      // Login if this page requires auth and we're not logged in
      if (pageConfig.auth && !isLoggedIn) {
        await login(page);
        isLoggedIn = true;
      }
      
      const result = await capturePage(page, pageConfig, viewport);
      results.push({
        page: pageConfig.name,
        viewport: viewport.name,
        ...result
      });
    }
    
    await browser.close();
  }
  
  // Summary
  console.log('\n\n📊 AUDIT SUMMARY');
  console.log('='.repeat(60));
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`Total: ${results.length} screenshots`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\nFailed captures:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.page} (${r.viewport}): ${r.error}`);
    });
  }
  
  // Save manifest
  const manifestPath = path.join(SCREENSHOT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    credentials: CREDENTIALS.email,
    baseUrl: BASE_URL,
    viewports: VIEWPORTS.map(v => v.name),
    pages: PAGES.map(p => p.name),
    results: results
  }, null, 2));
  
  console.log(`\n📝 Manifest saved to: ${manifestPath}`);
  console.log('\n✨ Visual audit complete!');
  
  return results;
}

runAudit().catch(error => {
  console.error('❌ Audit failed:', error);
  process.exit(1);
});
