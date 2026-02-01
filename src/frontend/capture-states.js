import { chromium, devices } from 'playwright';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:6173';

async function captureInteractiveStates() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  console.log('=== Capturing Interactive States ===\n');

  // Loading state
  console.log('Capturing loading states...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]');
    if (btn) btn.textContent = 'Loading...';
  });
  await page.screenshot({ path: 'screenshots/desktop/login-loading.png', fullPage: false });

  // Button hover states - Dashboard
  console.log('Capturing hover states...');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn) => {
      if (btn.textContent?.toLowerCase().includes('start') || btn.textContent?.toLowerCase().includes('play')) {
        btn.classList.add('hover:bg-blue-600');
      }
    });
  });
  await page.screenshot({ path: 'screenshots/desktop/dashboard-hover.png', fullPage: false });

  // Game page with camera simulation
  console.log('Capturing game state...');
  await page.goto(`${BASE_URL}/game`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screenshots/desktop/alphabet-game-playing.png', fullPage: true });

  // Progress page charts
  console.log('Capturing progress page...');
  await page.goto(`${BASE_URL}/progress`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screenshots/desktop/progress-charts.png', fullPage: true });

  // Settings page
  console.log('Capturing settings page...');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screenshots/desktop/settings-controls.png', fullPage: true });

  // Games selection
  console.log('Capturing games selection...');
  await page.goto(`${BASE_URL}/games`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screenshots/desktop/games-grid.png', fullPage: true });

  // Mobile specific states
  console.log('Capturing mobile states...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const mobilePage = await mobileContext.newPage();

  await mobilePage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await mobilePage.screenshot({ path: 'screenshots/mobile/dashboard-mobile.png', fullPage: true });

  await mobilePage.goto(`${BASE_URL}/game`, { waitUntil: 'networkidle' });
  await mobilePage.screenshot({ path: 'screenshots/mobile/alphabet-game-mobile.png', fullPage: true });

  await browser.close();
  console.log('\nInteractive state screenshots captured!');
}

captureInteractiveStates().catch(console.error);
