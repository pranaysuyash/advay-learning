# Phase 3: Playtest Audit Execution Guide (TCK-20260205-001)

## Overview

Conduct persona-based playtest audit of 4 games with 8 personas to verify multi-model code review findings and identify UX issues across age groups.

**Focus Areas** (from multi-model analysis):

1. Difficulty colors - Are they visually distinct? Can users tell difficulty levels apart?
2. Age-based component adaptation - Do buttons, text size, instructions change per age group?
3. Analytics capture - Are gameplay events fired? Are they logged?
4. Hidden quest system - Is it accessible to users or truly hidden?
5. Age-to-content mapping - Do games adapt content based on child's profile age?

---

## Test Setup

### Server Status ✅

- **Frontend**: Running on <http://localhost:6173>
- **Backend**: Running on <http://localhost:8001>

### Profile Setup

Before starting playtests, verify test profiles exist or create them:

```bash
# Check if profiles exist in localStorage (browser dev tools)
# OR create new profiles via app:

# Asha (2-3yr):
- Create profile: "Asha", age: 2, language: English

# Dev (4-6yr):
- Create profile: "Dev", age: 5, language: English

# Maya (7-9yr):
- Create profile: "Maya", age: 8, language: English

# Arun (Parent):
- Create profile: "Arun", age: 35, role: Parent

# Priya (Teacher):
- Create profile: "Priya", age: 40, role: Teacher (if available)
```

### Browser Console Setup

Open DevTools (F12 or Cmd+Opt+J) and monitor:

- Console logs (errors, warnings, analytics events)
- Network tab (API calls, event tracking)
- Application tab (localStorage, sessionStorage)

---

## Playtest Protocol

### Test 1: AlphabetGame (Draw Letters) - Asha Persona (2-3yr)

**Expected Behaviors** (from multi-model analysis):

- Toddler will tap/swipe randomly
- Can't follow written instructions
- Needs immediate visual feedback
- Gets bored without celebration

**Test Steps**:

1. **Launch game**:
   - Open <http://localhost:6173>
   - Select "Asha" profile
   - Tap "Games"
   - Tap "Draw Letters" or "AlphabetGame"

2. **Observe**:
   - [ ] Game loads without errors (check console)
   - [ ] Game difficulty shows (Easy, Medium, or Hard?)
   - [ ] Difficulty color visible (should be different per level per P0 findings)
   - [ ] Instructions appear (text? voice? images?)
   - [ ] Drawing canvas loads

3. **Play**:
   - [ ] Try to draw a letter (watch for gesture recognition)
   - [ ] Success: Does celebration animation appear?
   - [ ] Check console for analytics events (expected: gesture completed, letter recognized, level up)
   - [ ] Can you navigate back to games list?

4. **Evidence Capture**:
   - [ ] Screenshot: Game title + difficulty display
   - [ ] Screenshot: Drawing canvas after success
   - [ ] Console log: Analytics events fired (copy-paste into notes)
   - [ ] Note: Any errors or console warnings?

5. **Questions**:
   - [ ] Can 2-3yr child tap buttons without help? (Button size adequate?)
   - [ ] Are celebration sounds/visuals engaging or overwhelming?
   - [ ] Can child understand game goal without reading instructions?

---

### Test 2: AlphabetGame (Draw Letters) - Dev Persona (4-6yr)

**Expected Behaviors**:

- Can follow simple instructions
- Wants to know if they won or lost
- Tries multiple times on failure
- Gets excited about rewards

**Test Steps**:

1. **Launch game**:
   - Switch to "Dev" profile (age 5)
   - Open "Draw Letters" game

2. **Observe**:
   - [ ] Instructions clear? (vs Asha test - should be similar, but are they?)
   - [ ] Difficulty displayed (still hardcoded "Easy"? P0 finding)
   - [ ] Progress feedback (stars, points, level badge)
   - [ ] Error messages encouraging or discouraging?

3. **Play**:
   - [ ] Complete 3 letters successfully
   - [ ] Observe: Does progress bar/star count update?
   - [ ] Check console for analytics: gesture data, level progression, XP earned

4. **Evidence**:
   - [ ] Screenshot: Difficulty display + progress feedback
   - [ ] Screenshot: Completed letter celebration
   - [ ] Console: Analytics event (level.completed or similar)
   - [ ] Note: How does UI differ from Asha test?

5. **Questions**:
   - [ ] Is difficulty progression visible (locked → unlocked)?
   - [ ] Do instructions adapt for 4-6yr comprehension vs 2-3yr?
   - [ ] Is progress tracking motivating?

---

