# Parent Dashboard Learning Visualization Spec

**Ticket:** TCK-20260307-CRIT-005  
**Stamp:** STAMP-20260307T160400Z-codex-parentdash  
**Phase:** Design & Implementation (Step 6-7 of 9)

---

## Current State Analysis

**File:** `src/frontend/src/pages/Dashboard.tsx`

**Current Metrics Shown:**
- Total time spent
- Games played count
- Current streak
- Raw session list

**Gap:** No learning outcomes, no skill progression, no educational value communication

---

## User Research (Inferred)

**What Indian Parents Want to Know:**
1. "Is my child actually learning?"
2. "What skills are they developing?"
3. "How do they compare to expected milestones?"
4. "What should they work on next?"
5. "Show me tangible progress"

**Current Frustration:**
- "All I see is 'played for 30 minutes' - but what did they learn?"
- "Is this app actually educational or just a game?"

---

## Proposed Dashboard Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  PARENT DASHBOARD                                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Time Today  │  │ Skills      │  │ Streak      │         │
│  │ 45 mins     │  │ Mastered: 5 │  │ 🔥 7 days   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  SKILLS PROGRESS                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Literacy    ████████████░░░░ 80%                   │   │
│  │   • Letter recognition: ✓ Mastered                 │   │
│  │   • CVC blending: ▶ In Progress (75%)              │   │
│  │   • Sight words: ● Not Started                     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Numeracy    ████████░░░░░░░░ 50%                   │   │
│  │   • Counting 1-20: ✓ Mastered                      │   │
│  │   • Number writing: ▶ In Progress (60%)            │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  THIS WEEK'S ACHIEVEMENTS                                   │
│  🏆 Mastered counting 1-20                                 │
│  🏆 Learned 5 new letters                                  │
│  🏆 Completed 10 WordBuilder words                         │
├─────────────────────────────────────────────────────────────┤
│  RECOMMENDED NEXT STEPS                                     │
│  → Practice sight words (15 min/day)                       │
│  → Try NumberTracing game                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Skill Taxonomy

### Literacy Skills

| Skill ID | Name | Age Range | Assessment Method | Games |
|----------|------|-----------|-------------------|-------|
| LIT-001 | Letter Recognition | 3-5 | Accuracy % | LetterHunt, AlphabetGame |
| LIT-002 | Letter-Sound Correspondence | 4-6 | Accuracy % | PhonicsSounds, BeginningSounds |
| LIT-003 | CVC Word Blending | 5-7 | Words completed | WordBuilder |
| LIT-004 | Sight Word Recognition | 5-8 | Words mastered | SightWordFlash |
| LIT-005 | Rhyme Awareness | 4-6 | Matches correct | RhymeTime |

### Numeracy Skills

| Skill ID | Name | Age Range | Assessment Method | Games |
|----------|------|-----------|-------------------|-------|
| NUM-001 | Counting 1-10 | 3-4 | Accuracy % | Counting Objects |
| NUM-002 | Counting 1-20 | 4-5 | Accuracy % | BubbleCount |
| NUM-003 | Number Recognition | 3-5 | Accuracy % | NumberTapTrail |
| NUM-004 | Number Writing | 4-6 | Tracing accuracy | NumberTracing |
| NUM-005 | Basic Addition | 5-7 | Problems solved | MathMonsters |
| NUM-006 | Pattern Recognition | 4-6 | Patterns completed | PatternPlay |

### Motor Skills

| Skill ID | Name | Age Range | Assessment Method | Games |
|----------|------|-----------|-------------------|-------|
| MOT-001 | Hand-Eye Coordination | 3-8 | Hit accuracy | ShapePop, ColorMatchGarden |
| MOT-002 | Fine Motor Precision | 4-8 | Tracing accuracy | NumberTracing, WordBuilder |
| MOT-003 | Gross Motor Control | 3-8 | Pose accuracy | YogaAnimals, FreezeDance |

### Cognitive Skills

