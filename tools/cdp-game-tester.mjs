#!/usr/bin/env node
/**
 * Game Evaluator using CDP (Chrome DevTools Protocol)
 *
 * A reusable tool for automated game testing with visual evaluation.
 * Launches the app, navigates to random games, captures screenshots,
 * and evaluates them on multiple criteria.
 *
 * Usage:
 *   node tools/cdp-game-tester.mjs                    # Test 5 random games
 *   node tools/cdp-game-tester.mjs --count 10         # Test 10 random games
 *   node tools/cdp-game-tester.mjs --games alphabet,math  # Test specific games
 *   node tools/cdp-game-tester.mjs --all              # Test all games
 *   node tools/cdp-game-tester.mjs --list             # List all available games
 *
 * Requirements:
 *   - Dev server running on http://localhost:5173
 *   - Node.js 18+
 *   - puppeteer (already installed)
 */

import puppeteer from 'puppeteer';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

// ─── CONFIGURATION ─────────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  baseUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  gameCount: 5,
  headless: false, // Set to true for CI/CD
  screenshotDir: join(PROJECT_ROOT, 'test-screenshots', 'evaluations'),
  viewport: { width: 1280, height: 720 },
  waitTime: 3000, // ms to wait for game to load
  evalTimeout: 30000, // ms timeout per game evaluation
};

// ─── GAME REGISTRY (fallback if can't scrape) ──────────────────────────────

const FALLBACK_GAMES = [
  // Letter Land
  { id: 'alphabet-tracing', path: '/games/alphabet-tracing', name: 'Draw Letters', world: 'letter-land', vibe: 'chill', age: '2-8', cv: ['hand', 'face'] },
  { id: 'letter-hunt', path: '/games/letter-hunt', name: 'Find the Letter', world: 'letter-land', vibe: 'active', age: '2-6', cv: ['hand'] },
  // Number Jungle
  { id: 'finger-number-show', path: '/games/finger-number-show', name: 'Finger Counting', world: 'number-jungle', vibe: 'chill', age: '3-7', cv: ['hand'] },
  { id: 'number-tap-trail', path: '/games/number-tap-trail', name: 'Number Tap Trail', world: 'number-jungle', vibe: 'active', age: '4-8', cv: ['hand'] },
  { id: 'number-tracing', path: '/games/number-tracing', name: 'Number Tracing', world: 'number-jungle', vibe: 'chill', age: '4-7', cv: ['hand'] },
  { id: 'math-monsters', path: '/games/math-monsters', name: 'Math Monsters', world: 'number-jungle', vibe: 'brainy', age: '5-8', cv: ['hand'] },
  { id: 'math-jumpers', path: '/games/math-jumpers', name: 'Math Jumpers', world: 'number-jungle', vibe: 'active', age: '4-7', cv: ['hand'] },
  { id: 'simple-addition', path: '/games/simple-addition', name: 'Simple Addition', world: 'number-jungle', vibe: 'educational', age: '4-7', cv: ['hand'] },
  // Word Workshop
  { id: 'word-search', path: '/games/word-search', name: 'Word Search', world: 'word-workshop', vibe: 'puzzle', age: '5-9', cv: ['hand'] },
  { id: 'spelling-run', path: '/games/spelling-run', name: 'Spelling Run', world: 'word-workshop', vibe: 'active', age: '4-8', cv: ['hand'] },
  // Shape Garden
  { id: 'shape-safari', path: '/games/shape-safari', name: 'Shape Safari', world: 'shape-garden', vibe: 'educational', age: '3-6', cv: ['hand'] },
  { id: 'shape-stacker', path: '/games/shape-stacker', name: 'Shape Stacker', world: 'shape-garden', vibe: 'puzzle', age: '3-7', cv: ['hand'] },
  { id: 'shadow-match', path: '/games/shadow-match', name: 'Shadow Match', world: 'shape-garden', vibe: 'chill', age: '3-6', cv: ['hand'] },
  // Color Splash
  { id: 'color-match-garden', path: '/games/color-match-garden', name: 'Color Match Garden', world: 'color-splash', vibe: 'educational', age: '3-6', cv: ['hand'] },
  { id: 'color-mixing', path: '/games/color-mixing', name: 'Color Mixing Lab', world: 'color-splash', vibe: 'creative', age: '4-8', cv: ['hand'] },
  { id: 'color-potions', path: '/games/color-potions', name: 'Color Potions', world: 'color-splash', vibe: 'creative', age: '4-8', cv: ['hand'] },
  // Platform World
  { id: 'platformer-runner', path: '/games/platformer-runner', name: 'Platformer Runner', world: 'platform-world', vibe: 'active', age: '5-10', cv: ['hand'] },
  { id: 'obstacle-course', path: '/games/obstacle-course', name: 'Obstacle Course', world: 'platform-world', vibe: 'active', age: '4-8', cv: ['pose'] },
  { id: 'mirror-duel', path: '/games/mirror-duel', name: 'Mirror Duel', world: 'platform-world', vibe: 'focus', age: '6-12', cv: ['pose'] },
  // Wellness
  { id: 'yoga-animals', path: '/games/yoga-animals', name: 'Yoga Animals', world: 'wellness', vibe: 'relaxed', age: '4-10', cv: ['pose'] },
  { id: 'breathing-bubbles', path: '/games/breathing-bubbles', name: 'Breathing Bubbles', world: 'wellness', vibe: 'relaxed', age: '3-8', cv: ['hand'] },
  // Sound Studio
  { id: 'music-conductor', path: '/games/music-conductor', name: 'Music Conductor', world: 'sound-studio', vibe: 'musical', age: '4-9', cv: ['pose'] },
  { id: 'beat-bounce', path: '/games/beat-bounce', name: 'Beat Bounce', world: 'sound-studio', vibe: 'musical', age: '4-8', cv: ['hand'] },
  // Body Zone
  { id: 'mirror-maze', path: '/games/mirror-maze', name: 'Mirror Maze', world: 'body-zone', vibe: 'focus', age: '5-10', cv: ['pose'] },
  { id: 'balance-beam', path: '/games/balance-beam', name: 'Balance Beam', world: 'body-zone', vibe: 'focus', age: '4-8', cv: ['pose'] },
  // Additional Games
  { id: 'odd-one-out', path: '/games/odd-one-out', name: 'Odd One Out', world: 'word-workshop', vibe: 'educational', age: '3-7', cv: ['hand'] },
  { id: 'size-sorting', path: '/games/size-sorting', name: 'Size Sorting', world: 'shape-garden', vibe: 'educational', age: '3-6', cv: ['hand'] },
  { id: 'same-and-different', path: '/games/same-and-different', name: 'Same and Different', world: 'shape-garden', vibe: 'educational', age: '3-6', cv: ['hand'] },
  { id: 'beginning-sounds', path: '/games/beginning-sounds', name: 'Beginning Sounds', world: 'word-workshop', vibe: 'educational', age: '4-7', cv: ['hand'] },
  { id: 'ending-sounds', path: '/games/ending-sounds', name: 'Ending Sounds', world: 'word-workshop', vibe: 'educational', age: '4-7', cv: ['hand'] },
];

