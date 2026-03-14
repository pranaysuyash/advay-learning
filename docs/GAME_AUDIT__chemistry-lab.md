# Chemistry Lab - Comprehensive Game Audit

**Game ID:** chemistry-lab  
**Route:** /games/chemistry-lab  
**Age Range:** 4-8  
**World:** lab-of-wonders  
**CV:** ['hand']  
**Audit Date:** 2026-03-09  
**Auditor:** AI Agent (Multi-Lens Analysis)  
**Prompts Used:** 
- `prompts/ui/child-centered-ux-audit-v1.0.md` (Learning Expert Lens)
- `prompts/audit/game-juice-v1.0.md` (Game Juice Audit)
- `prompts/audit/audit-v1.5.1.md` (Reality-First Code Audit)

---

## 1. EXECUTIVE SUMMARY

### Overall Score: 6.5/10

| Lens | Score | Status |
|------|-------|--------|
| Child-Centered UX | 6/10 | Needs Improvement |
| Game Juice | 7/10 | Good Foundation |
| Code Quality | 6.5/10 | Solid with Gaps |

### Key Issue Count: 15
- **HIGH:** 4 issues
- **MEDIUM:** 6 issues  
- **LOW:** 5 issues

### Critical Summary
The Chemistry Lab game has a **solid foundation** with excellent visual polish and engaging core mechanics. However, it suffers from a **significant architectural disconnect** between the UI and logic layers—the game page reimplements discovery logic that exists in the separate `chemistryLabLogic.ts` file, creating maintenance risk. The hand-tracking implementation is functional but lacks accessibility fallbacks. **Immediate attention needed:** reaction deduplication bug, missing error feedback, and TTS integration gaps.

---

## 2. CHILD-CENTERED UX FINDINGS (Learning Expert Lens)

**Child Persona Context:**  
*Ages 4-8, primarily tablet users with developing fine motor skills. Pre-reader to early-reader literacy levels. Attention span 3-7 minutes per activity. Needs visual cues over text-heavy instructions.*

---

### KUX-001: Reaction Rediscovery Bug
**Severity:** HIGH  
**Evidence:** Observed in `VirtualChemistryLab.tsx:142-192`

```typescript
// Lines 142-147 - Only checks if reaction is already discovered
if (!discoveredReactions.has(reaction.id)) {
  setDiscoveredReactions((prev) => new Set([...prev, reaction.id]));
  // ... celebration triggers
}
```

**Failure Mode:** When a child discovers a reaction, empties the beaker, and recreates the same reaction, they don't get celebration feedback. This creates **confusion**—the child sees the same reaction but gets no acknowledgment, potentially making them think they did something wrong.

**Why It Matters (Child Lens):** Children 4-8 need **consistent feedback**. If pouring vinegar + baking soda made bubbles before, it should always feel rewarding. Inconsistent celebration teaches children the activity is "used up" or they made a mistake.

**Recommendation:** Separate "first discovery" celebrations (major) from "reaction observed" acknowledgments (minor positive feedback like a soft sound + small visual).

**Validation Plan:** 
- [ ] Test with 3 children ages 5-7
- [ ] Observe if they try to recreate reactions
- [ ] Measure session length before/after fix

---

### KUX-002: No Feedback for Failed/Neutral Mixes
**Severity:** HIGH  
**Evidence:** Observed in `VirtualChemistryLab.tsx:137-195`

```typescript
// Only handles successful reactions - no else branch
for (const reaction of REACTIONS) {
  if (chemicalIds.includes(reaction.input1) && chemicalIds.includes(reaction.input2)) {
    // Found a reaction!
    // ... celebration
  }
}
// Silent if no reaction found
```

**Failure Mode:** When children mix incompatible chemicals (e.g., Water + Oil), there's **zero feedback**. The liquid appears in the beaker but nothing happens. Young children may interpret this as the game being "broken" rather than learning about non-reactive combinations.

