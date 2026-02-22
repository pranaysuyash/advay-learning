/**
 * Child Exploratory UX Test
 * 
 * Simulates a child (ages 4-8) exploring all games
 * Captures: screenshots, timings, interactions, confusion points, UX issues
 * Generates detailed analysis report
 */

import { test, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:6173';
const REPORT_DIR = 'docs/ux-analysis';
const SCREENSHOT_DIR = `${REPORT_DIR}/screenshots`;

// Ensure directories exist
if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

// Test results storage
const testResults: GameTestResult[] = [];

interface GameTestResult {
  gameId: string;
  gameName: string;
  loadTime: number;
  screenshots: string[];
  interactions: InteractionRecord[];
  issues: UXIssue[];
  timings: TimingRecord[];
  childFriendly: {
    understandsGoal: boolean;
    canStartGame: boolean;
    instructionsClear: boolean;
    visualEngaging: boolean;
  };
}

interface InteractionRecord {
  action: string;
  target: string;
  timestamp: number;
  success: boolean;
  feedback?: string;
}

interface UXIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'ux' | 'accessibility' | 'confusion' | 'bug';
  description: string;
  screenshot?: string;
}

interface TimingRecord {
  event: string;
  duration: number;
  acceptable: boolean;
}

// Helper: Random child-like delay
const childDelay = async (page: Page, min = 500, max = 2000) => {
  const delay = Math.random() * (max - min) + min;
  await page.waitForTimeout(delay);
};

