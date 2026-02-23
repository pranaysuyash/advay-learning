const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:6173/games/rhyme-time');
  await page.waitForTimeout(3000);
  
  // Check for data-ux-goal using evaluate
  const hasGoal = await page.evaluate(() => {
    return document.querySelector('[data-ux-goal]') !== null;
  });
  
  console.log('Has data-ux-goal element:', hasGoal);
  
  if (hasGoal) {
    const goalText = await page.evaluate(() => {
      const el = document.querySelector('[data-ux-goal]');
      return el ? el.getAttribute('data-ux-goal') : null;
    });
    console.log('Goal text:', goalText);
  }
  
  // Also check for "GOAL:" text
  const html = await page.content();
  console.log('Has GOAL: in HTML:', html.includes('GOAL:'));
  console.log('Has data-ux-goal in HTML:', html.includes('data-ux-goal'));
  
  await browser.close();
})();
