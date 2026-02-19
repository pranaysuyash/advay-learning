# Skills Progression System Design

## Unified Skill Tracking, Leveling & Parent Reports

**Created:** 2026-02-01  
**Status:** Design Document  
**Related:** `ANALYTICS_TRACKING_AUDIT.md`, `progressStore.ts`

---

## Executive Summary

### Current State

| What We Track | What We Don't Track |
|---------------|---------------------|
| ✅ Letter progress per language | ❌ Cross-game skills |
| ✅ Mastery threshold (70%) | ❌ Skill levels (1-10) |
| ✅ Badges (basic) | ❌ Skill XP progression |
| ✅ Time played | ❌ Parent weekly reports |

### Proposed State

- **5 Skill Categories** with level progression
- **XP-based advancement** tied to activities
- **Parent Dashboard** with insights
- **Weekly Email Reports** (optional)

---

## Skill Categories

### The Five Skills

```
┌─────────────────────────────────────────────────────────────┐
│                    🎓 SKILL AREAS                           │
├─────────────┬─────────────┬─────────────┬─────────────┬─────┤
│  📚        │  🔢        │  ✋        │  🧠        │ 🎨  │
│ LITERACY   │ NUMERACY   │  MOTOR     │  LOGIC     │CREATIVE│
│            │            │            │            │       │
│ Reading    │ Counting   │ Hand-eye   │ Sequences  │ Art   │
│ Writing    │ Math       │ Precision  │ Patterns   │ Music │
│ Phonics    │ Recognition│ Tracing    │ Memory     │ Story │
└─────────────┴─────────────┴─────────────┴─────────────┴─────┘
```

### Skill → Game Mapping

| Skill | Primary Games | Secondary Games |
|-------|---------------|-----------------|
| **Literacy** | Alphabet Tracing, Letter Hunt, Word Builder | Story Sequence |
| **Numeracy** | Finger Number Show, Math Monsters, Color by Number | Connect the Dots |
| **Motor** | Alphabet Tracing, Mirror Draw, Connect the Dots, Shape Safari | All tracing games |
| **Logic** | Story Sequence, Connect the Dots | Pattern games (future) |
| **Creative** | Mirror Draw (paint mode), Color by Number | Rhythm Tap |

---

## Leveling System

### Level Structure (1-10)

| Level | Title | XP Required | What Unlocks |
|-------|-------|-------------|--------------|
| 1 | Beginner | 0 | Starting level |
| 2 | Explorer | 100 | First badge |
| 3 | Adventurer | 300 | Second badge |
| 4 | Skilled | 600 | New game variation |
| 5 | Expert | 1000 | Special celebration |
| 6 | Master | 1500 | Map area unlock |
| 7 | Champion | 2100 | New character item |
| 8 | Hero | 2800 | Advanced modes |
| 9 | Legend | 3600 | Secret content |
| 10 | Guardian | 4500 | Max level badge |

### XP Awards by Activity

| Activity | XP per action | Notes |
|----------|---------------|-------|
| **Letter traced** | 10 XP | +5 bonus if 80%+ accuracy |
| **Letter mastered** | 50 XP | First time only |
| **Number correctly shown** | 10 XP | Finger Number Show |
| **Puzzle completed** | 25 XP | Connect the Dots |
| **Hunt completed** | 20 XP | Letter Hunt |
| **Symmetry completed** | 30 XP | Mirror Draw |
| **Painting finished** | 15 XP | Color by Number |
| **Sequence correct** | 25 XP | Story Sequence |
| **Daily streak** | 20 XP | Per day maintained |
| **Weekly streak** | 100 XP | Bonus for 7-day streak |

---

## Data Schema

### SkillProgress Interface

```typescript
interface SkillProgress {
  skillId: 'literacy' | 'numeracy' | 'motor' | 'logic' | 'creative';
  level: number;           // 1-10
  currentXP: number;       // XP in current level
  totalXP: number;         // Lifetime XP
  lastUpdated: string;     // ISO date
  
  // Per-skill breakdown
  subskills: {
    [subskillId: string]: {
      attempts: number;
      accuracy: number;
      mastered: boolean;
    };
  };
}
```

