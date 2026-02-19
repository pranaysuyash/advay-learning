# Intent-First Performance Philosophy v1.0

## "Optimize What Users Actually Feel"

**Core Principle:** Before implementing performance optimizations, investigate real user impact and business metrics to ensure efforts improve actual user experience rather than synthetic benchmarks.

**Codebase-First Focus:** Optimize existing code before rewriting. Profile current implementation to identify real bottlenecks.

---

## Universal Investigation Framework

### Phase 1: Context Discovery

1. **Identify performance concerns** (user complaints, monitoring alerts, or proactive optimization)
2. **Measure current user experience** (real user metrics, not just synthetic tests)
3. **Understand usage patterns** (when, where, and how users experience slowness)
4. **Assess business impact** (how performance affects conversion, engagement, or revenue)
5. **Profile existing code** (where are the actual bottlenecks?)

### Phase 2: Impact Analysis

- What specific user actions or workflows are affected?
- How does current performance impact business metrics?
- Where do users actually experience slowness in their journey?
- What's the cost of poor performance vs. cost of optimization?
- **What's causing the bottleneck in existing code?**

### Phase 3: Performance Priority Assessment

- **User Impact**: How many users experience the performance issue
- **Business Impact**: Effect on conversion, retention, or revenue
- **Optimization Effort**: Complexity and time required for improvement
- **Improvement Potential**: How much performance gain is realistically achievable
- **Codebase Impact**: Will changes affect other parts of the system?

---

## Quick Filter

Skip complex optimization if all true:

- Performance issue affects very few users
- Current performance meets business requirements
- High optimization effort for minimal user-perceivable improvement
- Other higher-impact performance issues exist

→ **Document as acceptable performance debt** in `performance-debt.md`

---

## Performance Priority Matrix

| User Impact | Business Impact | Optimization Effort | Existing Code Maturity | Priority |
|-------------|----------------|-------------------|----------------------|----------|
| High | High | Low-Medium | Mature | **Critical – Optimize immediately** |
| High | Medium | Low-Medium | Mature | **High – Optimize this sprint** |
| Medium | High | Low | Mature | **Medium – Plan for next iteration** |
| High | High | High | Mature | **Profile first, then optimize** |
| High | High | Any | Immature | **Stabilize code first, then optimize** |
| Low | Low | Any | Any | **Document as acceptable performance level** |

---

## Codebase-First Performance Rule

For *Critical* and *High* priority items:

1. **Profile before optimizing** - identify real bottlenecks in existing code
2. **Optimize existing code first** - improve current implementation before rewriting
3. **Target slowest experiences** - focus on the 20% of users with worst performance
4. **Measure real impact** - verify optimizations actually help users
5. **Avoid premature optimization** - ensure code is stable before micro-optimizing

Advanced optimizations like micro-caching or complex algorithmic improvements can be deferred unless they directly impact core user experience.

---

## Ready-to-Use AI Prompt

```
You are to apply the Intent-First Performance Philosophy to the following performance concern.

### Performance Context:
[Describe the performance issue, user complaints, or optimization opportunity]

### Investigation Requirements:
1. **User Impact Analysis**:
   - Which user workflows are affected
   - How many users experience this issue
   - Current user experience and pain points

2. **Existing Code Analysis**:
   - Profile current implementation
   - Identify actual bottlenecks
   - Code maturity and stability

3. **Business Impact Assessment**:
   - Effect on conversion, engagement, or revenue
   - Cost of poor performance vs. optimization effort
   - Competitive performance comparison

4. **Optimization Options**:
   - Quick wins (optimize existing code)
   - Medium-term improvements (refactor then optimize)
   - Long-term architectural improvements

5. **Output Table**:
   | Factor | Assessment | Notes |
   |--------|------------|-------|
   | User Impact |  |  |
   | Business Impact |  |  |
   | Current Performance |  |  |
   | Bottleneck Location |  |  |
   | Code Maturity |  |  |
   | Recommended Approach |  |  |
   | Expected Improvement |  |  |
   | Success Metrics |  |  |

### Notes:
- Focus on user-perceived performance over synthetic benchmarks
- Profile before optimizing
- Prioritize optimizations that improve business metrics
- Optimize existing code before rewriting
- Measure real user impact, not just technical metrics
```

---

## Key Questions to Always Ask

- **"How does this performance issue affect real user workflows?"**
- **"What business metrics improve when we fix this?"**
- **"Are we optimizing what users actually experience?"**
- **"Where is the actual bottleneck in existing code?"**
- **"What's the simplest optimization that provides meaningful improvement?"**
- **"How will we measure if our optimization actually helped users?"**
- **"Can we improve existing code before rewriting?"**

---

## Related

- See `intent-first-development-v1.0.md` for implementation
- See `intent-first-testing-v1.0.md` for performance testing
