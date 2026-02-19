# Analytics & Tracking Audit - What Should We Actually Track?

**Date:** 2026-01-31  
**Status:** Critical Gap Analysis  
**Problem:** Dashboard only tracks "letters" - ignores all other games
**Ticket:** TCK-20260203-030

---

## 🔴 Current State: Severely Limited

### What's Being Tracked (Letters Only)

```
Dashboard Currently Shows:
├── Letters Learned: 12/26
├── Accuracy: 85%
├── Time Spent: 45 min
└── Streak: 5 days

🚨 MISSING: Everything else!
```

### Games That Exist But Aren't Tracked

| Game | Tracked? | Data Available? |
|------|----------|-----------------|
| Alphabet Tracing | ✅ Yes | Letters, accuracy, time |
| FingerNumberShow | ❌ NO | Numbers shown, finger counts |
| ConnectTheDots | ❌ NO | Completion, paths drawn |
| LetterHunt | ❌ NO | Found letters, time taken |

---

## 🤔 The Real Question: What SHOULD We Track?

### Category 1: Learning Progress (Universal)

```typescript
interface LearningMetrics {
  // SKILLS (not just letters)
  literacy: {
    lettersRecognized: string[];
    lettersTraced: number;      // fine motor
    phoneticAwareness: number;   // sound recognition
  };
  numeracy: {
    numbersRecognized: number[];
    countingAccuracy: number;    // FingerNumberShow
    numberTracing: number;       // fine motor
  };
  motorSkills: {
    handTrackingAccuracy: number;
    fineMotorPrecision: number;  // tracing quality
    handEyeCoordination: number;
  };
}
```

### Category 2: Engagement (Behavioral)

```typescript
interface EngagementMetrics {
  // SESSION LEVEL
  sessions: {
    totalSessions: number;
    averageSessionLength: number;  // minutes
    sessionsPerWeek: number;
    timeOfDay: string[];           // when active
  };
  
  // GAME LEVEL
  gameBreakdown: {
    alphabetTracing: { plays: number; avgDuration: number };
    fingerNumberShow: { plays: number; avgDuration: number };
    connectTheDots: { plays: number; avgDuration: number };
    letterHunt: { plays: number; avgDuration: number };
  };
  
  // ATTENTION
  attention: {
    avgTimePerActivity: number;
    switchesBetweenGames: number;
    pauseFrequency: number;
  };
}
```

### Category 3: Skill Development (Longitudinal)

```typescript
interface SkillDevelopment {
  // IMPROVEMENT OVER TIME
  tracing: {
    initialAccuracy: number;
    currentAccuracy: number;
    improvementRate: number;  // % per week
  };
  
  handTracking: {
    initialDetectionConfidence: number;
    currentConfidence: number;
    pinchAccuracy: number;    // for drawing
  };
  
  recognition: {
    letterRecognitionSpeed: number;  // seconds to identify
    numberRecognitionSpeed: number;
  };
}
```

### Category 4: Game-Specific Metrics

#### Alphabet Tracing

```typescript
interface AlphabetTracingMetrics {
  lettersMastered: string[];        // accuracy > 90%
  lettersInProgress: string[];      // accuracy 50-90%
  lettersNotStarted: string[];      // accuracy < 50%
  
  strokeQuality: number;            // path adherence
  letterCompletionTime: number;     // seconds
  retryCount: number;               // attempts per letter
  
  // Per-letter data
  letterStats: {
    [letter: string]: {
      attempts: number;
      bestAccuracy: number;
      avgTime: number;
      mastered: boolean;
    }
  };
}
```

#### FingerNumberShow

```typescript
interface FingerNumberShowMetrics {
  // NUMBER UNDERSTANDING
  numbersShown: number[];           // which numbers presented
  correctCounts: number;            // correct finger counts
  incorrectCounts: number;          // miscounts
  
  // FINGER RECOGNITION
  fingerDetectionAccuracy: number;
  confusionMatrix: {
    // e.g., often confuses 3 with 4?
    shown3_countedAs4: number;
    // etc.
  };
  
  // PROGRESS
  numbersMastered: number[];        // 100% accuracy
  numbersInProgress: number[];      // partial accuracy
  
  // ENGAGEMENT
  avgTimePerNumber: number;
  streakLength: number;             // consecutive correct
}
```

#### ConnectTheDots

