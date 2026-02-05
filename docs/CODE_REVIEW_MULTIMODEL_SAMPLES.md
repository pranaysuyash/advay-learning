# Code Samples for Multi-Model Architecture Review

## Context
Kids learning app (2-9yr). 4 games with hand tracking. All "Easy" difficulty. 
No age-based UI adaptation. Backend has quest system (hidden) + limited analytics.

---

## CODE SAMPLE 1: Game Configuration (Games.tsx - Lines 12-71)

```tsx
interface Game {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: IconName;
  ageRange: string;  // Hardcoded string "2-8 years"
  category: string;
  difficulty: string;  // All "Easy" - no progression
  isNew?: boolean;
}

export function Games() {
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const { currentProfile, profiles, setCurrentProfile } = useProfileStore();
  const [showProfilePicker, setShowProfilePicker] = useState(false);

  const availableGames: Game[] = [
    {
      id: 'alphabet-tracing',
      title: 'Draw Letters',
      description: 'Draw letters with your finger and see them come alive! 🎉',
      path: '/games/alphabet-tracing',
      icon: 'letters',
      ageRange: '2-8 years',  // ⚠️ String, not parsed
      category: 'Alphabets',
      difficulty: 'Easy',  // ⚠️ No progression
    },
    {
      id: 'finger-number-show',
      title: 'Finger Counting',
      description: 'Show numbers with your fingers and Pip will count them! 🔢',
      path: '/games/finger-number-show',
      icon: 'hand',
      ageRange: '3-7 years',
      category: 'Numbers',
      difficulty: 'Easy',
    },
    // ... 2 more games (all "Easy")
  ];
```

**Questions for Review**:
1. How should game configuration be refactored for scalability?
2. Should difficulty be enum-based with progression levels?
3. Should ageRange be parsed and used for filtering?

---

## CODE SAMPLE 2: Progress Analytics Schema (progress.py)

```python
class Progress(Base):
    """Learning progress model."""
    
    __tablename__ = "progress"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    profile_id: Mapped[str] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    activity_type: Mapped[str] = mapped_column(String, nullable=False)  # drawing, recognition, game
    content_id: Mapped[str] = mapped_column(String, nullable=False)  # letter, word, object identifier
    score: Mapped[int] = mapped_column(Integer, default=0)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    meta_data: Mapped[dict] = mapped_column(JSON, default=dict)  # detailed tracking
    idempotency_key: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        UniqueConstraint("profile_id", "idempotency_key", name="uix_profile_id_idempotency_key"),
    )
    profile: Mapped["Profile"] = relationship("Profile", back_populates="progress")
```

**Observations**:
- Limited granularity (only completion tracked, not per-attempt)
- meta_data JSON but no schema defined for structured events
- No game-specific event types (all maps to generic "drawing" or "recognition")
- No gesture quality or performance metrics
- No engagement metrics (time-to-first-action, retry patterns)

**Questions for Review**:
1. Is meta_data appropriate for extensibility or should events be typed?
2. What per-attempt metrics should be captured for learning analysis?
3. How should gesture quality (hand steadiness, accuracy) be tracked?

---

## CODE SAMPLE 3: UI Component Pattern (GameCard.tsx - Colors)

```tsx
// Category color mappings - IDENTICAL FOR DIFFICULTY
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'Alphabets': { bg: 'bg-bg-tertiary', text: 'text-text-secondary', border: 'border-border' },
    'Numeracy': { bg: 'bg-bg-tertiary', text: 'text-text-secondary', border: 'border-border' },
    'Fine Motor': { bg: 'bg-bg-tertiary', text: 'text-text-secondary', border: 'border-border' },
    'default': { bg: 'bg-bg-tertiary', text: 'text-text-secondary', border: 'border-border' },
};

// Difficulty color mappings - ALL IDENTICAL (no visual distinction)
const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'Easy': { bg: 'bg-bg-tertiary', text: 'text-text-secondary', border: 'border-border' },
    'Medium': { bg: 'bg-bg-tertiary', text: 'text-text-secondary', border: 'border-border' },
    'Hard': { bg: 'bg-bg-tertiary', text: 'text-text-secondary', border: 'border-border' },
    'default': { bg: 'bg-bg-tertiary', text: 'text-text-secondary', border: 'border-border' },
};
```

**Problems**:
- Easy/Medium/Hard have IDENTICAL colors (no visual hierarchy)
- No visual feedback for progression or difficulty
- Children can't distinguish difficulty levels

**Questions for Review**:
1. How should color progression be implemented for children 2-9yr?
2. Should difficulty colors use different saturation, brightness, or hue?
3. Should icons/symbols supplement color-only difficulty indication?

---

## CODE SAMPLE 4: Profile Age Tracking (profileStore.ts)

```tsx
export interface Profile {
  id: string;
  name: string;
  age?: number;  // ✓ Age tracked
  preferred_language: string;
  created_at: string;
}

interface ProfileState {
  profiles: Profile[];
  currentProfile: Profile | null;
  // ... methods
}
```

**Observation**: Age is tracked in profile but **NOT USED in Games.tsx for filtering or adaptation**.

**Questions for Review**:
1. How should age-based filtering be architected?
2. Should recommended games be filtered by currentProfile.age?
3. Should UI components adapt based on age?

---

## CODE SAMPLE 5: Quest System (quests.ts - Hidden)

```tsx
// Backend-configured 8 quests across 4 islands
// Island 1: Alphabet Lighthouse (Starter)
// Island 2: Number Nook (Unlocks after Island 1)
// Island 3: Treasure Bay (Unlocks after Island 2)
// Island 4: Star Studio (Unlocks after Island 3)

// Status: ⚠️ Configured but NOT EXPOSED in Games.tsx
// Users don't see:
// - Island progression
// - Quest chains
// - Unlocking mechanics
// - XP rewards
```

**Questions for Review**:
1. Should quests be exposed as the primary progression system?
2. How should island unlocking mechanics work?
3. Should Games page show individual games or quest-based structure?

---

## Review Tasks for Models

### For Claude (Architecture & Design)
Focus on:
- Scalability of hardcoded game config
- Age-based adaptation architecture
- Quest system integration
- Backend-driven vs frontend-driven progression

### For GPT (Code Quality & Patterns)
Focus on:
- Component duplication patterns
- Analytics schema extensibility
- Refactoring opportunities
- Code organization best practices

### For Gemini (UX & Engagement)
Focus on:
- Difficulty communication effectiveness
- Engagement loop tightness
- Age-appropriate design patterns
- Feedback quality per age group

---

## Desired Output from Models

1. **High-confidence findings** (agree on this issue)
2. **Top 3 improvement suggestions** (ordered by impact)
3. **Architectural recommendations** (how to restructure)
4. **Implementation prioritization** (what first?)
5. **Confidence levels** (how sure are you?)

---

**Audit Ticket**: TCK-20260205-001
**Next**: Send to Claude, GPT, Gemini for parallel analysis
