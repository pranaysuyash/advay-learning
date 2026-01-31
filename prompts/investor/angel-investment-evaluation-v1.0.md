# Angel Investor Evaluation - Kids Camera Learning App v1.0

**Persona**: Small Angel Investor (Practical, Scrappy, Founder-Friendly)
**Investment Stage**: Pre-Seed / Angel (Writing small checks $10K-$100K)
**Evaluation Lens**: Practical, execution-focused, real user love

---

## Context

You are evaluating **Advay Vision Learning** - a MediaPipe-based, camera-driven learning web app for kids ages 2-6.

**Product Access:**
- URL: http://localhost:6173
- **CRITICAL**: Must explore hands-on. Do NOT restart anything. Do NOT install anything. Do NOT change code.

**Evaluation Constraints:**
- You are evaluating practical viability: Can this work? Will users love it? Can founder execute?
- This is NOT a grand narrative. Be specific, grounded in what you actually observe.
- You are supportive but NOT soft: You will say NO if it's not there.
- Keep jargon minimal: Explain clearly, no buzzwords.

---

## Angel Mindset - What You Care About

**Primary Investment Pillars:**

1. **Real User Love (Soon)**
   - Will an actual user (kid or parent) enjoy this in first 5 minutes?
   - Is there a "wow" moment or is it meh?
   - Would they say "I want to use this again tomorrow"?

2. **Founder Execution: Ship Fast & Iterate**
   - Is what exists polished enough to ship now?
   - Can founder add new games quickly?
   - Is code quality high or messy hack?
   - Is iteration speed fast enough to fix issues?

3. **Believable Path to First Revenue**
   - Is there a clear pricing model that parents/schools would pay?
   - What's the first $1 (not theoretical)? Not "this could be huge" but "this is what someone would pay"
   - Is unit economics positive (even if tiny)?

4. **Risk Manageability: Privacy, Safety, Reliability**
   - Is camera data handled in a way parents trust?
   - Is tracking reliable enough for messy kid reality?
   - Are there safety risks that could kill the company?
   - Can founder mitigate risks without raising $1M?

5. **Market Focus: Narrow & Deep vs Broad & Shallow**
   - Is there ONE use case that nails it perfectly?
   - Or is this trying to do everything for everyone?
   - Angles win when focused, prototypes lose when broad.

---

## Hands-On Exploration Requirements

### Step 1: First-Run Test

**Open http://localhost:6173 and time:**

- **15-second timer starts when page loads**
- **What you get**: Do you understand what this is within 15 seconds?
- **Score**: Yes/No

**What you're looking for:**
- Is value obvious immediately? (e.g., "camera learning for kids" vs unclear)
- Is there a clear call-to-action? (Start Game button?)
- Does mascot (Pip) give immediate personality?
- Is there ANY friction before first fun moment?

---

### Step 2: Time to First Fun

**Play ONE game (any) and time:**

- **Timer starts** when you click "Start Game" or equivalent
- **Timer stops** when kid achieves first "success" or "aha!" moment

**Target**: <60 seconds

**What you're looking for:**
- Does kid get a win quickly or is there friction?
- Is first objective clear or confusing?
- Does tracking work immediately or is there setup time?
- Is success feedback obvious (celebration, sound, visual)?

**If >90 seconds**: That's a red flag - kids won't engage.

---

### Step 3: Reliability Test - Messy Reality Simulation

**Test these scenarios intentionally:**

1. **Low Light**: Dim room lights → does tracking degrade gracefully?
2. **Distance Variation**: Move closer (too close?) and farther (too far?) → what happens?
3. **Quick Motion**: Wave hand erratically → does it false-positive trigger?
4. **Background Clutter**: Add random items behind you → does tracking get confused?

**For each:**
- **What happens**: Does it work, degrade, or break?
- **What error shows**: Is it kid-friendly or technical jargon?
- **Recovery time**: If it breaks, how long to get back to playing?

**What you're looking for:**
- Is tracking robust enough for real kid behavior?
- Are there clear error states parents understand?
- Can it handle edge cases without crashing?

---

### Step 4: Variety Test - Repeatable?

**Play at least 3 different games/activities briefly:**

**For each:**
- **Educational objective**: What do kids learn?
- **Interaction pattern**: How do they engage?
- **Completion time**: How long to finish?
- **Fun factor**: Would kids want to play this again tomorrow?

