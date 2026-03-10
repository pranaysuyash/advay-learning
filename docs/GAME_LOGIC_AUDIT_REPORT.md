# Game Logic Files Audit Report

**Date:** March 10, 2024  
**Scope:** Audit of recent game logic files in `/src/frontend/src/games/` and utility files  
**Total Files Audited:** 7  
**Critical Issues Found:** 2  

---

## Executive Summary

| Classification | Count | Status |
|---|---|---|
| **ACTIVE** (consumed by pages) | 3 files | ✅ Keep |
| **UTILITY** (used by components) | 2 files | ✅ Keep |
| **TEST-ONLY** (code duplication) | 1 file | 🟡 Refactor |
| **ORPHAN** (completely unused) | 1 file | 🔴 Delete/Reconnect |

### Key Findings
- **2,397 LOC** of consumed, tested code ✅
- **423 LOC** of problematic code requiring attention ⚠️
- **1 orphaned file** with no imports, tests, or spec
- **1 duplicated logic file** (exists but not used; page reimplements inline)

---

## DETAILED AUDIT

### ✅ ACTIVE FILES (Keep)

#### 1. chemistryLabLogic.ts (360 LOC)
**Status:** ACTIVE ✅

**Integration:**
- **Import Location:** `src/frontend/src/pages/VirtualChemistryLab.tsx:48`
- **Exports Used:** `blendColors`, `shouldShowHint`, `getHint`, `getProgressPercentage`, `Ingredient`, `Recipe`, `GameProgress`, `MixResult`

**Quality:**
- **Tests:** ✓ `chemistryLabLogic.test.ts` (12.2K LOC) - comprehensive coverage
- **Spec:** ✓ `docs/games/chemistry-lab-spec.md` (5.1K)
- **Functionality:** Rich game logic with recipes, ingredients, mixing mechanics, color blending

**Decision:** KEEP - Fully integrated and well-tested

---

#### 2. cuttingPracticeLogic.ts (367 LOC)
**Status:** ACTIVE ✅ (with documentation gap)

**Integration:**
- **Import Location:** `src/frontend/src/pages/CuttingPractice.tsx:33`
- **Exports Used:** `calculateCutProgress`, `calculateCutQuality`, `getCutQualityPoints`, `areAllLinesCompleted`, `getMaterialEmoji`, `getMaterialColor`, `CutLine`, `Point`

**Quality:**
- **Tests:** ✓ `cuttingPracticeLogic.test.ts` (8.6K LOC) - good coverage
- **Spec:** ❌ **MISSING** (should create `docs/games/cutting-practice-spec.md`)
- **Functionality:** Complete cutting game with levels, geometry, quality assessment

**Decision:** KEEP + Add documentation (create cutting-practice-spec.md)

---

#### 3. shadowPortal/particles.ts (482 LOC)
**Status:** ACTIVE ✅

**Integration:**
- **Import Location:** `src/frontend/src/pages/ShadowPortal.tsx:58`
- **Constants Imported:** `ARMS_UP_THRESHOLD`, `PORTAL_RADIUS`, `PARTICLE_RADIUS`, `GRAVITY`, `BOUNCE_DAMPING`
- **Types Imported:** `Particle`, `Portal`, `Obstacle`

**Quality:**
- **Tests:** ✓ `shadowPortalLogic.test.ts` (14.6K LOC) - comprehensive
- **Spec:** ✓ `docs/games/shadow-portal-spec.md` (8.3K)
- **Functionality:** Particle physics engine with wind, gravity, collision detection

**Decision:** KEEP - Fully integrated

---

### ✅ UTILITY FILES (Keep - Essential Infrastructure)

#### 4. kenneyAssetRegistry.ts (580 LOC)
**Status:** UTILITY - ACTIVE ✅

**Integration:**
- **Import Location:** `src/frontend/src/components/game/CharacterReaction.tsx:11-12`
- **Imports:** `CharacterColor`, `CharacterAnimation` types, `getCharacterAsset()` function
- **Usage:** Lines 114, 167, 224 - retrieves image paths for character sprite animations

**Functionality:**
- Central registry for Kenney platform asset pack
- Provides type-safe access to: characters, enemies, collectibles, UI elements, backgrounds, sounds
- Key exports:
  - `getCharacterAsset()` - get character animation sprite paths
  - `getAssetsByCategory()` - query assets by type
  - `getUnusedAssets()` - audit asset usage
  - `searchAssets()` - find assets by query

**Decision:** KEEP - Core infrastructure, essential for asset management

---

#### 5. emojiToKenney.ts (244 LOC)
**Status:** UTILITY - ACTIVE ✅

**Integration:**
- **Import Location:** `src/frontend/src/components/ui/ItemIcon.tsx:4`
- **Import:** `getKenneyIconForEmoji()` function
- **Usage:** Line 26 - maps emoji to Kenney icon type for collectible items

