# Advay Vision Learning - Master Implementation Plan

**Created:** 2026-01-30  
**Purpose:** Comprehensive roadmap for all pending work  
**Status:** 73 DONE, 14 OPEN, 0 IN_PROGRESS  

---

## 🎯 Executive Summary

| Phase | Theme | Tickets | Timeline | Goal |
|-------|-------|---------|----------|------|
| **Phase 1** | Core Stability | 8 | Week 1-2 | Fix bugs, security, stability |
| **Phase 2** | Game Completeness | 10 | Week 3-4 | Complete FingerNumberShow + tracing |
| **Phase 3** | Multi-language | 6 | Week 5-6 | Full language support |
| **Phase 4** | Analytics & Tracking | 4 | Week 7-8 | Unified tracking for all games |
| **Phase 5** | Gamification | 20 | Month 2 | Achievements, XP, celebrations |
| **Phase 6** | Polish & Launch | 12 | Month 3 | Performance, accessibility, launch |

---

## Phase 1: Core Stability (Weeks 1-2)

### P0 - Critical (Do First)

| # | Ticket | Type | Description | Effort | Dependencies |
|---|--------|------|-------------|--------|--------------|
| 1.1 | TCK-20260129-301 | BUG | **Cannot Change Profile Language** - Critical bug blocking language switching | Low | None |
| 1.2 | TCK-20260130-018 | REM | Fix missing useProfileStore import in Game.tsx | Low | None |
| 1.3 | TCK-20260129-203 | SEC | CORS & Security Hardening | Medium | None |
| 1.4 | TCK-20260129-053 | REM | **Offline Progress Queue** - Finish IN_PROGRESS work | Medium | None |

### P1 - High Priority

| # | Ticket | Type | Description | Effort | Dependencies |
|---|--------|------|-------------|--------|--------------|
| 1.5 | TCK-20260129-081 → 085 | SEC | **Refresh Token Suite** (5 tickets: Revocation, Rotation, Tests, Schema, Status Code) | High | 1.3 |
| 1.6 | TCK-20260129-305 | AUDIT | Database Schema Review - Type Consistency | Medium | None |
| 1.7 | TCK-20260128-002 | HARD | Align docs/scripts to actual repo layout | Low | None |

### Phase 1 Exit Criteria
- [ ] All P0 tickets closed
- [ ] Security audit passes
- [ ] Database schema consistent
- [ ] No critical bugs open

---

## Phase 2: Game Completeness (Weeks 3-4)

### P0 - Core Game Fixes

| # | Ticket | Type | Description | Effort | Dependencies |
|---|--------|------|-------------|--------|--------------|
| 2.1 | TCK-20260130-015 | FEAT | **FingerNumberShow Language Selection** - Add alphabet tracing for all languages | High | 1.1 |
| 2.2 | TCK-20260130-024 | REM | FingerNumberShow count thumb correctly (5 shows as 5) | Medium | 2.1 |
| 2.3 | TCK-20260130-021 | REM | FingerNumberShow allow success for target=0 | Low | 2.1 |
| 2.4 | TCK-20260130-022 | REM | FingerNumberShow target randomization (avoid loops) | Low | 2.1 |
| 2.5 | TCK-20260130-028 | REM | FingerNumberShow prompt UX + TTS improvements | Medium | 2.1 |
| 2.6 | TCK-20260130-020 | HARD | FingerNumberShow camera-first layout | Medium | 2.1 |

### P1 - UX Improvements

| # | Ticket | Type | Description | Effort | Dependencies |
|---|--------|------|-------------|--------|--------------|
| 2.7 | TCK-20260130-014 | AUDIT | Manual UX Audit - Finger Number Show | Medium | 2.1-2.6 |
| 2.8 | TCK-20260130-009 | REM | Parent Gate for Settings (security) | Medium | None |
| 2.9 | TCK-20260130-010 | REM | Tutorial Overlay for First-Time Users | Medium | None |
| 2.10 | TCK-20260130-011 | REM | Webcam Overlay Contrast/Visibility | Low | None |