### Test 3: AlphabetGame (Draw Letters) - Maya Persona (7-9yr)

**Expected Behaviors**:

- Reads and follows complex instructions
- Wants to optimize performance
- Asks about harder levels
- Wants to understand "why"

**Test Steps**:

1. **Launch game**:
   - Switch to "Maya" profile (age 8)
   - Open "Draw Letters"

2. **Observe**:
   - [ ] Instructions detailed? (vs Dev/Asha - should be more complex)
   - [ ] Difficulty levels visible? (Can player choose Easy/Medium/Hard?)
   - [ ] Achievement system (badges, leaderboard, mastery levels)
   - [ ] Can player access harder content?

3. **Play**:
   - [ ] Complete letters in Easy
   - [ ] Try to unlock Medium or Hard
   - [ ] Check if age-based content gating works (P0 finding: age unused)

4. **Evidence**:
   - [ ] Screenshot: Difficulty selection screen (if exists)
   - [ ] Screenshot: Achievement unlocks
   - [ ] Console: Analytics for level attempted, difficulty, age-based gating
   - [ ] Note: Is content adapted based on age 8 profile?

5. **Questions**:
   - [ ] Can Maya access all difficulty levels or are some locked?
   - [ ] Does game explain unlock criteria (win 3x, time gating)?
   - [ ] Is there progression from letter recognition → speed challenge → accuracy?

---

### Test 4: FingerNumberShow (Finger Counting) - All 3 Child Personas

**Purpose**: Check if gesture recognition + analytics work across age groups.

**Test Steps** (per persona):

1. **Launch game**:
   - Select persona (Asha → Dev → Maya in sequence)
   - Open "Finger Numbers" game

2. **Observe**:
   - [ ] Camera permission requested? (P1 hardening)
   - [ ] Hand detection active (watch canvas for hand skeleton)?
   - [ ] Gesture feedback (recognized gesture highlighted)?
   - [ ] Analytics: Gesture events logged (position, confidence, timestamp)

3. **Play**:
   - [ ] Hold up 1 finger (expected: game shows "1")
   - [ ] Hold up 3 fingers (expected: game shows "3")
   - [ ] Check console for gesture events (MediaPipe data flowing?)

4. **Evidence**:
   - [ ] Screenshot: Hand detection canvas
   - [ ] Console: Gesture recognition events (hand position, finger count)
   - [ ] Console: Analytics batch API call (event payload)
   - [ ] Note: Does analytics include age-specific context?

5. **Questions**:
   - [ ] Does hand detection work for all hand sizes (toddler vs older child)?
   - [ ] Are gesture events timestamped with user age?
   - [ ] Is gesture quality metric captured (hand steadiness, detection confidence)?

---

### Test 5: Quest System Discovery - Maya Persona (7-9yr)

**Purpose**: Verify if hidden quest system is accessible (P0 finding).

**Test Steps**:

1. **Navigate to Home/Dashboard**:
   - Switch to Maya profile
   - Go back to main dashboard (not game view)

2. **Look for Quest Access**:
   - [ ] Is there a "Quests" menu item? (Multi-model finding: hidden)
   - [ ] Check home page for quest indicators
   - [ ] Look for "Learning Islands" or "Quest Chains" mentions
   - [ ] Check profile or settings for quest unlock status

3. **Try Direct URL** (if quests hidden in UI):
   - [ ] Try <http://localhost:6173/quests>
   - [ ] Try <http://localhost:6173/islands>
   - [ ] Does it load? Redirect? Show 404?

4. **Check Console**:
   - [ ] Look for quest-related API calls
   - [ ] Check localStorage for quest data
   - [ ] Is quest data fetched but hidden from UI?

5. **Evidence**:
   - [ ] Screenshot: Home page (is there any quest indication?)
   - [ ] Screenshot: Profile page (any quest status?)
   - [ ] Console: Network tab (any /quests or /islands API calls?)
   - [ ] Note: Quest system is fully built (8 chains found in audit) but UI access is hidden

6. **Questions**:
   - [ ] Are quests truly hidden or just hard to find?
   - [ ] If quest data exists, why isn't it exposed in games selection?
   - [ ] Should quests be primary navigation for older children (7-9yr)?

---

### Test 6: Analytics Verification - Parent View (Arun Persona)

**Purpose**: Verify if parent dashboard shows gameplay analytics.

**Test Steps**:

1. **Create Arun Profile**:
   - Create parent profile "Arun", age 35, role: Parent (if available)
   - Link to child profiles (Asha, Dev, Maya)

