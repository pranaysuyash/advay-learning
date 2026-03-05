// The repo's Playwright installation lives under src/frontend/node_modules
const path = require('path');
const playwrightPath = path.resolve(__dirname, '../src/frontend/node_modules/playwright');
const { chromium } = require(playwrightPath);

// A simple automation that navigates to each game URL, optionally clicks a
// "Start" button and records a short video of the page.  The resulting
// files are written to ./videos/<game-name>.webm so that other agents or humans
// can review real gameplay footage.

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:6173';
const outDir = './videos';

const games = [
  { name: 'alphabet-tracing', url: '/games/alphabet-tracing' },
  { name: 'finger-number-show', url: '/games/finger-number-show' },
  { name: 'connect-the-dots', url: '/games/connect-the-dots' },
  { name: 'letter-hunt', url: '/games/letter-hunt' },
  { name: 'music-pinch-beat', url: '/games/music-pinch-beat' },
  { name: 'steady-hand-lab', url: '/games/steady-hand-lab' },
  { name: 'shape-pop', url: '/games/shape-pop' },
  { name: 'color-match-garden', url: '/games/color-match-garden' },
  { name: 'number-tap-trail', url: '/games/number-tap-trail' },
  { name: 'shape-sequence', url: '/games/shape-sequence' },
  { name: 'yoga-animals', url: '/games/yoga-animals' },
  { name: 'freeze-dance', url: '/games/freeze-dance' },
  { name: 'simon-says', url: '/games/simon-says' },
  { name: 'chemistry-lab', url: '/games/chemistry-lab' },
];

async function recordAll() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
  });

  for (const game of games) {
    console.log(`\n=== Recording ${game.name} ===`);
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      recordVideo: { dir: outDir, size: { width: 1920, height: 1080 } },
    });

    const page = await context.newPage();
    await page.goto(BASE + game.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    // give page time to settle
    await page.waitForTimeout(3000);

    // optionally click a "Start" button if it exists
    try {
      await page.click('button:has-text("Start")', { timeout: 2000 });
      await page.waitForTimeout(500);
    } catch {}

    // perform simple interactions to generate gameplay activity
    // generic fallback: random clicks within viewport
    const viewport = page.viewportSize();
    if (viewport) {
      for (let i = 0; i < 5; i++) {
        const x = Math.floor(Math.random() * viewport.width);
        const y = Math.floor(Math.random() * viewport.height);
        await page.mouse.click(x, y);
        await page.waitForTimeout(800);
      }
    }

    // stay on the page long enough to capture a few seconds of gameplay
    await page.waitForTimeout(8000);

    // closing the context flushes and saves the video
    await context.close();
    console.log(`video saved for ${game.name}`);
  }

  await browser.close();
  console.log('\nAll recordings complete.');
}

recordAll().catch((e) => {
  console.error(e);
  process.exit(1);
});