| Skill ID | Name | Age Range | Assessment Method | Games |
|----------|------|-----------|-------------------|-------|
| COG-001 | Visual Memory | 4-8 | Match accuracy | MemoryMatch |
| COG-002 | Attention Span | 3-8 | Session duration | All games |
| COG-003 | Problem Solving | 5-8 | Completion rate | OddOneOut, SizeSorting |

---

## Backend Data Model

**File:** `src/backend/app/db/models/skill_progress.py`

```python
class SkillProgress(Base):
    """Tracks child skill mastery over time"""
    __tablename__ = "skill_progress"
    
    id: Mapped[str] = mapped_column(String, primary_key=True)
    child_id: Mapped[str] = mapped_column(ForeignKey("child_profiles.id"))
    skill_id: Mapped[str] = mapped_column(String)  # LIT-001, NUM-002, etc.
    
    # Progress tracking
    current_level: Mapped[int] = mapped_column(Integer, default=0)  # 0-100
    status: Mapped[str] = mapped_column(String)  # "not_started", "in_progress", "mastered"
    
    # Timestamps
    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    mastered_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    last_activity_at: Mapped[datetime] = mapped_column(DateTime)
    
    # Evidence
    sessions_count: Mapped[int] = mapped_column(Integer, default=0)
    accuracy_avg: Mapped[float] = mapped_column(Float, default=0.0)
```

---

## Skill Calculation Algorithm

```typescript
// src/frontend/src/services/skills/skillCalculator.ts

interface SkillProgress {
  skillId: string;
  currentLevel: number; // 0-100
  status: 'not_started' | 'in_progress' | 'mastered';
  evidence: SessionEvidence[];
}

class SkillCalculator {
  calculateSkillLevel(skillId: string, sessions: AnalyticsSession[]): SkillProgress {
    const relevantSessions = sessions.filter(s => 
      s.events.some(e => e.skillId === skillId)
    );
    
    if (relevantSessions.length === 0) {
      return { skillId, currentLevel: 0, status: 'not_started', evidence: [] };
    }
    
    // Calculate weighted accuracy
    const totalAttempts = relevantSessions.reduce((sum, s) => 
      sum + (s.metrics.attempts || 0), 0
    );
    
    const successfulAttempts = relevantSessions.reduce((sum, s) => 
      sum + (s.metrics.successes || 0), 0
    );
    
    const accuracy = totalAttempts > 0 ? successfulAttempts / totalAttempts : 0;
    
    // Calculate level (0-100)
    // Formula: accuracy * 0.7 + consistency * 0.3
    const consistency = this.calculateConsistency(relevantSessions);
    const level = Math.round((accuracy * 70) + (consistency * 30));
    
    // Determine status
    let status: 'in_progress' | 'mastered' = 'in_progress';
    if (level >= 80 && relevantSessions.length >= 5) {
      status = 'mastered';
    }
    
    return {
      skillId,
      currentLevel: level,
      status,
      evidence: relevantSessions.map(s => ({
        date: s.endTime,
        accuracy: s.metrics.accuracyPct,
      })),
    };
  }
  
  private calculateConsistency(sessions: AnalyticsSession[]): number {
    // Coefficient of variation inverse
    // Lower variation = higher consistency
    const accuracies = sessions.map(s => s.metrics.accuracyPct);
    const mean = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
    const variance = accuracies.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / accuracies.length;
    const cv = Math.sqrt(variance) / mean; // Coefficient of variation
    
    // Invert and normalize: lower CV = higher consistency score
    return Math.max(0, Math.min(100, 100 - (cv * 50)));
  }
}
```

---

## UI Components

### 1. SkillProgressCard

