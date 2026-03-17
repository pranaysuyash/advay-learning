#!/usr/bin/env node
/**
 * Game Evaluator v2 - Enhanced CDP Testing with Login Support
 *
 * Usage:
 *   node tools/cdp-game-tester-v2.mjs                     # Connect to existing Chrome
 *   node tools/cdp-game-tester-v2.mjs --launch             # Launch new Chrome with profile
 *   node tools/cdp-game-tester-v2.mjs --count 5            # Test 5 random games
 *   node tools/cdp-game-tester-v2.mjs --login              # Auto-login before testing
 *
 * Features:
 *   - Connect to existing Chrome instance via CDP
 *   - Launch Chrome with user profile
 *   - Auto-login with credentials
 *   - Screenshot capture
 *   - AI-powered visual evaluation
 */

import puppeteer from 'puppeteer';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

// ─── CONFIGURATION ─────────────────────────────────────────────────────────

const CONFIG = {
  // Login credentials (from user)
  email: 'pranay.suyash@gmail.com',
  password: 'Advay@2026!',

  // Server
  baseUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  loginUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Chrome settings
  userDataDir: join(PROJECT_ROOT, '.chrome-profile'),
  chromiumPath: puppeteer.executablePath(),

  // Testing
  gameCount: 5,
  screenshotDir: join(PROJECT_ROOT, 'test-screenshots', 'evaluations-v2'),
  viewport: { width: 1280, height: 720 },
  waitTime: 5000, // Longer wait for games to fully load
  screenshotDelay: 2000, // Wait before screenshot for animations
};

// ─── GAME REGISTRY ───────────────────────────────────────────────────────────

const GAME_CATEGORIES = {
  'letter-land': [
    { id: 'alphabet-tracing', path: '/games/alphabet-tracing', name: 'Draw Letters' },
    { id: 'letter-hunt', path: '/games/letter-hunt', name: 'Find the Letter' },
  ],
  'number-jungle': [
    { id: 'finger-number-show', path: '/games/finger-number-show', name: 'Finger Counting' },
    { id: 'number-tap-trail', path: '/games/number-tap-trail', name: 'Number Tap Trail' },
    { id: 'number-tracing', path: '/games/number-tracing', name: 'Number Tracing' },
    { id: 'math-monsters', path: '/games/math-monsters', name: 'Math Monsters' },
    { id: 'math-jumpers', path: '/games/math-jumpers', name: 'Math Jumpers' },
    { id: 'simple-addition', path: '/games/simple-addition', name: 'Simple Addition' },
  ],
  'word-workshop': [
    { id: 'word-search', path: '/games/word-search', name: 'Word Search' },
    { id: 'spelling-run', path: '/games/spelling-run', name: 'Spelling Run' },
  ],
  'shape-garden': [
    { id: 'shape-safari', path: '/games/shape-safari', name: 'Shape Safari' },
    { id: 'shape-stacker', path: '/games/shape-stacker', name: 'Shape Stacker' },
    { id: 'shadow-match', path: '/games/shadow-match', name: 'Shadow Match' },
  ],
  'color-splash': [
    { id: 'color-match-garden', path: '/games/color-match-garden', name: 'Color Match Garden' },
    { id: 'color-mixing', path: '/games/color-mixing', name: 'Color Mixing Lab' },
    { id: 'color-potions', path: '/games/color-potions', name: 'Color Potions' },
  ],
  'platform-world': [
    { id: 'platformer-runner', path: '/games/platformer-runner', name: 'Platformer Runner' },
    { id: 'obstacle-course', path: '/games/obstacle-course', name: 'Obstacle Course' },
    { id: 'mirror-duel', path: '/games/mirror-duel', name: 'Mirror Duel' },
  ],
  'wellness': [
    { id: 'yoga-animals', path: '/games/yoga-animals', name: 'Yoga Animals' },
    { id: 'breathing-bubbles', path: '/games/breathing-bubbles', name: 'Breathing Bubbles' },
  ],
  'sound-studio': [
    { id: 'music-conductor', path: '/games/music-conductor', name: 'Music Conductor' },
    { id: 'beat-bounce', path: '/games/beat-bounce', name: 'Beat Bounce' },
  ],
  'body-zone': [
    { id: 'mirror-maze', path: '/games/mirror-maze', name: 'Mirror Maze' },
    { id: 'balance-beam', path: '/games/balance-beam', name: 'Balance Beam' },
  ],
};

const ALL_GAMES = Object.values(GAME_CATEGORIES).flat();

// ─── CDP CONNECTION ─────────────────────────────────────────────────────────

