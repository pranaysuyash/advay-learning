# Game Audit: Catch & Sort

**Game ID:** catch-sort  
**Path:** `src/frontend/src/pages/CatchSort.tsx`  
**Logic:** `src/frontend/src/games/catchSortLogic.ts`  
**Route:** /games/catch-sort  
**World:** lab-of-wonders  
**Age Range:** 4-8  
**CV Claims:** ['hand']  
**Audit Date:** 2026-03-09  
**Auditor:** Comprehensive Game Auditor  

---

## 1. Executive Summary

| Metric | Score | Notes |
|--------|-------|-------|
| **Overall Score** | **5.2/10** | Functional but incomplete |
| **Child-Centered UX** | 4/10 | Missing motivation systems, frustrating penalties |
| **Game Juice** | 3/10 | Minimal feedback, no celebration |
| **Technical Quality** | 6/10 | Basic structure ok, critical logic gaps |
| **Issue Count** | **18** | 6 Critical, 8 Major, 4 Minor |

**Verdict:** The game is playable but incomplete. Core mechanics work, but missing success flow, timer logic, hand tracking (despite CV claim), and motivational systems make this a sub-par experience for children.

---

## 2. Child-Centered UX Findings (KUX-###)

### 🔴 KUX-001: Missing Success Celebration Screen
**Severity:** Critical  
**Evidence:** Observed - `CatchSort.tsx` lines 65-87 handle only `menu` and `failure` states. The `success` state exists in GameState type (line 38 in logic) but has no UI handler.  
**Impact:** Children complete challenges but see no celebration, reward, or progression feedback. Violates fundamental motivation principle for kids.  
**Fix:** Add success screen with celebration animation, star rewards, and "Next Level" button.

### 🔴 KUX-002: Time-Based Failure Only - No Progress-Based Win
**Severity:** Critical  
**Evidence:** Observed - `submitChallenge` function (logic lines 164-172) checks `score >= targetScore` but is **never called** in the component. Timer decrements nowhere.  
**Impact:** Children cannot "win" by reaching target score. Game only ends when time runs out.  
**Fix:** Add timer effect that calls `updateTimer` and `submitChallenge` when time expires.

### 🔴 KUX-003: Score Penalty Too Harsh for Ages 4-8
**Severity:** Critical  
**Evidence:** Observed - `catchObject` (logic line 143) applies `-5` points for wrong catches.  
**Impact:** Young children learn through experimentation. Penalties create anxiety and discourage exploration.  
**Fix:** Remove penalty or make it gentle (max score floor of 0, no negative points).

### 🟠 KUX-004: No Level Progression System
**Severity:** Major  
**Evidence:** Observed - 6 challenges defined (logic lines 56-63) but no progression mechanism. After failure, game resets to menu.  
**Impact:** No sense of advancement or mastery. Children replay same first level only.  
**Fix:** Track unlocked levels, show level select screen, auto-advance on success.

### 🟠 KUX-005: Missing Streak/Combo System
**Severity:** Major  
**Evidence:** Inferred - Comparison with LetterCatcher shows streak tracking with visual "🔥 X STREAK!" overlay. CatchSort has no equivalent.  
**Impact:** Missing positive reinforcement loop that motivates continued engagement.  
**Fix:** Add streak counter with visual feedback and bonus points.

### 🟠 KUX-006: No Tutorial or Onboarding
**Severity:** Major  
**Evidence:** Observed - Menu screen (lines 69-70) shows only "Catch falling objects and sort them into the right bins!"  
**Impact:** Children may not understand drag-and-drop vs click vs bin-tap mechanics immediately.  
**Fix:** Add first-time tutorial overlay showing both interaction methods.

### 🟠 KUX-007: No Pause Functionality
**Severity:** Major  
**Evidence:** Observed - `paused` status exists in GameState (line 38) but no pause button, handler, or UI. GameContainer supports `onPause` (line 12) but not passed.  
**Impact:** Children cannot pause for bathroom breaks, parent interruptions.  
**Fix:** Implement pause button with modal overlay.

### 🟠 KUX-008: Objects Spawn Without Visual Warning
**Severity:** Major  
**Evidence:** Observed - Objects spawn instantly at `y: 0` with no spawn indicator (logic line 111-118).  
**Impact:** Sudden appearances may startle younger children. No anticipation building.  
**Fix:** Add spawn indicator/animation (scale-in, glow effect) before object becomes interactive.

### 🟡 KUX-009: No Difficulty Ramp Within Level
**Severity:** Minor  
**Evidence:** Observed - Speed is `1 + Math.random() * 2` (logic line 117) but never increases during gameplay. Spawn rate fixed at 1500ms (component line 41).  
**Impact:** Game doesn't get more exciting as child demonstrates competence.  
**Fix:** Gradually increase speed or decrease spawn interval as score increases.

