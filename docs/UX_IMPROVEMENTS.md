# UX Improvements & Issues Log

## Critical Issues Found

### Issue 1: Child Profile Creation Flow Broken

**Problem**: Dashboard "Add Child Profile" button links to `/settings`, but Settings page has no profile creation UI.

**Current Flow**:

1. User clicks "Add Child Profile" on Dashboard
2. Gets redirected to Settings
3. Settings has no profile creation form
4. User is stuck/confused

**Root Cause**: Missing UI for `profileStore.createProfile()`

**Fix Needed**:

- Add child profile creation form to Dashboard OR
- Create separate "/profiles" page OR
- Add modal/dialog for profile creation

**Recommended Solution**: Add modal on Dashboard for creating profiles (keeps context)

---

## Proposed New Features

### Feature 1: Line Smoothing / Anti-Aliasing

**Concept**: After user finishes drawing a stroke, automatically smooth it to create cleaner lines.

**Use Cases**:

- Shaky hand drawings become smoother
- Better visual feedback for kids
- More "professional" looking output

**Implementation Options**:

| Option | Approach              | Pros               | Cons             |
| ------ | --------------------- | ------------------ | ---------------- |
| A      | Real-time smoothing   | Immediate feedback | May feel laggy   |
| B      | Post-stroke smoothing | Clean result       | Delayed feedback |
| C      | Simplified geometry   | Very clean         | Loses detail     |

**Recommended**: Option B (Post-stroke smoothing)

- Apply smoothing when drawing stops
- Use Catmull-Rom spline or Bézier curve fitting
- Reduce points while maintaining shape

**Algorithm Sketch**:

```typescript
// Simplify path using Ramer-Douglas-Peucker or curve fitting
function smoothPath(points: Point[]): Point[] {
  // 1. Reduce noise with moving average
  // 2. Fit Bézier curves to segments
  // 3. Return smoothed points
}
```

---

### Feature 2: Drawing Control Modes (In Progress)

See WORKLOG_TICKETS.md for TCK-20260128-009 through TCK-20260128-016.

Current status:

- ✅ Button Toggle (done)
- ✅ Pinch Gesture (done)
- 🔵 Dwell/Click (pending)
- 🔵 Two-Handed (pending)
- 🔵 Screen Zones (pending)
- 🔵 Hover Height (pending)

---

### Feature 3: Visual Feedback Enhancements

**Ideas**:

1. **Trail Effect**
   - Fading trail behind cursor
   - Shows movement path
   - Helps kids see where they drew

2. **Particle Effects**
   - Sparkles when drawing well
   - Confetti on completion
   - Encouraging visual rewards

3. **Progress Indicator**
   - Show how much of letter traced
   - Circular progress around cursor
   - Real-time accuracy feedback

4. **Ghost Letter**
   - Faint outline of target letter
   - Helps kids stay on track
   - Already partially implemented

---

### Feature 4: Audio Feedback

**Ideas**:

1. **Drawing Sounds**
   - Soft pencil sound when drawing
   - Different tones for different actions

2. **Encouragement**
   - "Good job!" on good tracing
   - "Try again" with hint
   - Celebratory sounds on completion

3. **Letter Sounds**
   - Pronounce letter being traced
   - Phonics for English
   - Word association ("A for Apple")

---

### Feature 5: Gamification

**Ideas**:

1. **Streak System**
   - Consecutive days of practice
   - Visual flame indicator
   - Bonus points for streaks

2. **Achievements**
   - "First Letter" badge
   - "Perfect Score" badge
   - "Speed Demon" for fast tracing

3. **Levels/Unlocks**
   - Unlock new letters by completing basics
   - Unlock themes/backgrounds
   - Progression path visible to kids

4. **Rewards Store**
   - Earn points for good tracing
   - Spend points on stickers/themes
   - Virtual rewards

---

### Feature 6: Parent Dashboard Improvements

**Current Issues**:

- No real progress data (mock data only)
- No detailed per-letter stats
- No time-series tracking

**Improvements**:

1. **Real Progress Tracking**
   - Store actual tracing data
   - Accuracy per letter over time
   - Time spent per session

2. **Detailed Reports**
   - Which letters need more practice
   - Improvement trends
   - Comparison to age benchmarks

---

### UI Borders & Card Contrast Improvements (2026-01-30)

**Finding**: Several card-like UI elements used extremely low-contrast white borders (e.g., `border-white/10`) on a light background, making borders and separators barely visible, especially in large screens and low-contrast viewing conditions.

**Fix implemented (Medium-scope)**:

- Replace faint borders with semantic tokens: `border-border` (standard) and `border-border-strong` (focus states).
- Add `bg-white/10` to primary card surfaces to lift cards off the background.
- Apply `shadow-sm` to main cards and `shadow-md` to emphasized/mastered cards for subtle depth.
- Ensure `select`/`input` controls use `border-border` and `focus:border-border-strong` for clearer affordance.

**Files updated**:

- `src/frontend/src/components/LetterJourney.tsx` (card borders, legend tokens)
- `src/frontend/src/components/ui/Layout.tsx` (header separator)
- `src/frontend/src/components/ui/Card.tsx` (card defaults)
- `src/frontend/src/components/ui/Button.tsx` (secondary variant tokens)
- `src/frontend/src/pages/Settings.tsx`, `src/frontend/src/games/FingerNumberShow.tsx`, `src/frontend/src/pages/Login.tsx`, `src/frontend/src/pages/Register.tsx`, `src/frontend/src/pages/Progress.tsx`, `src/frontend/src/pages/Dashboard.tsx`, `src/frontend/src/pages/Game.tsx`

**Evidence & Results**:

- **Before screenshots**: `docs/screenshots/ui_contrast/before/{home,dashboard,game,progress,settings}.png`
- **After screenshots**: `docs/screenshots/ui_contrast/after/{home,dashboard,game,progress,settings}.png`
- **Unit tests**: `npx vitest --run` → **76 tests passed** (Observed)
- **Build**: `npx vite build` → **build succeeded** (Observed)

**Why**: Improves perceived separation and accessibility without changing the color palette; consistent token use makes future design adjustments easier.

**Next**: Add a visual regression snapshot pipeline and integrate the `StyleTest` page into QA for quick manual checks.

1. **Multiple Child Management**
   - Better child switching
   - Individual progress for each
   - Side-by-side comparison

2. **Export/Share**
   - PDF progress reports
   - Share achievements
   - Print certificates

---

### Feature 7: Accessibility

**Ideas**:

1. **Color Blind Mode**
   - High contrast options
   - Pattern-based feedback (not just color)

2. **Motor Accessibility**
   - Larger hit areas
   - Slower required movement
   - Stabilization for shaky hands

3. **Cognitive Accessibility**
   - Simpler UI mode
   - Fewer distractions
   - Clearer instructions

4. **Screen Reader Support**
   - ARIA labels
   - Audio descriptions
   - Keyboard navigation

---

## Priority Ranking

### P0 (Critical)

1. Fix child profile creation flow

### P1 (High)

2. Complete drawing control modes (Dwell, Two-handed, etc.)
3. Add mode selector UI
4. Line smoothing/anti-aliasing

### P2 (Medium)

5. Visual feedback enhancements (trails, particles)
6. Audio feedback
7. Real progress tracking

### P3 (Low)

8. Gamification (achievements, rewards)
9. Accessibility features
10. Advanced parent dashboard

---

## Next Actions

1. **Immediate**: Fix profile creation (P0)
2. **This week**: Complete drawing control modes + selector (P1)
3. **Next**: Line smoothing (P1)
4. **Later**: Visual/audio enhancements (P2)
