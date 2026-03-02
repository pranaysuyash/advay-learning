import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = process.env.SCREENSHOT_TEST_BASE_URL || 'http://localhost:6173';
const email = process.env.SCREENSHOT_TEST_EMAIL;
const password = process.env.SCREENSHOT_TEST_PASSWORD;
const profileName = process.env.SCREENSHOT_TEST_PROFILE_NAME || 'Advay';
const outputDir = path.join(__dirname, 'screenshots');

function requireEnv(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

async function clickByText(page, selector, text) {
  const clicked = await page.evaluate(
    ({ selectorValue, textValue }) => {
      const nodes = Array.from(document.querySelectorAll(selectorValue));
      const match = nodes.find((node) => node.textContent?.includes(textValue));
      if (!match) return false;
      match.click();
      return true;
    },
    { selectorValue: selector, textValue: text },
  );

  if (!clicked) {
    throw new Error(`Could not find clickable element containing "${text}"`);
  }
}

async function dispatchContextMenuByText(page, selector, text) {
  const dispatched = await page.evaluate(
    ({ selectorValue, textValue }) => {
      const nodes = Array.from(document.querySelectorAll(selectorValue));
      const match = nodes.find((node) => node.textContent?.includes(textValue));
      if (!match) return false;

      const event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        view: window,
      });

      match.dispatchEvent(event);
      return true;
    },
    { selectorValue: selector, textValue: text },
  );

  if (!dispatched) {
    throw new Error(`Could not find profile button containing "${text}"`);
  }
}

async function run() {
  requireEnv('SCREENSHOT_TEST_EMAIL', email);
  requireEnv('SCREENSHOT_TEST_PASSWORD', password);

  await fs.mkdir(outputDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(baseUrl, { waitUntil: 'networkidle2' });

    await clickByText(page, 'button, a', 'Log In');
    await page.waitForTimeout(2000);

    await page.type('input[type="email"], input[name="email"], input[name="username"]', email);
    await page.type('input[type="password"]', password);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    await dispatchContextMenuByText(page, 'button', profileName);
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(outputDir, 'profile-context-menu.png'),
      fullPage: true,
    });

    await clickByText(page, 'button', 'Edit');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(outputDir, 'edit-profile-modal.png'),
      fullPage: true,
    });

    await clickByText(page, 'button', 'Change Avatar');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(outputDir, 'avatar-picker.png'),
      fullPage: true,
    });

    console.log(`Screenshots saved to ${outputDir}`);
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
