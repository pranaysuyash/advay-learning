#!/usr/bin/env node
/**
 * UI/UX Audit Screenshot Capture Script
 * Captures comprehensive screenshots of all app pages and states
 * 
 * Run from project root: node scripts/ui-audit-screenshots.mjs
 */

import { chromium } from '../src/frontend/node_modules/@playwright/test/index.mjs';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:6173';
const OUTPUT_DIR = './audit-screenshots';

// Viewport configurations
const viewports = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 834, height: 1112 },
  mobile: { width: 390, height: 844 }
};

// Routes to capture
const routes = [
  { path: '/', name: 'home', description: 'Landing page with hero and features' },
  { path: '/login', name: 'login', description: 'Login form page' },
  { path: '/register', name: 'register', description: 'Registration form page' },
  { path: '/dashboard', name: 'dashboard', description: 'Parent dashboard with child profiles' },
  { path: '/games', name: 'games', description: 'Games selection page' },
  { path: '/game', name: 'alphabet-game', description: 'Alphabet tracing game' },
  { path: '/games/finger-number-show', name: 'finger-numbers', description: 'Finger counting game' },
  { path: '/games/connect-the-dots', name: 'connect-dots', description: 'Connect the dots game' },
  { path: '/games/letter-hunt', name: 'letter-hunt', description: 'Letter hunt game' },
  { path: '/progress', name: 'progress', description: 'Learning progress page' },
  { path: '/settings', name: 'settings', description: 'App settings page' },
  { path: '/style-test', name: 'style-test', description: 'Component style test page' }
];

// Screenshot metadata for the audit report
const screenshotIndex = [];

async function captureScreenshots() {
  // Create output directory
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
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
          path: join(OUTPUT_DIR, fullPageFile),
          fullPage: true
        });
        
        screenshotIndex.push({
          filename: fullPageFile,
          route: route.path,
          device,
          type: 'full-page',
          description: route.description,
          viewport: `${viewport.width}x${viewport.height}`
        });
        
        // Capture viewport (above the fold)
        const viewportFile = `${device}_${route.name}_viewport.png`;
        await page.screenshot({
          path: join(OUTPUT_DIR, viewportFile),
          fullPage: false
        });
        
        screenshotIndex.push({
          filename: viewportFile,
          route: route.path,
          device,
          type: 'viewport',
          description: `${route.description} - Above the fold`,
          viewport: `${viewport.width}x${viewport.height}`
        });
        
        console.log(`  ✓ Captured: ${fullPageFile}, ${viewportFile}`);
        
        // Capture specific states for certain pages
        if (route.path === '/login') {
          // Capture error state
          await page.fill('#login-email-input', 'invalid@email.com');
          await page.fill('#login-password-input', 'wrongpass');
          await page.click('button[type="submit"]');
          await page.waitForTimeout(500);
          
          const errorFile = `${device}_${route.name}_error.png`;
          await page.screenshot({
            path: join(OUTPUT_DIR, errorFile),
            fullPage: true
          });
          
          screenshotIndex.push({
            filename: errorFile,
            route: route.path,
            device,
            type: 'error-state',
            description: 'Login form with error state',
            viewport: `${viewport.width}x${viewport.height}`
          });
          
          console.log(`  ✓ Captured error state: ${errorFile}`);
        }
        
      } catch (error) {
        console.error(`  ✗ Failed to capture ${route.name}:`, error.message);
        screenshotIndex.push({
          filename: 'FAILED',
          route: route.path,
          device,
          type: 'error',
          description: `Failed to capture: ${error.message}`,
          viewport: `${viewport.width}x${viewport.height}`
        });
      }
    }
    
    await context.close();
  }
  
  await browser.close();
  
  // Write screenshot index
  const indexPath = join(OUTPUT_DIR, 'screenshot-index.json');
  const fs = await import('fs');
  fs.writeFileSync(indexPath, JSON.stringify(screenshotIndex, null, 2));
  
  console.log('\n=== CAPTURE COMPLETE ===');
  console.log(`Total screenshots: ${screenshotIndex.length}`);
  console.log(`Index saved to: ${indexPath}`);
  
  return screenshotIndex;
}

captureScreenshots().catch(console.error);
