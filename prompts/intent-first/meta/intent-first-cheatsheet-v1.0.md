# Intent-First Cheatsheet v1.0

## Universal Intent Test
>
> "What is the real intent behind this, and will our approach create genuine value?"

---

## The 3-Phase Framework (All Philosophies)

### Phase 1: Context Discovery

1. Define situation and stakeholders
2. Gather signals, history, constraints
3. Surface hidden incentives and risks
4. **Review existing code/assets/processes**

### Phase 2: Intent Analysis

- What outcome are we truly optimizing for?
- Which principles must not be violated?
- What trade-offs are acceptable?
- **What existing foundation can we build upon?**

### Phase 3: Priority Assessment

- Impact: magnitude of upside/downside
- Effort: time, energy, attention, capital
- Risk: reversibility, blast radius, optionality
- **Existing foundation fit**

---

## Quick Filter (All Philosophies)

Skip deep analysis if all true:

- Low, vague, or misaligned intent
- High effort for marginal value
- Better alternatives exist now
- **No existing foundation to build upon**

→ **Log as intent debt** (record context, revisit trigger)

---

## Codebase-First Rule (All Philosophies)

Ship the smallest action that:

1. **Builds on existing foundation**
2. Proves intent and creates observable value
3. Can be instrumented for feedback
4. Enables iteration

---

## One-Page Cheatsheets by Philosophy

### Development

- **Intent test:** What problem and for whom? What's already there?
- **Quick filter:** low intent + high effort + weak foundation → log debt
- **Codebase-first:** enhance existing, preserve patterns, add don't destroy
- **Metrics:** user value, technical effort, operational risk, codebase fit
- **Standard prompt:** see `intent-first-development-v1.0.md`

### Testing

- **Intent test:** What user journey breaks if this fails?
- **Quick filter:** low impact + well-covered + high effort → log debt
- **Codebase-first:** test existing behavior before new, preserve coverage
- **Metrics:** business impact, failure probability, test effort, coverage gap
- **Standard prompt:** see `intent-first-testing-v1.0.md`

### UX Design

- **Intent test:** What user problem? Can we use existing components?
- **Quick filter:** cosmetic only + low traffic + high effort → log debt
- **Codebase-first:** use existing patterns, extend don't replace
- **Metrics:** user impact, business impact, effort, existing pattern fit
- **Standard prompt:** see `intent-first-ux-design-v1.0.md`

### Code Review

- **Intent test:** What problem? Does it fit existing patterns?
- **Quick filter:** low risk + standard patterns → skim only
- **Codebase-first:** consistency, correctness, security, maintainability
- **Metrics:** correctness, security, performance, maintainability, consistency
- **Standard prompt:** see `intent-first-code-review-v1.0.md`

### Deployment

- **Intent test:** Worst case? Can we roll back? Is foundation stable?
- **Quick filter:** no monitoring + untested rollback + unstable → delay
- **Codebase-first:** preserve existing functionality, deploy incrementally
- **Metrics:** business impact, technical risk, rollback complexity, stability
- **Standard prompt:** see `intent-first-deployment-v1.0.md`

### Data

- **Intent test:** What decision? Can we use existing data structures?
- **Quick filter:** low quality + any decision → don't use
- **Codebase-first:** leverage existing data, extend schemas incrementally
- **Metrics:** quality, completeness, timeliness, relevance, schema fit
- **Standard prompt:** see `intent-first-data-v1.0.md`

### Security

- **Intent test:** What attack vector? How do existing controls help?
- **Quick filter:** low threat + adequate controls → document risk
- **Codebase-first:** layer on existing controls, enhance incrementally
- **Metrics:** threat severity, business risk, user impact, control fit
- **Standard prompt:** see `intent-first-security-v1.0.md`

### Performance

- **Intent test:** What do users actually feel? Profile existing code first
- **Quick filter:** few users + meets requirements + high effort → log debt
- **Codebase-first:** profile before optimizing, optimize existing before rewrite
- **Metrics:** user impact, business impact, effort, improvement potential
- **Standard prompt:** see `intent-first-performance-v1.0.md`

### Documentation

- **Intent test:** Who needs this? Does it match current code?
- **Quick filter:** self-explanatory + small audience + misaligned → log debt
- **Codebase-first:** document existing code first, keep in sync
- **Metrics:** knowledge impact, audience size, maintenance, codebase alignment
- **Standard prompt:** see `intent-first-documentation-v1.0.md`

