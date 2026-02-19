# Prompt Creation Summary - Angel Investor Evaluation

**Date**: 2026-01-31
**Author**: AI Assistant (executing user request)
**User Request**: "also add this new prompt:PROMPT: 'Small Angel Investor Evaluating a Kids Camera-Based Learning App'"

---

## What Was Created

### 1. New Prompt File

**File**: `prompts/investor/angel-investment-evaluation-v1.0.md`

**Persona**: Small Angel Investor (Practical, Scrappy, Founder-Friendly)
**Investment Stage**: Pre-Seed / Angel (Writing small checks $10K-$100K)
**Target App**: Advay Vision Learning (MediaPipe-based, camera-driven learning web app for kids 2-6)

**Prompt Sections (10 Deliverables):**

1. **One-Line Verdict** - "Invest / Pass / Maybe"
   - Binary decision on writing angel check now
   - If No: specify minimum needed in 2-4 weeks
   - If Yes: what to push founder to do immediately

2. **What I Saw (5-Minute Product Tour Summary)**
   - Product concept (1-2 bullets, simple terms)
   - Core "magic" (1 bullet - what camera enables)
   - What's working (3 bullets max - specific strengths)
   - What's broken/confusing (3 bullets max - specific failures)
   - Overall polish score (0-10 with justification)

3. **Why It Might Work (The Wedge)**
   - Best use case (1-2 bullets - specific scenario, why camera matters)
   - Narrowest target user (1 bullet - specific persona)
   - Habit loop (1 paragraph - trigger → action → reward → repeat)
   - Why this could win (1-2 sentences - specific advantage, no buzzwords)

4. **What Blocks Love (Top 10)**
   - For each block (max 10):
     - Where it happens (screen/activity)
     - What you expected vs what you got
     - Why it matters for kids/parents
     - Fix direction (no code changes, UX improvement)

5. **Monetization: First Revenue Path**
   - 2 realistic paths (consumer B2C, school B2B2C, hybrid)
   - Pick one as primary
   - For each path:
     - What's included
     - Price point (realistic angel-stage pricing)
     - Who pays
     - Revenue driver
     - 3 "must be true" hypotheses
     - 2 "what would break it" hypotheses
     - First 3 pricing experiments to run
   - All grounded in "first $1" not theoretical TAM

6. **2-Week Plan I'd Demand as an Angel**
   - 10 milestones max
   - Each with: what, why it matters, expected impact, how to measure
   - Timeline: 2 weeks exactly
   - Actionable immediately

7. **Metrics I Care About (Early Stage, Minimal)**
   - 6 metrics max
   - Each with: definition, what's good, what's bad
   - Example metrics:
     - Time-to-first-win (<60 seconds)
     - Session length
     - Day-1 and Day-7 return rate (if measurable)
     - Activity completion rate
     - "Parent intervention count" per session
     - Tracking failure rate

8. **Risks (Practical, Not Paranoia)**
   - Top 8 risks
   - Each with: type, why it's real, mitigation I'd expect, evidence to monitor
   - Risk types: privacy/safety, camera reliability, overstimulation/frustration, thin content, distribution, regulatory, competitive, team execution
   - Grounded in what angel investors actually worry about (not existential threats)

9. **If I Pass: What Changes My Mind**
   - Minimum to get to "Yes" in 2-4 weeks
   - 3 categories: demo improvements, retention signals, trust/safety cues
   - Each with: what, why it proves founder can iterate, evidence needed
   - Timeline to re-evaluate: specific date
   - No "come back with more features" - specific, measurable improvements

10. **If I Invest: What I'd Ask For**

- Investment amount ($10K-$100K realistic for angel check)
- Use of funds (3 bullets: founder salary, marketing/growth, buffer)
- Success metrics I'd want (3 bullets: 1K families, 40% retention, etc.)
- Demo video structure (3 scenes: intro, gameplay, outro)
- Landing + waitlist angle (2 bullets)
- Simple terms I'd want (3 bullets: common stock, board seat, pro-rata)
- All grounded in "would a kid use this tomorrow?"