### Phase 2 Exit Criteria
- [ ] FingerNumberShow works with all 5 languages
- [ ] Game counting logic fixed (thumb=5)
- [ ] Camera layout optimized
- [ ] First-time UX complete

---

## Phase 3: Multi-language & Content (Weeks 5-6)

### P0 - Language System

| # | Ticket | Type | Description | Effort | Dependencies |
|---|--------|------|-------------|--------|--------------|
| 3.1 | TCK-20260129-303 | IMPL | Language as Game Choice (Not Profile Setting) | High | 2.1 |
| 3.2 | TCK-20260129-302 | FEAT | Visual Language Indicator in Game | Low | 3.1 |
| 3.3 | TCK-20260129-072 | BUG | Fix Language Selection - Game Should Use Profile Language | Medium | 3.1 |

### P1 - Additional Games

| # | Ticket | Type | Description | Effort | Dependencies |
|---|--------|------|-------------|--------|--------------|
| 3.4 | TCK-20260129-200 | FEAT | **Number Tracing Game** | High | None |
| 3.5 | TCK-20260129-201 | FEAT | **Connect-the-Dots Game** | High | None |
| 3.6 | TCK-20260129-211 | FEAT | Lowercase Letter Support | Medium | None |
| 3.7 | TCK-20260129-212 | FEAT | Hindi Special Characters Support | Medium | None |

### Phase 3 Exit Criteria
- [ ] Language selection works in all games
- [ ] Number Tracing game playable
- [ ] Connect-the-Dots game playable
- [ ] Hindi special characters supported

---

## Phase 4: Analytics & Tracking (Weeks 7-8)

**Critical Gap**: Dashboard only tracks Alphabet Tracing (letters), ignores 3 other games.

### Overview

| Ticket | Phase | Description | Effort | Week |
|--------|-------|-------------|--------|------|
| TCK-20260201-001 | 1 | Extend Data Model | Medium | Week 7 |
| TCK-20260201-002 | 2 | Instrument All Games | High | Week 7-8 |
| TCK-20260201-003 | 3 | Redesign Dashboard | High | Week 8 |
| TCK-20260201-004 | 4 | Parent Insights | Medium | Week 8 |

### What Gets Fixed

**Before** (Current):
```
Dashboard shows:
├── Letters Learned: 12/26
├── Accuracy: 85%
├── Time Spent: 45 min
└── 🚨 MISSING: FingerNumberShow, ConnectTheDots, LetterHunt data
```

**After** (With Analytics):
```
Dashboard shows:
├── 📊 Overall Skills
│   ├── Literacy: 65% (letters)
│   ├── Numeracy: 40% (numbers)
│   ├── Motor Skills: 72% (tracing)
│   └── Engagement: 12 sessions
├── 🎮 Game Activity
│   ├── Alphabet Tracing: 45 min
│   ├── Finger Numbers: 20 min
│   ├── Connect the Dots: 10 min
│   └── Letter Hunt: 15 min
└── 📈 Skill Development
    ├── Letter Recognition: +23%
    ├── Number Counting: +15%
    └── Hand Tracking: +31%
```

### Technical Approach

**Database Changes**:
- Add `game_type` to progress table
- New `game_sessions` table for per-session metrics
- New `skill_metrics` table for aggregated weekly scores

**Game Instrumentation**:
- FingerNumberShow: Track numbers shown, finger counts, accuracy
- ConnectTheDots: Track completion time, path accuracy
- LetterHunt: Track letters found, time to find

**Dashboard Redesign**:
- Replace letter-only stats with 4 skill categories
- Add game activity breakdown
- Add skill development trend charts

### Phase 4 Exit Criteria

- [ ] All 4 games tracked in database
- [ ] Dashboard shows unified skill view
- [ ] Parents can see game breakdown
- [ ] Skill improvement trends visible
- [ ] Ready for Phase 5 (Gamification)

**Reference**: `docs/audit/ANALYTICS_TRACKING_AUDIT.md`

---

