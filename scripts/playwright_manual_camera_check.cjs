#!/usr/bin/env node

const path = require('path');
const { chromium } = require('../src/frontend/node_modules/playwright');

const ROOT_DIR = path.resolve(__dirname, '..');
const DEFAULT_BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:6173';
const profileDir = path.join(ROOT_DIR, '.tmp', 'playwright-manual-camera-profile');
const args = new Set(process.argv.slice(2));

const launchGuest = args.has('--guest');
const targetUrl = launchGuest
  ? `${DEFAULT_BASE_URL}/games/alphabet-tracing`
  : `${DEFAULT_BASE_URL}/login`;

async function main() {
  const context = await chromium.launchPersistentContext(profileDir, {
    channel: 'chrome',
    headless: false,
    viewport: { width: 1440, height: 960 },
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

  console.log('');
  console.log('[manual-camera] Headed Chrome launched with a persistent profile.');
  console.log(`[manual-camera] URL: ${targetUrl}`);
  console.log('[manual-camera] Expected behavior:');
  console.log('  1. Reach a game screen that offers camera mode.');
  console.log('  2. Click "Play with Camera" or the equivalent camera CTA.');
  console.log('  3. Verify Chrome shows a real camera permission prompt.');
  console.log('  4. Accept once and confirm the game receives live camera access.');
  console.log('');
  if (!launchGuest) {
    console.log('[manual-camera] Default start is the login page so you can verify the paid-user path.');
    console.log('[manual-camera] Use --guest to open the guest alphabet flow directly.');
  }
  console.log('[manual-camera] Close the Chrome window when finished.');

  context.on('close', () => {
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('[manual-camera] Failed to launch Chrome:', error);
  process.exit(1);
});
