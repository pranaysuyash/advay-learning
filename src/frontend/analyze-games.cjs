const { chromium } = require('playwright');

async function analyzeSpecificGame(gameSlug, gameName) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push('PAGE ERROR: ' + err.message));
  
  try {
    await page.goto('http://localhost:6173/login');
    await page.fill('input[type="email"]', 'testuser1771519713@example.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    console.log(`\n=== ${gameName} ===`);
    await page.goto('http://localhost:6173/games/' + gameSlug, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    const html = await page.content();
    const hasCanvas = html.includes('<canvas');
    const hasVideo = html.includes('<video');
    const buttons = await page.locator('button').count();
    const title = await page.locator('h1, h2').first().textContent().catch(() => 'No title');
    const text = await page.locator('body').textContent();
    
    console.log('Title:', title);
    console.log('Canvas:', hasCanvas);
    console.log('Video:', hasVideo);
    console.log('Buttons:', buttons);
    console.log('Text length:', text.length);
    
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach(e => console.log(' -', e.substring(0, 100)));
    }
    
  } catch (e) {
    console.log('ERROR:', e.message);
  }
  
  await browser.close();
}

const games = [
  ['alphabet-tracing', 'Alphabet Tracing'],
  ['finger-number-show', 'Finger Number Show'],
  ['connect-the-dots', 'Connect The Dots'],
  ['letter-hunt', 'Letter Hunt'],
  ['music-pinch-beat', 'Music Pinch Beat'],
  ['steady-hand-lab', 'Steady Hand Lab'],
  ['shape-pop', 'Shape Pop'],
  ['color-match-garden', 'Color Match Garden'],
  ['number-tap-trail', 'Number Tap Trail'],
  ['shape-sequence', 'Shape Sequence'],
  ['yoga-animals', 'Yoga Animals'],
  ['freeze-dance', 'Freeze Dance'],
  ['simon-says', 'Simon Says'],
  ['chemistry-lab', 'Chemistry Lab'],
];

(async () => {
  for (const [slug, name] of games) {
    await analyzeSpecificGame(slug, name);
  }
})();