### Product

- **Intent test:** What user problem? Can we enhance existing features?
- **Quick filter:** few users + adequate workarounds + misaligned → log debt
- **Codebase-first:** enhance before building new, extend working patterns
- **Metrics:** user impact, business impact, confidence, effort, foundation
- **Standard prompt:** see `intent-first-product-v1.0.md`

### Content

- **Intent test:** What reader problem? Can we update existing content?
- **Quick filter:** small audience + existing coverage adequate → log debt
- **Codebase-first:** update before creating new, build on what works
- **Metrics:** audience impact, business impact, effort, existing content
- **Standard prompt:** see `intent-first-content-v1.0.md`

### Customer Success

- **Intent test:** What customer outcome? Can existing processes handle this?
- **Quick filter:** simple workaround + achieving goals → minimal intervention
- **Codebase-first:** use existing processes, enhance incrementally
- **Metrics:** customer impact, relationship impact, scalability, efficiency
- **Standard prompt:** see `intent-first-customer-success-v1.0.md`

### Sales

- **Intent test:** What problem and why now? Do they fit our process?
- **Quick filter:** unclear problem + poor fit + weak urgency → minimal investment
- **Codebase-first:** follow existing process, use existing materials
- **Metrics:** success probability, revenue quality, strategic value, fit
- **Standard prompt:** see `intent-first-sales-v1.0.md`

### Operations

- **Intent test:** What business outcome? Can we improve existing processes?
- **Quick filter:** adequate current + low frequency + high effort → log debt
- **Codebase-first:** improve before automating, enhance incrementally
- **Metrics:** business impact, scalability, productivity, effort, process fit
- **Standard prompt:** see `intent-first-operations-v1.0.md`

### Leadership

- **Intent test:** What outcome? What existing capabilities can we leverage?
- **Quick filter:** low intent + high effort + strong team fit → log debt
- **Codebase-first:** build on team strengths, enhance working processes
- **Metrics:** impact, effort, risk, team fit
- **Standard prompt:** see `intent-first-leadership-v1.0.md`

### Communication

- **Intent test:** What outcome? What channels already exist?
- **Quick filter:** low intent + high effort + adequate channels → log debt
- **Codebase-first:** use existing channels, established terminology
- **Metrics:** impact, effort, risk, channel fit
- **Standard prompt:** see `intent-first-communication-v1.0.md`

### Decision-Making

- **Intent test:** Reversible? What precedents exist?
- **Quick filter:** low intent + precedent exists → use precedent
- **Codebase-first:** check precedents, use existing frameworks
- **Metrics:** impact, effort, risk, precedent fit
- **Standard prompt:** see `intent-first-decision-making-v1.0.md`

### Creativity

- **Intent test:** What emotion? What existing assets can we use?
- **Quick filter:** low intent + existing assets usable → log debt
- **Codebase-first:** use existing brand elements, proven patterns
- **Metrics:** impact, effort, risk, brand fit
- **Standard prompt:** see `intent-first-creativity-v1.0.md`

### Learning

- **Intent test:** What outcome? What existing knowledge to build on?
- **Quick filter:** low intent + sufficient existing → log debt
- **Codebase-first:** build on existing knowledge, project-based practice
- **Metrics:** impact, effort, risk, foundation
- **Standard prompt:** see `intent-first-learning-v1.0.md`

### Wellbeing

- **Intent test:** What energy outcome? What existing habits to anchor?
- **Quick filter:** low intent + adequate habits → log debt
- **Codebase-first:** anchor to existing habits, minimum viable changes
- **Metrics:** impact, effort, risk, habit foundation
- **Standard prompt:** see `intent-first-wellbeing-v1.0.md`

### Relationships

- **Intent test:** What trust outcome? What existing foundation?
- **Quick filter:** low intent + strong foundation → log debt
- **Codebase-first:** maintain existing, repair when needed
- **Metrics:** impact, effort, risk, foundation
- **Standard prompt:** see `intent-first-relationships-v1.0.md`

---

## Quick Reference: Intent Debt Log

When skipping deep work, log:

```
- Date: [when noted]
- Intent: [what was considered]
- Why skipped: [which quick filter criteria applied]
- Revisit trigger: [when to reconsider]
- Context: [enough info to pick up later]
```

---

## Related

- See `intent-first-handbook-overview-v1.0.md` for full documentation
- See `intent-first-implementation-guide-v1.0.md` for adoption guide