```tsx
interface SkillProgressCardProps {
  category: 'literacy' | 'numeracy' | 'motor' | 'cognitive';
  skills: SkillProgress[];
}

const SkillProgressCard: React.FC<SkillProgressCardProps> = ({ category, skills }) => {
  const averageProgress = skills.reduce((sum, s) => sum + s.currentLevel, 0) / skills.length;
  
  return (
    <div className="bg-white rounded-2xl border-2 border-[#F2CC8F] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-lg text-advay-slate capitalize">{category}</h3>
        <span className="text-2xl font-black text-[#F2CC8F]">{Math.round(averageProgress)}%</span>
      </div>
      
      <ProgressBar progress={averageProgress} color="#F2CC8F" />
      
      <div className="mt-4 space-y-2">
        {skills.map(skill => (
          <div key={skill.skillId} className="flex items-center gap-2">
            <SkillStatusIcon status={skill.status} />
            <span className="text-sm font-bold text-slate-600">{skill.name}</span>
            <span className="text-xs text-slate-400 ml-auto">{skill.currentLevel}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 2. AchievementBadge

```tsx
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  rarity: 'common' | 'rare' | 'epic';
}

const AchievementBadge: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
  <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-3 border-2 border-yellow-200">
    <span className="text-3xl">{achievement.icon}</span>
    <div>
      <p className="font-black text-advay-slate">{achievement.title}</p>
      <p className="text-xs text-slate-500">{achievement.description}</p>
    </div>
  </div>
);
```

### 3. WeeklyReportEmail

```tsx
// Email template for weekly digest
const WeeklyReportEmail: React.FC<{ data: WeeklyData }> = ({ data }) => (
  <EmailTemplate>
    <h1>Pranav's Learning Week</h1>
    
    <StatsGrid>
      <Stat value={data.totalMinutes} label="Minutes Played" />
      <Stat value={data.skillsImproved} label="Skills Improved" />
      <Stat value={data.achievementsEarned} label="Achievements" />
    </StatsGrid>
    
    <Section title="New Skills Mastered">
      {data.newMasteries.map(skill => (
        <AchievementRow key={skill.id} skill={skill} />
      ))}
    </Section>
    
    <Section title="Recommended This Week">
      {data.recommendations.map(rec => (
        <RecommendationCard key={rec.id} recommendation={rec} />
      ))}
    </Section>
  </EmailTemplate>
);
```

---

## API Endpoints

```typescript
// GET /api/v1/children/{child_id}/skills
interface GetSkillsResponse {
  literacy: SkillProgress[];
  numeracy: SkillProgress[];
  motor: SkillProgress[];
  cognitive: SkillProgress[];
  lastUpdated: string;
}

// GET /api/v1/children/{child_id}/achievements
interface GetAchievementsResponse {
  thisWeek: Achievement[];
  allTime: Achievement[];
  nextMilestones: Milestone[];
}

// GET /api/v1/children/{child_id}/recommendations
interface GetRecommendationsResponse {
  games: RecommendedGame[];
  skills: RecommendedSkill[];
  reasoning: string;
}
```

---

## Implementation Phases

### Phase 1: Backend (3 days)
- [ ] Create SkillProgress model
- [ ] Create skill calculation service
- [ ] Add API endpoints
- [ ] Write tests

### Phase 2: Frontend UI (5 days)
- [ ] Create SkillProgressCard component
- [ ] Create AchievementBadge component
- [ ] Update Dashboard page layout
- [ ] Add skill progress section
- [ ] Add achievements section

### Phase 3: Weekly Email (2 days)
- [ ] Create email template
- [ ] Add backend job for weekly summary
- [ ] Integrate with email service

### Phase 4: Polish (2 days)
- [ ] Mobile responsiveness
- [ ] Loading states
- [ ] Error handling
- [ ] A/B test different layouts

---

## Success Metrics

**Parent Engagement:**
- Dashboard visit frequency (target: 2x/week)
- Time spent on dashboard (target: >1 min)
- Email open rate (target: >40%)

**Learning Outcomes:**
- Skills mastered per child per month
- Correlation with game performance
- Parent satisfaction (survey)

---

**Spec Status:** Ready for implementation