### ActivityLog Interface (for analytics)

```typescript
interface ActivityLog {
  id: string;
  childId: string;
  gameId: string;
  skillsImpacted: string[];    // Multiple skills per activity
  xpEarned: number;
  timestamp: string;
  
  // Game-specific data
  metadata: {
    letter?: string;
    number?: number;
    accuracy?: number;
    timeSpent?: number;
    level?: number;
  };
}
```

### SkillStore Schema (Zustand)

```typescript
interface SkillState {
  // Core data
  skills: Record<string, SkillProgress>;
  activityLog: ActivityLog[];
  
  // Actions
  recordActivity: (activity: ActivityLog) => void;
  getSkillLevel: (skillId: string) => number;
  getXPToNextLevel: (skillId: string) => number;
  getTotalXP: () => number;
  
  // Computed
  getTopSkills: () => SkillProgress[];
  getWeakestSkill: () => SkillProgress;
  getRecentActivities: (days: number) => ActivityLog[];
}
```

---

## Parent Dashboard Design

### Overview Tab

```
┌────────────────────────────────────────────────────────────┐
│  👦 Advay's Learning Progress          Week of Feb 1-7    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  🌟 Total XP: 1,247          📅 Streak: 5 days            │
│                                                            │
│  SKILL LEVELS                                              │
│  ┌──────────────────────────────────────────────────┐     │
│  │ 📚 Literacy   ████████░░ Level 5                 │     │
│  │ 🔢 Numeracy   ██████░░░░ Level 4                 │     │
│  │ ✋ Motor      ██████████ Level 6 ⭐              │     │
│  │ 🧠 Logic      ███░░░░░░░ Level 2                 │     │
│  │ 🎨 Creative   ████░░░░░░ Level 3                 │     │
│  └──────────────────────────────────────────────────┘     │
│                                                            │
│  THIS WEEK                                                 │
│  • Mastered letters: D, E, F                              │
│  • Practiced counting to 7                                 │
│  • Completed 3 Connect the Dots puzzles                   │
│                                                            │
│  💡 INSIGHT: Advay is excelling at Motor skills!          │
│     Consider trying Mirror Draw for a challenge.          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Activity Tab

```
┌────────────────────────────────────────────────────────────┐
│  📊 Activity Breakdown                                     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  TIME SPENT BY GAME                                        │
│  Alphabet Tracing  ████████████████░░░  32 min            │
│  Finger Numbers    ██████████░░░░░░░░░  18 min            │
│  Connect Dots      ████░░░░░░░░░░░░░░░   8 min            │
│                                                            │
│  SESSIONS THIS WEEK                                        │
│  Mon ██ (15 min)                                          │
│  Tue ████ (28 min)                                        │
│  Wed (no session)                                         │
│  Thu █ (8 min)                                            │
│  Fri ███ (22 min)                                         │
│                                                            │
│  BEST ACHIEVEMENTS                                         │
│  🏆 Traced letter E with 95% accuracy                     │
│  🎯 Showed number 5 with fingers correctly                │
│  ⭐ 3-day streak maintained                               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Insights Tab

```
┌────────────────────────────────────────────────────────────┐
│  💡 Learning Insights for Advay                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  STRENGTHS                                                 │
│  ✅ Fine motor precision - Top 20% for age                │
│  ✅ Pattern recognition - Improving rapidly               │
│  ✅ Session consistency - Regular daily use               │
│                                                            │
│  AREAS FOR GROWTH                                          │
│  📈 Logic skills - Try Story Sequence game                │
│  📈 Number counting above 5 - Practice 6-10               │
│                                                            │
│  RECOMMENDATIONS                                           │
│  1. Try Mirror Draw - Great for motor skills              │
│  2. Increase session to 20+ minutes                       │
│  3. Practice numbers 6-10 with Finger Numbers             │
│                                                            │
│  MILESTONES APPROACHING                                    │
│  🔜 5 more letters → Literacy Level 6                     │
│  🔜 100 more XP → Numeracy Level 5                        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Weekly Email Report

### Email Template

```
Subject: 📚 Advay's Weekly Learning Report - Feb 1-7

Hi [Parent Name],

