import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Navigate to homepage
  await page.goto('http://localhost:6175', { waitUntil: 'networkidle2' });
  await page.waitFor(3000);
  
  // Take homepage screenshot
  await page.screenshot({ path: 'screenshots/homepage.png', fullPage: true });
  console.log('Homepage screenshot saved');

  // Navigate to games page
  await page.goto('http://localhost:6175/games', { waitUntil: 'networkidle2' });
  await page.waitFor(3000);
  
  // Take games page screenshot
  await page.screenshot({ path: 'screenshots/games-page.png', fullPage: true });
  console.log('Games page screenshot saved');

  // Navigate to Finger Number Show game
  await page.goto('http://localhost:6175/games/finger-number-show', { waitUntil: 'networkidle2' });
  await page.waitFor(3000);
  
  // Take Finger Number Show game screenshot
  await page.screenshot({ path: 'screenshots/finger-number-show.png', fullPage: true });
  console.log('Finger Number Show screenshot saved');

  // Navigate to Word Builder game
  await page.goto('http://localhost:6175/games/word-builder', { waitUntil: 'networkidle2' });
  await page.waitFor(3000);
  
  // Take Word Builder game screenshot
  await page.screenshot({ path: 'screenshots/word-builder.png', fullPage: true });
  console.log('Word Builder screenshot saved');

  // Navigate to Alphabet Game
  await page.goto('http://localhost:6175/games/alphabet-game', { waitUntil: 'networkidle2' });
  await page.waitFor(3000);
  
  // Take Alphabet Game screenshot
  await page.screenshot({ path: 'screenshots/alphabet-game.png', fullPage: true });
  console.log('Alphabet Game screenshot saved');

  await browser.close();
})();