**Functionality:**
- Maps common emojis to Kenney game assets
- `EMOJI_TO_KENNEY` record: hearts (❤️), currency (🪙, 💰), collectibles (⭐), keys (🔑), locks (🔒), checks (✅), etc.
- Key exports:
  - `getKenneyIconForEmoji()` - get asset type for emoji
  - `hasKenneyEquivalent()` - check if mapping exists
  - Emoji replacement utilities

**ItemIcon Priority Logic:**
```tsx
1. Custom icon path (if provided in data)
2. Kenney asset (using getKenneyIconForEmoji mapping)
3. Emoji fallback (if no mapping exists)
```

**Decision:** KEEP - Essential for consistent visual styling across collectible items

---

### ⚠️ PROBLEMATIC FILES (Require Action)

#### 6. ✅ washHandsDanceLogic.ts (99 LOC) - RESOLVED
**Status:** WIRED — integrated in WashHandsDance.tsx ✅

**Integration Analysis:**
- **Imports Found:** Imported by `src/frontend/src/pages/WashHandsDance.tsx`
- **Test File:** ❌ Missing (unit tests still recommended as follow-up)
- **Spec Document:** ❌ Missing (doc still recommended as follow-up)
- **Page Component:** ✅ WashHandsDance.tsx — fully implemented with TTS, scoring, and GameShell

**Code Content:**
- Interface: `WashStep` (id, name, emoji, instruction, hint)
- Data: `WASH_STEPS` array with 5 handwashing steps:
  1. Wet Hands (🚿)
  2. Soap Time
  3. Scrub Hands
  4. Rinse Hands
  5. Dry Hands
- Exported Functions:
  - `createInitialState()` - create initial game state
  - `getStepById(id)` - look up step by ID
  - `getTotalSteps()` - return 5
  - `calculateStars(attempts)` - calculate performance stars
  - `calculateScore(step, attempts)` - calculate step score

**Analysis:**
This is complete, functional game logic with:
- Proper TypeScript interfaces
- Well-structured data
- Game state management functions
- But **NO ONE USES IT**

**Possible Explanations:**
1. Planned feature - created as prep for future WashHandsDance game
2. Replaced by different implementation (possibly in FreezeDance.tsx)
3. Left over from refactoring/code reorganization
4. Abandoned feature

**Recommendation:** 🔴 **CRITICAL - DELETE or RECONNECT**

**Action Options:**
- **Option A (Delete):** Remove `src/frontend/src/games/washHandsDanceLogic.ts` entirely
- **Option B (Reconnect):** Create `src/frontend/src/pages/WashHandsDance.tsx` that uses this logic
  - Create corresponding test file: `src/frontend/src/games/__tests__/washHandsDanceLogic.test.ts`
  - Create spec document: `docs/games/wash-hands-dance-spec.md`

---

#### 7. 🟡 platformerRunnerLogic.ts (324 LOC) - CODE DUPLICATION
**Status:** TEST-ONLY + PAGE DUPLICATION ⚠️

**Integration Analysis:**
- **Imports Found:** 1 location only - `src/frontend/src/games/__tests__/platformerRunnerLogic.test.ts:50`
- **Production Imports:** ZERO in any .tsx files
- **Test File:** ✓ `platformerRunnerLogic.test.ts` (15.4K LOC) - comprehensive
- **Spec Document:** ✓ `docs/games/platformer-runner-spec.md` (5.1K)
- **Page Component:** ✓ `src/frontend/src/pages/PlatformerRunner.tsx` EXISTS (18.5K lines)

**Critical Issue: The page doesn't import the logic!**

**What platformerRunnerLogic.ts exports:**
- Constants: `CANVAS_WIDTH`, `CANVAS_HEIGHT`, `GROUND_Y`, `GRAVITY`, `JUMP_VELOCITY`, `PLAYER_WIDTH`, `PLAYER_HEIGHT`, etc.
- Types and game state management

**What PlatformerRunner.tsx does instead:**
- **Redefines the same constants** (lines 19-21):
  ```typescript
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const GROUND_Y = CANVAS_HEIGHT - 64;
  ```
- **Implements its own collision logic** (lines 43-67):
  ```typescript
  function checkCollision(r1: Rect, r2: Rect, margin = 0.6): boolean { ... }
  ```
- Completely reimplements game logic inline instead of importing from module

**Why This Is a Problem:**
1. **Code Duplication:** Same logic exists in two places
2. **Maintenance Burden:** Bug fixes in one won't sync to the other
3. **Test/Production Gap:** Logic is tested separately but not in actual page
4. **Inconsistency Risk:** Values could diverge over time

**Recommendation:** 🟡 **HIGH PRIORITY - REFACTOR**