```typescript
interface ConnectTheDotsMetrics {
  puzzlesCompleted: number;
  puzzlesAttempted: number;
  
  // ACCURACY
  pathAccuracy: number;             // how close to lines
  dotConnectionOrder: number[];     // correct sequence?
  
  // DIFFICULTY
  maxPuzzleSize: number;            // most dots completed
  avgCompletionTime: number;
  
  // LEARNING
  numberSequenceUnderstanding: boolean;
}
```

#### LetterHunt

```typescript
interface LetterHuntMetrics {
  lettersFound: number;
  lettersMissed: number;
  
  // RECOGNITION SPEED
  avgTimeToFind: number;
  distractorResistance: number;     // not clicking wrong letters
  
  // PROGRESSION
  difficultyLevel: number;
  gridSizesCompleted: number[];
}
```

---

## 📊 Unified Dashboard Design

### Header: Overall Progress

```
┌────────────────────────────────────────────────────────────┐
│  📊 Overall Progress                         [Export] [⚙️]  │
│                                                            │
│  ┌──────────┬──────────┬──────────┬──────────┐            │
│  │ Literacy │ Numeracy │ Motor    │ Sessions │            │
│  │   65%    │   40%    │   72%    │   12     │            │
│  └──────────┴──────────┴──────────┴──────────┘            │
└────────────────────────────────────────────────────────────┘
```

### Game Breakdown

```
┌────────────────────────────────────────────────────────────┐
│  🎮 Game Activity                                          │
│                                                            │
│  Alphabet Tracing    ████████████░░░  45 min  12 sessions  │
│  Finger Numbers      ██████░░░░░░░░░  20 min   8 sessions  │
│  Connect the Dots    ███░░░░░░░░░░░░  10 min   3 sessions  │
│  Letter Hunt         █████░░░░░░░░░░  15 min   5 sessions  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Skill Development

```
┌────────────────────────────────────────────────────────────┐
│  📈 Skill Development (Last 30 Days)                       │
│                                                            │
│  Letter Recognition:  ████████░░  +23% improvement         │
│  Number Counting:     ██████░░░░  +15% improvement         │
│  Hand Tracking:       █████████░  +31% improvement         │
│  Tracing Precision:   ███████░░░  +18% improvement         │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementation Plan

### Phase 1: Data Model Extension (Week 1)

- [ ] Extend `progress` table to include game_type
- [ ] Create game-specific metrics tables
- [ ] Migration for existing letter-only data

### Phase 2: Game Instrumentation (Week 2-3)

- [ ] AlphabetGame: Already tracked ✓
- [ ] FingerNumberShow: Add tracking hooks
- [ ] ConnectTheDots: Add tracking hooks
- [ ] LetterHunt: Add tracking hooks

### Phase 3: Dashboard Redesign (Week 4)

- [ ] Create unified "Overall Progress" view
- [ ] Add game activity breakdown
- [ ] Add skill development charts
- [ ] Remove letter-only focus

### Phase 4: Parent Insights (Week 5)

- [ ] Weekly summary emails
- [ ] Skill milestone notifications
- [ ] Game recommendations based on progress

---

## ❓ Questions to Answer

### For Parents

1. "Is my child improving?" → Skill development over time
2. "What are they good at?" → Highest accuracy games
3. "What needs practice?" → Lowest accuracy areas
4. "How much are they using it?" → Session frequency & duration

### For Product

1. "Which games are most popular?" → Game play distribution
2. "Where do kids get stuck?" → Drop-off points, retry counts
3. "Is the AI working?" → Hand tracking accuracy improvements

### For Learning Science

1. "What's the optimal session length?" → Correlation: time vs retention
2. "Which order of activities works best?" → Sequence analysis
3. "When do kids lose interest?" → Attention span by age

---

## 🎯 Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Tracked Games | 1 | 4+ |
| Metric Categories | 1 (letters) | 4 (literacy, numeracy, motor, engagement) |
| Parent Insights | Basic stats | Skill development trends |
| Data Granularity | Per-letter | Per-skill, per-game, over time |

---

## 🚨 Immediate Actions Needed

1. **STOP** adding more letter-only features
2. **AUDIT** existing tracking code for reusability
3. **DESIGN** unified progress schema
4. **PRIORITIZE** FingerNumberShow tracking (most different game)

---

**Next Step:** Implement unified tracking schema for all games
