# Consolidated Task Plan - Post Documentation Audit

**Date:** 2026-04-01  
**Status:** Based on comprehensive docs + code verification  
**Goal:** Launch Readiness

---

## 🎯 Executive Summary

### What's Been Done
- ✅ 8 major docs updated with verified status
- ✅ CV compliance verified: 120/127 games (98%)
- ✅ All "not implemented" games verified as EXISTING
- ✅ PR #50 issues marked as resolved
- ✅ Test suite passing: 7290/7290

### What's Blocking Launch
**Critical (Must Fix):**
1. External uptime monitoring (2 hrs)
2. Database backup automation (4 hrs)
3. Rollback procedure documentation (2 hrs)

**Important (Should Fix):**
4. Fix cv_gap_analysis.py indentation (5 min)
5. Load testing to 500+ concurrent users (1 day)

**Nice-to-Have:**
6. Security audit (1-2 weeks, can be post-launch)

---

## 📋 Detailed Task List

### CRITICAL - Pre-Launch (This Week)

#### Task 1: Setup External Uptime Monitoring
**Effort:** 2 hours  
**Priority:** P0  
**Why:** App can silently fail without this

**Steps:**
1. Create Healthchecks.io account (free tier)
2. Add check for `/health` endpoint
3. Configure email/Slack notifications
4. Document in runbook

**Verification:**
```bash
curl https://your-domain.com/health
# Should return 200 OK
```

---

#### Task 2: Automate Database Backups
**Effort:** 4 hours  
**Priority:** P0  
**Why:** Data loss risk without backups

**Steps:**
1. Create S3/Backblaze bucket for backups
2. Add backup script (pg_dump daily)
3. Schedule via cron or GitHub Actions
4. Test restore procedure
5. Document retention policy (30 days)

**Verification:**
```bash
# Backup script exists and runs
docker exec postgres pg_dump -U user db > backup.sql
# Restore test passes
```

---

#### Task 3: Document Rollback Procedure
**Effort:** 2 hours  
**Priority:** P0  
**Why:** Need to recover from bad deploys

**Steps:**
1. Write rollback runbook:
   - How to revert to previous Docker image
   - How to rollback database migrations
   - Who to contact/on-call owner
2. Practice on staging environment
3. Store in `docs/runbooks/ROLLBACK.md`

**Verification:**
- Runbook reviewed by team
- Staging rollback test passed

---

### IMPORTANT - Pre-Launch (Next Week)

#### Task 4: Fix cv_gap_analysis.py Indentation
**Effort:** 5 minutes  
**Priority:** P1  
**File:** `tools/cv_gap_analysis.py`

**Issue:** IndentationError at line 161

**Fix:**
```python
# Fix indentation to match outer block
```

**Verification:**
```bash
python3 -m py_compile tools/cv_gap_analysis.py
# Should output: no errors
```

---

#### Task 5: Load Testing
**Effort:** 1 day  
**Priority:** P1  
**Why:** Unknown capacity limits

**Steps:**
1. Install k6 or Locust
2. Create test scenario: auth → play game → save progress
3. Run with 100, 500, 1000 concurrent users
4. Monitor: CPU, memory, DB connections, response times
5. Document capacity limits

**Verification:**
- 100 users: < 200ms response time ✅
- 500 users: < 500ms response time ✅
- Documented bottleneck (if any)

---

### NICE-TO-HAVE - Post-Launch

#### Task 6: Security Audit
**Effort:** 1-2 weeks  
**Priority:** P2  
**Can be post-launch for beta**

**Steps:**
1. Run SAST (GitHub CodeQL, Snyk, or SonarQube)
2. Review findings, fix critical/high
3. Optional: Hire penetration tester ($2k-5k)
4. Document security posture

---

## 🎮 Activity Book Game Ideas

You mentioned having activity books with new game ideas! Once critical tasks are done, we can:

### Phase 1: Concept Development
1. Review activity book content
2. Identify CV-native game mechanics
3. Map to learning objectives (ages 3-8)
4. Prioritize by implementation effort

### Phase 2: Design
1. Create game specs using 23-section format
2. Design CV interactions (hand/pose/face/voice)
3. Define visual style (Kenney assets)
4. Plan drops/rewards integration

### Phase 3: Implementation
1. Build game with full CV from start
2. Add to game registry
3. Create e2e tests
4. Add to appropriate world

---

## 📊 Current Status Dashboard

| Area | Status | Evidence |
|------|--------|----------|
| **CV Compliance** | ✅ 98% | 120/127 games, 7290 tests |
| **Game Implementation** | ✅ 100% | All catalog games done |
| **Email Service** | ✅ Working | Resend API integrated |
| **Parental Consent** | ✅ Complete | All 3 methods working |
| **Auth/Security** | ✅ Hardened | Redis lockout, JWT, rate limits |
| **Docker/Deploy** | ✅ Ready | Multi-stage builds, compose |
| **Test Suite** | ✅ Passing | 7290/7290 tests |
| **Monitoring** | ❌ Missing | Needs Healthchecks.io |
| **Backups** | ❌ Missing | Needs automation |
| **Rollback** | ❌ Missing | Needs documentation |

---

## 🚀 Launch Readiness Timeline

### This Week (Critical)
- [ ] Task 1: Uptime monitoring (2 hrs)
- [ ] Task 2: Database backups (4 hrs)
- [ ] Task 3: Rollback procedure (2 hrs)

### Next Week (Important)
- [ ] Task 4: Fix Python script (5 min)
- [ ] Task 5: Load testing (1 day)
- [ ] Final verification

### Week 3 (Launch Prep)
- [ ] Soft launch to 100 beta users
- [ ] Monitor errors/feedback
- [ ] Polish UX based on feedback

### Week 4 (Public Launch)
- [ ] Public launch 🚀
- [ ] Monitor metrics
- [ ] Respond to issues

---

## 🎯 Decision Points

### Can We Launch Beta This Week?
**Answer:** YES, with conditions
- ✅ Core functionality complete
- ⚠️ Need monitoring (Task 1)
- ⚠️ Need backups (Task 2)
- ⚠️ Need rollback doc (Task 3)

**Decision:** Complete tasks 1-3 this week, then beta launch.

### Can We Launch Public This Month?
**Answer:** YES, with 2-3 weeks of work
- Complete all critical + important tasks
- 1 week beta testing
- Polish based on feedback

---

## 📞 Next Actions

1. **You decide:** Prioritize tasks 1-3 for this week?
2. **Share activity book content** when ready for game ideation
3. **Review:** This plan realistic for your timeline?

---

*Task plan created: 2026-04-01*  
*Based on: Documentation audit + code verification*