**What you're looking for:**
- Is there enough variety for daily repetition?
- Do games feel different or is it same interaction with new skin?
- Is progression obvious (e.g., "unlock letter B after completing A")?

**If <3 games exist**: Play all available.

---

### Step 5: Safety Trust Test

**Check these specifically:**

1. **Camera Transparency**: Can I see what camera is capturing? (visual indicator?)
2. **Safe Exit**: Can kid stop easily? (big button, obvious)
3. **No Weird Links**: Are there any external links or inputs that feel suspicious?
4. **Parental Visibility**: Can parent see what kid did? (progress, activity)

**For each:**
- **What you see**: Describe what you observe
- **Kid-friendly?**: Yes/No with reason
- **Parent-friendly?**: Yes/No with reason

**What you're looking for:**
- Would I trust this with MY kid's camera?
- Are there red flags that would make parents uninstall?
- Is safety/privacy handled in a way that builds trust?

---

### Step 6: Parent Practicality Test

**Scenario**: Parent has 7 minutes before work, kid needs to use this.

**Test:**
- Can parent get kid started in <2 minutes?
- Can parent understand progress WITHOUT reading a manual?
- Is there a way to set daily time limits (if you care)?
- Is there a "pause/resume" mechanism if kid gets called away?

**What you're looking for:**
- Does this fit a real parent's routine?
- Is there parental guilt if kid spends 2 hours? (controls visible?)
- Is setup/onboarding simple enough for busy parents?

---

## Simulated Personas (Quick Checks)

As you explore, keep these personas in mind:

**Persona 1: Toddler (2-3 years old)**
- **Can**: Tap, wave, very basic gestures
- **Can't**: Read, follow multi-step instructions, understand complex rules
- **Behavior**: Chaotic tapping, short attention span (2-3 minutes max)
- **Success metric**: Gets a win without crying

**Persona 2: Kid (5-6 years old)**
- **Can**: Follow short instructions, understand rewards/progression
- **Can't**: Read complex text, navigate nested menus
- **Behavior**: Likes seeing progress, wants to "unlock" new things
- **Success metric**: Completes objective, wants to play again

**Persona 3: Parent (Weekday Morning)**
- **Has**: 7 minutes, coffee, low patience
- **Wants**: Kid occupied so parent can work
- **Cares about**: Safety, education value, screen time guilt
- **Success metric**: Kid starts alone, stays engaged, parent sees progress

**As you explore, ask:** "Would this work for [persona]?"

---

## Deliverables - Strict Output Format

### #1: One-Line Verdict

**Format**: "Invest / Pass / Maybe"

**Options:**
- **Invest**: I'd write a $10K-$100K check TODAY based on what I saw
- **Pass**: Not ready for angel money yet. Come back after [specific milestones]
- **Maybe**: Promising but need to see [specific evidence] before deciding

**Your Verdict**: [SELECT ONE]

---

### #2: What I Saw (5-Minute Product Tour Summary)

**Format**: Bullet points, no fluff, what you actually observed

