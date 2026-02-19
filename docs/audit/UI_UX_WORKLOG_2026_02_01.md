# UI/UX Audit Worklog - 2026-02-01

## Generated from AUDIT-20260201-001

This worklog contains actionable tickets derived from the comprehensive UI/UX audit.
**Ticket:** TCK-20260201-001

---

## TCK-20260201-100 :: [BLOCKER] Add Visual Game Tutorial Animation

**Type:** UX  
**Priority:** P0 - Blocker  
**Owner:** Unassigned  
**Status:** OPEN  
**Estimate:** 1 day

### Description

Toddlers (ages 3-5) cannot read the text instruction "Trace letters with your finger!" in the Alphabet Tracing game. Without a visual demonstration, children cannot start the game independently.

### Evidence

- Screenshot: `game_desktop_*.png`
- Location: `AlphabetGame.tsx` game start screen

### Requirements

1. Create animated hand overlay component (`AnimatedHandTutorial.tsx`)
2. Show 3-second hand tracing the letter before game starts
3. Play once per session, with "Skip" option
4. Triggereable again via "?" help button

### Acceptance Criteria

- [ ] Animation shows hand tracing current letter
- [ ] No text required to understand the action
- [ ] Parent can skip if child is returning user
- [ ] Works on mobile and desktop

### Related Files

- `src/frontend/src/pages/AlphabetGame.tsx`
- `src/frontend/src/components/GameTutorial.tsx`

---

## TCK-20260201-101 :: [HIGH] Add Progress Ring to Parent Gate

**Type:** UX  
**Priority:** P1 - High  
**Owner:** Unassigned  
**Status:** OPEN  
**Estimate:** 2 hours

### Description

The Parent Gate requires a 3-second hold to access Settings, but provides no visual feedback that the hold is registering. Parents tap instead of hold, then think the feature is broken.

### Evidence

- Screenshot: `settings_parent_gate_*.png`
- Location: `src/frontend/src/pages/Settings.tsx`

### Requirements

1. Create `ProgressRing.tsx` component
2. Ring fills as user holds button
3. Haptic feedback on mobile (if supported)
4. On completion, ring turns green before unlocking

### Acceptance Criteria

- [ ] Progress ring visible during hold
- [ ] Ring reflects actual hold duration (not just animation)
- [ ] Clear visual indication when 3 seconds reached
- [ ] Works with mouse and touch

### Related Files

- `src/frontend/src/pages/Settings.tsx`
- `src/frontend/src/components/ui/` (new component)

---

## TCK-20260201-102 :: [HIGH] Add Celebration Animation on Letter Completion

**Type:** UX/Engagement  
**Priority:** P1 - High  
**Owner:** Unassigned  
**Status:** OPEN  
**Estimate:** 4 hours

### Description

When a child successfully traces a letter, the app simply moves to the next letter. Kids need a reward moment - confetti, sound, mascot celebration - to reinforce positive behavior and maintain engagement.

### Evidence

- Observation during game play testing
- Location: `AlphabetGame.tsx` letter completion handler

### Requirements

1. Create `CelebrationOverlay.tsx` component
2. Trigger on letter accuracy > 70%
3. Include:
   - Confetti particles
   - Pip mascot celebrating
   - Sound effect (with mute respect)
   - "Great job!" visible briefly
4. Auto-dismiss after 2 seconds

### Acceptance Criteria

- [ ] Celebration triggers on successful letter
- [ ] Animation does not block next letter transition
- [ ] Respects audio mute setting
- [ ] Accessible to users with motion sensitivity (prefers-reduced-motion)

### Related Files

- `src/frontend/src/pages/AlphabetGame.tsx`
- `src/frontend/src/components/Mascot.tsx`

---

## TCK-20260201-103 :: [HIGH] Add Profile Selection Modal When None Selected

**Type:** UX  
**Priority:** P1 - High  
**Owner:** Unassigned  
**Status:** OPEN  
**Estimate:** 2 hours

### Description

On the Games page, clicking "Play" without a profile silently redirects to Dashboard without explanation. Users don't understand why they can't play.

### Evidence

- Observation on `/games` page
- Location: `src/frontend/src/pages/Games.tsx:138-147`

### Requirements

1. Show modal when clicking Play without profile
2. Modal explains: "Select a learner to track progress"
3. Quick-add profile option in modal
4. List existing profiles for quick selection