## Phase 5: Gamification & Engagement (Month 2)

### Foundation Layer

| # | Ticket | Type | Description | Effort | Dependencies |
|---|--------|------|-------------|--------|--------------|
| 4.1 | TCK-20260129-100 | FEAT | Particle Effects System | High | None |
| 4.2 | TCK-20260129-101 | FEAT | Celebration Component Infrastructure | Medium | 4.1 |
| 4.3 | TCK-20260129-102 | FEAT | Audio Feedback System | Medium | None |

### Achievement System

| # | Ticket | Type | Description | Effort | Dependencies |
|---|--------|------|-------------|--------|--------------|
| 4.4 | TCK-20260129-103 | FEAT | Define Achievement Types and Conditions | Medium | None |
| 4.5 | TCK-20260129-104 | FEAT | Achievement Detection System | High | 4.4 |
| 4.6 | TCK-20260129-105 | FEAT | Connect Celebrations to Achievements | Medium | 4.2, 4.5 |
| 4.7 | TCK-20260129-108 | FEAT | Badge Display Component | Medium | 4.5 |

### XP & Progression

| # | Ticket | Type | Description | Effort | Dependencies |
|---|--------|------|-------------|--------|--------------|
| 4.8 | TCK-20260129-107 | FEAT | XP and Level System | High | 4.5 |
| 4.9 | TCK-20260129-110 | FEAT | Level-Up Animations | Medium | 4.8 |
| 4.10 | TCK-20260129-111 | FEAT | Enhanced Progress Charts | Medium | None |

### Mascot Integration

| # | Ticket | Type | Description | Effort | Dependencies |
|---|--------|------|-------------|--------|--------------|
| 4.11 | TCK-20260129-077 | PLAN | Video Mascot Integration | High | None |
| 4.12 | TCK-20260129-106 | FEAT | Integrate Mascot Video with Achievements | Medium | 4.11 |

### Dashboard Redesign

| # | Ticket | Type | Description | Effort | Dependencies |
|---|--------|------|-------------|--------|--------------|
| 4.13 | TCK-20260129-109 | FEAT | Redesign Dashboard with Gamified Elements | High | 4.5, 4.8 |
| 4.14 | TCK-20260129-122 | FEAT | Activity Feed Widget | Medium | 4.13 |
| 4.15 | TCK-20260129-123 | FEAT | Weekly Goal Widget | Medium | 4.13 |

### Phase 4 Exit Criteria
- [ ] Achievement system live
- [ ] XP/Level system working
- [ ] Celebrations on all milestones
- [ ] Dashboard redesigned
- [ ] Audio feedback throughout

---

## Phase 6: Polish & Launch (Month 3)

### UI/UX Polish

| # | Ticket | Type | Description | Effort | Dependencies |
|---|--------|------|-------------|--------|--------------|
| 5.1 | TCK-20260201-001 | REM | Cleanup remaining faint borders | Low | None |
| 5.2 | TCK-20260130-019 | HARD | Brand-aligned UI refresh (remove gradients) | Medium | None |
| 5.3 | TCK-20260129-116 | FEAT | Page Transition Animations | Low | None |
| 5.4 | TCK-20260129-117 | FEAT | Interactive Button States | Low | None |
| 5.5 | TCK-20260129-118 | FEAT | Loading Skeleton Components | Low | None |

### Performance & Infrastructure

| # | Ticket | Type | Description | Effort | Dependencies |
|---|--------|------|-------------|--------|--------------|
| 5.6 | TCK-20260129-060 | TRACK | React 18 → 19 Upgrade | Medium | All above |
| 5.7 | TCK-20260130-016 | REM | Model & delegate fallback (bundled model + CPU fallback) | High | None |
| 5.8 | TCK-20260130-017 | REM | Icon & Image Runtime Fallbacks + Tests | Medium | None |

### Navigation & Accessibility

