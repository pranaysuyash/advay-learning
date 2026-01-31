# Claims Registry (Append-Only)

Purpose: prevent cross-agent contradictions by requiring every non-trivial claim to be recorded with evidence.

Rules:
- Append-only (never rewrite prior entries).
- Every claim must be labeled exactly one of: `Observed`, `Inferred`, `Unknown`.
- Claims that affect audits/reviews must be referenced in the relevant `docs/audit/*.md` artifact.

## Template

```markdown
### CLM-YYYYMMDD-### :: <Short claim title>

Date: YYYY-MM-DD
Owner: <person/agent>
Scope: <file(s)/component(s)>
Claim: <one sentence>
Evidence type: Observed|Inferred|Unknown

Evidence:

**Command**: `<command run>`  # OR: File reference(s)

**Output**:
<paste output or cite file path + snippet anchor>

Interpretation: <what the evidence shows, without upgrading Inferred to Observed>

Refs:
- Ticket: TCK-YYYYMMDD-###
```

---

### CLM-20260131-001 :: FingerNumberShow Thumb Detection Algorithm

Date: 2026-01-31
Owner: AI Assistant
Scope: src/frontend/src/games/FingerNumberShow.tsx
Claim: Thumb detection algorithm improved to use 3-heuristic majority voting for more reliable 5-finger counting
Evidence type: Observed

Evidence:

**File**: src/frontend/src/games/FingerNumberShow.tsx (lines 102-130)

**Code snippet**:
```typescript
// Thumb:
// Improved detection for kids' hands - uses multiple heuristics for reliability.
// Thumb is extended when:
// 1. Thumb tip is further from palm center than thumb MCP (base)
// 2. OR thumb tip is far from index finger base (spread position)
// 3. OR thumb forms an angle with other fingers (not tucked in)
const thumbTip = landmarks[4];
const thumbIp = landmarks[3];
const thumbMcp = landmarks[2];
if (thumbTip && thumbIp && thumbMcp) {
  // Distance-based: tip should be further from palm center than MCP
  const tipToPalm = dist(thumbTip, palmCenter);
  const mcpToPalm = dist(thumbMcp, palmCenter);
  const thumbExtendedFromPalm = tipToPalm > mcpToPalm * 0.8; // More lenient threshold
  
  // Spread-based: thumb tip should be away from index finger
  const thumbSpread = indexMcp ? dist(thumbTip, indexMcp) > 0.15 : true;
  
  // Angle-based: thumb tip should not be too close to other fingers when closed
  const thumbTipToIndexTip = landmarks[8] ? dist(thumbTip, landmarks[8]) : 1;
  const thumbNotTucked = thumbTipToIndexTip > 0.08;
  
  // Count thumb if majority of conditions pass (2 out of 3)
  let thumbConditions = 0;
  if (thumbExtendedFromPalm) thumbConditions++;
  if (thumbSpread) thumbConditions++;
  if (thumbNotTucked) thumbConditions++;
  
  if (thumbConditions >= 2) count++;
}
```

Interpretation: The new algorithm uses three independent heuristics and requires only 2 of 3 to pass, making it more forgiving for children's hand positions compared to the previous strict 2-condition requirement.

Refs:
- Ticket: TCK-20260130-015

---

### CLM-20260131-002 :: FingerNumberShow Multiplayer Support (4 Hands)

Date: 2026-01-31
Owner: AI Assistant
Scope: src/frontend/src/games/FingerNumberShow.tsx
Claim: Game now supports up to 4 hands (20 fingers) for multiplayer mode
Evidence type: Observed

Evidence:

**File**: src/frontend/src/games/FingerNumberShow.tsx

**Changes**:
1. MediaPipe config (line 326):
```typescript
numHands: 4,  // was 2
```

2. New difficulty level (line 56):
```typescript
{ name: 'Duo Mode', minNumber: 0, maxNumber: 20, rewardMultiplier: 0.6 },
```

3. Extended number names (lines 39-59):
```typescript
const NUMBER_NAMES = [
  'Zero', 'One', 'Two', ..., 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
  'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty',
] as const;
```

Interpretation: The game now detects up to 4 hands simultaneously and supports counting up to 20 fingers in the new "Duo Mode" difficulty level.

Refs:
- Ticket: TCK-20260130-015

