#!/usr/bin/env node
/**
 * Game Quality Audit Script
 * 
 * Automatically checks all 39 games for:
 * - Error handling patterns
 * - Progress integration
 * - Subscription access control
 * - Console.log/debug code
 * - CV hook usage
 * - Wellness features
 * - Reduce motion support
 */

const fs = require('fs');
const path = require('path');

// Game files to audit
const GAME_FILES = [
  'AlphabetGame.tsx',
  'LetterHunt.tsx',
  'PhonicsSounds.tsx',
  'PhonicsTracing.tsx',
  'BeginningSounds.tsx',
  'WordBuilder.tsx',
  'RhymeTime.tsx',
  'FingerNumberShow.tsx',
  'NumberTracing.tsx',
  'NumberTapTrail.tsx',
  'MathMonsters.tsx',
  'ShapePop.tsx',
  'ShapeSequence.tsx',
  'ShapeSafari.tsx',
  'ColorMatchGarden.tsx',
  'ColorByNumber.tsx',
  'MemoryMatch.tsx',
  'ConnectTheDots.tsx',
  'MirrorDraw.tsx',
  'FreeDraw.tsx',
  'MusicPinchBeat.tsx',
  'BubblePopSymphony.tsx',
  'BubblePop.tsx',
  'YogaAnimals.tsx',
  'FreezeDance.tsx',
  'SimonSays.tsx',
  'SteadyHandLab.tsx',
  'AirCanvas.tsx',
  'VirtualChemistryLab.tsx',
  'PhysicsDemo.tsx',
  'EmojiMatch.tsx',
  'StorySequence.tsx',
  'DressForWeather.tsx',
  'PlatformerRunner.tsx',
  'OddOneOut.tsx',
  'ShadowPuppetTheater.tsx',
  'VirtualBubbles.tsx',
  'KaleidoscopeHands.tsx',
  'DiscoveryLab.tsx',
];

const GAME_DIR = path.join(__dirname, '../src/frontend/src/pages');
const GAMES_SUBDIR = path.join(__dirname, '../src/frontend/src/games');

