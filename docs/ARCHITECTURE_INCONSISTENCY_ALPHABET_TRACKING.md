# Architecture Inconsistency: Alphabet Tracking

**Date:** 2026-03-07  
**Issue:** Special-cased alphabet tracking in Settings vs. unified game tracking in Dashboard

---

## The Problem

### Current State (Inconsistent)

```
┌─────────────────────────────────────────────────────────────────┐
│  DASHBOARD                                                      │
│  ├─ letterProgress (from progressStore)                        │
│  ├─ game progress (from API)                                    │
│  ├─ totalStars (calculated from letter accuracy)               │
│  └─ game recommendations                                        │
├─────────────────────────────────────────────────────────────────┤
│  SETTINGS                                                       │
│  ├─ getMasteredLettersCount()  ← SPECIAL CASE                  │
│  ├─ "Letters Explored" display                                  │
│  └─ "Reset Curriculum Progress" button                         │
└─────────────────────────────────────────────────────────────────┘
```

### The Inconsistency

| Aspect | Alphabet | Other Games |
|--------|----------|-------------|
| **Progress Store** | `letterProgress` | `gameHistory` |
| **Display Location** | Settings | Dashboard |
| **Reset Location** | Settings | Not available? |
| **Count Display** | "X / 26 Played With" | No equivalent |
| **Special Treatment** | Yes (first-class) | No (generic) |

### Code Evidence

**Settings.tsx (lines 610-620):**
```tsx
{/* ONLY alphabet has special section in Settings */}
<div className='bg-slate-50 rounded-[1.5rem] p-5 mb-4 border-4 border-[#F2CC8F]'>
  <div className='text-sm font-black uppercase tracking-widest text-slate-400 mb-2'>
    Letters Explored  {/* ← Special label */}
  </div>
  <div className='text-advay-slate flex items-baseline gap-2'>
    <span className='font-black text-3xl'>{getMasteredLettersCount(settings.language)}</span>
    <span className="text-text-secondary font-bold text-lg">/ {getAlphabet(settings.language).letters.length} Played With</span>
  </div>
</div>

{/* Reset button ONLY for alphabet progress */}
<Button onClick={() => resetProgress(settings.language)}>
  Reset Curriculum Progress  {/* ← Only resets alphabet! */}
</Button>
```

**Dashboard.tsx (lines 160-175):**
```tsx
// Calculates stars from letterProgress
const totalStars = useMemo(() => {
  if (letterProgress) {
    baseStars += Object.values(letterProgress).reduce((acc, itemArr) =>
      acc + itemArr.reduce((sum, item) => sum + (item.bestAccuracy > 0 ? 10 : 0), 0)
    , 0);
  }
  return baseStars;
}, [letterProgress, ...]);
```

**Progress.tsx:**
- Shows game progress, session data
- NO letter progress display
- NO unified view of all activity

---

## Root Cause Analysis

### Hypothesis: Historical Legacy

The Alphabet Game was likely:
1. **First game implemented** - became the "reference architecture"
2. **Core feature** - treated as central learning mechanic
3. **Prototype** - other games followed different patterns

### Evidence

```typescript
// progressStore.ts - LetterProgress is first-class type
export interface LetterProgress {
  letter: string;
  attempts: number;
  bestAccuracy: number;
  mastered: boolean;
  lastAttemptDate: string;
}

// But game history is generic
export interface GamePlayHistoryEntry {
  gameId: string;
  lastPlayed: string;
  playCount: number;
  totalSeconds: number;
  bestScore: number;
  avgScore: number;
}
```

### The Rubric Connection

You mentioned "rubric tracking" - this appears to be **legacy/unused** code:

```typescript
// types/teacher.ts - appears unused
export type RubricLevel = 'emerging' | 'developing' | 'proficient' | 'advanced';
export interface RubricAssessment {
  rubricLevel: RubricLevel;
  rubricDistribution: Record<RubricLevel, number>;
}
```

Search shows NO actual usage of rubric types in game code - they appear to be:
- Early design artifact
- Never implemented
- Or removed but types left behind

---

## Why This Is Wrong

### 1. **Inconsistent User Experience**

User has to go to **Settings** to see alphabet progress but **Dashboard** for game progress.

### 2. **Unequal Treatment**

