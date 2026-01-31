# Prompt Creation Summary - VC Investment Evaluation

**Date**: 2026-01-31
**Author**: AI Assistant (executing user request)
**User Request**: "also add this new prompt:PROMPT: 'Big VC Partner Evaluating a Camera-Based Kids Learning App'"

---

## What Was Created

### 1. New Prompt File

**File**: `prompts/investor/vc-investment-evaluation-v1.0.md`

**Persona**: Senior VC Partner at Top-Tier Fund (Series A/B stage)
**Target App**: Advay Vision Learning (MediaPipe-based, camera-driven learning web app for kids 2-6)

**Prompt Sections (12 Deliverables)**:

1. **Investment Headline** - "This is a ___ disguised as a ___"
2. **What I Saw (FACTS ONLY)**
   - Product map (screens + flows)
   - Core interaction loops
   - Notable UX strengths
   - Notable UX failures
3. **The Thesis**
   - The wedge (specific use case)
   - The expansion (how it becomes platform)
   - The inevitability (macro trend)
4. **Moat Analysis** (6 moats, 0-10 scoring)
   - Data moat
   - Model moat
   - Content moat
   - Distribution moat
   - Brand moat
   - Switching costs
5. **Risk Register** (top 12)
   - Privacy/safety
   - Technical
   - GTM
   - Retention
   - Regulatory
   - Competition
   - Team/ops
   - Financial
6. **Business Model Hypotheses**
   - 3 pricing models (B2C, B2B2C, Hybrid)
   - "Must be true" for each model
   - What would break each model
7. **Growth/Distribution Strategy**
   - 3 channels for first 6 months
   - 2 wasteful channels to avoid
   - Viral hooks (shareable moments)
   - Community loops
8. **Retention Diagnosis**
   - What brings kids back tomorrow
   - What makes parents schedule it weekly
   - Missing systems (progression, personalization, habit loops, rewards)
9. **Competitive Landscape**
   - What it most resembles
   - Likely competitors by category
   - Where incumbents strong vs where this wins
10. **Investment Readiness Scorecard** (8 metrics, 0-10 scoring)
    - Product clarity
    - Trust/safety posture
    - Retention potential
    - Differentiation
    - Speed of iteration (implied by build)
    - Go-to-market plausibility
    - Defensibility
    - Overall fundability
11. **What I'd Tell the Founder**
    - Single biggest change to increase fundability
    - Top 5 milestones for next 8 weeks
    - Top 5 metrics to instrument immediately
12. **Diligence Questions** (minimum 25)
    - Product (5)
    - Market (5)
    - GTM (5)
    - Tech (5)
    - Safety/privacy (5)
    - Team/ops (optional)

---

## Hands-On Exploration Requirements

### 10-Minute Product Tour

**Open http://localhost:6173 and explore:**

**Time Allocation:**
- 0:00-2:00: Landing page + onboarding
- 2:00-4:00: Core gameplay loop
- 4:00-6:00: Unique camera features
- 6:00-8:00: Progress/engagement systems
- 8:00-10:00: Edge cases + stress-testing

### Step 2: Identify "Core Magic"

**Answer:**
- What does camera enable that touch/scroll apps CANNOT? (3-5 advantages)
- What's the ONE interaction pattern that feels magical?

### Step 3: Test Onboarding