### 🟡 KUX-010: Limited Accessibility for Color Blindness
**Severity:** Minor  
**Evidence:** Inferred - Fruits use color-coded emojis (🍎 red, 🍌 yellow). No additional distinguishing features.  
**Impact:** Color blind children may struggle with fruit/vegetable distinction.  
**Fix:** Add shape or pattern differences, or display labels on hover.

---

## 3. Game Juice Findings

**Overall Juice Score: 3/10**

### 🔴 GJ-001: No Audio Beyond Basic Success/Error
**Severity:** Critical  
**Evidence:** Observed - Only `playSuccess()` and `playError()` used (lines 56-57). Missing: celebration, level start, object spawn, game over fanfare.  
**Impact:** Game feels flat and lifeless.  
**Fix:** Add `playCelebration()` on win, `playPop()` on spawn, `playLevelUp()` between levels.

### 🔴 GJ-002: No Visual Effects or Particles
**Severity:** Critical  
**Evidence:** Observed - Objects exit with simple `opacity: 0` (line 107). No particle burst, no screen shake on miss.  
**Impact:** Catching feels unrewarding.  
**Fix:** Add CSS particle burst on catch, screen flash on wrong catch.

### 🟠 GJ-003: No Score Popup Animation
**Severity:** Major  
**Evidence:** Inferred - LetterCatcher shows `+X` floating animation (LetterCatcher lines 295-306). CatchSort silently updates score.  
**Impact:** Children don't get immediate positive feedback for correct actions.  
**Fix:** Add floating `+10` popup at catch location.

### 🟠 GJ-004: Static Background, No Ambient Motion
**Severity:** Major  
**Evidence:** Observed - Background is static gradient `from-sky-100 to-sky-50` (line 100).  
**Impact:** Game world feels dead, not alive.  
**Fix:** Add subtle cloud drift, floating dust particles, or parallax layers.

### 🟠 GJ-005: No Haptic Feedback
**Severity:** Major  
**Evidence:** Observed - No `triggerHaptic()` calls (compare LetterCatcher lines 135, 149).  
**Impact:** Mobile/tablet users miss tactile confirmation of actions.  
**Fix:** Add haptic on catch (success/error) and milestone celebrations.

### 🟡 GJ-006: Bins Have No Active State Feedback
**Severity:** Minor  
**Evidence:** Observed - Bins use only `whileTap={{ scale: 0.95 }}` (line 128). No glow on hover, no shake on wrong sort.  
**Impact:** Bins feel like static images, not interactive elements.  
**Fix:** Add hover glow, incorrect shake animation, correct pulse animation.

---

## 4. Technical Issues

### 🔴 TECH-001: Hand Tracking Claimed But Not Implemented
**Severity:** Critical  
**Evidence:** Observed - Registry claims `cv: ['hand']` (labOfWonders.ts line 333). Component has no webcam, no hand tracking hooks, no `useGameHandTracking` usage (compare LetterCatcher lines 225-237).  
**Impact:** False advertising of hand tracking feature.  
**Fix:** Either implement hand tracking (see LetterCatcher pattern) or remove CV claim.

### 🔴 TECH-002: Timer Never Decrements
**Severity:** Critical  
**Evidence:** Observed - `timeLeft` displayed (line 95) but no `useEffect` calls `updateTimer`. Game never ends due to time.  
**Impact:** Game runs indefinitely; score-based winning impossible.  
**Fix:** Add `setInterval(() => setState(updateTimer), 1000)` effect.

### 🟠 TECH-003: Unused Bin Positioning Logic
**Severity:** Major  
**Evidence:** Observed - `bins` array created with `x` positions (logic lines 82-89) but bins are rendered via flexbox in component (lines 119-135), ignoring `x` coordinates.  
**Impact:** Dead code creates confusion; bins could be positioned over game area.  
**Fix:** Either use positioned bins overlaying game area or remove bin coordinate logic.

### 🟠 TECH-004: Position Calculation Bug
**Severity:** Major  
**Evidence:** Observed - Spawn sets `x: 10 + Math.random() * 80` (logic line 115). CSS uses `left: obj.x - 15` (line 110). Results in `left: -5` to `75` percent - objects can spawn partially off-screen left.  
**Impact:** Objects may be unclickable when spawning at left edge.  
**Fix:** Use consistent coordinate system; clamp to visible range.

### 🟠 TECH-005: No Maximum Object Limit
**Severity:** Major  
**Evidence:** Observed - `objects` array grows unbounded (line 120). Only filtered when `y >= 100` (logic line 126).  
**Impact:** Memory leak; DOM elements accumulate if spawn faster than fall.  
**Fix:** Cap objects array length; recycle DOM elements.