---

## Hands-On Exploration Requirements

### 6-Step Product Exploration (30-45 minutes total)

**Step 1: First-Run Test (15 seconds)**

- Timer starts when page loads
- Do I understand what this is within 15 seconds?
- Is value obvious?
- Is there clear call-to-action?
- Does mascot give immediate personality?
- Score: Yes/No

**Step 2: Time to First Fun**

- Play ONE game and time to first success
- Target: <60 seconds
- Red flag if >90 seconds
- Check: clear objective, immediate tracking, obvious success feedback

**Step 3: Reliability Test - Messy Reality**

- Test 4 scenarios intentionally:
  1. Low light: does tracking degrade gracefully?
  2. Distance: too close/too far?
  3. Quick motion: false-positive triggers?
  4. Background clutter: tracking confusion?
- For each: what happens, error message (kid-friendly?), recovery time
- What you're looking for: robust enough for real kid behavior?

**Step 4: Variety Test - Repeatable?**

- Play at least 3 different games/activities
- For each: educational objective, interaction pattern, completion time, fun factor
- What you're looking for: enough variety for daily repetition?

**Step 5: Safety Trust Test**

- Check 4 things:
  1. Camera transparency (can I see what's capturing?)
  2. Safe exit (big button, obvious)
  3. No weird links/inputs
  4. Parental visibility (can parent see progress?)
- For each: what you see, kid-friendly?, parent-friendly?
- What you're looking for: trust, no red flags for parents

**Step 6: Parent Practicality Test**

- Scenario: parent has 7 minutes, kid needs to use this
- Test: <2 minutes to start, parent understands progress without manual, daily time limits visible, pause/resume
- What you're looking for: fits real parent's routine?

---

## Simulated Personas (Quick Checks)

As you explore, keep these personas in mind:

**Persona 1: Toddler (2-3 years old)**

- Can: Tap, wave, very basic gestures
- Can't: Read, follow multi-step instructions, understand complex rules
- Behavior: Chaotic tapping, short attention span (2-3 minutes max)
- Success metric: Gets a win without crying
- Ask: "Would this work for [toddler]?"

**Persona 2: Kid (5-6 years old)**

- Can: Follow short instructions, understand rewards/progression
- Can't: Read complex text, navigate nested menus
- Behavior: Likes seeing progress, wants to "unlock" new things
- Success metric: Completes objective, wants to play again
- Ask: "Would this work for [kid]?"

**Persona 3: Parent (Weekday Morning)**

- Has: 7 minutes, coffee, low patience
- Wants: Kid occupied so parent can work
- Cares about: Safety, education value, screen time guilt
- Success metric: Kid starts alone, stays engaged, parent sees progress
- Ask: "Would this work for [parent]?"

---

## Key Differentiators from VC Prompt

### What This Prompt Does Better (Angel vs VC)

**1. Binary Decision Framework**

- VC: Grand thesis, long-term vision
- Angel: Invest/Pass/Maybe NOW - specific 2-4 week path to "Yes"
- Focus: Practical, immediate, actionable

**2. "First $1" vs "Unicorn Vision"**

- VC: TAM, expansion, platform, inevitability
- Angel: Will a parent pay $5/month? Can you get 1 school?
- Grounded in early-stage revenue reality

**3. Founder Execution Focus**

- VC: Team velocity, scalability, go-to-market strategy
- Angel: Can founder ship fast? Can they iterate? Is code quality high?
- Focus on: Scrappy execution, rapid feedback loop

**4. Retention as THE Metric**

- VC: Long-term LTV, CAC, churn
- Angel: Will a kid use this again tomorrow? Is there a habit loop?
- Tie everything to "will kid repeat this tomorrow?"

**5. Practical Risk Assessment**

- VC: Existential risks (COPPA, incumbents, market shifts)
- Angel: Manageable risks (camera reliability in low light, thin content, frustration)
- Focus on: What can we fix in 2 weeks?

**6. Simulated Personas**

- VC: Abstract user segments, market research
- Angel: Specific personas (toddler, kid, parent) - test against these
- Hands-on: "Would this work for [persona]?"

**7. Specific Blocker Identification**

- VC: Strategic blockers (distribution, partnerships)
- Angel: UX blockers (took 3 minutes to understand, confusing onboarding)
- Top 10 blockers: where they happen, what you expected, fix direction

**8. 2-Week Action Plan**

- VC: 8-week milestones, long-term vision
- Angel: 10 milestones in 2 weeks, immediate actions
- Each milestone: what, why it matters, expected impact, how to measure

**9. Early-Stage Metrics (6 max)**

- VC: Scale metrics (1M users, $1M MRR)
- Angel: Engagement metrics (time-to-first-win, session length, return rate)
- Definitions included: what's good vs bad

**10. Demo Video Structure**

- VC: Brand narrative, emotional story
- Angel: 3 scenes (intro, gameplay, outro), simple terms
- Landing + waitlist angle: "Camera learning for kids under 5"

---

## Quality Bar

### This is NOT a Generic Angel Memo. It Must Be

1. **Specific and Actionable**
   - Every recommendation is something founder can DO
   - Not "build more features" but "fix THIS specific thing"
   - Tie everything to retention

2. **Minimal Jargon**
   - Avoid buzzwords like "disruptive", "transformative"
   - Speak plainly like you're talking to a parent
   - Explain if you use technical terms

3. **Hands-On, Grounded**
   - Every claim references something you observed
   - Be explicit: "I saw X on screen Y" not "seems engaging"
   - Distinguish: "Observed" vs "Inferred" vs "Assumption"

4. **Binary Decision Framework**
   - Invest/Pass/Maybe verdict must be clear
   - No "it depends" - commit to YES/NO/MAYBE
   - If Maybe: SPECIFIC evidence needed to move to Yes

5. **Prefer 1-2 Killer Loops Over Breadth**
   - Angels fund niches, not horizontal plays
   - Focus on ONE use case that nails it
   - Avoid "do everything for all kids"

6. **Tie Everything to "Will Kid Repeat Tomorrow?"**
   - Retention is THE metric
   - Fun, frictionless, variety all connect to repeat
   - Parent trust supports repeat, doesn't block it

7. **Supportive But NOT Soft**
   - Be honest about issues
   - Don't sugarcoat: "Needs polish" not "Looks promising"
   - Say NO if it's not there - saves founder time

---

## When to Use This Prompt

**Use Case**: Before writing angel checks or having serious angel conversations

**Prerequisites:**

- Product running at <http://localhost:6173>
- 30-45 minutes available for hands-on exploration
- Willing to hear brutal feedback (this prompt is not for ego)

**Execution Flow:**

1. **Read prompt completely** - Understand all 10 deliverables and exploration steps
2. **Open product** - <http://localhost:6173>
3. **Follow 6-step exploration** - 30-45 minutes hands-on
4. **Document observations** - Use 10 deliverable format strictly
5. **Answer honestly** - Be investor-first, not founder-flattering
6. **Review deliverables** - Ensure all 10 sections are complete
7. **Provide verdict** - Invest/Pass/Maybe with clear reasoning

---

## Output Artifact

**The prompt produces a comprehensive angel investor memo covering:**

**Decision Framework:**

- One-line verdict (Invest/Pass/Maybe)
- If No: Minimum to get to Yes in 2-4 weeks
- If Yes: What to push founder to do immediately

**Product Assessment:**

- 5-minute product tour summary
- Core "magic" identification
- What's working (3 strengths)
- What's broken (3 blockers)
- Overall polish score (0-10)

**Investment Logic:**

- Best use case (specific scenario, why camera matters)
- Narrowest target user (specific persona)
- Habit loop (trigger → action → reward → repeat)
- Why this could win (specific advantage)

**Love Blockers:**

- Top 10 things preventing user love
- For each: where, what expected vs got, why it matters, fix direction

**Monetization:**

- 2 realistic revenue paths (B2C subscription, school B2B2C, hybrid)
- Primary path selection
- For each: pricing, who pays, "must be true" hypotheses, breakers, first 3 experiments

**Execution Plan:**

- 10 milestones in 2 weeks
- Each with: what, why, impact, measurement

**Metrics:**

- 6 early-stage metrics with definitions
- Examples: time-to-first-win, session length, return rate, activity completion

**Risks:**

- Top 8 practical risks with mitigation
- Types: privacy/safety, camera reliability, overstimulation, thin content, distribution, regulatory, competitive, team execution

**If I Pass:**

- Minimum to get to "Yes" (demo, retention, trust/safety)
- 9 improvements with evidence needed
- Timeline to re-evaluate

**If I Invest:**

- Investment amount ($10K-$100K)
- Use of funds (founder salary, marketing, buffer)
- Success metrics (3 bullets)
- Demo video structure
- Landing + waitlist angle
- Simple terms (common stock, board seat, pro-rata)

---

## App-Specific Version Note

**Target App**: Advay Vision Learning (MediaPipe-based, camera-driven learning web app for kids 2-6)

**Key Technology to Evaluate:**

- MediaPipe HandLandmarker performance (does tracking feel smooth?)
- Camera permission flow (is it clear, kid-friendly?)
- Real-time gesture recognition (pinch, pointing, waving)
- Progress tracking system (does it feel rewarding?)

**Current Game State (What to Expect):**

- Multiple games (FingerNumberShow, AlphabetGame, LetterHunt, ConnectTheDots)
- Camera-first interaction (no mouse/touch required by default)
- Mascot (Pip) for personality/feedback
- Progress dashboard (stars, levels, completion)

**Specific Angles to Test:**

- **Toddler mode**: Can a 2-3 year-old get a win? (simple gestures, immediate feedback)
- **Early reader mode**: Can a 4-6 year-old follow instructions and unlock things? (progression, rewards)
- **Parent mode**: Can a busy parent understand progress and trust safety? (clear visibility, no red flags)

---

## Execution Notes

### Time to Complete Prompt

- **Reading prompt**: 15-20 minutes
- **Product exploration**: 30-45 minutes (hands-on)
- **Documentation**: 60-90 minutes (10 deliverables)
- **Total estimated**: 2-3 hours

### Skill Level Required

- **Angel investment experience**: Understanding of pre-seed/angel rounds
- **Product intuition**: Ability to assess UX/retention from brief use
- **Technical literacy**: Understanding of MediaPipe, browser APIs, scalability basics
- **Parent psychology**: What makes parents trust apps for kids

### Output Quality

- **Angel-ready memo**: Can be shared with angels as-is
- **Brutally honest**: No sugarcoating, clear risks and gaps
- **Actionable feedback**: Specific changes to improve investability
- **Binary decision**: Clear Invest/Pass/Maybe with specific path forward
- **Milestone-driven**: 2-week plan with measurable outcomes

---

## Related Prompts

For additional context, see:

- `prompts/investor/vc-investment-evaluation-v1.0.md` - VC evaluation (grand narrative, long-term)
- `prompts/release/demo-launch-strategy-v1.0.md` - Portfolio showcase (LinkedIn/X)
- `prompts/product/feature-prd-and-ticketing-v1.0.md` - Feature planning
- `prompts/product/next-focus-strategy-v1.0.md` - Strategic prioritization

---

**Last Updated**: 2026-01-31
**Version**: 1.0
**Author**: AI Assistant
**Status**: Complete and documented