### Acceptance Criteria

- [ ] Modal appears instead of silent redirect
- [ ] User can select existing profile
- [ ] User can create new profile from modal
- [ ] After selection, game starts automatically

### Related Files

- `src/frontend/src/pages/Games.tsx`
- `src/frontend/src/components/ui/Modal.tsx`

---

## TCK-20260201-104 :: [MEDIUM] Improve Coming Soon Games Visibility

**Type:** UX  
**Priority:** P2 - Medium  
**Owner:** Unassigned  
**Status:** OPEN  
**Estimate:** 1 hour

### Description

Coming Soon games occupy the same visual space and weight as playable games. Users click them and get frustrated. They should be visually differentiated or moved to a separate section.

### Evidence

- Screenshot: `games_desktop_*.png`
- Location: `src/frontend/src/pages/Games.tsx`

### Requirements

**Option A:** Visual Differentiation

- Gray out Coming Soon cards
- Reduce opacity
- Show "Coming Soon" badge prominently

**Option B:** Separate Section

- Move to "What's Next" section below playable games
- Smaller card size
- Collapsible

### Acceptance Criteria

- [ ] Playable games clearly distinct from Coming Soon
- [ ] No user confusion about which games are available
- [ ] Coming Soon games still discoverable

### Related Files

- `src/frontend/src/pages/Games.tsx`

---

## TCK-20260201-105 :: [MEDIUM] Replace Text Loading with Pip Animation

**Type:** UX/Engagement  
**Priority:** P2 - Medium  
**Owner:** Unassigned  
**Status:** OPEN  
**Estimate:** 3 hours

### Description

During hand tracking model load, the app shows text "Loading hand tracking...". Non-readers stare at text they don't understand. Pip should animate to keep them engaged.

### Evidence

- Observation during game load
- Location: `Mascot.tsx` loading state

### Requirements

1. Define `loading` state animation for Pip
2. Show Pip doing a "getting ready" animation
3. Progress indicator as part of Pip (e.g., building blocks filling)
4. Transition smoothly to "ready" state

### Acceptance Criteria

- [ ] No plain text during loading
- [ ] Animation is smooth and calming
- [ ] Clear visual when loading complete
- [ ] Loading time feels shorter than current text

### Related Files

- `src/frontend/src/components/Mascot.tsx`
- `src/frontend/src/pages/AlphabetGame.tsx`

---

## TCK-20260201-106 :: [MEDIUM] Extract Dashboard Modals to Separate Components

**Type:** Code Quality  
**Priority:** P2 - Medium  
**Owner:** Unassigned  
**Status:** OPEN  
**Estimate:** 4 hours

### Description

`Dashboard.tsx` is 856 lines with inline modal definitions for AddChild and EditProfile. This makes the file hard to maintain and test.

### Evidence

- File: `src/frontend/src/pages/Dashboard.tsx`
- Line count: 856

### Requirements

1. Create `src/frontend/src/components/modals/AddChildModal.tsx`
2. Create `src/frontend/src/components/modals/EditProfileModal.tsx`
3. Pass props for state management
4. Add unit tests for modal components

### Acceptance Criteria

- [ ] Dashboard.tsx under 500 lines
- [ ] Modals independently testable
- [ ] No change to user-facing behavior
- [ ] Props interface clearly documented

### Related Files

- `src/frontend/src/pages/Dashboard.tsx`
- `src/frontend/src/components/modals/` (new directory)

---

## TCK-20260201-107 :: [MEDIUM] Fix Mobile Stats Layout Cramping

**Type:** Responsive Design  
**Priority:** P2 - Medium  
**Owner:** Unassigned  
**Status:** OPEN  
**Estimate:** 2 hours

### Description

On 390px mobile viewport, the Dashboard stats bar becomes cramped with text truncation. Stats should stack vertically or wrap to a 2x2 grid.

### Evidence

- Screenshot: `dashboard_mobile_*.png`
- Location: `src/frontend/src/pages/Dashboard.tsx` stats section

### Requirements

1. Add responsive breakpoint for stats container
2. Below 480px: stack vertically or 2x2 grid
3. Maintain visual hierarchy
4. Test on iPhone SE (375px)

### Acceptance Criteria