// ─── EVALUATION CRITERIA ────────────────────────────────────────────────────

const EVALUATION_CRITERIA = {
  visuals: {
    name: 'Visuals',
    description: 'Color scheme, animations, overall aesthetic appeal',
    prompt: 'Rate the visual design (1-5): colors, animations, polish, child-friendly design'
  },
  appeal: {
    name: 'Appeal',
    description: 'Would a child want to play this? First impressions',
    prompt: 'Rate the kid appeal (1-5): is it exciting, inviting, does it grab attention?'
  },
  mechanism: {
    name: 'Mechanism',
    description: 'Core interaction, responsiveness, controls',
    prompt: 'Rate the gameplay mechanics (1-5): interactions, controls, feedback'
  },
  rules: {
    name: 'Rules',
    description: 'Clarity of objectives, instructions, win conditions',
    prompt: 'Rate rule clarity (1-5): are goals clear, is it easy to understand?'
  },
  learnings: {
    name: 'Learnings',
    description: 'Educational value, skills practiced',
    prompt: 'Rate educational value (1-5): what skills are being developed?'
  },
  fun: {
    name: 'Fun Factor',
    description: 'Engagement, replay value, enjoyment',
    prompt: 'Rate the fun factor (1-5): is it engaging, would kids want to replay?'
  }
};

// ─── CLI PARSING ────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const config = { ...DEFAULT_CONFIG };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--count':
        config.gameCount = parseInt(args[++i]);
        break;
      case '--games':
        config.specificGames = args[++i].split(',').map(g => g.trim().toLowerCase());
        break;
      case '--all':
        config.gameCount = 'all';
        break;
      case '--headless':
        config.headless = true;
        break;
      case '--list':
        config.listOnly = true;
        break;
      case '--url':
        config.baseUrl = args[++i];
        break;
      case '--output':
        config.screenshotDir = args[++i];
        break;
      case '--help':
      case '-h':
        console.log(`
Game Evaluator - CDP Testing Tool

Usage:
  node tools/cdp-game-tester.mjs [options]

Options:
  --count <n>       Number of random games to test (default: 5)
  --games <list>    Comma-separated game IDs or partial names
  --all             Test all available games
  --headless        Run in headless mode (no UI)
  --list            List all available games and exit
  --url <url>       Base URL of dev server (default: http://localhost:5173)
  --output <dir>    Screenshot output directory

Examples:
  node tools/cdp-game-tester.mjs --count 3
  node tools/cdp-game-tester.mjs --games alphabet,math
  node tools/cdp-game-tester.mjs --all --headless
        `);
        process.exit(0);
    }
  }

  return config;
}

