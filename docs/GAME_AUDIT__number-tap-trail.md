# Game Audit: Number Tap Trail

**Audit Date:** 2026-03-09  
**Game ID:** number-tap-trail  
**File:** `src/frontend/src/pages/NumberTapTrail.tsx`  
**Age Range:** 4-8  
**World:** number-jungle  
**CV:** ['hand']

---

## 1. Executive Summary

| Metric | Score | Notes |
|--------|-------|-------|
| **Overall Score** | **6.8/10** | Solid foundation with notable gaps in visual feedback and child-centric design |
| **Child-Centered UX** | 6/10 | Functional but lacks scaffolding for younger players |
| **Game Juice** | 6/10 | Basic feedback present; missing polish and delight |
| **Code Quality** | 8/10 | Well-structured, uses shared infrastructure, good TypeScript |
| **Total Issues** | **18** | 7 UX, 6 Juice, 5 Technical |

**Verdict:** A competent implementation that hits basic requirements but misses opportunities for delight and child-appropriate scaffolding. Ready for production with quick wins implemented.

---

## 2. Child-Centered UX Findings (KUX-###)

### 🔴 HIGH: Missing Visual "Trail" Concept (KUX-001)
**Evidence:** `Observed` - Game is called "Number Tap Trail" but there is no trail visualization. Targets are scattered points from `pickSpacedPoints()` (line 36).

**Impact:** The game name promises a trail-following experience, but children see disconnected circles. Cognitive mismatch for 4-6 year olds who expect visual consistency.

**Recommendation:** Add a dotted/dashed line connecting targets in sequence order (1→2→3). Fade segments as numbers are cleared.

---

### 🔴 HIGH: Timer Anxiety for Young Players (KUX-002)
**Evidence:** `Observed` - 90-second countdown (line 55) displayed prominently. No option to disable.

**Impact:** Research shows timed elements increase anxiety in children under 7. Counterproductive for early number learning.

**Recommendation:** 
- Add "Zen Mode" toggle (no timer, focus on sequence completion)
- Or: Replace countdown with a visual "energy bar" that depletes slowly
- Or: Only show timer for levels 4+ (older children)

---

### 🟡 MEDIUM: No Tutorial/Onboarding (KUX-003)
**Evidence:** `Observed` - Pre-game screen (lines 396-446) only shows static instructions. No interactive demonstration.

**Impact:** First-time players (especially 4-5 year olds) may not understand the pinch gesture or sequential concept.

**Recommendation:** Add a 5-second animated demo showing a hand cursor pinching numbers in order, with "Watch me!" text.

---

### 🟡 MEDIUM: Weak Visual Guidance to Next Target (KUX-004)
**Evidence:** `Observed` - "Next" badge (lines 352-359) is small and positioned at screen edge. Main targets have no highlighting.

**Impact:** Children must scan between the corner badge and scattered targets, increasing cognitive load.

**Recommendation:**
- Pulse/glow animation on the next expected target
- Add floating arrow pointing from cleared number to next
- Increase "Next" badge size and position near center

---

### 🟡 MEDIUM: No Progress Within Sequence (KUX-005)
**Evidence:** `Observed` - No indication of "3 of 8 completed" or visual progress bar.

**Impact:** Children lose sense of accomplishment mid-level. No buildup to completion.

**Recommendation:** Add a visual trail path that fills in as numbers are tapped, or a "X of Y" counter with pictorial representation.

---

### 🟢 LOW: Error Feedback Could Be More Encouraging (KUX-006)
**Evidence:** `Observed` - Line 184: `"That is ${hit.value}. Find ${expected.value}."`

**Impact:** Functional but dry. Could reinforce learning more positively.

**Recommendation:** 
- "Oops! That's a {number}. You're looking for {correct}. Try again!"
- Add encouraging character voice: "Almost! Keep looking for {number}!"

---

### 🟢 LOW: Target Size May Be Small for 4-Year-Olds (KUX-007)
**Evidence:** `Observed` - Line 364: `w-[5.5rem] h-[5.5rem]` (~88px). Line 31: `HIT_RADIUS = 0.15` (generous hit area).

**Impact:** Visual target is smaller than hit area; may cause confusion when children "miss" despite hitting the circle.

**Recommendation:** Increase visual target to `w-24 h-24` (96px) or add transparent padding to hit area visualization.

---

## 3. Game Juice Findings

### Overall Juice Score: 6/10

