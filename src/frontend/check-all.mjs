import { chromium } from 'playwright';

const browser = await chromium.launch();
const games = [
  'story-sequence',
  'shape-safari', 
  'rhyme-time',
  'free-draw',
  'math-monsters',
  'bubble-pop'
];

for (const game of games) {
  const page = await browser.newPage();
  await page.goto(`http://localhost:6173/games/${game}`);
  await page.waitForTimeout(3000);
  
  const hasGoal = await page.evaluate(() => {
    return document.querySelector('[data-ux-goal]') !== null;
  });
  
  const hasGOAL = await page.evaluate(() => {
    return document.body.innerText.includes('GOAL:');
  });
  
  console.log(`${game}: data-ux-goal=${hasGoal}, GOAL: text=${hasGOAL}`);
  await page.close();
}

await browser.close();