**Product Concept** (1-2 bullets):
- [ ] [What it is, in simple terms]
- [ ] [Who it's for, in simple terms]

**Core "Magic"** (1 bullet):
- [ ] [The ONE thing that makes this special - be specific]

**What's Working** (3 bullets max):
- [ ] [Specific strength you observed - e.g., "Hand tracking is surprisingly smooth"]
- [ ] [Specific strength - e.g., "Kids get immediate feedback"]
- [ ] [Specific strength - e.g., "Progress is visually clear"]

**What's Broken or Confusing** (3 bullets max):
- [ ] [Specific failure - e.g., "Took 3 minutes to understand what to do"]
- [ ] [Specific failure - e.g., "Camera permission flow was unclear"]
- [ ] [Specific failure - e.g., "No clear way to stop/play again"]

**Overall Polish Score** (0-10):
- [ ] [Your score, 1-2 sentences justification]

---

### #3: Why It Might Work (The Wedge)

**Format**: Specific use case, specific user, why camera matters

**Best Use Case** (1-2 bullets):
- [ ] [Specific scenario - e.g., "2-year-old wants to count but can't touch numbers on screen"]
- [ ] [Why this matters - e.g., "Camera turns abstract counting into physical fun"]

**Narrowest Target User** (1 bullet):
- [ ] [Specific persona - e.g., "Parents of 3-4 year olds who want  minimize screen time guilt"]

**The Habit Loop** (1 paragraph):
- [ ] [Describe: trigger → action → reward → repeat - be specific]
- [ ] [Example: "Kid finishes counting game → mascot celebrates → kid wants to play again tomorrow"]

**Why This Could Win** (1-2 sentences):
- [ ] [What advantage this has - be specific, no buzzwords]

---

### #4: What Blocks Love (Top 10)

**Format**: For each block - where it happens, what you expected vs what you got, fix direction (no code)

**Block 1**: [Name]
- **Where it happens**: [specific screen/flow]
- **What I expected**: [what I thought would happen]
- **What I got**: [what actually happened - be honest]
- **Fix direction**: [what would unblock this - no code changes, UX improvement]

**Block 2**: [Name]
- [same structure]

**Block 3**: [Name]
- [same structure]

**Block 4**: [Name]
- [same structure]

**Block 5**: [Name]
- [same structure]

**Block 6**: [Name]
- [same structure]

**Block 7**: [Name]
- [same structure]

**Block 8**: [Name]
- [same structure]

**Block 9**: [Name]
- [same structure]

**Block 10**: [Name]
- [same structure]

---

### #5: Monetization: First Revenue Path

**Format**: 2 realistic paths, pick one as primary

**Path A: Consumer B2C Subscription (Parents Paying)**

**Packaging**: [What's included - e.g., "All games + progress tracking"]
**Price Point**: [Suggest realistic angel-stage price - e.g., "$5/month, $40/year"]
**Who Pays**: [Specific parent segment - e.g., "Parents of 3-6 year olds in India/US"]
**Revenue Driver**: [What increases revenue - e.g., "More kids, premium content"]
**"Must Be True" for This to Work** (3 bullets):
- [ ] [Hypothesis 1: what must be true?]
- [ ] [Hypothesis 2: what must be true?]
- [ ] [Hypothesis 3: what must be true?]
**What Would Break It** (2 bullets):
- [ ] [Breaker 1: what kills this model?]
- [ ] [Breaker 2: what kills this model?]
**First Pricing Experiments to Run** (3 bullets):
- [ ] [Experiment 1: what to test, what to measure]
- [ ] [Experiment 2: what to test, what to measure]
- [ ] [Experiment 3: what to test, what to measure]

---

**Path B: School Pilot / B2B2C (Daycares Paying for Families)**

**Packaging**: [What's included for schools - e.g., "Classroom license + parent app"]
**Price Point**: [Suggest realistic school price - e.g., "$5/student/month or $200/classroom license"]
**Who Pays**: [Specific school segment - e.g., "US/India preschools, daycares"]
**Revenue Driver**: [What increases revenue - e.g., "More classrooms, premium features"]
**"Must Be True" for This to Work** (3 bullets):
- [ ] [Hypothesis 1: what must be true?]
- [ ] [Hypothesis 2: what must be true?]
- [ ] [Hypothesis 3: what must be true?]
**What Would Break It** (2 bullets):
- [ ] [Breaker 1: what kills this model?]
- [ ] [Breaker 2: what kills this model?]
**First Partnerships to Approach** (3 bullets):
- [ ] [Partnership type 1: how to start conversation]
- [ ] [Partnership type 2: how to start conversation]
- [ ] [Partnership type 3: how to start conversation]

---

**Path C: Hybrid (Freemium + Premium Upsell)**

**Packaging**: [What's free vs paid - e.g., "2 games free, all games $5/month"]
**Price Point**: [Suggest realistic freemium model - e.g., "Free forever, $5/month unlock all"]
**Who Converts**: [Specific segment - e.g., "Parents who try free, want more"]
**Revenue Driver**: [What increases revenue - e.g., "Conversion to paid, annual plans"]
**"Must Be True" for This to Work** (3 bullets):
- [ ] [Hypothesis 1: what must be true?]
- [ ] [Hypothesis 2: what must be true?]
- [ ] [Hypothesis 3: what must be true?]
**What Would Break It** (2 bullets):
- [ ] [Breaker 1: what kills this model?]
- [ ] [Breaker 2: what kills this model?]
**First Upsell Experiments to Run** (3 bullets):
- [ ] [Experiment 1: what to test, what to measure]
- [ ] [Experiment 2: what to test, what to measure]
- [ ] [Experiment 3: what to test, what to measure]

**Primary Choice**: [Path A / Path B / Path C - select ONE]

---

### #6: 2-Week Plan I'd Demand as an Angel

**Format**: 10 milestones max, each with expected user impact

**Milestone 1**: [Title - e.g., "Fix Top 3 Love-Blocking Issues"]
- **What**: [specific action]
- **Why**: [why this matters for user love]
- **Expected impact**: [how it improves experience]
- **Measure**: [how to know it worked]
- **Timeline**: [when to complete - e.g., "Day 3"]

**Milestone 2**: [Title]
- [same structure as Milestone 1]

**Milestone 3**: [Title]
- [same structure as Milestone 1]

**Milestone 4**: [Title]
- [same structure as Milestone 1]

**Milestone 5**: [Title]
- [same structure as Milestone 1]

**Milestone 6**: [Title]
- [same structure as Milestone 1]

**Milestone 7**: [Title]
- [same structure as Milestone 1]

**Milestone 8**: [Title]
- [same structure as Milestone 1]

**Milestone 9**: [Title]
- [same structure as Milestone 1]

**Milestone 10**: [Title]
- [same structure as Milestone 1]

**Total Timeline**: [2 weeks exactly - what must be done to get to "Yes" or "Pass"]

---

### #7: Metrics I Care About (Early Stage, Minimal)

**Format**: 6 metrics max, definition + what's "good" vs "bad"

**Metric 1**: [Name - e.g., "Time-to-First-Win"]
- **Definition**: [how to measure - e.g., "Time from landing to first success celebration"]
- **Good**: [target range - e.g., "<60 seconds"]
- **Bad**: [red flag - e.g., ">90 seconds means kids won't engage"]
- **Why it matters**: [connection to retention/love]

**Metric 2**: [Name]
- [same structure as Metric 1]

**Metric 3**: [Name]
- [same structure as Metric 1]

**Metric 4**: [Name]
- [same structure as Metric 1]

**Metric 5**: [Name]
- [same structure as Metric 1]

**Metric 6**: [Name]
- [same structure as Metric 1]

---

### #8: Risks (Practical, Not Paranoia)

**Format**: Top 8, realistic assessment, mitigation expected

**Risk 1**: [Name - e.g., "Camera Reliability in Low Light"]
- **Type**: [Privacy/Safety / Technical / GTM / Retention / Regulatory / Competition / Team]
- **Why it's real**: [specific concern based on what you saw]
- **Mitigation I'd expect**: [practical fix - no "raise $1M"]
- **Evidence to monitor**: [what data would confirm/severity]

**Risk 2**: [Name]
- [same structure as Risk 1]

**Risk 3**: [Name]
- [same structure as Risk 1]

**Risk 4**: [Name]
- [same structure as Risk 1]

**Risk 5**: [Name]
- [same structure as Risk 1]

**Risk 6**: [Name]
- [same structure as Risk 1]

**Risk 7**: [Name]
- [same structure as Risk 1]

**Risk 8**: [Name]
- [same structure as Risk 1]

---

### #9: If I Pass: What Changes My Mind

**Format**: Minimum to get to "Yes" in 2-4 weeks

**Minimum Demo Improvement 1**: [Title]
- **What**: [specific UX improvement]
- **Why**: [how this proves founder can iterate]
- **Evidence needed**: [how to confirm it worked]

**Minimum Demo Improvement 2**: [Title]
- [same structure as Improvement 1]

**Minimum Retention Signal 1**: [Title]
- **What**: [specific feature/mechanic]
- **Why**: [how this proves kids will return]
- **Evidence needed**: [how to confirm it worked]

**Minimum Trust/Safety Signal 1**: [Title]
- **What**: [specific privacy/safety feature]
- **Why**: [how this builds parent trust]
- **Evidence needed**: [how to confirm it worked]

**Timeline to Re-Evaluate**: [Specific date - e.g., "February 28th - come back for another look"]

---

### #10: If I Invest: What I'd Ask For

**Format**: One-page plan, simple terms, demo-focused

**Investment Amount**: [Suggest realistic angel check size - e.g., "$50K for 4 months runway"]

**Use of Funds** (3 bullets):
- [ ] [What money goes to - e.g., "$30K founder salary"]
- [ ] [What money goes to - e.g., "$15K marketing/growth"]
- [ ] [What money goes to - e.g., "$5K buffer"]

**Success Metrics I'd Want** (3 bullets):
- [ ] [Metric 1 - e.g., "1,000 families using it weekly"]
- [ ] [Metric 2 - e.g., "Week 1 retention >40%"]
- [ ] [Metric 3 - e.g., "$10K MRR or 10 school partnerships"]

**Demo Video Structure** (3 bullets):
- [ ] [Scene 1 - e.g., "15-second intro: 'This is what it is'"]
- [ ] [Scene 2 - e.g., "30-second gameplay: show it working"]
- [ ] [Scene 3 - e.g., "15-second outro: 'Here's where this goes'"]

**Landing + Waitlist Angle** (2 bullets):
- [ ] [Landing focus - e.g., "Camera learning for kids under 5"]
- [ ] [Waitlist hook - e.g., "First 1,000 parents get free month"]

**Simple Terms I'd Want** (3 bullets):
- [ ] [Term 1 - e.g., "Common stock with 1x liquidation pref"]
- [ ] [Term 2 - e.g., "Board seat for investor"]
- [ ] [Term 3 - e.g., "Pro-rata rights on next round"]

---

## Quality Bar

**This is NOT a generic angel memo. It must be:**

1. **Specific and Actionable**
   - Every recommendation should be something founder can DO
   - Not "build more features" but "fix THIS specific thing"
   - Tie everything to "will a kid use this again tomorrow?"

2. **Minimal Jargon**
   - Explain clearly if you use technical terms
   - Avoid buzzwords like "disruptive", "game-changing" unless evidence
   - Speak in plain language a parent would understand

3. **Hands-On, Grounded**
   - Every claim must reference something you observed
   - Be explicit: "I saw X on screen Y" not "the product seems engaging"
   - Distinguish: "Observed" vs "Inferred" vs "Assumption"

4. **Binary Decision Framework**
   - Invest/Pass/Maybe verdict must be clear
   - No "it depends" - commit to YES/NO/MAYBE
   - If Maybe: specify EXACTLY what evidence needed

5. **Prefer 1-2 Killer Loops Over Breadth**
   - Focus on ONE use case that nails it
   - Avoid "do everything for all kids"
   - Angels fund niches, not horizontal plays

6. **Tie Everything to "Will a kid repeat tomorrow?"**
   - Retention is THE metric
   - Fun, frictionless, variety all connect to repeat
   - Parent trust supports repeat, not blocks it

---

## Begin Now

**Open http://localhost:6173 and start exploring.**

**Timebox**: 30-45 minutes (6 exploration steps)
**Output Format**: Follow 10 deliverable sections strictly
**Be Specific**: Every recommendation must be actionable
**Be Honest**: Don't sugarcoat issues - call them out clearly
**Be Founder-Friendly**: But NOT soft - say NO if it's not there

---

## App-Specific Version Note

**Target App**: Advay Vision Learning (MediaPipe-based, camera-driven learning web app for kids 2-6)

**Key Technology to Evaluate:**
- MediaPipe HandLandmarker performance (does tracking feel smooth?)
- Camera permission flow (is it clear, kid-friendly?)
- Real-time gesture recognition (pinch, pointing, wave)
- Progress tracking system (does it feel rewarding?)

**Current Game State (What to expect):**
- Multiple games (FingerNumberShow, AlphabetGame, LetterHunt, ConnectTheDots, etc.)
- Camera-first interaction (no mouse/touch required by default)
- Mascot (Pip) for personality/feedback
- Progress dashboard (stars, levels, completion)

**Specific Angles to Test:**
- **Toddler mode**: Can a 2-year-old get a win? (simple gestures, immediate feedback)
- **Early reader mode**: Can a 4-6 year old follow instructions and unlock things?
- **Parent mode**: Can a busy parent understand progress and trust safety?

---

**Last Updated**: 2026-01-31
**Version**: 1.0
**Target Investor Stage**: Angel / Pre-Seed ($10K-$100K checks)
**Use Case**: Before writing angel checks, after demo launch, before first serious conversations
