# Gesture Stability Audit Checklist

**Ticket:** TCK-20260307-CRIT-004  
**Stamp:** STAMP-20260307T160300Z-codex-gestaudit  
**Phase:** Audit (Step 1-3 of 9)

---

## Background

**Prior Issue Fixed:** `docs/fixes/finger-number-success-detection-fix.md`

**Pattern Identified:**
- Games with "hold gesture" detection reset stability timer on ANY movement
- Children's hands are naturally shaky
- Need tolerance for minor fluctuations

**Fix Applied to Finger Number Show:**
```typescript
// Added 1-second tolerance before resetting stable match
if (!eligibleMatch && stable.startAt !== null) {
  const timeSinceMatch = nowMs - stable.startAt;
  if (timeSinceMatch > 1000) { // 1 second grace period
    stableMatchRef.current = { startAt: null, target: null, count: null };
  }
}
```

---

## Games to Audit

### Tier 1: High Risk (Hover + Hold)

| Game | File | Interaction Pattern | Risk Level |
|------|------|---------------------|------------|
| Color Match Garden | `ColorMatchGarden.tsx` | Hover over flower + pinch to collect | HIGH |
| Shape Pop | `ShapePop.tsx` | Hover over shape + pinch to pop | HIGH |
| WordBuilder | `WordBuilder.tsx` | Hover over letter + pinch to select | HIGH |
| Memory Match | `MemoryMatch.tsx` | Hover over card + pinch to flip | HIGH |

### Tier 2: Medium Risk (Position Hold)

| Game | File | Interaction Pattern | Risk Level |
|------|------|---------------------|------------|
| Air Guitar Hero | `AirGuitarHero.tsx` | Strum gesture (quick, less risk) | MEDIUM |
| LetterHunt | `LetterHunt.tsx` | Hover + pinch on letters | HIGH |
| NumberTracing | `NumberTracing.tsx` | Follow path with finger | MEDIUM |

### Tier 3: Low Risk (Discrete Actions)

| Game | File | Interaction Pattern | Risk Level |
|------|------|---------------------|------------|
| Bubble Pop | `BubblePop.tsx` | Pop on contact (no hold) | LOW |
| Beat Bounce | `BeatBounce.tsx` | Hit timing (no hold) | LOW |

---

## Audit Checklist

### For Each Game:

#### Step 1: Find Gesture Detection Code
```bash
# Search for gesture detection patterns
grep -n "hover\|pinch\|isPointInCircle\|findHitTarget" src/frontend/src/pages/[Game].tsx
```

#### Step 2: Identify Stability Mechanism
- [ ] Look for `setTimeout` or `setInterval` for stability
- [ ] Look for `stableMatchRef` or similar patterns
- [ ] Look for `Date.now()` timing checks

#### Step 3: Check Reset Logic
**Bad Pattern (Reset immediately):**
```typescript
if (!isMatch) {
  stableMatchRef.current = null; // ❌ Too strict
}
```

**Good Pattern (Tolerance):**
```typescript
if (!isMatch && timeSinceMatch > TOLERANCE_MS) {
  stableMatchRef.current = null; // ✓ Graceful
}
```

#### Step 4: Test with Shaky Input
```typescript
// Simulated shaky hand test
const simulateShakyHand = () => {
  const baseX = 0.5;
  const baseY = 0.5;
  
  // Generate 30 frames with small jitter
  for (let i = 0; i < 30; i++) {
    const jitterX = (Math.random() - 0.5) * 0.02; // ±1% jitter
    const jitterY = (Math.random() - 0.5) * 0.02;
    
    sendHandPosition({
      x: baseX + jitterX,
      y: baseY + jitterY
    });
    
    await delay(33); // ~30fps
  }
};
```

---

## Color Match Garden Deep Dive

**File:** `src/frontend/src/pages/ColorMatchGarden.tsx`

**Interaction Flow:**
1. Hand hovers over flower
2. `isPointInCircle()` checks if inside hit radius
3. Pinch gesture detected via `frame.pinch.transition === 'start'`
4. Match check: `hitTarget.id === expected.id`

**Code to Audit:**
```typescript
// Line ~200-250 (approximate)
const hitTarget = activeTargets.find((target) =>
  isPointInCircle(tip, target.position, TARGET_RADIUS),
);

if (hitTarget.id === expected.id) {
  // Success - but is there stability checking?
  setScore(...);
  triggerHaptic('success');
}
```

**Questions:**
- [ ] Is there a stability requirement before pinch?
- [ ] Does minor hand movement reset the "ready to pinch" state?
- [ ] What is the TARGET_RADIUS? (Too small = frustrating)

---

## Shape Pop Deep Dive

**File:** `src/frontend/src/pages/ShapePop.tsx`

**Interaction Flow:**
1. Cursor hovers over collectible
2. `isPointInCircle()` checks hit
3. Pinch to collect
4. Score updates

**Code to Audit:**
```typescript
// Line ~200-290
const inside = isPointInCircle(tip, targetCenter, GAME_CONFIG[difficulty].popRadius);

if (inside) {
  // Success
  const newStreak = streakRef.current + 1;
  // ... scoring
}
```

**Questions:**
- [ ] Does `popRadius` vary by difficulty appropriately?
- [ ] Is there any stability checking before accepting pinch?
- [ ] Could shaky hands cause missed collections?

---

## WordBuilder Deep Dive

**File:** `src/frontend/src/pages/WordBuilder.tsx`

**Interaction Flow:**
1. Hover over letter target
2. Pinch to select
3. Letter added to word

**Code to Audit:**
```typescript
// Line ~350-440
const hit = findHitTarget(tip, activeTargets, HIT_RADIUS);

if (hit.letter === expectedLetter) {
  // Correct
  const newStreak = streak + 1;
  // ...
}
```

**Questions:**
- [ ] What is HIT_RADIUS? Is it large enough for kids?
- [ ] Any stability checking?

---

## Remediation Template

If a game needs the fix:

```typescript
// BEFORE
if (!isMatch) {
  resetStableMatch();
}

// AFTER
const nowMs = Date.now();
if (!isMatch && stableMatchRef.current.startAt !== null) {
  const timeSinceStable = nowMs - stableMatchRef.current.startAt;
  const TOLERANCE_MS = 1000; // 1 second grace
  
  if (timeSinceStable > TOLERANCE_MS) {
    resetStableMatch();
  }
}
```

---

## Audit Execution Log

| Game | Status | Found Issue | Fix Applied | Tests Pass |
|------|--------|-------------|-------------|------------|
| Color Match Garden | ⬜ | | | |
| Shape Pop | ⬜ | | | |
| WordBuilder | ⬜ | | | |
| Memory Match | ⬜ | | | |
| LetterHunt | ⬜ | | | |
| NumberTracing | ⬜ | | | |

---

## Evidence Collection

**For Each Finding:**
1. Screenshot of relevant code
2. Line numbers
3. Test case showing the issue
4. Fix diff
5. Post-fix test results

---

**Audit Status:** Ready to begin