Why does alphabet get:
- Special display in Settings?
- Its own reset button?
- First-class data structure?

While other games (WordBuilder, NumberTracing, etc.) get:
- Generic game history?
- No visibility in Settings?
- No reset option?

### 3. **Architectural Debt**

Two parallel tracking systems:
- `letterProgress` (alphabet-specific)
- `gameHistory` (generic)

They should be unified.

### 4. **Vision Misalignment**

From vision perspective:
- **Alphabet as "curriculum"** = school-like framing
- **Special treatment** = not all play is equal
- **"Mastered" language** = explicit learning (violates "fun first")

---

## Recommended Solutions

### Option 1: Unified Activity Log (Recommended)

**Architecture:**
```typescript
// Single source of truth
interface ActivityRecord {
  id: string;
  type: 'alphabet' | 'game' | 'creative';
  activityId: string;  // 'letter-a', 'word-builder', 'free-draw'
  profileId: string;
  startedAt: string;
  durationSeconds: number;
  // NO accuracy/score for vision alignment
  // Just: "played with", "explored", "time spent"
}
```

**UI:**
- Dashboard shows ALL activity (alphabet + games + creative)
- Settings has NO progress tracking (only preferences)
- Unified "Play History" view

### Option 2: Remove Special Treatment

**Actions:**
1. Remove `getMasteredLettersCount` from Settings
2. Treat alphabet like any other game
3. Show alphabet progress ONLY in Dashboard (if at all)
4. Single reset for ALL data (not separate)

### Option 3: Remove Progress Tracking Entirely (Vision-Aligned)

**Nuclear option for vision purity:**
- NO progress tracking in Settings
- NO counters in Dashboard
- Just: "Recently played" list
- Focus on "in the moment" play, not tracking

---

## Implementation Recommendation

### Phase 1: Immediate Fix

**Remove from Settings:**
```tsx
// DELETE this entire section from Settings.tsx (lines 610-658)
<div className="pt-6 border-t-4 border-[#F2CC8F] space-y-4">
  <div className='bg-slate-50 rounded-[1.5rem] p-5 mb-4 border-4 border-[#F2CC8F]'>
    <div className='text-sm font-black uppercase tracking-widest text-slate-400 mb-2'>
      Letters Explored
    </div>
    ...
  </div>
</div>
```

**Rationale:**
- Settings = Configuration (language, sound, permissions)
- Dashboard = Activity/Progress view
- NEVER should have been in Settings

### Phase 2: Dashboard Unification

**Create unified view:**
```
Dashboard
├── Profile Selector
├── Recent Activity (all types)
│   ├── Alphabet tracing (if played)
│   ├── WordBuilder (if played)
│   ├── Free Draw (if played)
│   └── ...
├── Play Patterns (not "progress")
│   ├── Creative: 45 mins
│   ├── Exploration: 30 mins
│   └── Physical: 20 mins
└── Suggestions (not requirements)
```

### Phase 3: Data Model Cleanup

**Deprecate:**
- `letterProgress` special case
- `getMasteredLettersCount()`
- `resetProgress()` for letters only

**Unify:**
- All activities as `ActivityRecord`
- No special "alphabet" treatment
- Reset clears ALL activity (or none)

---

## Files to Modify

| File | Action | Effort |
|------|--------|--------|
| `Settings.tsx` | Remove alphabet tracking section | 30 min |
| `Dashboard.tsx` | Add unified activity view | 1-2 days |
| `progressStore.ts` | Deprecate letterProgress | 1 day |
| `types/teacher.ts` | Remove unused rubric types | 10 min |

---

## Vision Alignment Note

This architectural inconsistency is a **symptom** of the larger issue:

> **"The app treats alphabet learning as 'special education' while other games are 'just fun'."**

But the vision says:
> **"Kids learn best when they don't know they're learning."**

**If alphabet is special, it signals to parents:**
- "This is the REAL learning"
- "Other games are just for fun"
- "Focus on letter mastery"

**This undermines the "fun first" philosophy.**

The fix: Treat ALL activities equally - alphabet tracing is just another game in the playground, not a curriculum module.

---

**Document Version:** 1.0  
**Recommendation:** Remove alphabet tracking from Settings immediately, unify in Dashboard