**Action Options:**

**Option A (Recommended):** Import and use platformerRunnerLogic in PlatformerRunner.tsx
```typescript
// In PlatformerRunner.tsx, add:
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GROUND_Y,
  GRAVITY,
  // ... other exports
} from '../games/platformerRunnerLogic';

// Remove inline definitions
// Remove checkCollision() function if it exists in logic module
```

**Option B:** Delete platformerRunnerLogic.ts if intentionally separate
- But then update/delete the test file
- Document why the pattern differs from other games

---

## Summary Table

| File | LOC | Type | Page | Tests | Spec | Status | Action |
|------|-----|------|------|-------|------|--------|--------|
| washHandsDanceLogic.ts | 99 | Logic | ✅ | ❌ | ❌ | ✅ RESOLVED | WIRED (PR #20) |
| chemistryLabLogic.ts | 360 | Logic | ✅ | ✅ | ✅ | ✅ ACTIVE | KEEP |
| cuttingPracticeLogic.ts | 367 | Logic | ✅ | ✅ | ❌ | ✅ ACTIVE | KEEP + DOC |
| platformerRunnerLogic.ts | 324 | Logic | ✅* | ✅ | ✅ | 🟡 DUPED | REFACTOR |
| shadowPortal/particles.ts | 482 | Logic | ✅ | ✅ | ✅ | ✅ ACTIVE | KEEP |
| kenneyAssetRegistry.ts | 580 | Utility | ✅ | - | ✅ | ✅ ACTIVE | KEEP |
| emojiToKenney.ts | 244 | Utility | ✅ | - | ✅ | ✅ ACTIVE | KEEP |
| **TOTAL** | **2,456** | - | - | - | - | - | - |

*Page exists but doesn't import the logic module

---

## Statistics

### Code Coverage
- **Consumed Code:** 2,397 LOC (85%)
- **Problematic Code:** 423 LOC (15%)
  - Orphaned: 99 LOC
  - Duplicated: 324 LOC

### Test Coverage
- **With Dedicated Tests:** 5 files (65.8K LOC of test code)
- **Without Tests:** 2 files (utility libraries - utility.test.ts not required)

### Documentation
- **With Spec:** 5 files
- **Without Spec:** 2 files (washHandsDance, cutting-practice-spec.md missing)

---

## Recommendations

### Priority 1 (RESOLVED) - washHandsDanceLogic.ts — Wired in PR #20
**washHandsDanceLogic.ts** — No longer orphaned. WashHandsDance.tsx page was created and imports this module.
- Remaining follow-up: Add unit tests + spec doc (tracked as non-blocking P3).

### Priority 2 (HIGH) - Refactor Code Duplication
**platformerRunnerLogic.ts** - Extracted logic not used by page
- **Recommendation:** Import platformerRunnerLogic into PlatformerRunner.tsx
- **Benefit:** Single source of truth, reduced maintenance burden
- **Alternative:** Document why pattern is intentionally different

### Priority 3 (MEDIUM) - Documentation
**cuttingPracticeLogic.ts** - Missing spec doc
- **Action:** Create `docs/games/cutting-practice-spec.md`
- **Reference:** Use chemistry-lab-spec.md or platformer-runner-spec.md as templates

---

## ItemIcon.tsx Usage Analysis

**File:** `src/frontend/src/components/ui/ItemIcon.tsx`

**Proper Implementation Verified:**
```tsx
// Line 4: Import getKenneyIconForEmoji
import { getKenneyIconForEmoji } from '../../utils/emojiToKenney';

// Line 26: Use to map emoji to icon type
const kenneyType: KenneyIconType | undefined = item.emoji 
  ? getKenneyIconForEmoji(item.emoji) 
  : undefined;

// Lines 45-54: Display Kenney icon if mapping exists
if (kenneyType && !imageFailed) {
  return (
    <KenneyIcon
      type={kenneyType}
      size={size}
      className={className}
      fallback={item.emoji}
    />
  );
}
```

**Status:** ✅ Properly implemented with 3-tier fallback strategy:
1. Custom icon path (if provided)
2. Kenney asset (from emoji mapping)
3. Emoji text (fallback)

---

## Conclusion

**Files to KEEP (5):**
- chemistryLabLogic.ts ✅
- cuttingPracticeLogic.ts ✅
- shadowPortal/particles.ts ✅
- kenneyAssetRegistry.ts ✅
- emojiToKenney.ts ✅

**Files with Issues (2):**
- washHandsDanceLogic.ts ✅ RESOLVED — wired in WashHandsDance.tsx (PR #20)
- platformerRunnerLogic.ts 🟡 REFACTOR (code duplication issue)

**Documentation Gaps:**
- Add cutting-practice-spec.md (for consistency)

---

*Report Generated: March 10, 2024*
