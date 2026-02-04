# Implementation Plan: Top 10 Tickets (P0 Priority)

**Created**: 2026-02-04  
**Strategy**: Quick wins first → Foundation → Large features  
**Total Effort Estimate**: ~3-4 weeks of focused work

---

## Executive Summary

We have 10 P0 tickets covering feature implementation, testing, and a major redesign. The optimal execution order is:

1. **Phase 1 (Quick Wins - 2-3 days)**: Tickets 039, 041, 043, 044
2. **Phase 2 (Core Implementations - 5-7 days)**: Tickets 038, 040, 042
3. **Phase 3 (Testing & Verification - 3-5 days)**: Tickets 045, 046
4. **Phase 4 (Major Redesign - 5-7 days)**: Ticket 037

---

## Ticket Breakdown & Execution Order

### PHASE 1: Quick Wins (Days 1-3)

#### 1. TCK-20260202-039 :: Detect Camera API Availability
**Priority**: P0 | **Effort**: S (0.5-1 day) | **Impact**: High  
**What**: Add feature detection for camera API support before attempting to access it  
**Acceptance**: App gracefully handles devices without camera support  
**Files**: `src/frontend/src/utils/cameraAvailability.ts` (NEW)  
**Test**: Manual on device without camera, automated check in setup  
**Depends**: None  
**Blocks**: 041, 042

**Approach**:
1. Create utility to check camera API availability
2. Add to app initialization (App.tsx or config)
3. Show fallback UI if camera unavailable
4. Add unit tests

---

#### 2. TCK-20260202-041 :: Delay Camera Permission Until Game Start
**Priority**: P0 | **Effort**: S (0.5-1 day) | **Impact**: High  
**What**: Don't request camera permission on app load; defer until game starts  
**Acceptance**: Camera permission requested only when user starts a camera game  
**Files**: `src/frontend/src/pages/Home.tsx`, `src/frontend/src/pages/Games.tsx`, camera hook  
**Test**: Manual on real device, E2E test for permission flow  
**Depends**: TCK-039  
**Blocks**: 042

**Approach**:
1. Remove camera permission request from app initialization
2. Move permission request to game start (or game selection)
3. Add permission state management in game setup
4. Test on iOS/Android

---

#### 3. TCK-20260202-043 :: Responsive Mascot Positioning
**Priority**: P0 | **Effort**: S (0.5 day) | **Impact**: Medium  
**What**: Fix mascot positioning issues across screen sizes  
**Acceptance**: Mascot visible and properly positioned on mobile, tablet, desktop  
**Files**: `src/frontend/src/components/Mascot.tsx`  
**Test**: Visual regression test on 3 viewport sizes  
**Depends**: None  
**Blocks**: None (cosmetic)

**Approach**:
1. Audit current mascot CSS/positioning
2. Add responsive breakpoints using Tailwind
3. Test on iPhone SE, iPad, desktop
4. Consider bottom-right positioning for mobile, top-right for desktop

---

#### 4. TCK-20260202-044 :: Human-Centered Error Messages
**Priority**: P0 | **Effort**: S (0.5-1 day) | **Impact**: High  
**What**: Replace technical error messages with kid/parent-friendly messages  
**Acceptance**: All error states show friendly messages, no console errors visible to user  
**Files**: `src/frontend/src/utils/errorMessages.ts` (NEW), error components  
**Test**: Trigger each error type manually, check message display  
**Depends**: None  
**Blocks**: None

**Approach**:
1. Audit all current error messages in codebase
2. Create error message mapping (technical → friendly)
3. Update error handlers to use mapped messages
4. Test all error paths

---

### PHASE 2: Core Implementations (Days 4-10)

#### 5. TCK-20260202-038 :: Add Demo Mode Flag to Settings Store
**Priority**: P0 | **Effort**: M (1-2 days) | **Impact**: High  
**What**: Add persistent demo mode flag allowing app exploration without auth  
**Acceptance**: Demo mode can be toggled on/off, disabled in production, state persists  
**Files**: `src/frontend/src/store/settingsStore.ts` (or new), Settings component  
**Test**: Unit tests for store, E2E for demo mode toggle  
**Depends**: None  
**Blocks**: None (enhancement)

**Approach**:
1. Add demo mode state to settings store
2. Add toggle UI in Settings page (parent gate protected)
3. Use flag to skip auth on Home page
4. Add tests for store operations

---

#### 6. TCK-20260202-040 :: Touch-Based Letter Tracing Interface
**Priority**: P0 | **Effort**: M (2-3 days) | **Impact**: Very High  
**What**: Implement touch-based drawing for letter tracing (fallback to hand tracking)  
**Acceptance**: User can trace letters with finger/stylus, feedback is smooth, respects touch events  
**Files**: `src/frontend/src/components/games/TracingCanvas.tsx` (refactor)  
**Test**: Manual on tablet, E2E for basic tracing path  
**Depends**: TCK-039  
**Blocks**: Testing (045)

**Approach**:
1. Add touch event listeners to canvas
2. Implement separate path recording for touch vs hand-tracking
3. Add touch feedback (line smoothing, visual cues)
4. Fallback to hand-tracking if available
5. Test on iPad, Android tablet

---

#### 7. TCK-20260202-042 :: Step-by-Step Demo Introduction
**Priority**: P0 | **Effort**: M (2-3 days) | **Impact**: High  
**What**: Create interactive onboarding tutorial showing app features  
**Acceptance**: Demo covers 5+ key features, kid can follow along, easy to skip  
**Files**: `src/frontend/src/components/Onboarding/` (NEW), `src/frontend/src/pages/Home.tsx` (update)  
**Test**: Playtest with real kids, check completion flow  
**Depends**: TCK-039, 041  
**Blocks**: None