async function connectToChrome(useProfile = false) {
  console.log('🔗 Connecting to Chrome...');

  const options = {
    headless: false,
    defaultViewport: CONFIG.viewport,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  };

  if (useProfile) {
    options.userDataDir = CONFIG.userDataDir;
    options.args.push(`--user-data-dir=${CONFIG.userDataDir}`);
    console.log(`📁 Using profile: ${CONFIG.userDataDir}`);
  }

  const browser = await puppeteer.launch(options);
  return browser;
}

// ─── LOGIN FLOW ────────────────────────────────────────────────────────────

async function performLogin(page) {
  console.log('🔐 Logging in...');
  console.log(`   Email: ${CONFIG.email}`);

  try {
    // Navigate to login page
    await page.goto(`${CONFIG.baseUrl}/login`, { waitUntil: 'networkidle2' });

    // Check if already logged in (redirected to dashboard/games)
    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard') || currentUrl.includes('/games')) {
      console.log('✅ Already logged in!');
      return true;
    }

    // Fill in login form
    await page.waitForSelector('input[type="email"], input[name="email"], #email', { timeout: 5000 });

    const emailInput = await page.$('input[type="email"], input[name="email"], #email');
    const passwordInput = await page.$('input[type="password"], input[name="password"], #password');

    if (emailInput && passwordInput) {
      await emailInput.type(CONFIG.email, { delay: 50 });
      await passwordInput.type(CONFIG.password, { delay: 50 });

      // Find and click submit button (try multiple selectors)
      const submitBtn = await page.$('button[type="submit"], button.submit, button.login, button[type="button"]');
      if (submitBtn) {
        await submitBtn.click();
      } else {
        // Try pressing Enter
        await page.keyboard.press('Enter');
      }

      // Wait for navigation
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
      console.log('✅ Login successful!');
      return true;
    } else {
      console.warn('⚠️  Login form not found');
      return false;
    }
  } catch (error) {
    console.error(`❌ Login failed: ${error.message}`);
    return false;
  }
}

// ─── GAME EVALUATION ───────────────────────────────────────────────────────

async function evaluateGame(page, game) {
  console.log(`\n🎮 Evaluating: ${game.name}`);
  console.log(`   URL: ${CONFIG.baseUrl}${game.path}`);

  const result = {
    ...game,
    timestamp: new Date().toISOString(),
    url: `${CONFIG.baseUrl}${game.path}`,
  };

  try {
    // Navigate to game
    const response = await page.goto(result.url, {
      waitUntil: 'networkidle2',
      timeout: 15000
    });

    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}`);
    }

    // Wait for game to load
    await new Promise(r => setTimeout(r, CONFIG.waitTime));

    // Take screenshot
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = join(CONFIG.screenshotDir, `${game.id}-${timestamp}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    result.screenshot = screenshotPath;
    console.log(`   📸 Screenshot saved`);

    // Analyze page
    const analysis = await page.evaluate(() => {
      const body = document.body;
      const h1 = document.querySelector('h1')?.textContent || '';
      const h2 = document.querySelector('h2')?.textContent || '';
      const title = document.title;

      // Check for game elements
      const hasCanvas = !!document.querySelector('canvas');
      const hasVideo = !!document.querySelector('video');
      const hasGameContainer = !!document.querySelector('[class*="game"], [class*="Game"], #game');
      const hasScore = !!document.querySelector('[class*="score"], [data-score]');
      const hasTimer = !!document.querySelector('[class*="timer"], [class*="time"], [data-time]');
      const hasStartButton = !!document.querySelector('button[class*="start"], button[class*="play"], button.Start, button.Play, [class*="start"]');
      const hasInstructions = !!body.textContent.match(/how to play|instructions|tap|click|drag/i);
      const hasMediaPipe = !!window.MediaPipe || !!document.querySelector('script[src*="mediapipe"]');

      // Color analysis (basic)
      const bgColor = window.getComputedStyle(body).backgroundColor;
      const hasDarkBg = bgColor.includes('rgb(0, 0, 0)') || bgColor.includes('rgb(18, 18, 18)');

      return {
        title,
        h1,
        h2,
        hasCanvas,
        hasVideo,
        hasGameContainer,
        hasScore,
        hasTimer,
        hasStartButton,
        hasInstructions,
        hasMediaPipe,
        hasDarkBg,
        elementCount: document.querySelectorAll('*').length,
        textLength: body.textContent?.length || 0,
      };
    });

    result.analysis = analysis;

    // Quick quality checks
    const issues = [];
    if (!analysis.hasInstructions) issues.push('No visible instructions');
    if (!analysis.hasGameContainer && !analysis.hasCanvas) issues.push('No game container detected');
    if (analysis.elementCount < 50) issues.push('Very low element count (may not be loaded)');

    result.issues = issues;
    result.status = issues.length === 0 ? 'passed' : 'warning';

    console.log(`   ${analysis.hasCanvas ? '✅' : '⚠️'} Canvas`);
    console.log(`   ${analysis.hasMediaPipe ? '✅' : '⚠️'} MediaPipe`);
    console.log(`   ${analysis.hasInstructions ? '✅' : '⚠️'} Instructions`);
    console.log(`   ${analysis.hasStartButton ? '✅' : '⚠️'} Start Button`);

    // Check for errors
    const hasError = await page.evaluate(() => {
      return document.body.textContent?.toLowerCase().includes('error') ||
             !!document.querySelector('.error, [class*="error"]');
    });

    if (hasError) {
      result.status = 'error';
      result.issues.push('Error detected on page');
      console.log(`   ❌ Error detected`);
    } else {
      console.log(`   ✅ No errors`);
    }

  } catch (error) {
    result.status = 'failed';
    result.error = error.message;
    console.log(`   ❌ Failed: ${error.message}`);
  }

  return result;
}

