# Critical Issues Master Index

**Date:** 2026-03-07  
**Source:** Deep dive analysis of production readiness gaps  
**Workflow:** 9-Step Evidence-First Methodology

---

## Quick Reference

| Ticket | Title | Priority | Effort | Status | Doc Location |
|--------|-------|----------|--------|--------|--------------|
| TCK-20260307-CRIT-001 | AI Generator Integration | P0 | 1 week | OPEN | `docs/ai-integration/` |
| TCK-20260307-CRIT-002 | Privacy Compliance | P0 | 4 weeks | OPEN | `docs/compliance/` |
| TCK-20260307-CRIT-003 | Curriculum Alignment | P1 | 3 weeks | OPEN | `docs/curriculum/` |
| TCK-20260307-CRIT-004 | Gesture Stability Audit | P1 | 4 days | OPEN | `GESTURE_STABILITY_AUDIT_CHECKLIST.md` |
| TCK-20260307-CRIT-005 | Parent Dashboard | P1 | 2 weeks | OPEN | `PARENT_DASHBOARD_SPEC.md` |

---

## Execution Roadmap

### Week 1: Quick Wins + Research Launch

**Day 1-2: AI Generator (Unit 1)**
- [ ] Implement LLMStoryGenerator
- [ ] Add error handling with fallback
- [ ] Test with feature flag OFF
- [ ] **Deliverable:** Working integration, ready for rollout

**Day 3-4: Gesture Audit (Games 1-3)**
- [ ] Audit Color Match Garden
- [ ] Audit Shape Pop
- [ ] Audit WordBuilder
- [ ] Apply fixes if needed
- [ ] **Deliverable:** Audit report + fixes

**Day 5: Research Launch**
- [ ] Download DPDPA 2023 text
- [ ] Download NCERT ECCE framework
- [ ] Start competitor analysis
- [ ] **Deliverable:** Research materials gathered

### Week 2-3: Privacy & Compliance

**Week 2: Research Phase**
- [ ] Complete DPDPA analysis
- [ ] Complete COPPA research
- [ ] Competitor privacy flow documentation
- [ ] Data flow audit
- [ ] **Deliverable:** `DPDPA_RESEARCH.md` + `COPPA_RESEARCH.md`

**Week 3: Design Phase**
- [ ] Design consent flow
- [ ] Draft privacy policy (child-specific)
- [ ] Create data flow diagrams
- [ ] Legal review (if available)
- [ ] **Deliverable:** Implementation plan + designs

### Week 4-5: Curriculum & Dashboard

**Week 4: Curriculum Research**
- [ ] Map all 18+ games to NCERT
- [ ] Define learning outcomes per game
- [ ] Create assessment methodology
- [ ] **Deliverable:** `NCERT_ALIGNMENT_MATRIX.md`

**Week 5: Dashboard Implementation**
- [ ] Backend skill calculation service
- [ ] Frontend SkillProgressCard component
- [ ] Dashboard layout update
- [ ] **Deliverable:** New dashboard with skills

### Week 6: Integration & Polish

**AI Generator Rollout**
- [ ] Enable for 10% of users
- [ ] Monitor error rates
- [ ] Enable for 100% if stable
- [ ] **Deliverable:** Feature live

**Privacy Implementation**
- [ ] Build consent flow
- [ ] Add camera permission explainer
- [ ] Implement data export/deletion
- [ ] **Deliverable:** Compliant app

---

## Evidence Log

### Critical Findings Summary

**1. AI Stubs (P0)**
```
Observed: src/frontend/src/services/ai/generators/StoryGenerator.ts:100-104
Evidence: Returns "STUB: story for 'prompt'"
Impact: Users see placeholder text in Voice Stories game
Fix: Integrate LLMService with caching + fallback library
```

**2. Privacy Gap (P0)**
```
Observed: No DPDPA research documented
Evidence: docs/compliance/ directory empty except research plan
Impact: Legal risk, launch blocker for India
Fix: Research + implement parental consent flow
```

**3. Curriculum Gap (P1)**
```
Observed: No NCERT mapping in docs/curriculum/
Evidence: Games have descriptions but no learning outcomes
Impact: Schools won't adopt, parents don't see value
Fix: Map all games to NCERT ECCE framework
```

**4. Gesture Stability (P1)**
```
Observed: Prior fix in docs/fixes/finger-number-success-detection-fix.md
Evidence: Similar pattern may exist in other games
Impact: Shaky child hands cause frustration
Fix: Audit 6 games, apply tolerance pattern
```