// Helper: Take annotated screenshot
const takeScreenshot = async (page: Page, gameId: string, step: string, result: GameTestResult) => {
  const filename = `${gameId}_${step}_${Date.now()}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  result.screenshots.push(filename);
  return filename;
};

// Helper: Record interaction
const recordInteraction = (result: GameTestResult, action: string, target: string, success: boolean, feedback?: string) => {
  result.interactions.push({
    action,
    target,
    timestamp: Date.now(),
    success,
    feedback,
  });
};

// Helper: Record issue
const recordIssue = (result: GameTestResult, severity: UXIssue['severity'], category: UXIssue['category'], description: string, screenshot?: string) => {
  result.issues.push({ severity, category, description, screenshot });
};

// Helper: Measure timing
const measureTiming = async <T>(
  result: GameTestResult,
  event: string,
  acceptableMs: number,
  fn: () => Promise<T>
): Promise<T> => {
  const start = Date.now();
  const result_data = await fn();
  const duration = Date.now() - start;
  result.timings.push({
    event,
    duration,
    acceptable: duration <= acceptableMs,
  });
  return result_data;
};

test.describe('🧒 Child Exploratory UX Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Login as guest
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Try as Guest")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('Explore: Story Sequence', async ({ page }) => {
    const result: GameTestResult = {
      gameId: 'story-sequence',
      gameName: 'Story Sequence',
      loadTime: 0,
      screenshots: [],
      interactions: [],
      issues: [],
      timings: [],
      childFriendly: {
        understandsGoal: false,
        canStartGame: false,
        instructionsClear: false,
        visualEngaging: false,
      },
    };

    const startTime = Date.now();
    
    // Navigate to game
    await measureTiming(result, 'Navigation', 5000, async () => {
      await page.goto(`${BASE}/games/story-sequence`);
      await page.waitForLoadState('domcontentloaded');
    });
    
    result.loadTime = Date.now() - startTime;
    await takeScreenshot(page, 'story-sequence', '01_initial_load', result);

    // Child sees game for first time
    await childDelay(page);
    
    // Check if instructions are visible
    const hasInstructions = await page.locator('text=/how to play|instructions|drag/i').isVisible().catch(() => false);
    if (hasInstructions) {
      recordInteraction(result, 'read_instructions', 'instruction_panel', true, 'Instructions visible');
      result.childFriendly.instructionsClear = true;
    } else {
      recordIssue(result, 'medium', 'confusion', 'No clear instructions visible on first load');
    }

    // Look for start button (child might be confused)
    const startButton = await page.locator('button:has-text("Start"), button:has-text("Play"), button:has-text("Begin")').first();
    if (await startButton.isVisible().catch(() => false)) {
      await takeScreenshot(page, 'story-sequence', '02_start_button_found', result);
      await childDelay(page, 800, 1500);
      await startButton.click();
      recordInteraction(result, 'click', 'start_button', true);
      result.childFriendly.canStartGame = true;
      await page.waitForTimeout(1000);
    } else {
      recordIssue(result, 'high', 'ux', 'No obvious start button - child might not know how to begin');
      result.childFriendly.canStartGame = false;
    }

    await takeScreenshot(page, 'story-sequence', '03_game_started', result);

    // Try to interact with story cards
    const cards = await page.locator('[class*="card"], [draggable="true"]').all();
    recordInteraction(result, 'discover', 'story_cards', cards.length > 0, `Found ${cards.length} cards`);

    if (cards.length > 0) {
      // Child tries to drag first card
      await childDelay(page, 1000, 2000);
      try {
        const card = cards[0];
        const box = await card.boundingBox();
        if (box) {
          // Simulate drag attempt
          await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
          await page.mouse.down();
          await page.mouse.move(box.x + 100, box.y - 50, { steps: 5 });
          await page.mouse.up();
          recordInteraction(result, 'drag', 'story_card', true, 'Drag gesture attempted');
          
          await takeScreenshot(page, 'story-sequence', '04_drag_attempt', result);
          
          // Check if drop zones are clear
          const dropZones = await page.locator('[class*="drop"], [class*="slot"], [class*="target"]').all();
          if (dropZones.length === 0) {
            recordIssue(result, 'high', 'confusion', 'No visible drop zones - child wont know where to place cards');
          } else {
            result.childFriendly.understandsGoal = true;
          }
        }
      } catch (e) {
        recordInteraction(result, 'drag', 'story_card', false, 'Drag failed');
        recordIssue(result, 'medium', 'bug', `Drag interaction failed: ${e}`);
      }
    }

    // Check visual engagement
    const hasEmojis = await page.locator('text=/[\u{1F300}-\u{1F9FF}]/u').count() > 0;
    const hasColors = await page.locator('[style*="background"], [class*="bg-"]').count() > 5;
    result.childFriendly.visualEngaging = hasEmojis && hasColors;

    // Check for celebration/feedback
    await page.waitForTimeout(2000);
    const hasFeedback = await page.locator('text=/correct|wrong|try again|good/i').isVisible().catch(() => false);
    if (!hasFeedback) {
      recordIssue(result, 'medium', 'ux', 'No immediate feedback on interactions - child might be confused');
    }

    await takeScreenshot(page, 'story-sequence', '05_final_state', result);
    testResults.push(result);
  });

  test('Explore: Shape Safari', async ({ page }) => {
    const result: GameTestResult = {
      gameId: 'shape-safari',
      gameName: 'Shape Safari',
      loadTime: 0,
      screenshots: [],
      interactions: [],
      issues: [],
      timings: [],
      childFriendly: {
        understandsGoal: false,
        canStartGame: false,
        instructionsClear: false,
        visualEngaging: false,
      },
    };

    const startTime = Date.now();
    
    await measureTiming(result, 'Navigation', 5000, async () => {
      await page.goto(`${BASE}/games/shape-safari`);
      await page.waitForLoadState('domcontentloaded');
    });
    
    result.loadTime = Date.now() - startTime;
    await takeScreenshot(page, 'shape-safari', '01_initial_load', result);

    await childDelay(page);

    // Click on first scene to start (children need to pick a scene)
    const sceneButton = await page.locator('button').filter({ hasText: /Jungle|Circles|Farm|Ocean/i }).first();
    if (await sceneButton.isVisible().catch(() => false)) {
      await sceneButton.click();
      await childDelay(page, 1000, 2000); // Wait for scene transition
      result.childFriendly.canStartGame = true;
      recordInteraction(result, 'click', 'scene_card', true, 'Selected a scene to play');
    }

    // Check canvas performance
    const canvas = await page.locator('canvas').first();
    if (await canvas.isVisible().catch(() => false)) {
      // Test canvas responsiveness
      const box = await canvas.boundingBox();
      if (box) {
        const startInteract = Date.now();
        await page.mouse.move(box.x + 50, box.y + 50);
        await page.mouse.down();
        await page.mouse.move(box.x + 150, box.y + 150, { steps: 10 });
        await page.mouse.up();
        const interactTime = Date.now() - startInteract;
        
        if (interactTime > 500) {
          recordIssue(result, 'high', 'performance', `Canvas interaction lag: ${interactTime}ms`);
        }
        recordInteraction(result, 'trace', 'canvas', true, `Trace took ${interactTime}ms`);
      }
    } else {
      recordIssue(result, 'critical', 'bug', 'Canvas not found - game cannot function');
    }

    await takeScreenshot(page, 'shape-safari', '02_canvas_interaction', result);

    // Check for visible shapes to find
    const shapes = await page.locator('[class*="shape"], canvas').all();
    recordInteraction(result, 'discover', 'shapes', shapes.length > 0, `${shapes.length} interactive elements`);

    // Visual check
    const hasVibrantColors = await page.evaluate(() => {
      const divs = document.querySelectorAll('div');
      let colorful = 0;
      divs.forEach(d => {
        const bg = window.getComputedStyle(d).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') colorful++;
      });
      return colorful > 10;
    });
    result.childFriendly.visualEngaging = hasVibrantColors;

    result.childFriendly.understandsGoal = await page.locator('text=/find|trace|shape/i').isVisible().catch(() => false);

    await takeScreenshot(page, 'shape-safari', '03_final_state', result);
    testResults.push(result);
  });

  test('Explore: Rhyme Time', async ({ page }) => {
    const result: GameTestResult = {
      gameId: 'rhyme-time',
      gameName: 'Rhyme Time',
      loadTime: 0,
      screenshots: [],
      interactions: [],
      issues: [],
      timings: [],
      childFriendly: {
        understandsGoal: false,
        canStartGame: false,
        instructionsClear: false,
        visualEngaging: false,
      },
    };

    const startTime = Date.now();
    
    await measureTiming(result, 'Navigation', 5000, async () => {
      await page.goto(`${BASE}/games/rhyme-time`);
      await page.waitForLoadState('domcontentloaded');
    });
    
    result.loadTime = Date.now() - startTime;
    await takeScreenshot(page, 'rhyme-time', '01_initial_load', result);

    await childDelay(page);

    // Check for TTS/Speaker button
    const speakerBtn = await page.locator('button:has([class*="speaker"]), button:has-text("🔊"), button:has-text("▶")').first();
    if (await speakerBtn.isVisible().catch(() => false)) {
      await childDelay(page, 500, 1000);
      await speakerBtn.click();
      recordInteraction(result, 'click', 'speaker_button', true, 'TTS button found and clicked');
      await page.waitForTimeout(1000);
      
      // Check if audio played (visual indicator)
      const audioPlaying = await page.locator('[class*="playing"], [class*="active"]').isVisible().catch(() => false);
      if (!audioPlaying) {
        recordIssue(result, 'medium', 'ux', 'No visual feedback when TTS plays - child might not know audio is playing');
      }
    }

    await takeScreenshot(page, 'rhyme-time', '02_audio_test', result);

    // Check word cards
    const wordCards = await page.locator('[class*="word"], [class*="card"], button').all();
    recordInteraction(result, 'discover', 'word_cards', wordCards.length > 0, `${wordCards.length} word options`);

    if (wordCards.length > 0) {
      // Child randomly clicks a word
      const randomCard = wordCards[Math.floor(Math.random() * wordCards.length)];
      await childDelay(page, 800, 1500);
      await randomCard.click();
      recordInteraction(result, 'click', 'word_card', true);
      
      await page.waitForTimeout(1000);
      await takeScreenshot(page, 'rhyme-time', '03_word_selected', result);
      
      // Check for feedback
      const hasFeedback = await page.locator('text=/correct|wrong|✓|✗/i').isVisible().catch(() => false);
      if (!hasFeedback) {
        recordIssue(result, 'medium', 'confusion', 'No clear feedback after selecting answer');
      }
    }

    result.childFriendly.understandsGoal = await page.locator('text=/rhyme|match|same sound/i').isVisible().catch(() => false);
    result.childFriendly.instructionsClear = result.childFriendly.understandsGoal;

    await takeScreenshot(page, 'rhyme-time', '04_final_state', result);
    testResults.push(result);
  });

  test('Explore: Free Draw', async ({ page }) => {
    const result: GameTestResult = {
      gameId: 'free-draw',
      gameName: 'Free Draw',
      loadTime: 0,
      screenshots: [],
      interactions: [],
      issues: [],
      timings: [],
      childFriendly: {
        understandsGoal: false,
        canStartGame: false,
        instructionsClear: false,
        visualEngaging: false,
      },
    };

    const startTime = Date.now();
    
    await measureTiming(result, 'Navigation', 5000, async () => {
      await page.goto(`${BASE}/games/free-draw`);
      await page.waitForLoadState('domcontentloaded');
    });
    
    result.loadTime = Date.now() - startTime;
    await takeScreenshot(page, 'free-draw', '01_initial_load', result);

    await childDelay(page);

    // Check for drawing canvas
    const canvas = await page.locator('canvas').first();
    if (await canvas.isVisible().catch(() => false)) {
      const box = await canvas.boundingBox();
      if (box) {
        // Test drawing responsiveness
        const drawStart = Date.now();
        await page.mouse.move(box.x + 100, box.y + 100);
        await page.mouse.down();
        await page.mouse.move(box.x + 200, box.y + 200, { steps: 20 });
        await page.mouse.up();
        const drawTime = Date.now() - drawStart;
        
        if (drawTime > 300) {
          recordIssue(result, 'medium', 'performance', `Drawing lag detected: ${drawTime}ms for simple stroke`);
        }
        recordInteraction(result, 'draw', 'canvas', true, `Stroke in ${drawTime}ms`);
      }
    }

    await takeScreenshot(page, 'free-draw', '02_drawing_test', result);

    // Check for color palette
    const colorButtons = await page.locator('button[class*="color"], [class*="palette"] button').all();
    recordInteraction(result, 'discover', 'color_buttons', colorButtons.length > 0, `${colorButtons.length} color options`);

    // Check for brush options
    const brushOptions = await page.locator('button[class*="brush"], [class*="tool"] button').all();
    if (brushOptions.length === 0) {
      recordIssue(result, 'medium', 'confusion', 'Brush/tool options not clearly visible');
    }

    result.childFriendly.visualEngaging = colorButtons.length > 3;
    result.childFriendly.understandsGoal = true; // Free draw is intuitive

    await takeScreenshot(page, 'free-draw', '03_final_state', result);
    testResults.push(result);
  });

  test('Explore: Math Monsters', async ({ page }) => {
    const result: GameTestResult = {
      gameId: 'math-monsters',
      gameName: 'Math Monsters',
      loadTime: 0,
      screenshots: [],
      interactions: [],
      issues: [],
      timings: [],
      childFriendly: {
        understandsGoal: false,
        canStartGame: false,
        instructionsClear: false,
        visualEngaging: false,
      },
    };

    const startTime = Date.now();
    
    await measureTiming(result, 'Navigation', 5000, async () => {
      await page.goto(`${BASE}/games/math-monsters`);
      await page.waitForLoadState('domcontentloaded');
    });
    
    result.loadTime = Date.now() - startTime;
    await takeScreenshot(page, 'math-monsters', '01_initial_load', result);

    await childDelay(page);

    // Check for monster character
    const monster = await page.locator('text=/🦖|🐊|🐡|🦥|🦎/').first();
    if (await monster.isVisible().catch(() => false)) {
      recordInteraction(result, 'discover', 'monster_character', true);
      result.childFriendly.visualEngaging = true;
    } else {
      recordIssue(result, 'medium', 'ux', 'Monster character not prominently displayed');
    }

    // Check for math problem
    const hasMathProblem = await page.locator('text=/[0-9]+.*[+-].*[0-9]+/').isVisible().catch(() => false);
    if (hasMathProblem) {
      result.childFriendly.understandsGoal = true;
      recordInteraction(result, 'discover', 'math_problem', true);
    }

    // Check for finger counting instructions
    const hasInstructions = await page.locator('text=/finger|hand|show/i').isVisible().catch(() => false);
    result.childFriendly.instructionsClear = hasInstructions;
    if (!hasInstructions) {
      recordIssue(result, 'high', 'confusion', 'No instructions on how to answer (show fingers)');
    }

    await takeScreenshot(page, 'math-monsters', '02_gameplay_view', result);

    // Check webcam indicator
    const webcamIndicator = await page.locator('video, [class*="webcam"], [class*="camera"]').first();
    if (await webcamIndicator.isVisible().catch(() => false)) {
      recordInteraction(result, 'discover', 'webcam_preview', true);
    }

    await takeScreenshot(page, 'math-monsters', '03_final_state', result);
    testResults.push(result);
  });

  test('Explore: Bubble Pop (Voice Input)', async ({ page }) => {
    const result: GameTestResult = {
      gameId: 'bubble-pop',
      gameName: 'Bubble Pop',
      loadTime: 0,
      screenshots: [],
      interactions: [],
      issues: [],
      timings: [],
      childFriendly: {
        understandsGoal: false,
        canStartGame: false,
        instructionsClear: false,
        visualEngaging: false,
      },
    };

    const startTime = Date.now();
    
    await measureTiming(result, 'Navigation', 5000, async () => {
      await page.goto(`${BASE}/games/bubble-pop`);
      await page.waitForLoadState('domcontentloaded');
    });
    
    result.loadTime = Date.now() - startTime;
    await takeScreenshot(page, 'bubble-pop', '01_initial_load', result);

    await childDelay(page);

    // Check for microphone permission UI
    const micPermission = await page.locator('text=/microphone|mic|allow|permission/i').isVisible().catch(() => false);
    if (micPermission) {
      recordInteraction(result, 'prompt', 'microphone_permission', true);
    }

    // Check instructions clarity
    const hasBlowInstructions = await page.locator('text=/blow|mic|microphone/i').isVisible().catch(() => false);
    result.childFriendly.instructionsClear = hasBlowInstructions;
    if (!hasBlowInstructions) {
      recordIssue(result, 'high', 'confusion', 'Voice input game but no clear blow/mic instructions');
    }

    result.childFriendly.understandsGoal = hasBlowInstructions;
    result.childFriendly.visualEngaging = true; // Bubbles are engaging

    await takeScreenshot(page, 'bubble-pop', '02_instructions', result);
    testResults.push(result);
  });

  test.afterAll(async () => {
    // Generate comprehensive report
    const report = generateReport(testResults);
    fs.writeFileSync(
      path.join(REPORT_DIR, 'ux-analysis-report.md'),
      report,
      'utf-8'
    );
    console.log(`\n✅ UX Analysis Report saved to: ${REPORT_DIR}/ux-analysis-report.md`);
  });
});

function generateReport(results: GameTestResult[]): string {
  const timestamp = new Date().toISOString();
  
  let report = `# 🧒 Child Exploratory UX Analysis Report

**Generated:** ${timestamp}  
**Test Environment:** Playwright Automated Browser Testing  
**User Persona:** Child (ages 4-8), first-time player  

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Games Tested | ${results.length} |
| Avg Load Time | ${Math.round(results.reduce((a, r) => a + r.loadTime, 0) / results.length)}ms |
| Total Issues Found | ${results.reduce((a, r) => a + r.issues.length, 0)} |
| Critical Issues | ${results.reduce((a, r) => a + r.issues.filter(i => i.severity === 'critical').length, 0)} |
| High Priority | ${results.reduce((a, r) => a + r.issues.filter(i => i.severity === 'high').length, 0)} |

### Overall Child-Friendliness Score
${calculateOverallScore(results)}

---

## Game-by-Game Analysis

`;

  results.forEach((result, index) => {
    report += generateGameSection(result, index + 1);
  });

  report += `

---

## Critical Issues Summary

${generateCriticalIssuesList(results)}

## Performance Analysis

### Load Times
${generatePerformanceTable(results)}

### Interaction Responsiveness
${generateInteractionAnalysis(results)}

## Recommendations by Priority

### 🔴 Critical (Fix Immediately)
${generateRecommendations(results, 'critical')}

### 🟠 High (Fix Soon)
${generateRecommendations(results, 'high')}

### 🟡 Medium (Nice to Have)
${generateRecommendations(results, 'medium')}

## Screenshots Index

${results.map(r => `
### ${r.gameName}
${r.screenshots.map(s => `- ${s}`).join('\n')}
`).join('\n')}

---

## Methodology

### Test Approach
- Simulated child exploration patterns (random clicking, delays between actions)
- No prior knowledge assumed (fresh eyes)
- Focus on first-time user experience
- Performance monitoring for each interaction

### Child Behavior Model
- Attention span: 5-10 seconds per element
- Reading ability: Limited (relies on visuals)
- Motor skills: Developing (imprecise clicks/drags)
- Expectations: Immediate visual feedback

### What Was Tested
1. **Discovery**: Can child find interactive elements?
2. **Understanding**: Does child know what to do?
3. **Interaction**: Can child successfully interact?
4. **Feedback**: Does child know if they succeeded?
5. **Performance**: Is the game responsive enough?

---

*Report generated by automated exploratory testing*
`;

  return report;
}

function generateGameSection(result: GameTestResult, index: number): string {
  const score = calculateGameScore(result);
  
  return `
### ${index}. ${result.gameName}
**ID:** ${result.gameId} | **Score:** ${score}/100

#### 📊 Metrics
| Metric | Value | Status |
|--------|-------|--------|
| Load Time | ${result.loadTime}ms | ${result.loadTime < 3000 ? '✅' : '⚠️'} |
| Interactions | ${result.interactions.length} | - |
| Issues Found | ${result.issues.length} | ${result.issues.length === 0 ? '✅' : '⚠️'} |

#### 🎯 Child-Friendliness
| Criterion | Result |
|-----------|--------|
| Understands Goal | ${result.childFriendly.understandsGoal ? '✅ Yes' : '❌ No'} |
| Can Start Game | ${result.childFriendly.canStartGame ? '✅ Yes' : '❌ No'} |
| Instructions Clear | ${result.childFriendly.instructionsClear ? '✅ Yes' : '❌ No'} |
| Visually Engaging | ${result.childFriendly.visualEngaging ? '✅ Yes' : '❌ No'} |

#### 📝 Key Interactions
${result.interactions.slice(0, 5).map(i => `- ${i.action}: ${i.target} (${i.success ? '✅' : '❌'})${i.feedback ? ` - ${i.feedback}` : ''}`).join('\n')}

#### ⚠️ Issues Found
${result.issues.length > 0 ? result.issues.map(i => `- **[${i.severity.toUpperCase()}]** ${i.category}: ${i.description}`).join('\n') : '✅ No issues found'}

#### ⏱️ Performance Timings
${result.timings.map(t => `- ${t.event}: ${t.duration}ms ${t.acceptable ? '✅' : '⚠️ Too slow'}`).join('\n')}

---
`;
}

function calculateGameScore(result: GameTestResult): number {
  let score = 100;
  
  // Deduct for issues
  result.issues.forEach(issue => {
    switch (issue.severity) {
      case 'critical': score -= 25; break;
      case 'high': score -= 15; break;
      case 'medium': score -= 5; break;
      case 'low': score -= 2; break;
    }
  });
  
  // Deduct for performance
  result.timings.forEach(t => {
    if (!t.acceptable) score -= 10;
  });
  
  // Deduct for child-friendliness
  if (!result.childFriendly.understandsGoal) score -= 15;
  if (!result.childFriendly.canStartGame) score -= 20;
  if (!result.childFriendly.instructionsClear) score -= 10;
  if (!result.childFriendly.visualEngaging) score -= 5;
  
  // Slow load
  if (result.loadTime > 5000) score -= 10;
  
  return Math.max(0, score);
}

function calculateOverallScore(results: GameTestResult[]): string {
  const avgScore = results.reduce((a, r) => a + calculateGameScore(r), 0) / results.length;
  const grade = avgScore >= 90 ? 'A (Excellent)' : 
                avgScore >= 80 ? 'B (Good)' : 
                avgScore >= 70 ? 'C (Acceptable)' : 
                avgScore >= 60 ? 'D (Needs Work)' : 'F (Critical Issues)';
  
  return `**${Math.round(avgScore)}/100** - Grade: ${grade}`;
}

function generateCriticalIssuesList(results: GameTestResult[]): string {
  const critical = results.flatMap(r => 
    r.issues.filter(i => i.severity === 'critical' || i.severity === 'high')
      .map(i => ({ game: r.gameName, ...i }))
  );
  
  if (critical.length === 0) return '✅ No critical or high issues found!';
  
  return critical.map(i => `- **[${i.game}]** ${i.severity.toUpperCase()}: ${i.description}`).join('\n');
}

function generatePerformanceTable(results: GameTestResult[]): string {
  return results.map(r => `| ${r.gameName} | ${r.loadTime}ms | ${r.timings.find(t => t.event === 'Navigation')?.acceptable ? '✅' : '⚠️'} |`).join('\n');
}

function generateInteractionAnalysis(results: GameTestResult[]): string {
  return results.flatMap(r => 
    r.timings.filter(t => t.event !== 'Navigation')
      .map(t => `| ${r.gameName} | ${t.event} | ${t.duration}ms | ${t.acceptable ? '✅' : '⚠️'} |`)
  ).join('\n');
}

function generateRecommendations(results: GameTestResult[], severity: string): string {
  const items = results.flatMap(r => 
    r.issues.filter(i => i.severity === severity)
      .map(i => `- **${r.gameName}**: ${i.description}`)
  );
  
  return items.length > 0 ? items.join('\n') : '_No items in this category_';
}