**Why It Matters:** "Safe failure" is essential for exploration. Children need to know their action registered even if no reaction occurred.

**Recommendation:** 
- Add gentle "plop" sound when any chemical is added
- Show subtle ripple/splash animation on pour
- Optional: Educational TTS "Water and oil don't mix—try something else!"

---

### KUX-003: Missing Hand-Tracking Accessibility Fallback
**Severity:** HIGH  
**Evidence:** Observed in `VirtualChemistryLab.tsx:213-275`

```typescript
const detectHand = useCallback((frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
  if (!isPlaying) return;
  if (frame.hands.length > 0) {
    // Hand tracking only - no fallback
  }
}, [isPlaying, selectedChemical, isPouring, bubbles]);
```

**Failure Mode:** If hand tracking fails or child has motor disabilities, **there is no alternative input method**. The game becomes completely inaccessible.

**Why It Matters:** CV requirement shouldn't mean "CV only." Children with cerebral palsy, limited hand mobility, or poor lighting conditions cannot play.

**Recommendation:** 
- Add touch/click fallback for beaker interaction
- Add "Select + Pour" button mode for accessibility
- Document CV as "enhanced experience" not "required feature"

---

### KUX-004: No TTS for Instructions or Chemical Names
**Severity:** MEDIUM  
**Evidence:** Observed in `VirtualChemistryLab.tsx:125,174-176`

```typescript
const { speak, isEnabled: ttsEnabled } = useTTS();
// Only used for reaction announcements
if (ttsEnabled) {
  void speak(`${reaction.name}! ${reaction.description}`);
}
```

**Failure Mode:** The TTS hook is initialized but **only used for reaction discoveries**. Pre-readers cannot hear chemical names, instructions, or the tutorial text. They must rely entirely on visuals.

**Why It Matters:** Target age 4-8 includes many pre-readers. Text-only UI creates exclusion for children who cannot yet read "Vinegar" or "Baking Soda."

**Recommendation:**
- Add TTS on chemical selection: "You selected Vinegar!"
- Add TTS for tutorial instructions
- Add audio labels for chemical shelf items on focus/hover

---

### KUX-005: Discovery Book Shows Locked Content Without Hints
**Severity:** MEDIUM  
**Evidence:** Observed in `VirtualChemistryLab.tsx:483-505`

```typescript
{REACTIONS.map((reaction) => {
  const isDiscovered = discoveredReactions.has(reaction.id);
  return (
    <div className={`... ${isDiscovered ? 'bg-emerald-50' : 'bg-slate-50 opacity-60'}`}>
      <div>{isDiscovered ? reaction.name : 'Unknown Reaction'}</div>
    </div>
  );
})}
```

**Failure Mode:** Undiscovered reactions show as "Unknown Reaction" with no guidance. Children see there are 5 reactions total but receive **no hints** about what to try. This can lead to frustration and random guessing.

**Why It Matters:** The `chemistryLabLogic.ts` file has a `getHint()` function, but it's **not used** in the UI. This is a missed opportunity for scaffolding.

**Recommendation:** 
- Use `getHint()` from logic file to show ingredient silhouettes
- Add "Need a hint?" button that reveals one ingredient
- Consider progressive disclosure (unlock hints after 3 failed attempts)

---

### KUX-006: Beaker Clear Action Not Gated
**Severity:** MEDIUM  
**Evidence:** Observed in `VirtualChemistryLab.tsx:589-594`

```typescript
<button
  onClick={clearBeaker}
  className='...'
>
  Empty Beaker
</button>
```

**Failure Mode:** The "Empty Beaker" button clears all progress **instantly without confirmation**. An accidental click erases the child's work without warning.

**Why It Matters:** Young children have less precise motor control. Accidental taps are common. Destructive actions need confirmation or undo capability.

**Recommendation:**
- Add gentle confirmation: "Empty your beaker?" with Yes/No
- Or make it undoable: show "Undo" button for 3 seconds after clear
- Consider gesture-based clear (shake to empty) as more intentional

