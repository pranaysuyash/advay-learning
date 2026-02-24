# Secondary Findings Backlog (Non-Initiative Items)

**Date**: 2026-02-24  
**Source**: DOCS_FOLDER_SUMMARY.md analysis + deeper research  
**Priority**: P1-P3 (mixed)  
**Status**: CATALOGUED (ready for triage)

---

## Overview

6 major initiatives (Visual, Games, Lumi, Backend, New Games, Personas) capture 80% of transformation work. **This document catalogs the remaining 20%**: bugs, quality improvements, edge cases, and smaller features that don't justify full initiatives but add up to significant value.

**Organization**:
- **By Category**: UX/Accessibility, Performance, Security, Content, Mobile, Infrastructure
- **By Priority**: P0 (ship soon), P1 (next quarter), P2 (backlog), P3 (nice-to-have)
- **By Effort**: Quick wins (<1 day), Medium (1-3 days), Large (3+ days)

---

## Category 1: UX/Accessibility Improvements

### UX-001: Camera Permission Flow Clarity
**Priority**: P1  
**Effort**: 1-2 days  
**Source**: docs/CAMERA_PRIVACY_CLARIFICATION.md

**Issue**: 
Camera permission screen shows generic OS dialog. Children don't understand why camera is needed. Parents concerned about privacy.

**Solution**:
- Add pre-permission explainer: "Pip needs camera to see your hand and celebrate with you!"
- Show visual demonstration (animated hand)
- Add privacy commitment banner
- Show camera access indicator (always visible when on)

**Acceptance**:
- [ ] Pre-permission screen shows before OS dialog
- [ ] Visual demo of hand tracking
- [ ] Camera indicator always visible
- [ ] Privacy statement prominent

**Related files**:
- `src/frontend/src/components/CameraPermissionScreen.tsx` (already exists, enhance)
- `src/frontend/src/components/CameraPermissionTutorial.tsx` (already exists)

---

### UX-002: Onboarding Flow for New Users
**Priority**: P1  
**Effort**: 2-3 days  
**Source**: docs/CHILD_UX_TESTING_GUIDE.md, child testing insights

**Issue**:
Kids jump straight into games without understanding mechanics. First 2 minutes are confusing.

**Solution**:
- Interactive onboarding (5-7 screens):
  1. Welcome from Pip ("Hi! Let's learn letters!")
  2. Hand tracking explanation (show camera + hand detection)
  3. First letter introduction (A = Apple)
  4. Pinch gesture tutorial (show example pinch)
  5. Success celebration demo (show star + sound)
  6. Ready to play? (confirmation)

**Acceptance**:
- [ ] All 5-7 screens implemented
- [ ] Hand tracking works during onboarding
- [ ] Onboarding skippable for returning users
- [ ] <2 min duration

**Related files**:
- `src/frontend/src/components/OnboardingFlow.tsx` (exists, enhance)
- `src/frontend/src/pages/Home.tsx`

---

### UX-003: Mobile Responsiveness Issues
**Priority**: P2  
**Effort**: 1-2 days  
**Source**: Responsive design audit

**Issue**:
Layouts break on small phones (<400px width). Buttons too close. Text too small on tablets.