Here's what Advay learned this week:

───────────────────────────────────────
🌟 HIGHLIGHTS
───────────────────────────────────────
• Total learning time: 1 hour 23 minutes
• Skills practiced: Literacy, Motor, Numeracy
• New letters mastered: D, E, F
• Current streak: 5 days 🔥

───────────────────────────────────────
📊 SKILL PROGRESS
───────────────────────────────────────
📚 Literacy:  Level 5 (+120 XP this week)
🔢 Numeracy:  Level 4 (+80 XP this week)  
✋ Motor:     Level 6 (+150 XP this week) ⭐ Top skill!

───────────────────────────────────────
💡 INSIGHT FROM THIS WEEK
───────────────────────────────────────
Advay shows excellent fine motor control!
The tracing accuracy has improved 15% this week.

Consider trying: Mirror Draw for a fun challenge!

───────────────────────────────────────
🎯 GOALS FOR NEXT WEEK
───────────────────────────────────────
• Master 3 more letters (G, H, I)
• Practice counting to 8
• Try a new game!

See detailed progress: [View Dashboard]

Happy Learning! 🦉
Pip & the Advay Vision Team
```

---

## Implementation Roadmap

### Phase 1: Skill Store (Week 1)

- [ ] Create `skillStore.ts` with schema above
- [ ] Integrate with existing `progressStore.ts`
- [ ] XP calculation hooks
- [ ] Level-up detection and celebration

### Phase 2: Activity Logging (Week 1-2)

- [ ] Instrument Alphabet Tracing
- [ ] Instrument Finger Number Show
- [ ] Instrument Connect the Dots
- [ ] Instrument Letter Hunt
- [ ] Persist to localStorage + API queue

### Phase 3: Parent Dashboard (Week 2-3)

- [ ] Skills overview component
- [ ] Activity breakdown chart
- [ ] Insights generator
- [ ] Export to PDF feature

### Phase 4: Email Reports (Week 4)

- [ ] Email template design
- [ ] Backend: Weekly report generation
- [ ] Parent email preferences
- [ ] Unsubscribe handling

---

## Backend API Requirements

### Endpoints Needed

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/progress/skills` | GET | Fetch all skill progress |
| `/api/progress/activity` | POST | Log activity |
| `/api/progress/report` | GET | Generate parent report |
| `/api/notifications/email` | POST | Send weekly email |

### Sync Strategy

```
Frontend (localStorage)  →  Queue (Service Worker)  →  Backend (PostgreSQL)
                         ↓
                   Retry on failure
```

- Offline-first: All progress stored locally
- Sync when online: Queue flushes to API
- Conflict resolution: Last-write-wins (with timestamps)

---

## Privacy Considerations

### What's Stored

- ✅ Skill XP and levels
- ✅ Activity counts and timestamps
- ✅ Accuracy percentages
- ✅ Session durations

### What's NOT Stored

- ❌ Video/camera feeds
- ❌ Audio recordings
- ❌ Exact finger positions
- ❌ Biometric data

### Data Retention

- Activity logs: 1 year
- Skill progress: Indefinite (tied to account)
- Email reports: Last 12 weeks

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Parents check dashboard | 2x/week | Analytics |
| Email open rate | >40% | Email service |
| Skills progression visible | All 5 skills | Coverage check |
| XP-to-engagement correlation | Positive | A/B test |

---

## FAQ

### Q: How does XP differ from "mastery"?

**A:** Mastery is binary (letter mastered or not). XP is cumulative, rewarding practice even without perfection. A child can earn XP even if they don't master a letter.

### Q: Can skills regress?

**A:** No. XP never decreases. If a child struggles, they earn less XP but never lose XP. This maintains positive motivation.

### Q: How are level thresholds determined?

**A:** Based on estimated 15-minute daily sessions:

- Level 2: ~1 week of play
- Level 5: ~1 month
- Level 10: ~3-4 months

### Q: What happens at max level (10)?

**A:** Child becomes a "Guardian" of that skill. Future games may offer Level 11-20 or "Prestige" system.

---

## Change Log

| Date | Change |
|------|--------|
| 2026-02-01 | Initial design document |

---

*End of Document*