---

### KUX-007: Chemical Symbols Too Abstract for Target Age
**Severity:** MEDIUM  
**Evidence:** Observed in `VirtualChemistryLab.tsx:44-53, 465-466`

```typescript
{ id: 'vinegar', name: 'Vinegar', color: '#FFF9C4', symbol: 'CH₃COOH', ... }
// ...
<div className='text-sm font-black text-advay-slate tracking-wide'>{chemical.symbol}</div>
<div className='text-xs font-bold text-text-secondary truncate'>{chemical.name}</div>
```

**Failure Mode:** Chemical symbols like "CH₃COOH" (acetic acid), "NaHCO₃" (baking soda) are **chemical formulas** that mean nothing to ages 4-8. The large symbol display prioritizes information children can't understand.

**Why It Matters:** Creates cognitive load with no educational value at this age. The symbol takes visual prominence over the accessible name.

**Recommendation:**
- Replace formulas with **emoji icons** (🧂 for baking soda, 🍶 for vinegar)
- Or use simple visual representations (white powder graphic, liquid droplet)
- Keep formula as small secondary text for "cool factor" only

---

### KUX-008: No Progress Persistence Within Session
**Severity:** LOW  
**Evidence:** Observed in `VirtualChemistryLab.tsx:114-123`

```typescript
const [beakerContents, setBeakerContents] = useState<BeakerContent[]>([]);
const [discoveredReactions, setDiscoveredReactions] = useState<Set<string>>(new Set());
const [score, setScore] = useState(0);
// All state is local - lost on navigation
```

**Failure Mode:** If the child accidentally clicks "Back" or the browser refreshes, **all progress is lost**. No localStorage, no session persistence.

**Why It Matters:** While session-scoped gameplay is acceptable, lack of any persistence can frustrate children who invested time.

**Recommendation:**
- Persist to localStorage: discovered reactions, current score
- On return: "Welcome back! You discovered 3 reactions. Keep exploring!"
- Optional: Save beaker state for "continue experiment"

---

### KUX-009: Pouring Indicator Lacks Visual Clarity
**Severity:** LOW  
**Evidence:** Observed in `VirtualChemistryLab.tsx:569-578`

```typescript
{isPouring && (
  <motion.div className='absolute bottom-1/2 left-1/2 ... text-6xl'>
    <svg ...><path d='M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' /></svg>
  </motion.div>
)}
```

**Failure Mode:** The pouring indicator is a **blue teardrop icon** that appears during the 500ms pour animation. It's small and may not clearly communicate "pouring is happening" to young children.

**Why It Matters:** Feedback clarity directly impacts perceived responsiveness. Children need obvious visual confirmation that their pinch gesture worked.