// Patterns to check
const PATTERNS = {
  // Good patterns
  hasErrorHandling: /try\s*{[\s\S]*?}\s*catch\s*\(/,
  hasProgressIntegration: /useProgressStore|progressQueue|recordProgress/,
  hasSubscriptionCheck: /canAccessGame|subscription|accessControl/,
  hasWellnessFeatures: /WellnessTimer|WellnessReminder|useWellness/,
  hasReduceMotion: /useReducedMotion|reducedMotion|prefers-reduced-motion/,
  hasCVHooks: /useGameHandTracking|usePoseTracking|useFaceTracking|useHandTracking/,
  hasAudioFeedback: /useAudio|playSuccess|playError|playCelebration/,
  hasTTS: /useTTS|speak\(/,
  hasGameDrops: /useGameDrops|triggerEasterEgg|onGameComplete/,
  hasErrorBoundary: /GlobalErrorBoundary|ErrorBoundary|try.*catch/,
  
  // Bad patterns
  hasConsoleLog: /console\.(log|warn|error|debug)\(/,
  hasTODO: /\/\/\s*(TODO|FIXME|HACK|XXX)/i,
  hasAnyPattern: /debugger|alert\(|confirm\(/,
};

// Scoring weights
const WEIGHTS = {
  hasErrorHandling: 10,
  hasProgressIntegration: 10,
  hasSubscriptionCheck: 15,
  hasWellnessFeatures: 5,
  hasReduceMotion: 10,
  hasCVHooks: 10,
  hasAudioFeedback: 10,
  hasTTS: 5,
  hasGameDrops: 10,
  hasErrorBoundary: 15,
  
  // Penalties
  hasConsoleLog: -2,
  hasTODO: -1,
  hasAnyPattern: -5,
};

function auditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const results = {
    file: path.basename(filePath),
    path: filePath,
    lineCount: lines.length,
    patterns: {},
    score: 0,
    issues: [],
    strengths: [],
  };
  
  // Check each pattern
  for (const [patternName, pattern] of Object.entries(PATTERNS)) {
    const matches = content.match(pattern);
    results.patterns[patternName] = !!matches;
    
    const weight = WEIGHTS[patternName];
    if (weight) {
      results.score += weight * (matches ? 1 : 0);
    }
  }
  
  // Identify specific issues
  lines.forEach((line, idx) => {
    if (/console\.(log|warn|error|debug)\(/.test(line) && !/\/\/\s*audit-ignore/.test(line)) {
      results.issues.push({
        type: 'CONSOLE_LOG',
        line: idx + 1,
        content: line.trim(),
      });
    }
    
    if (/\/\/\s*(TODO|FIXME|HACK|XXX)/i.test(line)) {
      results.issues.push({
        type: 'TODO_COMMENT',
        line: idx + 1,
        content: line.trim(),
      });
    }
    
    if (/alert\(|confirm\(/.test(line)) {
      results.issues.push({
        type: 'BLOCKING_UI',
        line: idx + 1,
        content: line.trim(),
      });
    }
  });
  
  // Identify strengths
  if (results.patterns.hasErrorHandling) {
    results.strengths.push('Has error handling');
  }
  if (results.patterns.hasProgressIntegration) {
    results.strengths.push('Tracks progress');
  }
  if (results.patterns.hasSubscriptionCheck) {
    results.strengths.push('Respects subscription');
  }
  if (results.patterns.hasReduceMotion) {
    results.strengths.push('Accessibility: reduce motion');
  }
  if (results.patterns.hasCVHooks) {
    results.strengths.push('Computer vision integrated');
  }
  if (results.patterns.hasAudioFeedback) {
    results.strengths.push('Audio feedback');
  }
  
  return results;
}

function runAudit() {
  console.log('🔍 Starting Game Quality Audit...\n');
  console.log(`Auditing ${GAME_FILES.length} games\n`);
  
  const allResults = [];
  let totalScore = 0;
  // Per-game max score (fixed constant, not accumulating across games)
  const perGameMax = Object.values(WEIGHTS).filter(w => w > 0).reduce((a, b) => a + b, 0);
  
  GAME_FILES.forEach(gameFile => {
    // Check in pages directory
    let filePath = path.join(GAME_DIR, gameFile);
    if (!fs.existsSync(filePath)) {
      // Check in games subdirectory
      filePath = path.join(GAMES_SUBDIR, gameFile);
    }
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${gameFile}`);
      return;
    }
    
    const result = auditFile(filePath);
    allResults.push(result);
    totalScore += result.score;
  });
  const maxPossibleScore = perGameMax * allResults.length;
  
  // Sort by score (worst first)
  allResults.sort((a, b) => a.score - b.score);
  
  // Generate report
  console.log('='.repeat(80));
  console.log('📊 AUDIT SUMMARY');
  console.log('='.repeat(80));
  console.log(`\nTotal Games Audited: ${allResults.length}`);
  console.log(`Average Score: ${(totalScore / allResults.length).toFixed(1)}/${perGameMax.toFixed(1)}`);
  console.log(`Total Score: ${totalScore}/${maxPossibleScore}\n`);
  
  console.log('='.repeat(80));
  console.log('🚨 CRITICAL ISSUES (Games with score < 60% of average)');
  console.log('='.repeat(80));
  const avgScore = totalScore / allResults.length;
  const criticalGames = allResults.filter(r => r.score < avgScore * 0.6);
  
  if (criticalGames.length === 0) {
    console.log('✅ No critical issues found!\n');
  } else {
    criticalGames.forEach(game => {
      console.log(`\n❌ ${game.file} (Score: ${game.score}/${perGameMax})`);
      console.log(`   Path: ${game.path}`);
      console.log(`   Issues: ${game.issues.length}`);
      if (game.issues.length > 0) {
        game.issues.slice(0, 5).forEach(issue => {
          console.log(`   - Line ${issue.line}: ${issue.type} - "${issue.content.substring(0, 60)}..."`);
        });
      }
    });
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('⚠️  GAMES NEEDING IMPROVEMENT (Score < 80% of average)');
  console.log('='.repeat(80));
  const needsImprovement = allResults.filter(r => r.score < avgScore * 0.8 && r.score >= avgScore * 0.6);
  
  if (needsImprovement.length === 0) {
    console.log('✅ All games meet quality standards!\n');
  } else {
    needsImprovement.forEach(game => {
      console.log(`\n⚠️  ${game.file} (Score: ${game.score}/${perGameMax})`);
      const missingCount = Object.entries(game.patterns).filter(([key, value]) => !value && WEIGHTS[key] > 0).length;
      console.log(`   Missing: ${missingCount} quality features`);
      const missing = Object.entries(game.patterns)
        .filter(([key, value]) => !value && WEIGHTS[key] > 0)
        .map(([key]) => key);
      console.log(`   Missing features: ${missing.join(', ')}`);
    });
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ TOP PERFORMING GAMES (Score >= average)');
  console.log('='.repeat(80));
  const topGames = allResults.filter(r => r.score >= avgScore);
  
  topGames.forEach(game => {
    console.log(`\n⭐ ${game.file} (Score: ${game.score}/${maxPossibleScore})`);
    console.log(`   Strengths: ${game.strengths.join(', ')}`);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('📋 COMMON ISSUES ACROSS ALL GAMES');
  console.log('='.repeat(80));
  
  const issueCounts = {};
  allResults.forEach(game => {
    game.issues.forEach(issue => {
      issueCounts[issue.type] = (issueCounts[issue.type] || 0) + 1;
    });
  });
  
  Object.entries(issueCounts).forEach(([type, count]) => {
    console.log(`\n${type}: ${count} occurrences`);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('📝 DETAILED RESULTS BY GAME');
  console.log('='.repeat(80));
  
  allResults.forEach(game => {
    console.log(`\n${game.file}`);
    console.log(`  Score: ${game.score}/${maxPossibleScore}`);
    console.log(`  Lines: ${game.lineCount}`);
    console.log(`  Strengths: ${game.strengths.length}`);
    console.log(`  Issues: ${game.issues.length}`);
    console.log(`  Patterns detected:`);
    Object.entries(game.patterns).forEach(([pattern, detected]) => {
      console.log(`    ${detected ? '✅' : '❌'} ${pattern}`);
    });
  });
  
  // Write JSON report
  const reportPath = path.join(__dirname, '../docs/audit/game_quality_audit_results.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalGames: allResults.length,
      averageScore: totalScore / allResults.length,
      maxPossibleScore: maxPossibleScore / allResults.length,
      criticalGames: criticalGames.length,
      needsImprovement: needsImprovement.length,
      topPerformers: topGames.length,
    },
    games: allResults,
  }, null, 2));
  
  console.log(`\n\n📄 Full JSON report written to: ${reportPath}`);
  console.log('\n✅ Audit complete!\n');
}

// Run the audit
runAudit();
