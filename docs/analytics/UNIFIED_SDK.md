# Unified Analytics SDK

**Version**: 2.0  
**Date**: 2026-03-04  
**Status**: Active

---

## Overview

The Unified Analytics SDK provides game-agnostic analytics with per-game extensions. It replaces the WordBuilder-specific `analyticsStore.ts` with a platform-wide solution.

### Key Features

- **Game-agnostic core**: Any game can use the SDK
- **Per-game extensions**: Rich typed data for specific games
- **Schema versioning**: Forward-compatible data evolution
- **Offline-first**: localStorage with backend export
- **Privacy-conscious**: No PII, COPPA-compliant

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Games                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │WordBuilder│  │ Tracing  │  │  Memory  │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       │             │             │                    │
│       └─────────────┼─────────────┘                    │
│                     ▼                                   │
│  ┌─────────────────────────────────────────┐            │
│  │      Unified Analytics SDK              │            │
│  │  ┌─────────────────────────────────┐    │            │
│  │  │  Core: Session, Event, Storage  │    │            │
│  │  └─────────────────────────────────┘    │            │
│  │  ┌─────────────────────────────────┐    │            │
│  │  │  Extensions: WordBuilder, etc.  │    │            │
│  │  └─────────────────────────────────┘    │            │
│  └─────────────────────────────────────────┘            │
└─────────────────────────┬───────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Storage & Export                           │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │  localStorage    │  │  Progress Queue  │             │
│  │  (rich data)     │  │  (summaries)     │             │
│  └──────────────────┘  └──────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Basic Usage

```typescript
import { 
  startSession, 
  endSession, 
  logEvent,
  getAnalyticsSummary 
} from '@/analytics';

// Start session when game begins
const sessionId = startSession('mygame', childId);

// Log events during gameplay
logEvent('level_start', { level: 1 });
logEvent('interaction', { type: 'click', target: 'button' });

// End session when game completes
endSession('completed');

// Get summary for parent dashboard
const summary = getAnalyticsSummary(childId);
```

### WordBuilder (with Extension)

```typescript
import { startSession, endSession, wordBuilder } from '@/analytics';

// Start and initialize extension
startSession('wordbuilder', childId);
wordBuilder.init('phonics', 'cvc_a');

// Use typed helpers
wordBuilder.recordTouch('A', 'B', false);
wordBuilder.recordWordCompleted('CAT');
wordBuilder.finalizeAccuracy();

// End session
endSession('completed');
```

---

## API Reference

### Core Functions

#### `startSession(gameId: string, childId?: string): string`

Start a new analytics session. Returns session ID.

#### `endSession(status?: 'completed' | 'abandoned' | 'error'): AnalyticsSession | null`

End current session and persist to storage.

#### `logEvent(type: string, payload?: Record<string, unknown>): void`

Log an event to the active session.

#### `updateExtension(data: Partial<GameExtension>): void`

Update extension data incrementally.

#### `getActiveSession(): ActiveSession | null`

Get currently active session (for UI display).

#### `abandonSession(): void`

Abandon session without saving.

### Query Functions

#### `getStoredSessions(): AnalyticsSession[]`

Get all stored sessions with validation.

#### `getSessionsByGame(gameId: string): AnalyticsSession[]`

Filter sessions by game.

#### `getSessionsByChild(childId: string): AnalyticsSession[]`

Filter sessions by child.

#### `getAnalyticsSummary(childId?: string): AnalyticsSummary`

Compute summary statistics.

### Export Functions

#### `exportAnalytics(): string`

Export all sessions as JSON.

#### `clearAnalytics(): void`

Clear all stored data.

#### `toProgressPayload(session: AnalyticsSession): ProgressExportPayload | null`

Convert session to progress tracking format.

#### `exportToProgressPayloads(): ProgressExportPayload[]`

Export all sessions for progress tracking.

---

## Extensions

### WordBuilder Extension

```typescript
import { wordBuilder } from '@/analytics';

// Initialize
wordBuilder.init(mode: 'explore' | 'phonics', stageId?: string);

// Record interactions
wordBuilder.recordTouch(expected: string, touched: string, isCorrect: boolean);
wordBuilder.recordWordCompleted(word: string);
wordBuilder.updateTiming(avgTimePerWordMs: number);
wordBuilder.finalizeAccuracy();

// Type guard
if (wordBuilder.isWordBuilderSession(session)) {
  // session.extension is typed as WordBuilderExtension
}
```

### Tracing Extension