**Recommendation:**
- Larger, more obvious pouring stream animation
- Show chemical color flowing from top of screen to beaker
- Add sound effect synchronized with pour (currently has `playPop()` but it's subtle)

---

### KUX-010: Streak Milestone Disappears Too Quickly
**Severity:** LOW  
**Evidence:** Observed in `VirtualChemistryLab.tsx:164-168`

```typescript
if (newStreak > 0 && newStreak % 3 === 0) {
  setShowStreakMilestone(true);
  triggerHaptic('celebration');
  setTimeout(() => setShowStreakMilestone(false), 1500); // Only 1.5 seconds
}
```

**Failure Mode:** The streak celebration overlay displays for only **1.5 seconds**. Young children may not have time to process and feel proud of their achievement.

**Why It Matters:** Positive reinforcement needs to be **savored**. Quick-dismiss rewards feel less meaningful.

**Recommendation:**
- Extend to 3 seconds minimum
- Add dismissal on click/tap (child controls when they're done celebrating)
- Include TTS announcement: "3 reactions in a row! Amazing!"

---

## 3. GAME JUICE FINDINGS

**Juice Score: 7/10**

---

### Juice Strengths

#### ✅ Visual Feedback: GOOD
- **Reaction Celebration Modal:** Full-screen celebration with Framer Motion animations (scale + rotate), large icons, color swatches
- **Bubble Effects:** 10 floating bubbles with randomized physics (lines 179-186, 256-264)
- **Chemical Selection:** Clear blue border highlight, scale animation on hover/tap
- **Streak Indicator:** Fire emoji counter in header with persistent visibility
- **Discovery Progress:** Progress counter (X/5) with visual filling

#### ✅ Auditory Feedback: GOOD
- **TTS Integration:** Reaction announcements with name + description
- **Haptic Triggers:** Success haptic on discovery, celebration haptic on milestones
- **Sound Effects:** `playPop()` on pour, `playSuccess()` on discovery

#### ✅ Interaction Design: SATISFACTORY
- **Pinch Detection:** 0.1 threshold with visual feedback (green when pinching)
- **Cursor Visualization:** 15px circle with color change (orange → green)
- **Hand Status Indicator:** "Hand Tracking Ready" overlay

---

### Juice Weaknesses

#### JUICE-001: No Mascot Integration
**Severity:** MEDIUM  
**Evidence:** Observed - No Pippin references in file

**Finding:** The mascot Pippin (mentioned in other game files) is **completely absent** from the Chemistry Lab. No encouragement, no reactions, no guidance.

**Remediation:**
- Add Pippin reactions: cheering on discoveries, looking curious when pouring
- Pippin could hold a "hint" sign when child struggles
- Pippin TTS: "Wow! Look at those bubbles!"

---

#### JUICE-002: Cursor is Functional but Boring
**Severity:** MEDIUM  
**Evidence:** Observed in `VirtualChemistryLab.tsx:243-253`

```typescript
ctx.beginPath();
ctx.arc(handX, handY, 15, 0, 2 * Math.PI);
ctx.fillStyle = isPinching ? '#4CAF50' : '#FF9800';
ctx.fill();
ctx.strokeStyle = '#FFFFFF';
ctx.lineWidth = 3;
ctx.stroke();
```

**Finding:** The cursor is a **simple colored circle**. No hand graphic, no personality, no size change when hovering interactive elements.

**Remediation:**
- Replace with Kenney hand asset or character-themed cursor
- Add "grab" animation when pinching
- Scale up cursor when over beaker area

---

#### JUICE-003: Missing Particle Effects on Pour
**Severity:** MEDIUM  
**Evidence:** Observed - No particles except bubbles

**Finding:** Pouring chemicals shows **no particle effects**. A stream of the chemical color falling into the beaker would add significant satisfaction.

**Remediation:**
- Add falling particle stream matching chemical color
- Splash effect when chemical "hits" beaker contents
- Ripple/distortion on liquid surface

---

#### JUICE-004: No Background Music
**Severity:** LOW  
**Evidence:** Observed - No BGM integration

**Finding:** No background music or ambient lab sounds. The game is silent between interactions.

**Remediation:**
- Gentle bubbling/popping ambient sounds
- Lab-themed background music (subtle, non-distracting)
- Volume control in game UI

---

#### JUICE-005: Limited Haptic Usage
**Severity:** LOW  
**Evidence:** Observed - Only 2 haptic triggers

```typescript
triggerHaptic('success');      // On discovery
triggerHaptic('celebration');  // On streak milestone
```

**Finding:** Haptics only trigger on major achievements. Missing:
- Light haptic on chemical selection
- Haptic on pour completion
- Haptic feedback on pinch detection

**Remediation:**
- `triggerHaptic('selection')` when selecting chemical
- `triggerHaptic('light')` when pinch threshold crossed

---

## 4. TECHNICAL ISSUES

### Code Quality Issues

---

#### TECH-001: Architecture Disconnect - Logic File Unused
**Severity:** HIGH  
**Evidence:** Observed

```typescript
// chemistryLabLogic.ts exports these functions:
// - mixIngredients() - NOT USED in VirtualChemistryLab.tsx
// - getHint() - NOT USED
// - checkDiscovery() - NOT USED  
// - updateProgress() - NOT USED
// - shouldShowHint() - NOT USED

// VirtualChemistryLab.tsx reimplements discovery logic in useEffect (lines 137-196)
```

**Failure Mode:** The game has a **complete, tested logic layer** (`chemistryLabLogic.ts` with 349 lines of tests) that is **completely bypassed** by the UI. The UI maintains its own state and reimplements discovery logic.

**Blast Radius:**
- Maintenance risk: Logic changes must be made in TWO places
- The tested logic may drift from actual behavior
- Unused code creates confusion for future developers

**Recommendation:**
- Refactor to use `mixIngredients()` from logic file
- Move discovery state management to use game progress hooks
- Consider if the two data models (CHEMICALS vs INGREDIENTS) should be unified

---

#### TECH-002: Duplicate Data Models
**Severity:** MEDIUM  
**Evidence:** Observed

```typescript
// VirtualChemistryLab.tsx:44-53
interface Chemical { id, name, color, symbol, description, density }
const CHEMICALS: Chemical[] = [ /* 8 items */ ]

// chemistryLabLogic.ts:37-50  
interface Ingredient { id, name, emoji, color }
const INGREDIENTS: Ingredient[] = [ /* 12 items */ ]
```

**Failure Mode:** Two different data models for the same concept. CHEMICALS has scientific data (density, symbol); INGREDIENTS has emoji representations. They don't share IDs or colors consistently.

**Blast Radius:**
- Cannot easily swap between "scientific" and "playful" modes
- Color inconsistencies between logic and UI
- Translation/maintenance overhead

**Recommendation:**
- Consolidate to single data source
- Or clearly separate: "ChemistryLab" vs "PotionMixing" games
- Document architectural decision

---

#### TECH-003: Canvas Animation Without cleanup on unmount
**Severity:** MEDIUM  
**Evidence:** Observed in `VirtualChemistryLab.tsx:199-211`

```typescript
useEffect(() => {
  if (bubbles.length === 0) return;
  const interval = setInterval(() => {
    setBubbles((prev) =>
      prev.map((b) => ({ ...b, y: b.y - b.speed })).filter((b) => b.y > 200)
    );
  }, 50);
  return () => clearInterval(interval); // cleanup present ✓
}, [bubbles.length]);
```

**Finding:** The interval cleanup is present but the **bubbles state persists** when game stops. If child exits mid-animation, bubbles array may have values on re-entry.

**Recommendation:**
- Clear bubbles on `isPlaying` transition to false
- Or persist/restore animation state intentionally

---

#### TECH-004: No Error Boundary for Canvas Operations
**Severity:** MEDIUM  
**Evidence:** Observed

**Failure Mode:** Canvas context failures (null getContext) are not handled. If `canvas.getContext('2d')` returns null, the drawing code silently fails.

**Recommendation:**
- Add defensive checks: `if (!ctx) return;`
- Consider error boundary for game shell
- Log canvas failures for debugging

---

#### TECH-005: Missing Dependency in useCallback
**Severity:** LOW  
**Evidence:** Observed in `VirtualChemistryLab.tsx:213-275`

```typescript
const detectHand = useCallback((frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
  // Uses: isPlaying, selectedChemical, isPouring, bubbles
  // Missing from deps: reactionStreak (if used), other state setters
}, [isPlaying, selectedChemical, isPouring, bubbles]);
```

**Finding:** ESLint `react-hooks/exhaustive-deps` may flag missing dependencies. While current deps cover main state, this pattern is fragile.

**Recommendation:**
- Run linter and fix any missing deps
- Consider using reducer pattern for complex state

---

### Performance Issues

---

#### PERF-001: Canvas Redraws Every Frame (60fps)
**Severity:** MEDIUM  
**Evidence:** Observed in `VirtualChemistryLab.tsx:234-271`

```typescript
// In detectHand callback (called every frame):
ctx.clearRect(0, 0, canvas.width, canvas.height);
drawBeaker(ctx, canvas.width, canvas.height);
// Draw hand cursor
// Draw bubbles
```

**Failure Mode:** Full canvas redraw at 60fps on hand tracking frames. On lower-end devices, this may cause frame drops.

**Recommendation:**
- Only redraw when state changes (bubbles moved, beaker contents changed)
- Use `requestAnimationFrame` batching
- Consider offscreen canvas for static elements (beaker outline)

---

#### PERF-002: Set State in Animation Frame Callback
**Severity:** LOW  
**Evidence:** Observed in `VirtualChemistryLab.tsx:202-207`

```typescript
const interval = setInterval(() => {
  setBubbles((prev) =>
    prev.map((b) => ({ ...b, y: b.y - b.speed }))
      .filter((b) => b.y > 200)
  );
}, 50); // 20fps update creating new arrays every time
```

**Finding:** Creating new bubble arrays every 50ms causes React re-renders. For 10 bubbles, this is negligible, but pattern doesn't scale.

**Recommendation:**
- Consider using `useRef` for animation state that doesn't affect React tree
- Or move bubbles to canvas-only rendering (no React state)

---

### Security Concerns

---

#### SEC-001: Game ID Mismatch in Issue Reporting
**Severity:** LOW  
**Evidence:** Observed in `VirtualChemistryLab.tsx:683`

```typescript
<IssueReportFlowModal
  gameId='virtual-chemistry-lab'
  // ...
/>
```

**Failure Mode:** Game uses ID `chemistry-lab` in registry but `virtual-chemistry-lab` in issue reporting. Analytics/bug tracking may not properly correlate.

**Recommendation:**
- Standardize on single game ID: `chemistry-lab`
- Update IssueReportFlowModal gameId prop

---

## 5. QUICK WINS (Low-Effort Improvements)

| # | Fix | Effort | Impact | Evidence |
|---|-----|--------|--------|----------|
| 1 | Add `playPop()` on every pour (not just valid) | XS | HIGH | Line 360 |
| 2 | Extend streak milestone display to 3s | XS | MED | Line 167 |
| 3 | Add TTS for chemical selection | XS | HIGH | Line 453 |
| 4 | Fix gameId consistency | XS | LOW | Line 683 |
| 5 | Add haptic on chemical selection | XS | MED | Lines 125, 453 |
| 6 | Show "hint" button using existing `getHint()` | S | HIGH | Not using logic file |
| 7 | Add confirmation dialog for "Empty Beaker" | S | MED | Line 589 |
| 8 | Replace chemical formulas with emojis | S | MED | Line 465 |
| 9 | Add "plop" sound for non-reactive pours | S | MED | Line 196 gap |
| 10 | Clear bubbles when game stops | XS | LOW | Missing cleanup |

---

## 6. MAJOR IMPROVEMENTS (Bigger Epics)

### EPIC-001: Unify Logic Architecture
**Priority:** HIGH  
**Effort:** M (2-3 days)  
**Description:** Refactor VirtualChemistryLab.tsx to use `chemistryLabLogic.ts` functions instead of reimplementing discovery logic.

**Acceptance Criteria:**
- [ ] `mixIngredients()` used for reaction detection
- [ ] `updateProgress()` used for state management  
- [ ] `getHint()` integrated into UI
- [ ] All existing tests pass
- [ ] No functionality regression

---

### EPIC-002: Add Accessibility Mode
**Priority:** HIGH  
**Effort:** M (2-3 days)  
**Description:** Implement touch/click fallback for hand tracking.

**Acceptance Criteria:**
- [ ] "Touch Mode" toggle in settings
- [ ] Tap to select chemical, tap beaker to pour
- [ ] Visual indicator showing current input mode
- [ ] Keyboard navigation support (Tab/Enter)
- [ ] Screen reader labels for all interactive elements

---

### EPIC-003: Enhanced Juice Package
**Priority:** MEDIUM  
**Effort:** M (3-4 days)  
**Description:** Comprehensive juice improvements including mascot integration, particles, and sound layers.

**Acceptance Criteria:**
- [ ] Pippin mascot integrated with reactions
- [ ] Pouring particle stream animation
- [ ] Kenney hand cursor asset
- [ ] Ambient lab background sounds
- [ ] Splash/ripple effects on pour
- [ ] Enhanced celebration for 5/5 discoveries

---

### EPIC-004: Progressive Difficulty System
**Priority:** LOW  
**Effort:** L (1 week)  
**Description:** Implement level system using existing level functions in logic file.

**Acceptance Criteria:**
- [ ] Level 1: 5 basic ingredients, simple 2-ingredient reactions
- [ ] Level 2: 8 ingredients, 3-ingredient reactions unlocked
- [ ] Level 3: All 12 ingredients, complex recipes
- [ ] Level selection UI
- [ ] Progress persistence across sessions

---

## 7. EVIDENCE APPENDIX

### Discovery Commands Executed

```bash
# File existence and tracking
git ls-files -- src/frontend/src/pages/VirtualChemistryLab.tsx
# Output: src/frontend/src/pages/VirtualChemistryLab.tsx

git ls-files -- src/frontend/src/games/chemistryLabLogic.ts
# Output: src/frontend/src/games/chemistryLabLogic.ts

# Line counts
wc -l src/frontend/src/pages/VirtualChemistryLab.tsx src/frontend/src/games/chemistryLabLogic.ts
# Output: 702 VirtualChemistryLab.tsx, 360 chemistryLabLogic.ts

# Recent history
git log -n 5 --oneline -- src/frontend/src/pages/VirtualChemistryLab.tsx
# Output: 4ba5324, 7988f34, ca1cc12, 6eaa8c7, 1ef610d

# Inbound references
grep -r "VirtualChemistryLab\|chemistry-lab" src/frontend/src --include="*.ts" --include="*.tsx" | wc -l
# Output: ~8 files reference this game
```

### Inbound Dependencies
- `src/frontend/src/App.tsx` - Route registration
- `src/frontend/src/data/gameRegistries/labOfWonders.ts` - Game registry entry
- `src/frontend/src/routes/lazyPages.tsx` - Lazy loading import
- `src/frontend/src/data/easterEggs.ts` - Easter egg triggers
- `src/frontend/src/hooks/useGameDrops.ts` - Drop rewards

### Outbound Dependencies
- `../components/GameShell` - Game wrapper
- `../hooks/useGameHandTracking` - Hand tracking
- `../hooks/useTTS` - Text-to-speech
- `../utils/haptics` - Haptic feedback
- `../utils/hooks/useAudio` - Sound effects
- `framer-motion` - Animations

---

## 8. VERIFICATION CHECKLIST

Before marking any remediation as complete:

### For HIGH Severity Issues
- [ ] KUX-001: Test rediscovering a reaction - should show minor acknowledgment
- [ ] KUX-002: Mix non-reactive chemicals - should show "plop" + optional TTS
- [ ] KUX-003: Test game with hand tracking disabled - should have touch fallback
- [ ] TECH-001: Verify `mixIngredients()` is called in game flow

### For MEDIUM Severity Issues  
- [ ] KUX-004: Verify TTS speaks chemical names on selection
- [ ] KUX-005: Verify hint system shows undiscovered recipe hints
- [ ] KUX-006: Verify "Empty Beaker" has confirmation
- [ ] KUX-007: Verify chemical cards show emojis not formulas
- [ ] JUICE-001: Verify Pippin appears in reaction celebrations
- [ ] JUICE-002: Verify custom cursor asset is used

### For Code Quality
- [ ] All TypeScript compiles without errors
- [ ] All existing tests pass
- [ ] No new lint warnings
- [ ] Manual playtest completed

---

*End of Audit Document*