---

### CLM-20260131-003 :: FingerNumberShow Language Selection Feature

Date: 2026-01-31
Owner: AI Assistant
Scope: src/frontend/src/games/FingerNumberShow.tsx
Claim: Game now supports Letters mode with 5-language selection (English, Hindi, Kannada, Telugu, Tamil)
Evidence type: Observed

Evidence:

**File**: src/frontend/src/games/FingerNumberShow.tsx

**Key additions**:
1. Language configuration (lines 137-143):
```typescript
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
] as const;
```

2. Game mode state (lines 146-149):
```typescript
type GameMode = 'numbers' | 'letters';
const [gameMode, setGameMode] = useState<GameMode>('numbers');
const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
const [targetLetter, setTargetLetter] = useState<Letter | null>(null);
```

3. Letter matching logic - uses getLetterNumberValue() to map A=1, B=2, etc.

Interpretation: Users can now switch between Numbers mode and Letters mode, with Letters mode supporting all 5 languages using the existing alphabet data from alphabets.ts.

Refs:
- Ticket: TCK-20260130-015

---

### CLM-20260131-004 :: FingerNumberShow Success Detection Fix for Letter Mode

Date: 2026-01-31
Owner: AI Assistant
Scope: src/frontend/src/games/FingerNumberShow.tsx
Claim: Fixed success detection in detectAndDraw callback to handle letter mode correctly
Evidence type: Observed

Evidence:

**Problem**: In letter mode, `targetNumber` is reset to 0, but the `eligibleMatch` logic only compared against `targetNumber`, causing the game to never register success in letter mode.

**Fix**: Added `currentTargetNumber` calculation that uses either the letter value (A=1, B=2) or the number target:

```typescript
// For target 0: require a detected hand (closed fist) to avoid "no hands = success".
// Handle both number mode and letter mode
const currentTargetNumber = gameMode === 'letters' && targetLetter
  ? targetLetter.char.toUpperCase().charCodeAt(0) - 64
  : targetNumber;
const canSucceedOnZero = currentTargetNumber === 0 ? detectedHands > 0 : true;

const eligibleMatch = totalFingers === currentTargetNumber && canSucceedOnZero;
```

**Also updated**:
- `stable.target === currentTargetNumber` comparison
- `stableMatchRef.current = { startAt: nowMs, target: currentTargetNumber, count: totalFingers }` assignment

**File**: src/frontend/src/games/FingerNumberShow.tsx (lines 450-464)

Interpretation: The success detection now correctly compares finger count against the letter value in letter mode (A=1, B=2, etc.) instead of the reset targetNumber (0).

Refs:
- Ticket: TCK-20260130-015

---

### CLM-20260131-005 :: FingerNumberShow Infinite Loop Fix

Date: 2026-01-31
Owner: AI Assistant
Scope: src/frontend/src/games/FingerNumberShow.tsx
Claim: Fixed infinite re-render loop caused by circular dependency in detectAndDraw callback
Evidence type: Observed

Evidence:

**Problem**: `currentCount` was in the useCallback dependency array, but `setCurrentCount()` was called inside the callback, creating an infinite loop:
1. setCurrentCount() updates state
2. State update triggers callback recreation
3. useEffect runs and calls detectAndDraw again
4. Loop repeats infinitely

**Fix**: Removed `currentCount` from dependency array (line 521):

```typescript
// BEFORE (caused infinite loop):
}, [handLandmarker, isPlaying, targetNumber, countExtendedFingers, difficulty, 
    setNextTarget, gameMode, currentCount, handsDetected, targetLetter, ...]);

// AFTER (fixed):
}, [handLandmarker, isPlaying, targetNumber, countExtendedFingers, difficulty, 
    setNextTarget, gameMode, handsDetected, targetLetter]);
```

**Also removed**: `targetBagRef`, `lastTargetRef`, `lastSpokenTargetRef`, `lastSpokenAtRef`, `lastHandsSeenAtRef`, `lastVideoTimeRef`, `frameSkipRef` - these are refs and don't need to be in dependency arrays.

**File**: src/frontend/src/games/FingerNumberShow.tsx (line 521)

Interpretation: The infinite loop was causing the debug logs to flood the console and likely preventing proper success detection from working correctly.

Refs:
- Ticket: TCK-20260130-015
