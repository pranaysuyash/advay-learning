# Intent-First Deployment Philosophy v1.0
## "Ship Confidently, Not Just Quickly"

**Core Principle:** Before deploying or rolling back changes, investigate the business impact, operational readiness, and rollback safety to ensure deployments create value while maintaining system reliability.

**Codebase-First Focus:** Deploy incrementally. Build upon stable releases. Ensure existing functionality remains intact when adding new features.

---

## Universal Investigation Framework

### Phase 1: Context Discovery
1. **Understand the change impact** (which systems, users, and processes will be affected?)
2. **Assess operational readiness** (monitoring, alerting, and support preparedness)
3. **Verify rollback safety** (can we revert cleanly and quickly if needed?)
4. **Check dependencies** (are all required services, data, and teams ready?)
5. **Review existing stability** (are current systems stable to build upon?)

### Phase 2: Impact Analysis
- What user experience will change?
- What is the business value and urgency of this deployment?
- Are we operationally prepared to support this change?
- What would failure look like and how would we detect it?
- **Does this preserve existing functionality?**

### Phase 3: Deployment Risk Assessment
- **Business Impact**: Revenue, compliance, user experience
- **Technical Risk**: Complexity, novelty, criticality
- **Rollback Complexity**: Ease and safety of reverting changes
- **Operational Readiness**: Monitoring, alerting, on-call coverage
- **Foundation Stability**: Are existing systems stable?

---

## Quick Filter

Delay if any are true:
- Critical monitoring or alerting not configured
- Rollback procedure untested or unclear
- Major dependencies unavailable or unready
- Deployment window overlaps with high-risk events (e.g., peak traffic)
- On-call or core support staff unavailable
- **Existing systems showing instability**

→ **Delay until operational requirements are met**

---

## Deployment Risk Matrix

| Business Impact | Technical Risk | Rollback Complexity | Foundation Stability | Deployment Strategy |
|-----------------|---------------|-------------------|---------------------|-------------------|
| High | Low | Low | Stable | **Standard deployment + extra monitoring** |
| High | Medium | Low–Medium | Stable | **Staged rollout with feature flags** |
| High | High | Any | Stable | **Blue-green deployment + instant rollback** |
| High | Any | Any | Unstable | **Stabilize first, then deploy** |
| Medium | Low | Low | Stable | **Standard deployment** |
| Any | Any | High | Stable | **Migration strategy + rollback plan required** |

---

## Codebase-First Deployment Rule

Deploy the **smallest safe scope** that delivers required business value:
1. **Ensure existing functionality** is preserved and tested
2. **Deploy incrementally** - add features in small, safe batches
3. **Build on stable releases** - only deploy from known-good states
4. **Test in staging** with production-like data and load
5. **Have rollback ready** before deploying

Defer non-critical changes to a separate release to reduce complexity and risk.

---

## Ready-to-Use AI Prompt

```
You are to apply the Intent-First Deployment Philosophy to the following deployment.

### Deployment Context:
[Describe changes, urgency, and business context]

### Investigation Requirements:
1. **Change Impact**:
   - User experience changes
   - Business value
   - Systems/processes affected
   - Existing functionality preservation

2. **Foundation Assessment**:
   - Current system stability
   - Recent deployment history
   - Known issues in production

3. **Risk Assessment**:
   - Technical complexity
   - Failure scenarios
   - Blast radius

4. **Operational Readiness**:
   - Monitoring/alerting in place
   - Support readiness
   - Rollback tested

5. **Deployment Strategy Options**:
   - Full deploy
   - Staged/canary
   - Feature flag
   - Blue-green

6. **Output Table**:
   | Factor | Assessment | Notes |
   |--------|------------|-------|
   | Business Impact |  |  |
   | Technical Risk |  |  |
   | Rollback Complexity |  |  |
   | Foundation Stability |  |  |
   | Readiness |  |  |
   | Recommended Strategy |  |  |
   | Success Metrics |  |  |
   | Failure Triggers |  |  |

### Notes:
- Reliability > speed
- Always define rollback triggers
- Monitor both technical & business metrics
- Ensure existing functionality is preserved
```

---

## Key Questions to Always Ask

- **"What's the worst-case scenario and are we ready?"**
- **"Can we detect and recover from failure quickly?"**
- **"Is the business value worth the risk?"**
- **"Is the team ready to support this change?"**
- **"What are our rollback triggers?"**
- **"How will we measure success?"**
- **"Does this preserve existing functionality?"**

---

## Related

- See `intent-first-testing-v1.0.md` for testing strategy
- See `intent-first-operations-v1.0.md` for operational considerations