**What's Working:**
- ✅ Streak milestone celebration (lines 217-221)
- ✅ Score popup animation (lines 493-502)
- ✅ Haptic feedback on success/error (lines 190, 216)
- ✅ Celebration overlay with confetti (lines 482-490)
- ✅ Target clear transition (line 372-375: scale + color change)

**What's Missing:**

### 🔴 HIGH: No Particle Burst on Target Clear (JUICE-001)
**Evidence:** `Observed` - Targets simply change color/scale. No particle effect.

**Impact:** Each successful tap should feel rewarding. Missing the "satisfying pop."

**Recommendation:** Add 8-12 particle dots bursting outward from cleared number position.

---

### 🔴 HIGH: Static Targets Don't Attract Attention (JUICE-002)
**Evidence:** `Observed` - Targets are static circles (lines 371-379). No idle animation.

**Impact:** Young children need visual cues to engage. Static UI feels "dead."

**Recommendation:** Gentle floating/bobbing animation on uncleared targets; stronger pulse on "next" target.

---

### 🟡 MEDIUM: Generic Celebration Message (JUICE-003)
**Evidence:** `Observed` - CelebrationOverlay (line 244) shows: `"You traced {letter} beautifully!"` — but this is a NUMBER game, not tracing.

**Impact:** Breaks immersion; shows component was copy-pasted without customization.

**Recommendation:** Pass custom message prop: `"You found all the numbers!"`

---

### 🟡 MEDIUM: Score Popup at Fixed Position (JUICE-004)
**Evidence:** `Observed` - Line 214: `setScorePopup({ points: totalPoints, x: 50, y: 30 })` — always center-screen.

**Impact:** Disconnect between action (tap) and feedback location.

**Recommendation:** Pass actual tap coordinates to show popup at target location.

---

### 🟡 MEDIUM: No Sound Variation for Streaks (JUICE-005)
**Evidence:** `Observed` - Lines 194, 128: Always `playPop()` and `playFanfare()` regardless of streak.

**Impact:** Audio becomes repetitive; misses opportunity for escalating excitement.

**Recommendation:** Pitch-shift pop sound based on streak count, or use ascending musical notes.

---

### 🟢 LOW: No Screen Effects on Error (JUICE-006)
**Evidence:** `Observed` - Error state (lines 177-191) only plays sound and shows text.

**Impact:** Errors feel "soft" — could be more distinct without being scary.

**Recommendation:** Subtle screen shake + red vignette flash (0.2s) on wrong tap.

---

## 4. Technical Issues

### 🟡 MEDIUM: HIT_RADIUS Mismatch Between Code and Tests (TECH-001)
**Evidence:** `Observed`
- Component (line 31): `HIT_RADIUS = 0.15`
- Test file (line 63): `HIT_RADIUS = 0.1`

**Impact:** Tests validate wrong hit detection radius. Could pass tests but fail in production or vice versa.

**Fix:** Sync test constant with component constant.

---

### 🟡 MEDIUM: Unused Variable with Underscore Prefix (TECH-002)
**Evidence:** `Observed` - Line 235: `webcamRef: _webcamRef` — aliased but never used.

**Impact:** Dead code pattern. If not needed, should be destructured without assignment.

**Fix:** Either use it for something (debug overlay?) or destructure as `useGameHandTracking({ ..., webcamRef: undefined })`.

---

### 🟢 LOW: Controls Array Not Memoized (TECH-003)
**Evidence:** `Observed` - Lines 304-319: `controls` array recreated every render.

**Impact:** Unnecessary re-renders of GameControls component.

**Fix:** Wrap with `useMemo(() => [...], [isPlaying])`.

---

### 🟢 LOW: Score Popup Timeout Not Cleaned Up (TECH-004)
**Evidence:** `Observed` - Line 215: `setTimeout(() => setScorePopup(null), 700)` — no ref or cleanup.

**Impact:** If component unmounts during timeout, React warning for state update on unmounted component.

**Fix:** Store timeout ID in ref and clear in useEffect cleanup.

---

### 🟢 LOW: No Fallback for pickSpacedPoints Failure (TECH-005)
**Evidence:** `Observed` - `targetPracticeLogic.ts` lines 45-80: `pickSpacedPoints` has fallback to place anyway, but this can result in overlapping targets.

**Impact:** At higher levels (8-10 targets), targets may overlap making game frustrating.

**Fix:** Increase `maxAttempts` or use grid-based placement for high-density levels.

---