```typescript
import { tracing } from '@/analytics';

tracing.initTracingSession(letter: string);
tracing.recordTracingAttempt(accuracy: number, errors: ErrorType[]);
tracing.finalizeTracing(timeToCompleteMs: number);
```

### Memory Extension

```typescript
import { memory } from '@/analytics';

memory.initMemorySession(pairsCount: number);
memory.recordMove(card1: string, card2: string, isMatch: boolean, timeMs: number);
memory.finalizeMemory(totalTimeMs: number);
```

### Creating a New Extension

```typescript
// 1. Add type to types.ts
export interface MyGameExtension {
  game: 'mygame';
  score: number;
  level: number;
}

// 2. Create extension file: extensions/mygame.ts
import { logEvent, updateExtension, getActiveSession } from '../store';

export function initMyGame(level: number) {
  updateExtension({ game: 'mygame', score: 0, level });
}

export function recordScore(points: number) {
  const session = getActiveSession();
  if (!session) return;
  
  const current = session.extensionData as Partial<MyGameExtension>;
  updateExtension({ score: (current.score || 0) + points });
  logEvent('score', { points });
}

// 3. Export from index.ts
export * as mygame from './extensions/mygame';
```

---

## Schema

### Core Session Schema

```typescript
interface AnalyticsSession {
  schemaVersion: number;      // 2
  buildVersion: string;       // "0.1.0+abc1234"
  
  id: string;                 // Unique session ID
  timestamp: number;          // Start time
  gameId: string;             // Game identifier
  childId?: string;           // Child profile ID
  
  durationMs: number;         // Session duration
  eventsCount: number;        // Number of events
  completionStatus: 'completed' | 'abandoned' | 'error' | 'in_progress';
  
  extension: GameExtension | null;
}
```

### Extension Schema

Extensions are stored in the `extension` field. Each extension MUST have a `game` property for type discrimination.

---

## Storage

- **Key**: `advay.analytics.v2`
- **Format**: JSON array of sessions
- **Cap**: 50 sessions (LRU eviction)
- **Validation**: Schema version checked on load
- **Graceful degradation**: Invalid sessions dropped silently

### Clock Anomaly Guards

- Negative durations clamped to 0
- Max session duration: 2 hours
- Max per-event time: 5 minutes

---

## Progress Tracking Integration

The SDK integrates with the existing progress tracking system:

```typescript
import { exportToProgressPayloads } from '@/analytics';
import { recordGameProgress } from '@/services/progressTracking';

// Export analytics as progress payloads
const payloads = exportToProgressPayloads();

// Send to backend (via progress queue)
for (const payload of payloads) {
  await recordGameProgress({
    profileId: payload.profileId,
    gameName: payload.gameName,
    score: payload.score,
    durationSeconds: payload.durationSeconds,
    accuracy: payload.accuracy,
    completed: payload.completed,
    metaData: payload.metaData,
  });
}
```

---

## Migration from WordBuilder Analytics

### Before (WordBuilder-specific)

```typescript
import { startSession, recordTouch, endSession } from './analyticsStore';

startSession('phonics', 'cvc_a');
recordTouch('A', 'B', false);
endSession();
```

### After (Unified SDK)

```typescript
import { startSession, endSession, wordBuilder } from '@/analytics';

startSession('wordbuilder', childId);
wordBuilder.init('phonics', 'cvc_a');
wordBuilder.recordTouch('A', 'B', false);
endSession('completed');
```

### Data Migration

Old data in `wordbuilder.analytics.v1` is NOT automatically migrated. Options:

1. **Preserve**: Keep old data for historical reference
2. **Migrate**: Write one-time migration script
3. **Reset**: Clear old data, start fresh with v2

---

## Testing

```bash
# Run analytics tests
npm test -- src/analytics/__tests__/store.test.ts

# Run with coverage
npm test -- src/analytics --coverage
```

---

## Roadmap

### Phase 1 (Current)
- ✅ Core SDK
- ✅ WordBuilder extension
- ✅ Tracing extension
- ✅ Memory extension

### Phase 2
- Parent dashboard integration
- Real-time engagement hooks
- Cross-game skill tracking

### Phase 3
- Teacher dashboard aggregation
- Class-level analytics
- Printable reports

---

## Related Documentation

- [Analytics Architecture](./ARCHITECTURE.md)
- [Dashboard Gap Analysis](./DASHBOARD_GAP_ANALYSIS.md)
- [Progress Tracking](../services/progressTracking.ts)