- [ ] All stats fully visible on 375px
- [ ] No text truncation
- [ ] Maintains visual balance
- [ ] Touch targets still adequate (48px+)

### Related Files

- `src/frontend/src/pages/Dashboard.tsx`

---

## TCK-20260201-108 :: [LOW] Add First Milestone Celebration Badge

**Type:** Engagement  
**Priority:** P3 - Low  
**Owner:** Unassigned  
**Status:** OPEN  
**Estimate:** 4 hours

### Description

When a child traces their first letter, nothing special happens. Adding a "First Letter!" badge creates a memorable moment and encourages continued engagement.

### Evidence

- Observation: Empty Alphabet Mastery section
- Location: `src/frontend/src/pages/Progress.tsx`

### Requirements

1. Track milestone: first_letter_traced
2. Show badge on Progress page
3. Show notification on Dashboard
4. Pip celebration for first-time achievement

### Acceptance Criteria

- [ ] Badge visible in Progress after first letter
- [ ] Notification shown once when milestone reached
- [ ] Stored in progress store (persisted)
- [ ] Multiple milestones possible (5, 10, 26 letters)

### Related Files

- `src/frontend/src/store/progressStore.ts`
- `src/frontend/src/pages/Progress.tsx`
- `src/frontend/src/pages/Dashboard.tsx`

---

## TCK-20260201-109 :: [LOW] Implement Sound Effects System

**Type:** Engagement/Audio  
**Priority:** P3 - Low  
**Owner:** Unassigned  
**Status:** OPEN  
**Estimate:** 2 days

### Description

The app has volume controls but no sound effects. Adding pops, whooshes, and celebration sounds dramatically increases kid engagement.

### Evidence

- Settings page has volume sliders
- No audio files in repo
- Location: Settings store has audio controls

### Requirements

1. Create audio hook `useAudio.ts`
2. Add sound files: pop, success, error, celebration
3. Integrate with Settings store mute toggle
4. Preload sounds on app init
5. Respect device mute switch

### Acceptance Criteria

- [ ] Sounds play on interactions
- [ ] Mute toggle works
- [ ] Volume slider adjusts level
- [ ] No audio lag
- [ ] Works on iOS Safari (audio unlock)

### Related Files

- `src/frontend/src/hooks/useAudio.ts` (new)
- `src/frontend/src/store/settingsStore.ts`
- `public/sounds/` (new directory)

---

## TCK-20260201-110 :: [EPIC] Implement Story-Based Progression System

**Type:** Product/Narrative  
**Priority:** P3 - Epic  
**Owner:** Unassigned  
**Status:** OPEN  
**Estimate:** 2 weeks

### Description

Transform the learning experience from isolated activities into "Pip's Learning Adventure" - an island exploration narrative where mastering skills unlocks new areas.

### Evidence

- Map.tsx exists but is decorative
- StoryModal.tsx exists but unused
- Story store exists with quest system

### High-Level Requirements

1. **Interactive Map** - Clickable islands for skill areas
2. **Literacy Island** - Alphabet Tracing lives here
3. **Progress unlocks** - Completing letters reveals new map areas
4. **Story beats** - Pip narrates milestones
5. **Achievements** - Island Chief badges for completion

### Sub-Tickets Required

- TCK-XXX-001: Make Map.tsx interactive with island click handlers
- TCK-XXX-002: Connect letter progress to map unlock state
- TCK-XXX-003: Add Pip narration audio for story beats
- TCK-XXX-004: Create achievement badge system
- TCK-XXX-005: Design and implement island unlock animations

### Related Files

- `src/frontend/src/components/Map.tsx`
- `src/frontend/src/components/StoryModal.tsx`
- `src/frontend/src/store/storyStore.ts`

---

## Summary

| Priority   | Count | Total Effort    |
| ---------- | ----- | --------------- |
| P0 Blocker | 1     | 1 day           |
| P1 High    | 3     | 8 hours         |
| P2 Medium  | 4     | 10 hours        |
| P3 Low     | 3     | 2.5 days + Epic |

**Recommended Sprint 1 (This Week):**

- TCK-20260201-100 (Visual Tutorial) - Blocker
- TCK-20260201-101 (Parent Gate Ring) - Quick win
- TCK-20260201-102 (Celebration) - High engagement impact

**End of Worklog**