2. **Parent Dashboard**:
   - Login as Arun
   - Look for analytics dashboard
   - Check: What data is visible?
     - [ ] Games played (count, duration)?
     - [ ] Learning progress (letters learned)?
     - [ ] Engagement metrics (daily active time)?
     - [ ] Gesture quality metrics (hand steadiness)?
     - [ ] Age-adjusted content recommendations?

3. **Analytics Completeness**:
   - [ ] Is analytics data per child visible?
   - [ ] Is per-game analytics available (e.g., letters learned in Draw game)?
   - [ ] Are there per-attempt analytics (attempts, errors, success)?
   - [ ] Is metadata rich (age, difficulty, gesture quality) or generic?

4. **Evidence**:
   - [ ] Screenshot: Parent dashboard (what metrics shown?)
   - [ ] Screenshot: Per-child analytics (if separate page)
   - [ ] Screenshot: Per-game drill-down (if available)
   - [ ] Note: Compare against P1 finding: "Analytics schema too generic"

5. **Questions**:
   - [ ] Does parent see enough data to guide instruction?
   - [ ] Is gesture quality data accessible (hand steadiness scores)?
   - [ ] Can parent set difficulty for child or is all content "Easy"?

---

## Evidence Capture Format

For each test, document:

```markdown
### [Test Name] - [Persona]

**Setup**:
- Profile: [Name] (Age: [X])
- Time: [HH:MM]
- Server Status: Frontend ✅ / Backend ✅

**Observations**:
- UI Behavior: [What did you see?]
- Analytics Events: [Console events, network calls]
- Errors: [Any console errors?]

**Screenshots**:
- [screenshot 1 description]: [file path or embedded]
- [screenshot 2 description]: [file path or embedded]

**Console Log**:
```

[Paste relevant console events, analytics payloads, network calls]

```

**Findings**:
- [Finding 1: matches/contradicts multi-model prediction]
- [Finding 2: ...]

**Evidence Classification**:
- Observed: [Direct evidence from screenshot/console]
- Inferred: [What can be logically concluded]
- Unknown: [What still needs investigation]
```

---

## Multi-Model Consensus Verification Matrix

Test each prediction from multi-model analysis:

| Finding | Prediction | Test | Expected Result | Actual Result | Status |
|---------|-----------|------|-----------------|---------------|--------|
| Hardcoded Colors | Difficulty colors identical | Draw game difficulty display | Easy/Medium/Hard show different colors | ? | [ ] |
| Age Unused | Profile age doesn't adapt content | Draw game (Asha vs Dev vs Maya) | Same UI for all ages | ? | [ ] |
| Hidden Quests | Quest system not exposed in UI | Home page + menu search | No quest navigation visible | ? | [ ] |
| Analytics Generic | No gesture quality metrics | FingerNumbers console logs | Only basic event data, no hand steadiness | ? | [ ] |
| Difficulty Non-functional | All games show "Easy" | All games difficulty check | No Medium/Hard visible or unlocked | ? | [ ] |

---

## Execution Checklist

- [ ] Servers running (6173, 8001)
- [ ] Test profiles created (Asha, Dev, Maya, Arun)
- [ ] Browser DevTools open (Console + Network)
- [ ] Test 1: AlphabetGame - Asha (2-3yr) ✓
- [ ] Test 2: AlphabetGame - Dev (4-6yr) ✓
- [ ] Test 3: AlphabetGame - Maya (7-9yr) ✓
- [ ] Test 4: FingerNumberShow - All 3 personas ✓
- [ ] Test 5: Quest system discovery - Maya ✓
- [ ] Test 6: Parent analytics - Arun ✓
- [ ] Evidence compiled (screenshots + console logs)
- [ ] Matrix updated with actual results
- [ ] Commit evidence to project (not temp)

---

## Next Steps After Playtest

1. **Phase 4: Synthesis**
   - Compare playtest evidence against multi-model predictions
   - Identify patterns across personas (what works, what breaks)
   - Create final audit artifact: `docs/audit/games__ux__age_groups__analytics__[date].md`

2. **Phase 5: Remediation Tickets**
   - Create HIGH priority tickets for P0 findings (verified by playtest)
   - Create MEDIUM priority tickets for P1 findings
   - Link tickets to audit artifact with evidence

3. **Implementation**
   - 4-week roadmap (P0 → P1 → P2)
   - Backend games API (hardcoded → dynamic)
   - Difficulty color fix (immediate)
   - Age-based content adaptation
   - Quest system exposure

---

**Status**: Ready for execution  
**Date Created**: 2026-02-05  
**Ticket**: TCK-20260205-001 Phase 3