**5. Parent Dashboard (P1)**
```
Observed: Dashboard shows time, not learning
Evidence: src/frontend/src/pages/Dashboard.tsx
Impact: Parents can't see educational value
Fix: Add skill progression visualization
```

---

## Document Structure

```
docs/
├── CRITICAL_ISSUES_MASTER_INDEX.md          (this file)
├── DEEP_DIVE_CRITICAL_ISSUES_AND_RESEARCH_2026-03-07.md
├── WORKLOG_ADDENDUM_CRITICAL_ISSUES_2026-03-07.md
├── GESTURE_STABILITY_AUDIT_CHECKLIST.md
├── PARENT_DASHBOARD_SPEC.md
├── ai-integration/
│   └── AI_GENERATOR_IMPLEMENTATION_SPEC.md
├── compliance/
│   ├── PRIVACY_COMPLIANCE_RESEARCH_PLAN.md
│   ├── DPDPA_RESEARCH.md                    (to be created)
│   ├── COPPA_RESEARCH.md                    (to be created)
│   └── PRIVACY_IMPLEMENTATION_PLAN.md       (to be created)
├── curriculum/
│   ├── CURRICULUM_ALIGNMENT_RESEARCH_PLAN.md
│   ├── NCERT_ALIGNMENT_MATRIX.md            (to be created)
│   ├── LEARNING_OUTCOMES.md                 (to be created)
│   └── PARENT_COMMUNICATION_GUIDE.md        (to be created)
└── fixes/
    └── finger-number-success-detection-fix.md (prior art)
```

---

## Decision Log

### Decision 1: AI Generator Rollout Strategy
**Date:** 2026-03-07  
**Decision:** Implement with feature flag + fallback library  
**Rationale:** 
- LLM costs unpredictable without caching
- Fallback ensures feature works even if LLM fails
- Gradual rollout allows cost monitoring

### Decision 2: Privacy First, Then Curriculum
**Date:** 2026-03-07  
**Decision:** Prioritize privacy compliance over curriculum  
**Rationale:**
- Privacy is P0 launch blocker (legal requirement)
- Curriculum is P1 business enabler (schools)
- Privacy affects all users, curriculum affects B2B only

### Decision 3: Reuse Finger Number Fix Pattern
**Date:** 2026-03-07  
**Decision:** Apply same tolerance pattern to other gesture games  
**Rationale:**
- Proven fix with testing
- Pattern well-documented
- Consistent UX across games

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Privacy research takes longer than 2 weeks | Medium | High | Start immediately, parallel workstreams |
| LLM costs higher than expected | Low | Medium | Fallback library + caching + rate limits |
| Curriculum mapping reveals major gaps | Medium | Medium | Prioritize core literacy/numeracy first |
| Gesture fixes cause regressions | Low | High | Thorough testing per game |
| Parent dashboard doesn't resonate | Medium | Medium | A/B test, iterate based on feedback |

---

## Next Actions (Immediate)

### Today
1. [ ] Review this master index
2. [ ] Choose first ticket to implement
3. [ ] Create feature branch

### This Week
1. [ ] AI Generator Unit 1 (2 days)
2. [ ] Gesture Audit first 3 games (2 days)
3. [ ] Download privacy/curriculum research materials (1 day)

### Questions for User

1. **Privacy:** Do you have access to legal counsel for DPDPA review?
2. **AI:** What is the monthly budget for LLM API calls?
3. **Curriculum:** Do you have contacts with early childhood educators for validation?
4. **Priority:** Should we parallelize (all at once) or sequence (one by one)?

---

## Appendix: Evidence Sources

### Code Evidence
```bash
# AI Stubs
grep -n "STUB:" src/frontend/src/services/ai/generators/*.ts

# Gesture detection
grep -rn "isPointInCircle\|findHitTarget" src/frontend/src/pages/*.tsx | head -20

# Current dashboard
cat src/frontend/src/pages/Dashboard.tsx | grep -A 5 "return ("
```

### Document Evidence
- `ERROR_HANDLING_REVIEW.md` - Error handling status
- `GAME_LOGICAL_FINDINGS_AND_RESEARCH_2026-02-23.md` - Prior analysis
- `AREAS_TO_EXPLORE_BACKLOG_2026-03-03.md` - Future ideas
- `RESEARCH_TOPICS_CONSOLIDATED_2026-03-05.md` - Open research

---

**Status:** Ready for execution  
**Last Updated:** 2026-03-07  
**Next Review:** After first ticket completion