**Solutions**:
1. Test on: iPhone SE (375px), iPad Mini (768px), Samsung Galaxy S9 (360px)
2. Responsive button sizing (larger touch targets on mobile: 48x48px minimum)
3. Text scaling (readable at arm's length for kids)
4. Game canvas scaling (maintains aspect ratio)

**Acceptance**:
- [ ] Layouts work on 320-768px widths
- [ ] Touch targets 48x48px minimum
- [ ] Text readable at 60cm distance
- [ ] No horizontal scroll

---

### UX-004: Visual Feedback Consistency
**Priority**: P1  
**Effort**: 2-3 days  
**Source**: docs/AUDIT_PERSONAS_GAMES_UX.md

**Issue**:
Different games show success differently (some stars, some emoji, some text). No consistency.

**Solution**:
Standardize feedback UI across all games:
- **Success**: Star ⭐ + emoji (😊, 🎉) + sound (playSuccess)
- **Error**: Yellow background + gentle tone + sound (playError)
- **Info**: Light blue background + sound (playClick)
- **Duration**: 2-3 seconds auto-dismiss

**Acceptance**:
- [ ] All 13 games use feedback system
- [ ] No text-only feedback (only icons/emoji)
- [ ] Timing consistent
- [ ] Accessible (alt text for icons)

**Related files**:
- Create: `src/frontend/src/components/game/FeedbackDisplay.tsx` (new)
- Update: All game pages to use FeedbackDisplay

---

### UX-005: Hand Tracking Readiness Indicator
**Priority**: P1  
**Effort**: 1 day  
**Source**: Game improvement audit

**Issue**:
Kids don't know if hand tracking is working. They make gestures that don't register. Confusing.

**Solution**:
Visual status:
- 🔴 Red: "Looking for your hand..." (initializing)
- 🟡 Yellow: "Hand detected, get closer" (tracking but low confidence)
- 🟢 Green: "Ready! Pinch to play" (full confidence)

**Acceptance**:
- [ ] Status visible before/during gameplay
- [ ] Updates in real-time
- [ ] Non-intrusive (small indicator)
- [ ] Works with CameraThumbnail component

---

## Category 2: Accessibility Improvements

### A11Y-001: WCAG AA Color Contrast Audit
**Priority**: P0  
**Effort**: 1-2 days  
**Source**: Initiative 6 (Personas) accessibility review

**Issue**:
Current color palette may fail WCAG AA contrast tests. Some buttons hard to see.

**Solution**:
1. Audit all UI colors against WCAG AA (4.5:1 contrast ratio)
2. Darken backgrounds or lighten text where needed
3. Never use color alone to convey information (add text/icon)
4. Test with color blindness simulator (Chromatic, Color Brewer)

**Acceptance**:
- [ ] WCAG AA contrast verified for all text
- [ ] Color blindness test passed
- [ ] No color-only indicators
- [ ] Documentation updated

**Tools**:
- WebAIM Contrast Checker
- Accessible Colors tool
- Color Brewer

---

### A11Y-002: Keyboard Navigation Support
**Priority**: P1  
**Effort**: 2-3 days  
**Source**: Initiative 6 (Personas) accessibility

**Issue**:
Games require hand tracking. What if mouse/keyboard is only input? (Accessibility need)

**Solution**:
1. All buttons/interactive elements reachable via Tab
2. Game options (Start, Quit, Settings) accessible via keyboard
3. Consider: Arrow keys for selection (if applicable)
4. Test with screen readers (NVDA, VoiceOver)

**Acceptance**:
- [ ] Tab navigation works for all UI
- [ ] Focus indicator visible
- [ ] Screen reader announces buttons correctly
- [ ] Game controls accessible without mouse

---

### A11Y-003: Screen Reader Support
**Priority**: P2  
**Effort**: 2-3 days  
**Source**: Initiative 6 (Personas) accessibility

**Issue**:
Blind/low-vision users: app is visual-only. No alt text on game images.

**Solution**:
1. Alt text on all images (describe game, letters, emoji)
2. ARIA labels on buttons ("Pinch to start", "Next letter", etc.)
3. Announce game state changes (screen reader speaks updates)
4. Test with: NVDA (Windows) + VoiceOver (Mac)

**Acceptance**:
- [ ] All images have alt text
- [ ] ARIA labels complete
- [ ] State changes announced
- [ ] Screen reader test passed

---

### A11Y-004: Hand Position Guidance for Motor Disabilities
**Priority**: P2  
**Effort**: 1-2 days  
**Source**: Initiative 6 (Personas) pediatric OT notes

**Issue**:
Kids with limited motor control struggle with pinch gesture. No guidance on hand positioning.

**Solution**:
1. Visual guide (animated hand showing proper pinch position)
2. Flex input: accept other gestures (tap, open hand, point)
3. Posture reminder: occasional "Good posture!" feedback
4. Adjustable sensitivity (easier → harder modes)

**Acceptance**:
- [ ] Hand position visual guide shown
- [ ] Multiple gesture options supported
- [ ] Sensitivity adjustable
- [ ] Tested with motor disability users

---

## Category 3: Performance Improvements

### PERF-001: Bundle Size Optimization
**Priority**: P2  
**Effort**: 1-2 days  
**Source**: docs/ARCHITECTURE_DEPLOYMENT_SCALE.md

**Issue**:
Frontend bundle: ~2.5MB (uncompressed). Target: <2MB for fast load on 3G.

**Solutions**:
1. Code splitting:
   - Lazy load game pages (don't load all 13 games on startup)
   - Lazy load animations
   - Lazy load 3D models (if used)
2. Image optimization:
   - WebP format with fallback
   - Responsive images (srcset)
   - Compress PNG/SVG
3. Remove unused dependencies (audit package.json)

**Acceptance**:
- [ ] Bundle <2MB gzip
- [ ] LCP maintained <3s
- [ ] No performance regression
- [ ] Lighthouse score 90+

**Tools**:
- Webpack Bundle Analyzer
- Lighthouse
- Bundlesize CLI

---

### PERF-002: Render Performance (60fps Target)
**Priority**: P1  
**Effort**: 2-3 days  
**Source**: docs/ARCHITECTURE.md performance section

**Issue**:
Some animations stutter on low-end devices (older phones, tablets). Target: 60fps consistent.

**Solutions**:
1. Profile animations with DevTools (or Chrome Timeline)
2. Use `will-change` CSS property for animated elements
3. Avoid layout thrashing (seperate reads/writes)
4. Memoize expensive computations
5. Test on: Galaxy S9 (2018), iPad Air 2 (2014)

**Acceptance**:
- [ ] 60fps on modern devices (Lighthouse)
- [ ] 30fps minimum on low-end devices
- [ ] No janky scrolling
- [ ] Smooth transitions

---

### PERF-003: Network Optimization
**Priority**: P2  
**Effort**: 1-2 days  
**Source**: Network waterfall analysis

**Issue**:
Multiple API calls block each other. Load time slow on 4G/LTE.

**Solutions**:
1. Parallel API calls (Promise.all where safe)
2. Request batching (combine multiple small requests)
3. Caching strategy (localStorage for non-sensitive data)
4. Prefetch: load next game while current plays
5. Service Worker for offline support

**Acceptance**:
- [ ] API calls parallelized
- [ ] Largest Contentful Paint <2.5s (LCP)
- [ ] First Input Delay <100ms (FID)
- [ ] Cumulative Layout Shift <0.1 (CLS)

---

## Category 4: Security & Privacy Improvements

### SEC-001: No Video Storage + Camera Redaction Enforcement
**Priority**: P1  
**Effort**: 1-2 days  
**Source**: Issue reporting plan + privacy expectations

**Issue**:
We must ensure **no camera recordings are stored**. For issue reporting, only redacted captures are allowed (camera area blocked/blurred). This matches the solo-dev scope and avoids compliance-heavy flows.

**Solutions**:
1. Enforce redaction before any capture upload
2. Block upload if camera region not masked
3. UI copy: "Camera never recorded"
4. Document policy in issue reporting plan

**Acceptance**:
- [ ] No raw camera recordings stored on device or server
- [ ] Issue reports always mask/blur camera area
- [ ] Upload blocked if redaction not applied
- [ ] UI copy confirms camera is not recorded

**Related files**:
- `src/frontend/src/components/game/CameraThumbnail.tsx`
- Issue reporting components + capture utilities
- `docs/WORKLOG_ADDENDUM_VIDEO_ISSUE_REPORTING_2026-02-23.md`

---

### SEC-002: Input Validation & XSS Prevention
**Priority**: P1  
**Effort**: 1-2 days  
**Source**: OWASP review

**Issue**:
User inputs (child name, parent email) not validated. Potential XSS if data reflected in UI.

**Solutions**:
1. Sanitize all user inputs
2. Use DOMPurify for HTML content
3. Use parameterized queries (backend)
4. Escape output (React does this by default, but verify)

**Acceptance**:
- [ ] All inputs validated (length, type, format)
- [ ] XSS test passed (inject `<script>alert('xss')</script>`)
- [ ] No SQL injection possible
- [ ] Security headers set (CSP, X-Frame-Options)

---

### SEC-003: Rate Limiting on API Endpoints
**Priority**: P1  
**Effort**: 1 day  
**Source**: Backend infrastructure audit

**Issue**:
API endpoints unprotected. Attacker could brute-force login or DOS score submission.

**Solutions**:
1. Login endpoint: 5 attempts per 15 minutes
2. Score submission: 1 per 10 seconds per user
3. Password reset: 3 attempts per hour
4. Use library: `express-rate-limit` or similar

**Acceptance**:
- [ ] Rate limiting enforced
- [ ] Error message clear ("Too many attempts, try again later")
- [ ] Legitimate users not affected
- [ ] Monitoring alerts on abuse

---

## Category 5: Content & Curriculum

### CONTENT-001: Alphabet Curriculum Audit
**Priority**: P2  
**Effort**: 2-3 days  
**Source**: docs/ALPHABET_GAME_AUDIT_REMEDIATION_FINAL.md + educator input

**Issue**:
Letter progression doesn't match K-1 curriculum standards. Some letters too hard, some too easy.

**Solutions**:
1. Align with Common Core standards
2. Phoneme progression:
   - Week 1: A, B, C, D (simple sounds)
   - Week 2: E, F, G, H
   - Week 3-4: I-Z (mix easy/hard)
   - Week 5: Blends (sh, ch, th)
3. Benchmark: 80% success rate for each letter (adjust difficulty)

**Acceptance**:
- [ ] Progression matches Common Core
- [ ] Success rates: 75-85% per letter
- [ ] Teacher can view progression
- [ ] Content reviewed by K-1 teacher

---

### CONTENT-002: Game Difficulty Levels
**Priority**: P2  
**Effort**: 1-2 days  
**Source**: Game audit

**Issue**:
Games don't have difficulty levels. One child bored, another frustrated. No middle ground.

**Solutions**:
1. Add 3 difficulty modes: Easy, Medium, Hard
2. Per-game tuning:
   - **Easy**: Fewer targets, longer time, bigger targets
   - **Medium**: Standard rules
   - **Hard**: More targets, shorter time, smaller targets
3. Auto-progression: If 5/5 perfect, suggest Hard next time

**Acceptance**:
- [ ] All 13 games have 3 difficulty levels
- [ ] Easy/Hard feel appropriately different
- [ ] Auto-suggest working
- [ ] Playtest with kids (verify fun at all levels)

---

### CONTENT-003: Vocabulary Expansion
**Priority**: P3  
**Effort**: 2-3 days  
**Source**: Educator feedback

**Issue**:
Games only teach letters. No vocabulary building beyond the alphabet.

**Solutions**:
1. Word association games:
   - A = Apple (image + word + sound)
   - B = Ball (image + word + sound)
2. Add new game: "Word Builder" (spell simple words: cat, dog, hat)
3. Reading progression: 3-4 letter words → CVC pattern → simple sentences

**Acceptance**:
- [ ] Vocabulary built systematically
- [ ] Audio pronunciation for all words
- [ ] Word Builder game working
- [ ] Aligned to phonics progression

---

## Category 6: Mobile-Specific Issues

### MOBILE-001: Responsive Canvas Scaling
**Priority**: P1  
**Effort**: 1-2 days  
**Source**: Mobile testing

**Issue**:
Game canvas doesn't scale properly on tablets. Text too small, buttons misaligned.

**Solutions**:
1. Responsive design for game.canvas (use % widths, not px)
2. Scale game objects dynamically:
   - 360px width: letters 20% smaller
   - 768px width: letters 20% larger
3. Test on: Phone (375px), Tablet (768px), Landscape (800px+)

**Acceptance**:
- [ ] Game playable on 360-1200px widths
- [ ] No text smaller than 14px
- [ ] Touch targets 48px minimum
- [ ] No horizontal scroll

---

### MOBILE-002: Safe Area Padding (Notch Support)
**Priority**: P2  
**Effort**: 1 day  
**Source**: Modern phone support

**Issue**:
iPhone notch covers UI on some screens. Content disappears under notch.

**Solutions**:
1. Use CSS `viewport-fit=cover` + `env(safe-area-inset-*)`
2. Add padding around notch:
   ```css
   padding-top: env(safe-area-inset-top);
   padding-left: env(safe-area-inset-left);
   ```
3. Test on: iPhone X, iPhone 12, Samsung foldables

**Acceptance**:
- [ ] No content hidden under notch
- [ ] Status bar readable
- [ ] Works on all modern phones

---

## Category 7: Analytics & Insights

### ANALYTICS-001: Learning Progress Tracking
**Priority**: P2  
**Effort**: 2-3 days  
**Source**: Parents want to see "is my child learning?"

**Issue**:
Parents see score percentages but don't understand progression. Is 85% good? Is it improving?

**Solutions**:
1. Progress page improvements:
   - Chart: accuracy over time (trending up = good)
   - Milestones: "Mastered A, B, C" (visual progress)
   - Time investment: "15 hours played" (context)
2. Parent insights:
   - "Focus areas" (letters/games child struggles with)
   - "Strengths" (letters/games child excels at)
   - "Recommendations" ("Try Shape Games next")

**Acceptance**:
- [ ] Progress page shows trending
- [ ] Milestones visible
- [ ] Recommendations making sense
- [ ] Parents find it helpful (survey)

---

### ANALYTICS-002: Engagement Metrics
**Priority**: P3  
**Effort**: 1-2 days  
**Source**: Product health monitoring

**Issue**:
No visibility into: daily active users, retention rate, time in app, game popularity.

**Solutions**:
1. Track events (non-identifying):
   - Game started, Game completed, Letter unlocked
   - Session duration, Feature used
2. Dashboard (internal):
   - DAU/MAU trends
   - Retention curves (how many return after 1 day? 7 days?)
   - Popular games list
3. NO personal data (names, emails, IP addresses)

**Acceptance**:
- [ ] Event tracking working
- [ ] Dashboard populated with data
- [ ] Privacy maintained (no PII)
- [ ] Actionable insights (what to improve next?)

---

## Category 8: Deployment & DevOps

### DEVOPS-001: CI/CD Pipeline Hardening
**Priority**: P1  
**Effort**: 2-3 days  
**Source**: docs/ARCHITECTURE_DEPLOYMENT_SCALE.md

**Issue**:
No automated testing on every commit. Bugs slip through.

**Solutions**:
1. GitHub Actions CI:
   - Run tests on every PR
   - Run type-check (TypeScript)
   - Run linter (ESLint)
   - Run build (verify no errors)
   - Require: All checks pass before merge
2. Secrets management:
   - Environment variables for API keys (never in code)
   - Use GitHub Secrets for sensitive values

**Acceptance**:
- [ ] CI runs on every PR
- [ ] Tests must pass to merge
- [ ] No secrets in code
- [ ] Build optimization in CI

---

### DEVOPS-002: Monitoring & Alerting (Beyond Backend)
**Priority**: P2  
**Effort**: 1-2 days  
**Source**: Initiative 4 (Backend) monitoring plans

**Issue**:
Backend monitoring planned, but frontend errors not tracked. App crashes silently.

**Solutions**:
1. Frontend error tracking:
   - Send uncaught errors to backend logging
   - Include: error message, stacktrace, device info
   - Alert if error rate spikes
2. Performance monitoring:
   - Track Core Web Vitals (LCP, FID, CLS)
   - Alert if metrics degrade
3. Uptime monitoring:
   - Ping health endpoint regularly
   - Alert if API down

**Acceptance**:
- [ ] Errors logged + alertable
- [ ] Performance metrics tracked
- [ ] Uptime monitoring working
- [ ] Team notified on issues

---

## Priority Matrix Summary

| Category | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| UX/Accessibility | - | 4 | 1 | - |
| Accessibility | 1 | 2 | 1 | - |
| Performance | 1 | 1 | 1 | - |
| Security/Privacy | - | 3 | - | - |
| Content | - | 1 | 2 | 1 |
| Mobile | - | 1 | 1 | - |
| Analytics | - | - | 2 | - |
| DevOps | - | 1 | 1 | - |
| **TOTAL** | **2** | **13** | **9** | **1** |

---

## Effort Estimation

**Quick Wins (<1 day)**: 8 items
- UX-004, A11Y-001, SEC-003, DEVOPS-001 partial, etc.
- **Total effort**: 1 week solo

**Medium (1-3 days)**: 18 items
- UX-002, UX-003, A11Y-002, PERF-001, etc.
- **Total effort**: 3-4 weeks solo

**Large (3+ days)**: 2 items
- A11Y-003 (full accessibility), CONTENT-001 (curriculum redesign)
- **Total effort**: 1-2 weeks each

**Grand total**: 5-6 weeks 1 developer, or 2-3 weeks with 2 developers working in parallel.

---

## Triage Recommendations

### Ship in v2.1 (Next 2 weeks) — High Value, Quick Win
- UX-001, UX-004, UX-005 (hand tracking indicator)
- SEC-001 (No video storage + camera redaction)
- DEVOPS-001 (CI/CD)
- **Total**: 1-2 weeks

### Ship in v2.2 (Weeks 3-4)
- UX-002, UX-003 (mobile + onboarding)
- A11Y-001, A11Y-002 (WCAG AA compliance)
- PERF-001, PERF-002 (bundle size + 60fps)
- **Total**: 2-3 weeks

### Q2 Backlog
- CONTENT-001, CONTENT-002 (difficulty levels, curriculum)
- A11Y-003, A11Y-004 (full accessibility)
- ANALYTICS-001 (progress tracking)
- DEVOPS-002 (frontend monitoring)
- **Total**: 4-5 weeks

---

## Next Steps

1. **Create individual tickets** for each P0/P1 item (TCK-20260224-008 onwards)
2. **Prioritize within categories**: Which 3-4 items give highest ROI?
3. **Assign ownership**: Which team member owns which ticket?
4. **Schedule**: Fit into sprints alongside the 6 major initiatives
5. **Track progress**: Update WORKLOG_ADDENDUM as tickets move through phases

