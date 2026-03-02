#!/usr/bin/env node
/**
 * Batch Game Upgrade Script
 * 
 * Prepares game files for manual quality upgrades by adding safe shared imports
 * and simple boilerplate where it can do so without rewriting component logic.
 */

const fs = require('fs');
const path = require('path');

// Games to upgrade (excluding already done: PhysicsDemo, NumberTracing)
const GAMES_TO_UPGRADE = [
  'ColorByNumber.tsx',
  'OddOneOut.tsx',
  'ShadowPuppetTheater.tsx',
  'KaleidoscopeHands.tsx',
  'DiscoveryLab.tsx',
  'PhonicsTracing.tsx',
  'BeginningSounds.tsx',
  'BubblePop.tsx',
  'YogaAnimals.tsx',
  'PlatformerRunner.tsx',
  'VirtualBubbles.tsx',
  'FreeDraw.tsx',
  'LetterHunt.tsx',
  'RhymeTime.tsx',
  'FingerNumberShow.tsx',
  'NumberTapTrail.tsx',
  'MathMonsters.tsx',
  'ShapePop.tsx',
  'ShapeSequence.tsx',
  'ShapeSafari.tsx',
  'MemoryMatch.tsx',
  'MusicPinchBeat.tsx',
  'VirtualChemistryLab.tsx',
  'EmojiMatch.tsx',
  'StorySequence.tsx',
  'SimonSays.tsx',
  'PhonicsSounds.tsx',
  'WordBuilder.tsx',
  'ColorMatchGarden.tsx',
  'ConnectTheDots.tsx',
  'MirrorDraw.tsx',
  'BubblePopSymphony.tsx',
  'FreezeDance.tsx',
  'SteadyHandLab.tsx',
  'AirCanvas.tsx',
  'DressForWeather.tsx',
  'AlphabetGame.tsx',
];

const PAGES_DIR = path.join(__dirname, '../src/frontend/src/pages');

// Import block to add
const IMPORTS_TO_ADD = `
import { memo } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import { AccessDenied } from '../components/ui/AccessDenied';
import { progressQueue } from '../services/progressQueue';
import { useProgressStore } from '../store';
import WellnessTimer from '../components/WellnessTimer';
import { GlobalErrorBoundary } from '../components/errors/GlobalErrorBoundary';
`;

function insertAfterLastImport(content, block) {
  const importMatches = [...content.matchAll(/^import .*;$/gm)];
  if (importMatches.length === 0) {
    return `${block.trim()}\n\n${content}`;
  }

  const lastImport = importMatches[importMatches.length - 1];
  const insertAt = lastImport.index + lastImport[0].length;
  return `${content.slice(0, insertAt)}\n${block.trim()}${content.slice(insertAt)}`;
}

// Pattern to detect if file already has subscription check
function hasSubscriptionCheck(content) {
  return content.includes('useSubscription') && content.includes('canAccessGame');
}

// Pattern to detect if file already has progress tracking
function hasProgressTracking(content) {
  return content.includes('progressQueue.add');
}

// Pattern to detect if file already has error handling
function hasErrorHandling(content) {
  return content.includes('setError') && content.includes('useState<Error>');
}

// Pattern to detect if file already has wellness timer
function hasWellnessTimer(content) {
  return content.includes('WellnessTimer');
}

function upgradeGame(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  const fileName = path.basename(filePath);
  
  const changes = {
    imports: false,
    subscription: false,
    progress: false,
    errorHandling: false,
    wellness: false,
  };
  
  // Skip if already upgraded
  if (hasSubscriptionCheck(content) && hasProgressTracking(content)) {
    console.log(`⏭️  Skipping ${fileName} (already upgraded)`);
    return false;
  }
  
  console.log(`\n🔧 Upgrading ${fileName}...`);
  
  // 1. Add imports after existing React imports
  if (!content.includes('useSubscription')) {
    const reactImportMatch = content.match(/import\s+{[^}]*}\s+from\s+['"]react['"];?/);
    if (reactImportMatch) {
      content = insertAfterLastImport(content, IMPORTS_TO_ADD);
      changes.imports = true;
      console.log('  ✅ Added imports');
    }
  }
  
  // 2. Memo wrapping requires AST-safe edits; leave this for manual review.
  if (!content.includes('memo(function') && !content.includes('memo(')) {
    console.log('  ℹ️ Skipped automatic memo wrapper (manual review required)');
  }
  
  // 3. Add error state if not present
  if (!content.includes('setError') && !content.includes('Error | null')) {
    const stateMatch = content.match(/const \[state, setState\] = useState/);
    if (stateMatch) {
      const errorState = `\n  const [error, setError] = useState<Error | null>(null);`;
      content = content.replace(stateMatch[0], stateMatch[0] + errorState);
      changes.errorHandling = true;
      console.log('  ✅ Added error state');
    }
  }
  
  // 4. Subscription guard insertion is left for manual review to avoid hook-order regressions.
  if (!content.includes('canAccessGame')) {
    console.log('  ℹ️ Skipped automatic subscription guard insertion (manual review required)');
  }
  
  // 5. Add WellnessTimer before closing GameContainer
  if (!content.includes('WellnessTimer')) {
    const gameContainerClose = content.match(/<\/GameContainer>/);
    if (gameContainerClose) {
      const wellnessTimer = '\n        <WellnessTimer />\n      ';
      const index = gameContainerClose.index;
      content = content.slice(0, index) + wellnessTimer + content.slice(index);
      changes.wellness = true;
      console.log('  ✅ Added WellnessTimer');
    }
  }
  
  // Write if changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  💾 Saved ${fileName}`);
    return true;
  }
  
  return false;
}

function main() {
  console.log('🚀 Starting Batch Game Upgrade...\n');
  
  let upgraded = 0;
  let skipped = 0;
  let errors = 0;
  
  GAMES_TO_UPGRADE.forEach(gameFile => {
    const filePath = path.join(PAGES_DIR, gameFile);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${gameFile}`);
      errors++;
      return;
    }
    
    try {
      const result = upgradeGame(filePath);
      if (result) {
        upgraded++;
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`❌ Error upgrading ${gameFile}:`, error.message);
      errors++;
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Upgrade Summary');
  console.log('='.repeat(60));
  console.log(`✅ Upgraded: ${upgraded} games`);
  console.log(`⏭️  Skipped: ${skipped} games`);
  console.log(`❌ Errors: ${errors} games`);
  console.log('='.repeat(60));
  
  if (upgraded > 0) {
    console.log('\n⚠️  MANUAL REVIEW REQUIRED:');
    console.log('Each upgraded game needs manual review to ensure:');
    console.log('1. Game ID matches registry');
    console.log('2. Progress save is called on game complete');
    console.log('3. Error handling is in the right places');
    console.log('4. Reduce motion is applied to animations');
    console.log('5. Component closes properly with memo\n');
  }
}

main();