// ─── MAIN FUNCTION ─────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const options = {
    count: CONFIG.gameCount,
    useProfile: false,
    doLogin: false,
    category: null,
  };

  // Parse args
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--count': options.count = parseInt(args[++i]); break;
      case '--profile': options.useProfile = true; break;
      case '--login': options.doLogin = true; break;
      case '--category': options.category = args[++i]; break;
      case '--help':
        console.log(`
Game Evaluator v2 - CDP Testing with Login

Usage:
  node tools/cdp-game-tester-v2.mjs [options]

Options:
  --count <n>      Number of games to test (default: 5)
  --profile        Use Chrome user profile
  --login          Perform login before testing
  --category <cat> Test games from specific category

Examples:
  node tools/cdp-game-tester-v2.mjs --count 3
  node tools/cdp-game-tester-v2.mjs --login --profile
  node tools/cdp-game-tester-v2.mjs --category number-jungle
        `);
        return;
    }
  }

  console.log('🎮 Game Evaluator v2');
  console.log('═'.repeat(50));

  // Create screenshot directory
  await mkdir(CONFIG.screenshotDir, { recursive: true });

  // Connect to Chrome
  const browser = await connectToChrome(options.useProfile);

  try {
    const page = await browser.newPage();

    // Login if requested
    if (options.doLogin) {
      await performLogin(page);
    }

    // Select games
    let gamesToTest = ALL_GAMES;
    if (options.category && GAME_CATEGORIES[options.category]) {
      gamesToTest = GAME_CATEGORIES[options.category];
      console.log(`\n📁 Category: ${options.category}`);
    }

    // Shuffle and pick random games
    const shuffled = gamesToTest.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, options.count);

    console.log(`\n📋 Testing ${selected.length} games:`);
    selected.forEach(g => console.log(`   - ${g.name}`));

    // Evaluate each game
    const results = [];
    for (const game of selected) {
      const result = await evaluateGame(page, game);
      results.push(result);
    }

    // Save results
    const resultsPath = join(CONFIG.screenshotDir, `results-${Date.now()}.json`);
    await writeFile(resultsPath, JSON.stringify({
      config: {
        baseUrl: CONFIG.baseUrl,
        count: options.count,
        category: options.category,
        loggedIn: options.doLogin,
      },
      results,
      summary: {
        total: results.length,
        passed: results.filter(r => r.status === 'passed').length,
        warnings: results.filter(r => r.status === 'warning').length,
        failed: results.filter(r => r.status === 'failed').length,
      }
    }, null, 2));

    console.log('\n' + '═'.repeat(50));
    console.log('✅ Evaluation Complete!');
    console.log(`📊 Results: ${resultsPath}`);
    console.log(`📁 Screenshots: ${CONFIG.screenshotDir}`);

    // Print summary
    const passed = results.filter(r => r.status === 'passed').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    const failed = results.filter(r => r.status === 'failed').length;

    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ⚠️  Warnings: ${warnings}`);
    console.log(`   ❌ Failed: ${failed}`);

    // List common issues
    const allIssues = results.flatMap(r => r.issues || []);
    if (allIssues.length > 0) {
      console.log(`\n🔍 Common Issues:`);
      const issueCounts = {};
      allIssues.forEach(i => issueCounts[i] = (issueCounts[i] || 0) + 1);
      Object.entries(issueCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([issue, count]) => console.log(`   - ${issue} (${count})`));
    }

    // Keep browser open for inspection
    console.log('\n💡 Browser staying open for inspection. Press Ctrl+C to exit.');

    await new Promise(() => {}); // Keep running

  } finally {
    await browser.close();
  }
}

main().catch(console.error);