| # | Ticket | Type | Description | Effort | Dependencies |
|---|--------|------|-------------|--------|--------------|
| 5.9 | TCK-20260129-112 | FEAT | Child-Safe Navigation Bar | Medium | None |
| 5.10 | TCK-20260129-113 | FEAT | Breadcrumb Navigation | Low | None |
| 5.11 | TCK-20260129-114 | FEAT | Game Page with Progress Visualization | Medium | 4.11 |

### Content Completion

| # | Ticket | Type | Description | Effort | Dependencies |
|---|--------|------|-------------|--------|--------------|
| 5.12 | TCK-20260129-150 | R&D | Document MediaPipe Capabilities | Medium | None |
| 5.13 | TCK-20260129-071 | AUDIT | Audit Current Game Implementation vs Learning Plan | Medium | All games |

### Phase 5 Exit Criteria
- [ ] All UI polished, no "AI giveaway" elements
- [ ] React 19 upgrade complete
- [ ] Performance targets met
- [ ] Accessibility audit passes
- [ ] Ready for production

---

## Future Phases (Post-Launch)

### Phase 6: Additional Games

| Ticket | Game |
|--------|------|
| TCK-20260129-203 | Freeze Dance |
| TCK-20260129-204 | Yoga Animals |
| TCK-20260129-205 | Reach Stars |
| TCK-20260129-206 | Tap Count |
| TCK-20260129-207 | Sort into Buckets |
| TCK-20260129-208 | Free Paint Mode |

### Phase 7: Social Features

| Ticket | Feature |
|--------|---------|
| TCK-20260129-120 | Avatar System |
| TCK-20260129-121 | Avatar Creator UI |
| TCK-20260129-119 | Theme Structure |

### Phase 8: Advanced Features

| Ticket | Feature |
|--------|---------|
| TCK-20260129-402 | Sparkle Trail Effect |
| TCK-20260129-403 | Virtual Brush Selector |
| TCK-20260129-404 | Confetti Success Effects |
| TCK-20260129-405 | Particle Effects (Bubbles & Stars) |
| TCK-20260129-406 | Hand Distance Zoom Controls |

---

## Resource Allocation

### Development Capacity (Assuming 2 devs)

| Phase | Weeks | Capacity | Risk |
|-------|-------|----------|------|
| Phase 1 | 2 | 80% | Low |
| Phase 2 | 2 | 100% | Medium |
| Phase 3 | 2 | 100% | Medium |
| Phase 4 | 4 | 100% | High |
| Phase 5 | 4 | 80% | Low |

### Critical Path

```
1.1 Profile Language Bug
    ↓
2.1 FingerNumberShow Language Selection
    ↓
3.1 Language as Game Choice
    ↓
4.1 Particle Effects → 4.2 Celebrations → 4.5 Achievements → 4.13 Dashboard
    ↓
5.11 Game Page Progress → 5.13 Content Audit → LAUNCH
```

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| MediaPipe performance issues | High | Phase 5.7 fallback implementation |
| Language switching complexity | Medium | Complete 1.1 before 2.1, 3.1 |
| Achievement system scope creep | High | Strict P0/P1/P2 boundaries |
| React 19 breaking changes | Medium | Delay to Phase 5, thorough testing |
| Token rotation breaking auth | High | Comprehensive tests (TCK-20260129-083) |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-30 | Prioritize language bugs first | Blocks all multi-language features |
| 2026-01-30 | Security before features | Token rotation is production blocker |
| 2026-01-30 | Gamification in Month 2 | Needs stable foundation first |
| 2026-01-30 | React 19 upgrade delayed | Risk mitigation, not critical for launch |

---

## Weekly Sprint Cadence

### Sprint Planning (Monday)
- Review completed tickets
- Assign next week's work
- Update critical path

### Daily Standup
- Blockers identification
- Progress on critical path
- Scope adjustment if needed

### Sprint Review (Friday)
- Demo completed features
- Update compliance metrics
- Plan next sprint

---

**Next Action:** Pick Phase 1, Ticket 1.1 (TCK-20260129-301) - Critical language bug

**Document Version:** 1.0  
**Last Updated:** 2026-01-30
