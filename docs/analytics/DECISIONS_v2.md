# Analytics SDK v2: Universal Metrics Decision Record

**Version**: 2.0.0  
**Date**: 2026-03-04  
**Status**: **Active** (implemented)  

---

## 1. Problem Statement

The current analytics system has:
- Game-specific extensions without comparable core metrics
- Per-game branching logic in summary calculations
- No standardized way to identify "struggles" across games

This makes unified parent dashboards impossible and complicates cross-game insights.

---

## 2. Universal Metrics (Core Fields)

Every analytics session MUST include these fields in the core (not just extension):

| Field | Type | Definition | Constraints |
|-------|------|------------|-------------|
| `itemsCompleted` | `number` | Count of "primary units" completed in session | Integer ≥ 0 |
| `accuracyPct` | `number` | Success rate percentage | 0–100 inclusive |
| `difficultyTag` | `string?` | Normalized difficulty identifier | Opaque, game-defined |
| `struggleSignals` | `string[]` | Standardized struggle indicators | Controlled vocabulary |

### 2.1 Field Semantics

#### itemsCompleted
The "primary unit" is game-defined but must be consistent within a game:
- **WordBuilder**: words spelled correctly
- **Tracing**: letters traced to completion
- **Memory**: pairs matched
- **Math**: problems solved

Rationale: Enables weighted accuracy calculations and cross-game "work done" comparisons.

#### accuracyPct
Standard formula: `correct / (correct + incorrect) * 100`

Games MAY define alternative denominators (e.g., path deviation for tracing), but the semantic must remain "success rate out of 100."

Rationale: Cross-game "how well did they do" comparison.

#### difficultyTag
Opaque string, but preferred formats:
- Level-based: `lvl_1`, `lvl_2`
- Stage-based: `stage_cvc_a`, `stage_blends`
- Generic: `easy`, `medium`, `hard`

Rationale: Allows difficulty progression tracking without mandating structure.

#### struggleSignals
Controlled vocabulary (extensible):

| Signal | Meaning | Typical Source |
|--------|---------|----------------|
| `confusion_bd` | B/D letter confusion | WordBuilder touch errors |
| `confusion_pq` | P/Q letter confusion | WordBuilder touch errors |
| `confusion_mn` | M/N letter confusion | WordBuilder touch errors |
| `slow_response` | Response time > 2x average | Any timed game |
| `high_error_rate` | Accuracy < 50% | Any game |
| `attention_drop` | Idle time > 30s | Any game |
| `fine_motor_difficulty` | Tracing deviation high | Tracing games |
| `hesitation` | Started but didn't complete | Any game |

Rationale: Enables cross-game struggle pattern detection (e.g., "B/D confusion shows up in WordBuilder AND Tracing").

---

## 3. Where Universal Metrics Come From

### 3.1 Computation Timing

Universal metrics are **computed at `endSession()` time**, not derived later.

Flow:
1. Gameplay accumulates raw data (touches, completions, timing)
2. Extension helpers populate extension-specific data
3. Game/extension calls `setUniversalMetrics()` with final values
4. `endSession()` copies universal fields to session core
5. Session persisted with both core + extension

### 3.2 API for Games

```typescript
// Games/extensions set universal metrics deterministically
setUniversalMetrics({
  itemsCompleted: words.length,
  accuracyPct: Math.round((correct / total) * 100),
  difficultyTag: stageId,
  struggleSignals: detectStruggles(confusionPairs, accuracy),
});

// Then end session
endSession('completed');
```

Rationale: Prevents "derived later" inconsistency. Games own their metric definitions.

---

## 4. Non-Goals (Explicitly Out of Scope)

| Item | Why Deferred |
|------|--------------|
| IndexedDB migration | Storage is mechanical; semantics are not. Lock fields first. |
| Rollup computation | Need universal fields stable before designing aggregations. |
| Backend sync changes | Payload format depends on universal fields being stable. |
| Full game contracts | Start with WordBuilder proof-of-concept, generalize after. |
| Real-time subscriptions | Notify on session end is sufficient for now. |

---

## 5. Backward Compatibility

### 5.1 Schema Version

Current: `schemaVersion: 2`

Universal fields are ADDITIVE to existing schema. Old sessions without these fields are VALID but have defaults:
- `itemsCompleted: 0`
- `accuracyPct: 0`
- `difficultyTag: undefined`
- `struggleSignals: []`

### 5.2 Validation

`isValidSession()` accepts sessions with OR without universal fields. This prevents breaking existing data.

### 5.3 Summary Calculation

Summary functions prefer universal fields, fall back to extension-specific logic for legacy sessions:

```typescript
// Preferred: universal field
const accuracy = session.accuracyPct ?? computeFromExtension(session);
```

Rationale: Gradual migration without data loss.

---

## 6. Acceptance Criteria

Phase 1 is complete when:

- [ ] `startSession` never silently drops active sessions (auto-end as abandoned)
- [ ] `persistSession` validates against corrupted storage
- [ ] Session core always includes universal fields (zeroed if not set)
- [ ] WordBuilder extension populates universal metrics deterministically
- [ ] Summary uses universal fields for cross-game accuracy (weighted by itemsCompleted)
- [ ] No per-game branching in summary calculation for "overall accuracy"

---

## 7. Future Work (Post-Phase 1)

| Phase | Work | Trigger |
|-------|------|---------|
| 2 | IndexedDB + rollups | Universal fields stable for 2+ games |
| 3 | Game contract generator | Before building new games |
| 4 | WordBuilder adapter bridge | When unified dashboard needs legacy data |
| 5 | Backend sync v2 | When off-device sync is prioritized |

---

## 8. Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-04 | Universal fields in core, not extension | Enables cross-game queries without per-game branching |
| 2026-03-04 | Controlled vocabulary for struggles | Prevents free-text explosion, enables pattern detection |
| 2026-03-04 | Set at endSession, not derived later | Games own definitions; prevents inconsistencies |
| 2026-03-04 | Accuracy as 0-100, not 0-1 | Matches parent expectations ("85%" not "0.85") |
| 2026-03-04 | itemsCompleted weighted accuracy | 1-word session ≠ 50-word session in averages |

---

**Next Step**: Implement universal fields in SDK, update WordBuilder extension to populate them.