**Time These:**
- Time-to-First-Fun (landing → "aha!" moment)
- Time-to-First-Learning (first educational objective)
- Time-to-Trust (believe it's safe for kids)

**Red Flag**: Any >3 minutes is problematic.

### Step 4: Test 5+ Activities

**If 5+ games**: Test all 5 briefly (2 min each)
**If fewer**: Explore all repeatedly

**For each:**
- Educational objective
- Camera enhancement
- Repeatable engagement loop
- Difficulty curve

### Step 5: Trigger Edge Cases

**Test these scenarios:**

1. **Camera Permission**: Deny → play → allow later
2. **Low Light**: Dim room → degradation
3. **Distance**: Too close / too far
4. **Kid-Jittery Motion**: Wave erratically
5. **Rapid Switching**: 4 games in 1 minute

**Document**: What happens vs what SHOULD happen.

---

## VC Mindset - What This Prompt Cares About

### Primary Investment Pillars:

1. **Market Size & Urgency**
   - Billion-dollar category or niche toy?
   - Urgent or "nice to have"?
   - Why now? (macro trends)

2. **Differentiation & Defensibility (Moat)**
   - Unique value proposition?
   - Defensible against incumbents?
   - Compounding advantages?

3. **Distribution & Growth**
   - Viral loops, partnerships, content?
   - CAC-to-LTV ratio potential?
   - Channel constraints?

4. **Retention & LTV**
   - Daily/weekly/monthly return?
   - Monthly/yearly payments?
   - Habit formation mechanism?

5. **Operational Risk**
   - Privacy/safety (COPPA, camera data)
   - Platform constraints (browser/mobile APIs)
   - Technical execution risk

6. **Team Velocity (Implied)**
   - Current build quality signals
   - Iteration speed adequate?
   - Technical excellence signals?

7. **Path to Real Business**
   - Pricing strategy
   - Unit economics (margins, CAC, LTV, payback)
   - Enterprise channels

---

## Quality Bar

### This is NOT a generic VC memo. It must be:

1. **Grounded in actual product exploration**
   - Every claim must reference something observed
   - Explicit: "I saw X on screen Y"

2. **Explicit about assumptions and verification needs**
   - Distinguish: "Observed" vs "Inferred" vs "Assumption"
   - State evidence that would confirm/refute claims

3. **Recommend realistic wedge, not "do everything for all kids"**
   - Focus on specific use case
   - Avoid broad claims like "Netflix of education"
   - Be specific about target user/problem

4. **Brutally honest about risks**
   - Don't sugarcoat
   - If privacy risk is existential, say so
   - If moat is weak, score it 2-3
   - Call out gaps honestly

5. **Investor-first, not founder-flattering**
   - For partners to make investment decisions
   - Be critical: call out gaps, weaknesses, risks
   - Don't try to "help" - try to "evaluate"

---

## What Gets Evaluated

### Product Readiness:
- Does this feel investable as product direction?
- Would you put your firm's brand on this in 6 months?
- MVP vs what's actually built?

### Moat Strength (Total Score: 0-60 / 60):
- Data moat: 0-10
- Model moat: 0-10
- Content moat: 0-10
- Distribution moat: 0-10
- Brand moat: 0-10
- Switching costs: 0-10

### Investment Readiness (Total Score: 0-80 / 80):
- Product clarity: 0-10
- Trust/safety: 0-10
- Retention: 0-10
- Differentiation: 0-10
- Team velocity: 0-10
- GTM plausibility: 0-10
- Defensibility: 0-10
- Overall fundability: 0-10

### Business Model Hypotheses:
- Model 1: B2C subscription (parents paying)
- Model 2: B2B2C (schools paying for families)
- Model 3: Hybrid (freemium + premium upsell)

### Growth Strategy:
- 3 viable channels for first 6 months
- 2 wasteful channels to avoid
- Viral hooks (shareable moments)
- Community loops (user contributions)

### Diligence Questions (30 min 25):
- Product: 5 questions
- Market: 5 questions
- GTM: 5 questions
- Tech: 5 questions
- Safety/privacy: 5 questions
- Team/ops: optional (up to 5 more)

---

## Files Modified/Created

### Created:
1. `prompts/investor/vc-investment-evaluation-v1.0.md` (new, ~800 lines)

### Modified:
1. `prompts/README.md` - Added investor prompt reference under "Release / Ops" section

---

## Usage Instructions

### When to Use This Prompt:

**Use Case**: Before raising Series A or B funding, when:
- You have working product (MVP or better)
- You want to assess investment readiness
- You need to identify gaps before talking to investors
- You want to practice investor questions with brutal honesty

**Prerequisites:**
- Product running at http://localhost:6173
- 10+ minutes available for hands-on exploration
- Willing to hear brutal feedback (this prompt is not for ego)

### How to Use:

1. **Read prompt completely** - Understand all 12 deliverables
2. **Open product** - http://localhost:6173
3. **Follow exploration steps** - 10-minute tour, edge cases, onboarding
4. **Document observations** - Use the 12 deliverable format strictly
5. **Answer honestly** - Don't fluff, be investor-first
6. **Review deliverables** - Ensure all 12 sections are complete
7. **Iterate based on feedback** - If investors give feedback, update your answers

### Output Artifact:

The prompt produces a **comprehensive investment memo** covering:
- Product assessment (what works, what doesn't)
- Investment thesis (why this could be big)
- Risk analysis (top 12 risks with mitigation)
- Moat evaluation (6 moats scored 0-10 each)
- Business model (3 pricing hypotheses)
- Growth strategy (practical channels)
- Retention diagnosis (missing systems)
- Competitive landscape (where to win)
- Investment readiness scorecard (8 metrics scored 0-10)
- Founder feedback (5 milestones, 5 metrics)
- Diligence questions (30 minimum with investor criteria)

---

## Key Differentiators from Generic VC Memos

### What This Prompt Does Better:

1. **Product-specific**: Tailored to MediaPipe-based, camera-driven learning apps
2. **Hands-on requirement**: Must actually USE the product, not just read about it
3. **Structured observations**: Distinguishes "Observed" vs "Inferred" vs "Assumption"
4. **Moat scoring rubric**: 6 moats, each scored 0-10 with justification
5. **Risk register format**: Top 12 risks with mitigation + evidence needed
6. **Brutal quality bar**: Explicitly states this is NOT generic, must be investor-first
7. **Edge case testing**: Requires testing 5 specific scenarios (camera, light, distance, motion, switching)
8. **Business model hypotheses**: 3 models with "must be true" + "what would break"
9. **Diligence questions**: For each, specifies what makes you lean IN vs WALK AWAY
10. **Milestone/metric focus**: 5 milestones for 8 weeks + 5 metrics to instrument NOW

### What This Prompt Does NOT Do:

- Generic "tell me about your company" questions
- Vague "what's your TAM?" without context
- Founder-flattering feedback that sugarcoats risks
- High-level strategy without product specifics
- Abstract "be more disciplined" advice

---

## Execution Notes

### Time to Complete Prompt:
- **Reading prompt**: 15-20 minutes
- **Product exploration**: 10-15 minutes (hands-on)
- **Documentation**: 60-90 minutes (12 deliverables)
- **Total estimated**: 1.5-2.5 hours

### Skill Level Required:
- **VC experience**: Understanding of term sheets, unit economics, go-to-market
- **Product intuition**: Ability to assess UX, engagement, retention from brief use
- **Technical literacy**: Understanding of MediaPipe, browser APIs, scalability

### Output Quality:
- **Investor-ready memo**: Can be shared with partners as-is
- **Brutally honest**: No sugarcoating, clear risks and gaps
- **Actionable feedback**: Specific changes to improve fundability
- **Milestone-driven**: Clear 8-week roadmap with measurable outcomes

---

## Related Prompts

For additional context, see:

- `prompts/release/demo-launch-strategy-v1.0.md` - Portfolio showcase (LinkedIn/X)
- `prompts/product/feature-prd-and-ticketing-v1.0.md` - Feature planning
- `prompts/product/next-focus-strategy-v1.0.md` - Strategic prioritization

---

**Last Updated**: 2026-01-31
**Version**: 1.0
**Author**: AI Assistant
**Status**: Complete and documented
