# Counting Collect-a-thon - Implementation Plan (Final)

**Planned By**: Pranay + Qwen (Socratic mentoring)  
**Date**: 2026-03-08  
**Status**: Ready to Implement  

---

## Qwen's Final Validation Questions

### 1. Game-Scoped Counter - Implementation Details

**Qwen's Question**: Does moving `nextItemId` to GameState change function signatures?

**Answer**: Yes, `spawnItem` already returns state, just need to include `nextItemId` in that state.

```typescript
// BEFORE (module-level)
let nextItemId = 0;
export function spawnItem(state: GameState, config: GameConfig): GameState {
  const newItem = { id: nextItemId++, ... };
  return { ...state, items: [...state.items, newItem] }; // nextItemId not in state
}

// AFTER (game-scoped)
export function spawnItem(state: GameState, config: GameConfig): GameState {
  const newItem = { id: state.nextItemId, ... };
  return {
    ...state,
    items: [...state.items, newItem],
    nextItemId: state.nextItemId + 1, // Increment in returned state
  };
}
```

**Tests Needed**:
```typescript
it('should increment nextItemId after spawn', () => {
  const state = createInitialState();
  expect(state.nextItemId).toBe(0);
  
  const state2 = spawnItem(state, DEFAULT_CONFIG);
  expect(state2.nextItemId).toBe(1);
  expect(state2.items[0].id).toBe(0);
  
  const state3 = spawnItem(state2, DEFAULT_CONFIG);
  expect(state3.nextItemId).toBe(2);
  expect(state3.items[1].id).toBe(1);
});

it('should reset nextItemId for new game instances', () => {
  const game1 = startGame(createInitialState(), DEFAULT_CONFIG);
  const game2 = startGame(createInitialState(), DEFAULT_CONFIG);
  
  expect(game1.nextItemId).toBe(0);
  expect(game2.nextItemId).toBe(0);
});
```

**Semantic Question**: Initial value `0` or `1`?
- `0`: IDs are array indices (0, 1, 2...) - intuitive
- `1`: IDs are "1st, 2nd, 3rd..." - matches human counting
- **Decision**: `0` (array semantics, computer science convention)

---

### 2. Telemetry - Implementation Details

**Qwen's Questions**:
- Where does `reportCVError` live?
- What if telemetry fails?
- How to test without sending real events?

**Implementation**:

```typescript
// utils/telemetry.ts
interface TelemetryEvent {
  type: string;
  category: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

class Telemetry {
  private enabled: boolean;
  private queue: TelemetryEvent[] = [];
  
  constructor(enabled = true) {
    this.enabled = enabled;
  }
  
  report(event: TelemetryEvent): void {
    if (!this.enabled) return;
    
    try {
      // Queue for batch sending
      this.queue.push(event);
      
      // Send immediately for errors (don't batch)
      if (event.category === 'error') {
        this.flush();
      }
    } catch (e) {
      // Telemetry failure must not break game
      console.error('[Telemetry] Failed to queue:', e);
    }
  }
  
  private flush(): void {
    // Send to analytics
    if (typeof gtag !== 'undefined') {
      this.queue.forEach(event => {
        gtag('event', event.type, {
          event_category: event.category,
          ...event.data,
        });
      });
    }
    this.queue = [];
  }
}

// Singleton instance
export const telemetry = new Telemetry(process.env.NODE_ENV !== 'test');

// Test helper
export function createMockTelemetry(): { reports: TelemetryEvent[]; report: jest.Mock } {
  const reports: TelemetryEvent[] = [];
  return {
    reports,
    report: jest.fn((e: TelemetryEvent) => reports.push(e)),
  };
}
```

**Testing Strategy**:
```typescript
import { createMockTelemetry } from '../utils/telemetry';

it('should report telemetry for invalid handX', () => {
  const mockTelemetry = createMockTelemetry();
  
  // Inject mock
  const state = createInitialState();
  const newState = updatePlayerPosition(state, NaN, DEFAULT_CONFIG, mockTelemetry.report);
  
  expect(mockTelemetry.report).toHaveBeenCalledWith({
    type: 'invalid_hand_position',
    category: 'cv_error',
    data: { value: NaN, game: 'counting_collectathon' },
    timestamp: expect.any(Number),
  });
});
```

**Fallback if Telemetry Throws**:
```typescript
// In updatePlayerPosition:
try {
  telemetry.report({ ... });
} catch (e) {
  // Log locally only, don't break game flow
  console.error('[Telemetry] Failed:', e);
}
// Continue with position update regardless
```

---

### 3. A/B Testing - Implementation Details

**Qwen's Questions**:
- How to persist variant?
- What's minimum metric set?

**Implementation**:

```typescript
// utils/experiments.ts
export const EXPERIMENTS = {
  feedbackMessage: {
    id: 'feedback_message_v1',
    variants: ['control', 'guided', 'encouraging'] as const,
    defaultVariant: 'control' as const,
  },
};

export function getVariant(experimentId: string): string {
  // Check URL param first (for testing)
  const urlParams = new URLSearchParams(window.location.search);
  const forcedVariant = urlParams.get(`exp_${experimentId}`);
  if (forcedVariant) return forcedVariant;
  
  // Check localStorage (persist across sessions)
  const stored = localStorage.getItem(`exp_${experimentId}`);
  if (stored) return stored;
  
  // Random assignment (50/50 or weighted)
  const variants = EXPERIMENTS[experimentId as keyof typeof EXPERIMENTS]?.variants;
  if (!variants) return 'control';
  
  const assigned = variants[Math.floor(Math.random() * variants.length)];
  localStorage.setItem(`exp_${experimentId}`, assigned);
  
  // Report assignment to analytics
  telemetry.report({
    type: 'experiment_assigned',
    category: 'experiment',
    data: { experimentId, variant: assigned },
    timestamp: Date.now(),
  });
  
  return assigned;
}
```

**Minimum Metric Set** (from Qwen's challenge):

| Metric | Definition | Success Threshold |
|--------|------------|-------------------|
| Round completion rate | % of rounds completed successfully | +10% vs control |
| Wrong collection rate | # wrong items collected per round | -15% vs control |
| Time to complete | Seconds to finish round | -10% vs control |
| Engagement time | Total time in game | +5% vs control |

**Variant Selection Timing**:
- **Option A**: In `createInitialState` (persisted with game)
- **Option B**: At feedback time (can change mid-game)
- **Decision**: Option A (consistent experience per child)

---

### 4. Implementation Steps - Detailed

#### Step 1: Remove `lastCollectTime`

**Verification Commands**:
```bash
# Search for any usage
grep -r "lastCollectTime" src/frontend/src/games/

# Check TypeScript compilation
npx tsc --noEmit src/frontend/src/games/countingCollectathonLogic.ts

# Run tests to ensure nothing breaks
npx vitest run src/frontend/src/games/__tests__/countingCollectathonLogic.test.ts
```

**Changes**:
1. Remove from `GameState` interface (line 53)
2. Remove from `createInitialState` (line 120)
3. Remove from `checkCollisions` return (line 281)

#### Step 2: Add `nextItemId` to GameState

**Changes**:
1. Add to `GameState` interface
2. Initialize in `createInitialState`
3. Update `spawnItem` to use and increment
4. Add tests

#### Step 3: NaN Validation + Telemetry

**Changes**:
1. Create `utils/telemetry.ts`
2. Update `updatePlayerPosition` with validation
3. Add telemetry calls
4. Add tests with mock telemetry

#### Step 4: Feedback A/B Scaffolding

**Changes**:
1. Create `utils/experiments.ts`
2. Update `getCollectFeedback` to accept variant
3. Wire up variant selection in game initialization
4. Add metric tracking calls

#### Step 5: Lint Rules

**Separate PR**: Yes (infrastructure change, not feature)

```json
// tsconfig.json
{
  "compilerOptions": {
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

### 5. Trade-offs to Revisit in 6 Months

**Qwen's Challenge**: What's one trade-off you might revisit?

**My Answer**: **Game-scoped counter vs UUID**

| Scenario | Revisit Trigger |
|----------|-----------------|
| Multiplayer mode added | UUID becomes necessary |
| Memory profiling shows bloat | Re-evaluate |
| School deployments struggle | HTTPS issue real |
| Debug logs too noisy | Sequential IDs confirmed valuable |

**How Future-Me Knows**:
- Analytics: CV error rate, game completion rates
- Performance: Memory usage, frame rate
- Developer: Debug time for "item didn't count" bugs

**Log This Decision**:
```typescript
// In code comment:
// DECISION-2026-03-08: Using sequential IDs (0,1,2...) instead of UUIDs
// RATIONALE: Debuggability ("3rd star"), memory (4 bytes vs 36), no HTTPS requirement
// REVISIT: If multiplayer added or memory profiling shows issue
```

---

## Final Checklist Before Implementation

- [ ] grep confirms no `lastCollectTime` consumers
- [ ] Test file updated with counter tests
- [ ] Telemetry utility created
- [ ] Experiment utility created
- [ ] A/B metrics defined
- [ ] Implementation order documented
- [ ] Rollback plan (git revert) ready

---

## Mode Selection

**Qwen's Options**:
| Mode | I Do | Qwen Does |
|------|------|-----------|
| Code Review Partner | Write implementation | Review, ask questions |
| Test-First Pair | Drive implementation | Write tests together |
| Full Implementation | Critique and refine | Draft fixes |

**My Choice**: **Code Review Partner**

**Reasoning**:
- I write the code (build muscle memory)
- Qwen reviews (catches blind spots)
- Learn from feedback on actual implementation
- Most realistic work scenario

---

Ready to start with Step 1?
