import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

// Listen for console logs
page.on('console', msg => console.log('CONSOLE:', msg.text()));
page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

await page.goto('http://localhost:6173/games/rhyme-time');
await page.waitForTimeout(3000);

// Check if specific elements exist
const hasMenu = await page.locator('text=Rhyme Time!').count();
const hasMascot = await page.locator('img[alt*="mascot"]').count();
const hasGoal = await page.locator('text=GOAL:').count();

console.log('Has menu title:', hasMenu > 0);
console.log('Has mascot:', hasMascot > 0);
console.log('Has GOAL: text:', hasGoal > 0);

await browser.close();