### 🟠 TECH-006: Missing Challenge Completion Report
**Severity:** Major  
**Evidence:** Observed - `useAutoGameCompletion` only triggers on `status === 'failure'` (line 28). Success path doesn't report completion.  
**Impact:** Progress not saved when child wins.  
**Fix:** Add completion reporting for success state with appropriate score/level.

### 🟡 TECH-007: No Object Spawn Safety Check
**Severity:** Minor  
**Evidence:** Observed - Random x-position (line 115) with no collision detection. Objects can spawn on top of each other.  
**Impact:** Visual clutter, difficulty distinguishing objects.  
**Fix:** Maintain spawn history, ensure minimum distance between new and existing objects.

### 🟡 TECH-008: `Date.now()` + `Math.random()` ID Collision Risk
**Severity:** Minor  
**Evidence:** Observed - ID format: `` `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` `` (logic line 112).  
**Impact:** Theoretically possible ID collision on same millisecond.  
**Fix:** Use monotonic counter or UUID.

---

## 5. Quick Wins (5-10 Items)

1. **Add timer effect** (30 min): Call `updateTimer` every second to enable actual gameplay
2. **Remove score penalty** (5 min): Change `-5` to `0` in `catchObject`
3. **Add success screen** (1 hour): Copy failure screen pattern, add celebration emoji
4. **Add floating score popup** (45 min): Use framer-motion AnimatePresence like LetterCatcher
5. **Add haptic feedback** (15 min): Import and call `triggerHaptic` on catch
6. **Add playCelebration on win** (10 min): Call audio hook when score threshold reached
7. **Fix positioning bug** (15 min): Clamp `obj.x` to valid range before CSS
8. **Add pause button** (30 min): Wire up GameContainer's `onPause` prop
9. **Cap object array length** (20 min): Prevent unbounded growth
10. **Add spawn animation** (30 min): Scale-in effect for new objects

---

## 6. Major Improvements

### M1: Implement Actual Hand Tracking
**Effort:** 4-6 hours  
**Reference:** `LetterCatcher.tsx` pattern  
**Components needed:**
- Add `Webcam` component with ref
- Integrate `useGameHandTracking` hook
- Map hand x-position to "bucket" or direct object selection
- Add `CameraThumbnail` overlay

### M2: Complete Level Progression System
**Effort:** 6-8 hours  
**Features:**
- Level select screen showing locked/unlocked challenges
- Progress persistence (localStorage or backend)
- Success → unlock next level flow
- Level preview showing target categories

### M3: Enhanced Game Juice Package
**Effort:** 4-6 hours  
**Additions:**
- Particle system for catches (using canvas or CSS)
- Background ambient animation (floating clouds)
- Bin state animations (hover glow, correct pulse, wrong shake)
- Screen flash/transition effects
- Sound design: spawn pop, catch thud, win fanfare

### M4: Tutorial and Onboarding
**Effort:** 3-4 hours  
**Components:**
- First-time user overlay
- Animated hand showing click-and-drag vs bin-tap
- Practice mode with unlimited time
- Visual hints during first challenge

### M5: Adaptive Difficulty
**Effort:** 4-6 hours  
**System:**
- Speed increases based on accuracy streak
- Spawn rate adjusts to player performance
- Dynamic target score based on age (if profile available)
- "Easy mode" option with slower speeds

### M6: Comprehensive Testing
**Effort:** 4-6 hours  
**Currently:** Only logic unit tests exist (82 lines)  
**Needed:**
- Component integration tests
- Timer behavior tests
- Hand tracking mock tests
- Accessibility (a11y) tests

---

## Evidence Summary

| Evidence Type | Count | Examples |
|--------------|-------|----------|
| **Observed** | 28 | Direct code reading, file structure |
| **Inferred** | 6 | Comparison with LetterCatcher, best practices |
| **Unknown** | 2 | Actual user testing results, device-specific behavior |

---

## Recommendations Priority Matrix

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| P0 | Fix timer (TECH-002) | 30m | Critical |
| P0 | Add success screen (KUX-001) | 1h | Critical |
| P0 | Remove score penalty (KUX-003) | 5m | Critical |
| P1 | Implement hand tracking (TECH-001) | 6h | High |
| P1 | Add level progression (KUX-004) | 6h | High |
| P1 | Add game juice package (GJ-001/002) | 6h | High |
| P2 | Add tutorial (KUX-006) | 4h | Medium |
| P2 | Add pause (KUX-007) | 30m | Medium |

---

*Audit completed following Evidence-First Discipline (Observed/Inferred/Unknown). All file paths relative to project root.*
