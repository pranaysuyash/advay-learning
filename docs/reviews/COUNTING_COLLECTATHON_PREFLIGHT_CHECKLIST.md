# Counting Collect-a-thon - Pre-Flight Checklist

**Status**: Ready for Implementation  
**Final Review**: Qwen (pre-flight checks)  
**Date**: 2026-03-08  

---

## Qwen's Final Reflective Questions

### Step 1: Remove `lastCollectTime` - Safety Checks

**Question**: Have you searched for dynamic references?

**My Verification Plan**:
```bash
# Search for string literal
grep -r "lastCollectTime" src/frontend/src/

# Search in test files specifically
grep -r "lastCollectTime" src/frontend/src/games/__tests__/

# Check for any serialization/deserialization
grep -r "JSON.stringify\|JSON.parse" src/frontend/src/games/countingCollectathon*

# Check if used in any debugging/logging
rg "console\.(log|debug|warn).*collect" src/frontend/src/games/ -A 2 -B 2
```

**Expected Result**: Should only find occurrences in:
- `countingCollectathonLogic.ts` (definition, assignment)
- `countingCollectathonLogic.test.ts` (assertion - will update)

**Rollback Plan**:
```bash
# If hidden dependency found after merge:
git revert HEAD
# Or:
git checkout HEAD~1 -- src/frontend/src/games/countingCollectathonLogic.ts
```

---

### Step 2: Game-Scoped Counter - Contract Analysis

**Question**: Does `spawnItem` return type change?

**Analysis**:
```typescript
// Current signature (line 157):
export function spawnItem(state: GameState, config: GameConfig): GameState

// New signature (same!):
export function spawnItem(state: GameState, config: GameConfig): GameState

// What changes: GameState interface now includes nextItemId
// Callers don't change - they already handle returned state
```

**Caller Check**:
```bash
# Find all spawnItem calls
grep -r "spawnItem(" src/frontend/src/ --include="*.ts" --include="*.tsx"
```

**Expected**: Called from:
- `CountingCollectathon.tsx` (game loop)
- `countingCollectathonLogic.test.ts` (tests)

Both already do: `state = spawnItem(state, config)` so no change needed.

**Reset Location Decision**:
| Function | Sets nextItemId | Why |
|----------|-----------------|-----|
| `createInitialState` | `0` | Fresh game instance |
| `startGame` | Should NOT reset | Uses `createInitialState` which already sets 0 |

**Semantic**: `createInitialState` = "brand new game" → reset counter. `startGame` = "transition to playing" → keep existing state.

---

### Step 3: Telemetry - Dependency Check

**Question**: Is `reportCVError` already implemented?

**Answer**: No, this is NEW. Need to create:

```typescript
// utils/telemetry.ts (NEW FILE)
export interface TelemetryEvent {
  type: string;
  category: 'error' | 'game_event' | 'experiment';
  data?: Record<string, unknown>;
  timestamp: number;
}

export function reportCVError(details: {
  type: string;
  value: number;
  gameContext: string;
}): void {
  const event: TelemetryEvent = {
    type: details.type,
    category: 'error',
    data: details,
    timestamp: Date.now(),
  };
  
  try {
    // Send to analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', event.type, {
        event_category: event.category,
        ...event.data,
      });
    }
  } catch (e) {
    // Silent - telemetry must not break game
  }
}

// Test mock
export function createMockTelemetry() {
  const events: TelemetryEvent[] = [];
  return {
    getEvents: () => events,
    reportCVError: (details: any) => {
      events.push({
        type: details.type,
        category: 'error',
        data: details,
        timestamp: Date.now(),
      });
    },
  };
}
```

**Test Strategy**:
```typescript
// In test file:
import { createMockTelemetry } from '../utils/telemetry';

it('should report CV errors', () => {
  const mock = createMockTelemetry();
  // Pass mock to function or mock module
  vi.spyOn(telemetryModule, 'reportCVError').mockImplementation(mock.reportCVError);
  
  // ... test ...
  
  expect(mock.getEvents()).toHaveLength(1);
});
```

---

### Step 4: A/B Scaffolding - localStorage Details

**Key Name Convention**:
```typescript
// Format: exp_{experimentId}
const STORAGE_KEY = 'exp_feedback_message_v1';

// Alternative with game prefix (if multiple games):
const STORAGE_KEY = 'advay_counting_collectathon_feedback_variant';
```

**localStorage Disabled Handling**:
```typescript
function getVariant(): string {
  try {
    // Check URL first (for debugging)
    const urlParams = new URLSearchParams(window.location.search);
    const forced = urlParams.get('feedback_variant');
    if (forced) return forced;
    
    // Try localStorage
    const stored = localStorage.getItem('exp_feedback_v1');
    if (stored) return stored;
    
    // Assign new
    const variant = Math.random() < 0.5 ? 'control' : 'guided';
    localStorage.setItem('exp_feedback_v1', variant);
    return variant;
  } catch (e) {
    // localStorage disabled (private mode, restrictions)
    // Return control (default) without persisting
    return 'control';
  }
}
```

**URL Override**: Yes, for debugging:
- `?feedback_variant=guided` - Force guided variant
- `?feedback_variant=control` - Force control variant

---

## Pre-Flight Checklist

| Check | Command/Action | Status |
|-------|----------------|--------|
| ✅ Grep for `lastCollectTime` | `grep -r "lastCollectTime" src/` | Ready |
| ✅ Check test imports | Review test file | Ready |
| ✅ Define telemetry interface | Create stub file | Ready |
| ✅ Decide localStorage key | `exp_feedback_v1` | Decided |
| ✅ Branch naming | `fix/counting-collectathon-audit` | Ready |
| ✅ Rollback plan | git revert | Documented |

---

## Qwen's PR Recommendation

| Step | Bundle | Rationale |
|------|--------|-----------|
| 1 + 2 | Together | Both state changes, low risk |
| 3 | Separate | New dependency (telemetry) |
| 4 | Separate | UX change, needs product review |
| 5 | Last | Infrastructure |

**My Decision**: **Follow Qwen's recommendation**

- **PR 1**: Steps 1-2 (remove dead code + game-scoped counter)
- **PR 2**: Step 3 (telemetry + NaN validation)
- **PR 3**: Step 4 (A/B scaffolding)
- **PR 4**: Step 5 (lint rules)

---

## Qwen's Final Question: One Step Today

**Question**: If only ONE step to ship today, which?

**My Answer**: **Step 3 (NaN validation)**

**Why**:
- Safety issue: NaN can crash/break game experience
- Child impact: Game freezing is frustrating
- Engineering: Defensive programming
- Telemetry bonus: Learn about CV issues in production

**Not Step 1**: Dead code doesn't affect users (hygiene)
**Not Step 2**: ID collisions rare, mostly debugging
**Not Step 4**: A/B test is optimization, not necessity

**Priority**: Safety > Hygiene > Optimization

---

## What I'll Include in PR

Per Qwen's request:

1. **Before/after diff** (git diff)
2. **Grep output** showing no remaining references
3. **Test results** (`npm test -- --run` output)
4. **One sentence learned**: 
   > "Dead code isn't just clutter—it's a liability that confuses future maintainers and obscures the actual behavior of the system."

---

## Ready to Start

**Branch**: `fix/counting-collectathon-audit-phase1`

**First commit**: Remove `lastCollectTime`

**First PR**: Steps 1-2 together

**Status**: ✅ CLEARED FOR TAKEOFF