## 5. Quick Wins (5-10 Items)

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| 1 | Fix CelebrationOverlay message (JUICE-003) | 5 min | High |
| 2 | Add gentle bobbing animation to targets (JUICE-002) | 15 min | High |
| 3 | Sync HIT_RADIUS in tests (TECH-001) | 5 min | Medium |
| 4 | Add particle burst on clear (JUICE-001) | 30 min | High |
| 5 | Highlight "next" target with pulse/glow (KUX-004) | 20 min | Medium |
| 6 | Memoize controls array (TECH-003) | 10 min | Low |
| 7 | Add progress indicator (KUX-005) | 25 min | Medium |
| 8 | Make error messages more encouraging (KUX-006) | 10 min | Low |
| 9 | Add score popup at tap location (JUICE-004) | 15 min | Medium |
| 10 | Add subtle screen shake on error (JUICE-006) | 20 min | Low |

**Total Effort:** ~2.5 hours for all quick wins

---

## 6. Major Improvements

### 6.1 Add Visual Trail Path (KUX-001)
**Complexity:** Medium  
**Effort:** 4-6 hours

Implement an SVG path connecting targets in sequence. Animate stroke-dashoffset to "draw" the trail as numbers are cleared. Consider:
- Curved bezier paths for organic feel
- Trail segments light up as numbers are cleared
- Optional: Trail glows brighter as child approaches completion

---

### 6.2 Implement Zen Mode / Timer Options (KUX-002)
**Complexity:** Medium  
**Effort:** 3-4 hours

Add game mode selection to pre-game screen:
- "Adventure Mode" (with timer, for older kids)
- "Zen Mode" (no timer, focus on learning)
- Store preference in localStorage

---

### 6.3 Interactive Tutorial System (KUX-003)
**Complexity:** High  
**Effort:** 8-12 hours

Create reusable TutorialOverlay component:
- Animated hand cursor demonstrating pinch
- Voiceover instructions
- "Try it yourself" practice round with just 2 numbers
- Can be skipped and disabled in settings

---

### 6.4 Escalating Audio Feedback System (JUICE-005)
**Complexity:** Medium  
**Effort:** 4-6 hours

Implement musical reward system:
- Each correct tap plays next note in pentatonic scale
- Wrong tap plays discordant tone
- Level completion plays full chord based on performance

---

### 6.5 Adaptive Difficulty
**Complexity:** High  
**Effort:** 10-15 hours

Track performance metrics and adjust:
- If child struggles: larger targets, longer timer
- If child excels: smaller targets, bonus challenges
- Persist difficulty preference per profile

---

## 7. Accessibility Notes

**Strengths:**
- TTS integration present (`speak()` calls)
- Visual feedback independent of audio
- Haptic feedback for mobile/tablet
- Good color contrast on targets (blue/white)

**Gaps:**
- No keyboard fallback for children who cannot use hand tracking
- No high-contrast mode option
- Timer may be problematic for children with processing delays

---

## 8. Testing Coverage

**Status:** Good
- Unit tests for game logic exist (`numberTapTrailLogic.test.ts`)
- Tests cover: level progression, hit detection, scoring, streak system
- **Action Required:** Fix HIT_RADIUS mismatch (TECH-001)

---

## 9. Evidence Log

| Finding | Type | Location |
|---------|------|----------|
| HIT_RADIUS = 0.15 | Observed | NumberTapTrail.tsx:31 |
| HIT_RADIUS = 0.1 | Observed | numberTapTrailLogic.test.ts:63 |
| No trail visualization | Observed | NumberTapTrail.tsx:361-379 |
| Static target styling | Observed | NumberTapTrail.tsx:371-375 |
| Generic celebration message | Observed | CelebrationOverlay.tsx:244 |
| Timer = 90 seconds | Observed | NumberTapTrail.tsx:55 |
| Score popup fixed position | Observed | NumberTapTrail.tsx:214 |

---

## 10. Summary & Next Steps

**Immediate Actions (This Week):**
1. Fix celebration message text
2. Sync test HIT_RADIUS
3. Add target bobbing animation
4. Add particle burst effect

**Short Term (Next Sprint):**
1. Implement visual trail path
2. Add "next target" highlighting
3. Add progress indicator

**Long Term (Backlog):**
1. Zen mode / timer options
2. Interactive tutorial
3. Adaptive difficulty system

---

*Audit conducted using Evidence-First discipline. All claims labeled as Observed (directly verified), Inferred (logical implication), or Unknown (cannot determine).*

**Audited By:** AI Agent  
**Prompt Used:** Comprehensive Game Auditor  
**Lenses Applied:** Child-Centered UX, Game Juice, Reality-First Code