// ─── GAME DISCOVERY ─────────────────────────────────────────────────────────

async function discoverGames(page, config) {
  console.log('🔍 Discovering games from', config.baseUrl);

  try {
    // Navigate to the games page
    await page.goto(`${config.baseUrl}/games`, { waitUntil: 'networkidle2', timeout: 15000 });

    // Wait for game cards to load
    await page.waitForSelector('.game-card, [data-testid="game-card"], a[href*="/games/"]', { timeout: 10000 });

    // Extract game information from the page
    const games = await page.evaluate(() => {
      const cards = document.querySelectorAll('[data-game-id], a[href*="/games/"]');
      const seen = new Set();
      const result = [];

      cards.forEach(card => {
        const href = card.getAttribute('href') || card.querySelector('a[href*="/games/"]')?.getAttribute('href');
        if (!href || !href.includes('/games/')) return;

        const path = href.split('?')[0]; // Remove query params
        const id = path.replace('/games/', '');
        if (seen.has(id) || id === 'games') return;
        seen.add(id);

        // Try to get game info from card
        const nameEl = card.querySelector('[class*="title"], [class*="name"], h2, h3');
        const taglineEl = card.querySelector('[class*="tagline"], p');
        const iconEl = card.querySelector('[class*="icon"], img');

        result.push({
          id,
          path,
          name: nameEl?.textContent?.trim() || id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          tagline: taglineEl?.textContent?.trim() || 'A learning game',
        });
      });

      return result;
    });

    console.log(`✅ Found ${games.length} games on the page`);
    return games;

  } catch (error) {
    console.warn(`⚠️  Could not discover games from page: ${error.message}`);
    console.log('📋 Using fallback game registry');
    return FALLBACK_GAMES;
  }
}

// ─── SCREENSHOT CAPTURE ─────────────────────────────────────────────────────