**Approach**:
1. Create onboarding component with step-by-step flow
2. Add mascot guidance
3. Interactive demonstrations of key features
4. Easy skip button, progress indicator
5. Option to restart tutorial

---

### PHASE 3: Testing & Verification (Days 11-15)

#### 8. TCK-20260202-045 :: Test on Multiple Devices
**Priority**: P0 | **Effort**: M (2 days) | **Impact**: High  
**What**: Cross-device testing on iPhone SE, iPhone 12, desktop  
**Acceptance**: No functional bugs on any device, all games playable, performance acceptable  
**Files**: None (testing only)  
**Test**: Manual testing protocol + regression hunt  
**Depends**: TCK-038, 040, 042  
**Blocks**: None

**Approach**:
1. Execute test plan on 3 device types
2. Document any bugs found
3. Fix critical issues immediately
4. Create regression test checklist

---

#### 9. TCK-20260202-046 :: WCAG AA Compliance Verification
**Priority**: P0 | **Effort**: M (2 days) | **Impact**: Very High  
**What**: Audit app for WCAG AA accessibility compliance  
**Acceptance**: All interactive elements keyboard accessible, colors meet 4.5:1 contrast, screen reader tested  
**Files**: None (testing only)  
**Test**: Automated + manual WCAG audit using axe, manual testing with screen reader  
**Depends**: All other tickets  
**Blocks**: None

**Approach**:
1. Run axe accessibility scanner on all pages
2. Fix high/critical issues
3. Manual screen reader testing
4. Keyboard navigation audit
5. Color contrast check

---

### PHASE 4: Major Redesign (Days 16-25)

#### 10. TCK-20260202-037 :: Holistic Progress Page Redesign
**Priority**: P0 | **Effort**: L (4-5 days) | **Impact**: Very High  
**What**: Complete redesign of Progress page with unified model, better data, engaging visualization  
**Acceptance**: All criteria in ticket met, data is accurate, UX improved for both kids and parents  
**Files**: `src/frontend/src/pages/Progress.tsx` (major refactor), NEW components for visualizations  
**Test**: Unit tests for calculations, E2E for page flow, manual review  
**Depends**: All other tickets completed  
**Blocks**: None

**Approach**:
1. Create new unified progress calculation system
2. Implement plant growth visualization
3. Build parent summary dashboard
4. Add kid rewards section
5. Integrate with activity data
6. Comprehensive testing

---

## Success Criteria

- [ ] All 10 tickets move to DONE status
- [ ] No P0/P1 bugs found in cross-device testing
- [ ] WCAG AA compliance verified
- [ ] Code reviews passed
- [ ] Worklog updated with completion timestamps
- [ ] No regressions in existing features

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Camera API detection edge cases | Medium | Low | Comprehensive device testing, fallback UI |
| Touch tracing UX is poor | Medium | High | Playtesting with kids, UI iteration |
| Progress page calculations complex | Medium | High | Clear documentation, unit tests |
| WCAG compliance gaps | Medium | Medium | Early audit, automated scanning |
| Cross-device bugs | High | Medium | Test on real devices, not just emulators |

---

## Dependencies & Blockers

```
Phase 1 (Independent)
├─ TCK-039 (Camera detection)
├─ TCK-041 (Camera permission)
├─ TCK-043 (Mascot)
└─ TCK-044 (Error messages)
    │
Phase 2 (Depends on Phase 1)
├─ TCK-038 (Demo mode)
├─ TCK-040 (Tracing - depends on TCK-039)
└─ TCK-042 (Demo intro - depends on TCK-039/041)
    │
Phase 3 (Depends on Phase 2)
├─ TCK-045 (Testing - depends on all Phase 2)
└─ TCK-046 (WCAG - depends on all)
    │
Phase 4 (Depends on Phase 3)
└─ TCK-037 (Progress redesign - depends on all)
```

---

## Testing Strategy

### Unit Tests
- Progress calculations (TCK-037)
- Error message mapping (TCK-044)
- Settings store (TCK-038)
- Camera detection (TCK-039)

### E2E Tests (Playwright)
- Demo mode toggle → access without auth
- Camera permission flow → game start
- Touch tracing → letter completion
- Cross-device layout responsiveness

### Manual Tests
- Playtest with real kids (TCK-042, 040)
- Device testing (TCK-045)
- Accessibility audit (TCK-046)

---

## Next Steps

1. **Start Phase 1** - Begin with TCK-039 (camera detection)
2. **Daily standups** - Review progress against this plan
3. **Branch strategy** - Work on main, small focused commits
4. **Code review** - Pair on PRs, keep reviews tight
5. **Documentation** - Update worklog after each ticket completion

---

## Prompts to Use

| Ticket | Primary Prompt | Secondary Prompt |
|--------|---|---|
| TCK-039, 041, 043, 044 | `prompts/implementation/feature-implementation-v1.0.md` | `prompts/hardening/react-best-practices-v1.0.md` |
| TCK-038, 040, 042 | `prompts/implementation/feature-implementation-v1.0.md` | `prompts/planning/implementation-planning-v1.0.md` |
| TCK-045 | `prompts/qa/test-execution-report-v1.0.md` | `prompts/qa/randomized-exploratory-testing-pack-v1.0.md` |
| TCK-046 | `prompts/qa/test-plan-v1.0.md` | `prompts/review/completeness-check-v1.0.md` |
| TCK-037 | `prompts/remediation/implementation-v1.6.1.md` | `prompts/hardening/generalized-implementer-v1.0.md` |

---

EOF