async function captureScreenshot(page, game, outputDir) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${game.id}-${timestamp}.png`;
  const filepath = join(outputDir, filename);

  await page.screenshot({
    path: filepath,
    fullPage: true,
  });

  return filepath;
}

// ─── VISUAL EVALUATION (AI-powered) ─────────────────────────────────────────

async function evaluateGameVisuals(page, game, screenshotPath) {
  // This is where we'd send the screenshot to an AI for analysis
  // For now, we'll do basic DOM-based evaluation

  const evalData = await page.evaluate(() => {
    const body = document.body;
    const computedStyle = window.getComputedStyle(body);

    // Check for common accessibility/visual issues
    const hasContrast = () => {
      // Simple contrast check
      const bgColor = computedStyle.backgroundColor;
      const textColor = computedStyle.color;
      return bgColor !== textColor; // Basic check
    };

    const hasAnimations = () => {
      return document.querySelectorAll('[class*="animate"], [class*="motion"], svg, canvas').length > 0;
    };

    const hasInstructions = () => {
      const text = body.textContent || '';
      return text.toLowerCase().includes('how to play') ||
             text.toLowerCase().includes('instructions') ||
             document.querySelector('[class*="instruction"], [class*="help"]') !== null;
    };

    const hasFeedback = () => {
      return document.querySelector('[class*="score"], [class*="progress"], [role="alert"]') !== null;
    };

    const hasError = () => {
      return body.textContent?.toLowerCase().includes('error') ||
             document.querySelector('.error, [class*="error"]') !== null;
    };

    const hasLoadingIssues = () => {
      return document.querySelector('[class*="loading"], [class*="spinner"]') !== null;
    };

    return {
      hasBasicContrast: hasContrast(),
      hasAnimations: hasAnimations(),
      hasInstructions: hasInstructions(),
      hasFeedback: hasFeedback(),
      hasError: hasError(),
      hasLoadingIssues: hasLoadingIssues(),
      elementCount: document.querySelectorAll('*').length,
      textContentLength: body.textContent?.length || 0,
    };
  });

  return {
    id: game.id,
    name: game.name,
    path: game.path,
    screenshot: screenshotPath,
    timestamp: new Date().toISOString(),
    visualChecks: evalData,
    // Scores will be filled by human or AI
    scores: {
      visuals: null,
      appeal: null,
      mechanism: null,
      rules: null,
      learnings: null,
      fun: null
    },
    notes: []
  };
}

// ─── MAIN TESTING LOOP ─────────────────────────────────────────────────────

async function runTests(config) {
  console.log('🎮 Game Evaluator - Starting Tests');
  console.log('═'.repeat(50));
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Games to test: ${config.gameCount === 'all' ? 'ALL' : config.gameCount}`);
  console.log(`Headless: ${config.headless}`);
  console.log('═'.repeat(50));

  // Ensure output directory exists
  await mkdir(config.screenshotDir, { recursive: true });

  // Launch browser
  const browser = await puppeteer.launch({
    headless: config.headless ? 'new' : false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--use-fake-ui-for-media-stream', // Auto-allow camera
      '--use-fake-device-for-media-stream',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(config.viewport);

    // Discover games
    let allGames = await discoverGames(page, config);

    // Filter games if specified
    if (config.specificGames) {
      allGames = allGames.filter(g =>
        config.specificGames.some(term =>
          g.id.includes(term) || g.name.toLowerCase().includes(term)
        )
      );
    }

    // Select games to test
    const gamesToTest = config.gameCount === 'all'
      ? allGames
      : allGames.sort(() => Math.random() - 0.5).slice(0, config.gameCount);

    console.log(`\n📋 Selected ${gamesToTest.length} games to evaluate:`);
    gamesToTest.forEach(g => console.log(`   - ${g.name} (${g.id})`));

    const results = [];

    // Test each game
    for (let i = 0; i < gamesToTest.length; i++) {
      const game = gamesToTest[i];
      console.log(`\n${'─'.repeat(50)}`);
      console.log(`[${i + 1}/${gamesToTest.length}] Testing: ${game.name}`);
      console.log(`   URL: ${config.baseUrl}${game.path}`);

      try {
        // Navigate to game
        const response = await page.goto(`${config.baseUrl}${game.path}`, {
          waitUntil: 'networkidle2',
          timeout: config.evalTimeout
        });

        if (!response.ok()) {
          throw new Error(`HTTP ${response.status()}`);
        }

        // Wait for game to load
        await new Promise(r => setTimeout(r, config.waitTime));

        // Check for errors
        const hasError = await page.evaluate(() => {
          return document.body.textContent?.toLowerCase().includes('error') ||
                 document.querySelector('.error, [class*="error"]') !== null;
        });

        if (hasError) {
          console.log(`   ⚠️  Error detected on page`);
        }

        // Take screenshot
        const screenshotPath = await captureScreenshot(page, game, config.screenshotDir);
        console.log(`   📸 Screenshot saved: ${screenshotPath}`);

        // Evaluate visuals
        const evaluation = await evaluateGameVisuals(page, game, screenshotPath);
        results.push(evaluation);

        // Print quick summary
        console.log(`   📊 Elements: ${evaluation.visualChecks.elementCount}`);
        console.log(`   ${evaluation.visualChecks.hasAnimations ? '✅' : '⚠️'} Animations`);
        console.log(`   ${evaluation.visualChecks.hasInstructions ? '✅' : '⚠️'} Instructions`);
        console.log(`   ${evaluation.visualChecks.hasFeedback ? '✅' : '⚠️'} Feedback`);

      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        results.push({
          id: game.id,
          name: game.name,
          path: game.path,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Save results
    const resultsPath = join(config.screenshotDir, `evaluation-results-${Date.now()}.json`);
    await writeFile(resultsPath, JSON.stringify({
      config,
      summary: {
        total: gamesToTest.length,
        successful: results.filter(r => !r.error).length,
        failed: results.filter(r => r.error).length
      },
      results
    }, null, 2));

    console.log(`\n${'═'.repeat(50)}`);
    console.log(`✅ Evaluation Complete!`);
    console.log(`📊 Results saved to: ${resultsPath}`);
    console.log(`📁 Screenshots in: ${config.screenshotDir}`);
    console.log(`   Successful: ${results.filter(r => !r.error).length}/${results.length}`);

    // Print summary
    if (results.length > 0) {
      console.log(`\n📈 Quick Summary:`);
      const withAnimations = results.filter(r => r.visualChecks?.hasAnimations).length;
      const withInstructions = results.filter(r => r.visualChecks?.hasInstructions).length;
      const withFeedback = results.filter(r => r.visualChecks?.hasFeedback).length;

      console.log(`   Games with animations: ${withAnimations}/${results.length}`);
      console.log(`   Games with instructions: ${withInstructions}/${results.length}`);
      console.log(`   Games with feedback: ${withFeedback}/${results.length}`);
    }

    return results;

  } finally {
    await browser.close();
  }
}

// ─── ENTRY POINT ────────────────────────────────────────────────────────────

async function main() {
  const config = parseArgs();

  if (config.listOnly) {
    console.log('📋 Available Games:\n');
    FALLBACK_GAMES.forEach(g => {
      console.log(`   ${g.id.padEnd(25)} ${g.name}`);
    });
    return;
  }

  await runTests(config);
}

main().catch(console.error);
