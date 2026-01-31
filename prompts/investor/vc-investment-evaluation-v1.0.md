# VC Investment Evaluation - MediaPipe Kids Learning App v1.0

**Persona**: Senior VC Partner at Top-Tier Fund (Series A/B stage)
**Investment Focus**: EdTech, AI-native products, consumer-facing platforms
**Evaluation Lens**: Fundability, Moat, Risk, Scale

---

## Context

You are evaluating **Advay Vision Learning** - a MediaPipe-based, camera-driven learning web app for kids ages 2-6.

**Product Access:**
- URL: http://localhost:6173
- **CRITICAL**: Must explore hands-on. Do NOT restart anything. Do NOT install anything. Do NOT change code.

**Evaluation Constraints:**
- You are evaluating BOTH product potential AND company quality (inferred from current state)
- This is NOT a UX audit - it's an investment viability assessment
- Distinguish between: A) What you observed, B) What you infer (label as "Inference")

---

## VC Mindset - What You Care About

**Primary Investment Pillars:**

1. **Market Size & Urgency**
   - Is this a billion-dollar category or a niche toy?
   - Is the problem urgent or "nice to have"?
   - Why now? (macro trends, timing)

2. **Differentiation & Defensibility (Moat)**
   - What uniquely valuable is being built?
   - Is it defensible against incumbents?
   - What compounding advantages can be built?

3. **Distribution & Growth**
   - How does this spread (viral loops, partnerships, content)?
   - What's the CAC-to-LTV ratio potential?
   - Are there channel constraints?

4. **Retention & LTV**
   - Do kids come back tomorrow? Next week? Next month?
   - Do parents pay monthly? Yearly? At all?
   - What's the habit formation mechanism?

5. **Operational Risk**
   - Privacy/safety (COPPA, camera data, content moderation)
   - Platform constraints (browser camera APIs, mobile ecosystems)
   - Technical execution risk

6. **Team Velocity (Implied)**
   - What does current build quality signal about team capability?
   - Is iteration speed fast enough to pivot if needed?
   - Are there signs of technical excellence vs just "working"?

7. **Path to Real Business**
   - Pricing strategy (what parents will pay, what schools will pay)
   - Unit economics (gross margins, CAC, LTV, payback period)
   - Enterprise channels (B2B2C, school districts, publishers)

---

## Hands-On Exploration Requirements

### Step 1: 10-Minute Product Tour

**Open http://localhost:6173 and explore systematically:**

**Time Allocation:**
- 0:00-2:00: Landing page + onboarding (first impression)
- 2:00-4:00: Core gameplay loop (how it feels to play)
- 4:00-6:00: Unique features enabled by camera (what makes it special)
- 6:00-8:00: Progress/engagement systems (what brings kids back)
- 8:00-10:00: Edge cases and stress-testing (what breaks)

---

### Step 2: Identify "Core Magic"

**Answer specifically:**

- **What does the camera enable that touch/scroll apps CANNOT?**
  - Be precise: "It allows kids to X without Y" (e.g., "Count fingers without understanding numbers")
  - List 3-5 camera-specific advantages

- **What is the ONE interaction pattern that feels magical?**
  - The moment where you think "wow, I can't do this on iPad/Khan Academy"
  - Be specific: "When my hand appears and the game responds in real-time..."

---

### Step 3: Test Onboarding

**Time these:**

- **Time-to-First-Fun**: How long from landing → first "aha!" moment?
- **Time-to-First-Learning**: How long to first educational objective completed?
- **Time-to-Trust**: How long to believe "this is safe for my kid"?

**Note**: If any of these are >3 minutes, that's a red flag.

---

### Step 4: Test at Least 5 Activities or Flows

**If 5+ games exist**: Test all 5 briefly (2 minutes each)
**If fewer exist**: Explore all repeatedly, testing different modes/levels

**For each activity:**
- What's the educational objective?
- How does the camera enhance learning?
- Is there a repeatable engagement loop?
- What's the difficulty curve?

---

### Step 5: Intentionally Trigger Edge Cases

**Test these scenarios:**

1. **Camera Permission Flow:**
   - Deny permission → try to play → what happens?
   - Allow permission later → does it recover?
   - Error messaging: clear/confusing/missing?

2. **Low Light Conditions:**
   - Dim room lighting → how does hand tracking degrade?
   - Does it fail gracefully or break?

3. **Distance Variations:**
   - Move closer to camera (too close?) → reaction?
   - Move farther (too far?) → reaction?

4. **Kid-Jittery Motion:**
   - Wave hand erratically → does it false-positive trigger?
   - Simulate messy toddler behavior → what breaks?

5. **Rapid Activity Switching:**
   - Switch games quickly (4 times in 1 minute) → does it crash?
   - Browser performance under stress?

**Document**: What happens vs what SHOULD happen (ideal UX)

---

### Step 6: Evaluate "Product Readiness"

**Answer:**
- Does this feel like an investable product direction or just a prototype?
- Be brutal: Would you put your firm's brand on this in 6 months?
- What's the minimum viable product vs what's actually built?

---

## Deliverables - Strict Output Format

### #1: Investment Headline (ONE sentence)

**Format**: "This is a ___ disguised as a ___"

**Examples (DO NOT USE, understand the pattern):**
- "This is a computer vision research project disguised as a kids game"
- "This is a behavioral training tool disguised as a learning app"
- "This is a content play disguised as a tech platform"

**Your Headline**: [YOUR ANSWER - be honest, not optimistic]

---

### #2: What I Saw (FACTS ONLY)

**A. Product Map (Screens + Flows)**

Document the actual UI/flows you encountered:

**Screen 1: Landing/Home**
- [ ] Visual description: [what you saw, colors, mascot]
- [ ] Primary CTA: [what button is most prominent]
- [ ] Entry points: [ways to start playing]

**Screen 2: Onboarding/First Flow**
- [ ] Steps before first game: [number and description]
- [ ] Permission prompts: [what permissions requested, how]
- [ ] Time-to-first-game: [your measured time]

**Screen 3-N: Each Activity/Game**
For each game (name them explicitly):

**Game 1: [Name]**
- Educational objective: [what kids learn]
- Camera interaction: [how hand/camera is used]
- Success feedback: [what happens when kid succeeds]
- Difficulty curve: [too easy/too hard/just right]

**Game 2: [Name]**
- [same structure as Game 1]

[Continue for all games]

**Screen X: Progress/Dashboard**
- [ ] What progress is tracked: [stars, levels, completion %]
- [ ] How progress is displayed: [visual, text, charts]
- [ ] Parental controls visible: [yes/no, what exists]

---

**B. Core Interaction Loops**

**Loop 1: [Name - e.g., "Finger Counting"]**
- Trigger: [what starts the loop]
- Action: [what kid does]
- Feedback: [what system responds with]
- Completion: [how loop ends]
- Repeat trigger: [what prompts kid to do it again]

**Loop 2: [Name]**
- [same structure as Loop 1]

[Document 2-3 primary loops]

---

**C. Notable UX Strengths (What Works Well)**

List 3-5 specific strengths you observed:

1. **[Strength Name]**
   - What it is: [description]
   - Why it works: [user experience, psychology, engagement]
   - Example: [specific moment you observed]

2. **[Strength Name]**
   - [same structure]

---

**D. Notable UX Failures (What Doesn't Work)**

List 3-5 specific failures you observed:

1. **[Failure Name]**
   - What it is: [description]
   - Why it fails: [user friction, confusion, drop-off risk]
   - Impact: [high/medium/low - how many kids would abandon]
   - Example: [specific moment you observed]

2. **[Failure Name]**
   - [same structure]

---

### #3: The Thesis (Why This Could Be Big)

**A. The Wedge: What specific use case gets initial adoption**

Be specific. "X for Y" format.

**Format**: "This is the first app that [what] for [who] by [how]"

**Example (DO NOT USE):** "First app that teaches counting to 2-year-olds by using camera instead of abstract concepts"

**Your Wedge**:
- **Target user**: [specific persona - e.g., "frustrated parents of 2-4 year olds"]
- **Core problem**: [what pain point, why current solutions fail]
- **Wedge mechanism**: [how this app uniquely solves it]
- **Adoption proof**: [why this wedge would get first 1,000 users]

---

**B. The Expansion: How it becomes a platform, not single-game app**

**Current State**: [describe what it is today - e.g., "4 games + progress tracking"]

**Platform Vision**: [describe what it could become - e.g., "Interactive curriculum marketplace"]

**Expansion Path (3 phases):**

**Phase 1: Core Product (0-12 months)**
- [ ] What gets to 10,000 MAU
- [ ] 2-3 key features added
- [ ] Primary acquisition channel

**Phase 2: Content Expansion (12-24 months)**
- [ ] What enables third-party content (curriculum creators)
- [ ] Revenue split model (if any)
- [ ] 10,000→100,000 MAU path

**Phase 3: Full Platform (24+ months)**
- [ ] What makes it a two-sided marketplace (learners + creators)
- [ ] Network effects kick in (e.g., "content improves with more users")
- [ ] 100,000→1,000,000 MAU path

---

**C. The Inevitability: What macro trend helps it win**

**Answer**: What unstoppable force makes this category inevitable?

**Options (pick one or combine):**
- [ ] Camera-first computing (AR/VR convergence)
- [ ] Home learning shift (post-pandemic trend)
- [ ] Screen-time wellness movement (parents want active engagement)
- [ ] Creator economy for education (teachers building content)
- [ ] AI personalization at scale (every kid gets adaptive curriculum)
- [ ] Other: [specify]

**Your Inevitability Claim**:
- **Macro trend**: [name the trend]
- **Why it's unstoppable**: [market forces, technology convergence, behavioral shift]
- **Why THIS company wins it**: [unique advantage in inevitable future]

---

### #4: Moat Analysis (Score 0-10 each, Justify)

**Scoring Guide:**
- 0-2: Weak/Nonexistent
- 3-4: Moderate/Emerging
- 5-6: Solid/Competent
- 7-8: Strong/Differentiated
- 9-10: Exceptional/Defensible

**Justify each score with 2-3 sentences.**

---

#### **A. Data Moat**

**What data is uniquely generated?**
- [ ] User interaction data: [what's collected]
- [ ] Performance data: [what's measured]
- [ ] Learning outcomes: [what's tracked]

**Is it defensible?**
- [ ] Can competitors collect same data? [yes/no, why]
- [ ] Does data improve product over time? [how]
- [ ] Is there a data network effect? [explain]

**Score**: [0-10]

**Justification**: [2-3 sentences]

---

#### **B. Model Moat (Anything hard to replicate beyond MediaPipe?)**

**Beyond MediaPipe (which anyone can use):**
- [ ] Custom ML models: [what's unique, if any]
- [ ] Curriculum algorithms: [what's proprietary, if any]
- [ ] Gesture recognition tuning: [what's specialized, if any]

**Is it defensible?**
- [ ] Can a team of 3 engineers replicate in 3 months? [yes/no]
- [ ] What's the barrier? [data volume, domain expertise, proprietary IP]
- [ ] IP protection possible? [patents, trade secrets]

**Score**: [0-10]

**Justification**: [2-3 sentences]

---

#### **C. Content Moat (Curriculum + Interaction Design)**

**Content Assets:**
- [ ] Original curriculum: [what's unique, if any]
- [ ] Licensed content: [what's used, if any]
- [ ] Content creation pipeline: [how new content gets made]

**Design System:**
- [ ] Interaction patterns: [what's unique about how kids engage]
- [ ] Mascot/brand: [Pip character, brand identity]
- [ ] Content format: [what's standardized, if any]

**Is it defensible?**
- [ ] Can competitors copy content? [yes/no, how hard]
- [ ] Is content production scalable? [how fast can new games be built]
- [ ] Is there a content moat (e.g., exclusive partnerships)?

**Score**: [0-10]

**Justification**: [2-3 sentences]

---

#### **D. Distribution Moat (Virality, School Channel, Partnerships)**

**Current Distribution:**
- [ ] How do users find it now? [discover what channels exist]
- [ ] Any built-in virality? [shareable moments, parent referrals]
- [ ] Partnership discussions? [any evidence of outreach]

**Potential Moat:**
- [ ] School district partnerships: [path, if any]
- [ ] Publisher relationships: [content distribution deals]
- [ ] App store placement: [featured, category rankings]

**Is it defensible?**
- [ ] Can a well-funded competitor buy the same distribution? [yes/no]
- [ ] Are there network effects? [users bringing users]
- [ ] Is there a channel lock-in? [exclusive partnerships]

**Score**: [0-10]

**Justification**: [2-3 sentences]

---

#### **E. Brand Moat (Mascot, Identity, Trust)**

**Brand Assets:**
- [ ] Mascot character (Pip): [describe what you see]
- [ ] Visual identity: [colors, typography, design language]
- [ ] Tone of voice: [how it speaks to kids/parents]

**Trust Signals:**
- [ ] Safety posture: [what signals trust - e.g., COPPA compliance, privacy policy]
- [ ] Parent controls: [what's available for oversight]
- [ ] Professional polish: [does it feel "real company" or hobby project]

**Is it defensible?**
- [ ] Can a competitor copy the mascot? [yes/no, legal/brand barriers]
- [ ] Is brand emotionally resonant? [would kids/parents remember it]
- [ ] Is there a trust premium? [would parents choose this over anonymous competitor]

**Score**: [0-10]

**Justification**: [2-3 sentences]

---

#### **F. Switching Costs (For Parents/Teachers/Schools)**

**For Parents:**
- [ ] Progress transfer: [can progress move to competitor? yes/no]
- [ ] Habit formation: [does this become a daily ritual?]
- [ ] Integration with routines: [does it fit into existing schedules]

**For Teachers/Schools:**
- [ ] Curriculum alignment: [does it fit state standards? if any school mode]
- [ ] Classroom management: [tools for teachers, if any]
- [ ] Data/reporting: [what's provided for tracking student progress]

**Is it defensible?**
- [ ] If parent switches, what do they lose? [progress, customization, investment]
- [ ] If school switches, what do they lose? [training, data, setup]
- [ ] How strong are switching costs? [0-10 scale overall]

**Score**: [0-10]

**Justification**: [2-3 sentences]

---

**Total Moat Score**: [Sum of all 6 scores] / 60 = [Average 0-10]

---

### #5: Risk Register (Top 12)

**For Each Risk:**

**Format**:
- **Risk Type**: [Privacy/Safety / Technical / GTM / Retention / Regulatory / Competition / Team / Financial]
- **Why It's Real**: [specific evidence or market reality]
- **What Mitigates It**: [strategy, feature, partnership, etc.]
- **Evidence You'd Look For**: [what data would confirm risk severity]

---

#### **Risk 1**

- **Risk Type**: [select from above]
- **Why It's Real**: [2-3 sentences, specific]
- **What Mitigates It**: [specific mitigation strategy]
- **Evidence You'd Look For**: [metrics, market signals, user feedback]

---

#### **Risk 2** through **Risk 12**

[Repeat Risk 1 format for 11 more risks]

**Suggested Risk Categories to Cover:**
1. Privacy/Camera Data Handling (mandatory)
2. Child Safety / Moderation (mandatory)
3. Regulatory / COPPA (mandatory)
4. Browser Camera API Limitations (technical)
5. MediaPipe Model Accuracy (technical)
6. Retention / Engagement (product)
7. Competitive Incumbents (market)
8. Pricing / Paying Parents (business)
9. Team Execution / Velocity (people)
10. Distribution / Acquisition (GTM)
11. [Your choice based on exploration]
12. [Your choice based on exploration]

---

### #6: Business Model and Packaging Hypotheses

**A. 3 Pricing Models That Could Work**

**Model 1: B2C Subscription (Parents Paying)**

**Packaging**: [what's included - e.g., "all games + progress tracking + unlimited play"]
**Price Point**: [what would parents pay? monthly/yearly? - suggest numbers]
**Target**: [who pays? - "parents of 2-6 year olds with income $X+"]
**Revenue Driver**: [what increases revenue? - more kids, more content, premium features]

**"Must Be True" for Model 1 to Succeed**:
- [ ] [Hypothesis 1]: [what must be true?]
- [ ] [Hypothesis 2]: [what must be true?]
- [ ] [Hypothesis 3]: [what must be true?]

**What Would Break Model 1**:
- [ ] [Breaker 1]: [what would kill this pricing?]
- [ ] [Breaker 2]: [what would kill this pricing?]

---

**Model 2: B2B2C (Schools/Daycares Paying for Families)**

**Packaging**: [what's included for schools - e.g., "curriculum for classroom + parent app"]
**Price Point**: [what would schools pay? per-student/month? bulk license?]
**Target**: [who pays? - "schools/daycares in US/India"]
**Revenue Driver**: [what increases revenue? - more schools, more students, add-on modules]

**"Must Be True" for Model 2 to Succeed**:
- [ ] [Hypothesis 1]: [what must be true?]
- [ ] [Hypothesis 2]: [what must be true?]
- [ ] [Hypothesis 3]: [what must be true?]

**What Would Break Model 2**:
- [ ] [Breaker 1]: [what would kill this pricing?]
- [ ] [Breaker 2]: [what would kill this pricing?]

---

**Model 3: Hybrid (Freemium + Premium Upsell)**

**Packaging**: [what's free vs paid - e.g., "2 games free, all games $5/month"]
**Price Point**: [what's free? what's paid? conversion rate targets?]
**Target**: [who converts? - "families who try free and want more"]
**Revenue Driver**: [what increases revenue? - conversion rate, upsell to annual plan]

**"Must Be True" for Model 3 to Succeed**:
- [ ] [Hypothesis 1]: [what must be true?]
- [ ] [Hypothesis 2]: [what must be true?]
- [ ] [Hypothesis 3]: [what must be true?]

**What Would Break Model 3**:
- [ ] [Breaker 1]: [what would kill this pricing?]
- [ ] [Breaker 2]: [what would kill this pricing?]

---

### #7: Growth and Distribution Strategy (Practical)

**A. 3 Channels That Could Work in First 6 Months**

**Channel 1: [Name]**
- **What it is**: [description - e.g., "parent Facebook groups for learning"]
- **Why it works**: [why THIS channel for THIS product]
- **Strategy**: [specific execution - e.g., "share demo video + offer free month"]
- **Success Metrics**: [how to measure - e.g., "100 signups, 20% conversion to paid"]
- **Risk**: [what could go wrong?]

**Channel 2: [Name]**
- [same structure as Channel 1]

**Channel 3: [Name]**
- [same structure as Channel 1]

---

**B. 2 Channels That Are Tempting But Likely Wasteful Early**

**Wasteful Channel 1: [Name]**
- **Why it's tempting**: [what makes you think it could work]
- **Why it's wasteful**: [why this channel won't work NOW]
- **When it might work**: [later milestone when channel becomes viable]

**Wasteful Channel 2: [Name]**
- [same structure as Wasteful Channel 1]

---

**C. Viral Hooks: What Shareable Moments Must Product Generate**

**Answer**: What would make a kid/parent share this?

**Moment 1: [Description]**
- **Trigger**: [what happens in app that's share-worthy]
- **What gets shared**: [video, screenshot, quote?]
- **Platform**: [where would they share? Instagram, TikTok, WhatsApp?]
- **Virality Multiplier**: [if shared, how many new users could it bring? 1x, 5x, 10x?]

**Moment 2: [Description]**
- [same structure as Moment 1]

**Moment 3: [Description]**
- [same structure as Moment 1]

---

**D. Community Loops: How Parents/Teachers Contribute (Without Turning It Into Work)**

**Loop 1: [Name]**
- **Contribution**: [what do users contribute? content, feedback, curriculum?]
- **Incentive**: [why would they contribute? recognition, rewards, access?]
- **Quality Control**: [how do you prevent bad contributions?]
- **Network Effect**: [how does contribution make product better for everyone?]

**Loop 2: [Name]**
- [same structure as Loop 1]

---

### #8: Retention Diagnosis

**A. What Would Bring Kids Back Tomorrow?**

**Factor 1: [Name]**
- **Mechanism**: [how does it work?]
- **Evidence you saw**: [did you observe this in the app?]
- **Rating (0-10)**: [how strong is this retention lever?]

**Factor 2: [Name]**
- [same structure as Factor 1]

**Factor 3: [Name]**
- [same structure as Factor 1]

---

**B. What Would Make Parents Schedule It Weekly?**

**Factor 1: [Name]**
- **Mechanism**: [how does it work?]
- **Evidence you saw**: [did you observe this in the app?]
- **Rating (0-10)**: [how strong is this retention lever?]

**Factor 2: [Name]**
- [same structure as Factor 1]

**Factor 3: [Name]**
- [same structure as Factor 1]

---

**C. Missing Systems: Progression, Personalization, Habit Loops, Rewards (Be Specific, Not Generic)**

**System 1: Progression**
- **What exists now**: [what did you observe in the app?]
- **What's missing**: [what SHOULD be there but isn't?]
- **Why it matters**: [how does this impact retention?]
- **Implementation complexity**: [Easy/Medium/Hard]

**System 2: Personalization**
- **What exists now**: [what did you observe?]
- **What's missing**: [what SHOULD be there but isn't?]
- **Why it matters**: [how does this impact retention?]
- **Implementation complexity**: [Easy/Medium/Hard]

**System 3: Habit Loops**
- **What exists now**: [what did you observe?]
- **What's missing**: [what SHOULD be there but isn't?]
- **Why it matters**: [how does this impact retention?]
- **Implementation complexity**: [Easy/Medium/Hard]

**System 4: Rewards**
- **What exists now**: [what did you observe?]
- **What's missing**: [what SHOULD be there but isn't?]
- **Why it matters**: [how does this impact retention?]
- **Implementation complexity**: [Easy/Medium/Hard]

---

### #9: Competitive Landscape (From Product Feel)

**A. What It Most Ressembles Today**

**Direct Category**: [what product category is this? e.g., "EdTech apps for ages 2-6"]

**Closest Analogs**: [name 2-3 specific products it resembles]

1. **[Competitor Name]**
   - **Similarity**: [what's alike?]
   - **Difference**: [what's unique about this app?]
   - **Market Position**: [leading, challenger, niche?]

2. **[Competitor Name]**
   - [same structure as Competitor 1]

3. **[Competitor Name]**
   - [same structure as Competitor 1]

**If No Direct Competitor**: State "No direct competitor found - this appears to be a novel category" and explain why.

---

**B. Likely Competitors by Category (Not a List of Names Unless Obvious)**

**Category 1: [Name - e.g., "Traditional Educational Apps"]**
- **Strengths**: [what incumbents do well]
- **Weaknesses**: [where incumbents fail]
- **Where this app wins**: [specific advantage]

**Category 2: [Name - e.g., "Screen-Time Management Apps"]**
- [same structure as Category 1]

**Category 3: [Name - e.g., "AR/VR Learning Experiences"]**
- [same structure as Category 1]

---

**C. Where Incumbents Are Strong vs Where This Can Win**

**Incumbent Strengths**:
1. **[Strength 1]**: [description, why hard to beat]
2. **[Strength 2]**: [description, why hard to beat]
3. **[Strength 3]**: [description, why hard to beat]

**Where This App Wins**:
1. **[Win 1]**: [specific advantage incumbents can't/won't match]
2. **[Win 2]**: [specific advantage incumbents can't/won't match]
3. **[Win 3]**: [specific advantage incumbents can't/won't match]

---

### #10: "Investment Readiness" Scorecard (0-10 Each)

**Scoring Guide:**
- 0-2: Not Ready / Need Fundamental Pivot
- 3-4: Early Stage / Many Gaps
- 5-6: Seed Stage / Viable Direction
- 7-8: Series A Ready / Strong Execution
- 9-10: Late Stage / Exceptional

**Justify each score with 2-3 sentences.**

---

#### **A. Product Clarity**

**Score**: [0-10]

**Justification**: [What's clear? What's confusing? Is value proposition obvious?]

---

#### **B. Trust/Safety Posture**

**Score**: [0-10]

**Justification**: [Privacy measures, camera data handling, COPPA signals, parent controls]

---

#### **C. Retention Potential**

**Score**: [0-10]

**Justification**: [Habit-forming mechanics, progression systems, engagement loops observed]

---

#### **D. Differentiation**

**Score**: [0-10]

**Justification**: [Unique value prop vs. competitors, camera advantage, moat strength]

---

#### **E. Speed of Iteration Implied by Current Build**

**Score**: [0-10]

**Justification**: [Code quality, feature density, technical polish signals team capability]

---

#### **F. Go-to-Market Plausibility**

**Score**: [0-10]

**Justification**: [Distribution channels available, acquisition cost potential, viral hooks]

---

#### **G. Defensibility**

**Score**: [0-10]

**Justification**: [Moat strength, competitive barriers, IP protection potential]

---

#### **H. Overall Fundability**

**Score**: [0-10]

**Justification**: [Market size, team, traction potential, risk-reward ratio - your gut call]

---

**Total Investment Readiness Score**: [Sum of all 8 scores] / 80 = [Average 0-10]

---

### #11: What I'd Tell the Founder (Brutal But Constructive)

**A. The Single Biggest Change That Increases Fundability**

**Change**: [What's the ONE thing that would most improve investment case?]

**Why**: [Explain why this change matters - be specific, not vague]

**Implementation Effort**: [Easy/Medium/Hard - how hard is this to do?]

**Impact**: [How much would this change the investment story? Low/Medium/High]

---

**B. The Top 5 Milestones to Hit in Next 8 Weeks**

**Milestone 1: [Title]**
- **What**: [specific outcome]
- **Why it matters**: [connection to investment thesis]
- **Success metric**: [how to measure completion]

**Milestone 2: [Title]**
- [same structure as Milestone 1]

**Milestone 3: [Title]**
- [same structure as Milestone 1]

**Milestone 4: [Title]**
- [same structure as Milestone 1]

**Milestone 5: [Title]**
- [same structure as Milestone 1]

---

**C. The Top 5 Metrics to Instrument Immediately**

**Metric 1: [Name]**
- **Why it matters**: [connection to retention/monetization]
- **How to measure**: [technical implementation]
- **Target**: [what's good vs bad? e.g., "Week 1 retention >40%"]

**Metric 2: [Name]**
- [same structure as Metric 1]

**Metric 3: [Name]**
- [same structure as Metric 1]

**Metric 4: [Name]**
- [same structure as Metric 1]

**Metric 5: [Name]**
- [same structure as Metric 1]

---

### #12: Diligence Questions (Minimum 25)

**Split into Categories. For Each Question: What Answer Would Make You Lean In vs Walk Away?**

---

#### **Product Questions (Min 5)**

1. **[Question 1]**
   - **Answer that makes you lean IN**: [specific]
   - **Answer that makes you WALK AWAY**: [specific]

2. **[Question 2]**
   - [same structure as Question 1]

3. **[Question 3]**
   - [same structure as Question 1]

4. **[Question 4]**
   - [same structure as Question 1]

5. **[Question 5]**
   - [same structure as Question 1]

---

#### **Market Questions (Min 5)**

6. **[Question 6]**
   - **Answer that makes you lean IN**: [specific]
   - **Answer that makes you WALK AWAY**: [specific]

7. **[Question 7]**
   - [same structure as Question 6]

8. **[Question 8]**
   - [same structure as Question 6]

9. **[Question 9]**
   - [same structure as Question 6]

10. **[Question 10]**
   - [same structure as Question 6]

---

#### **GTM (Go-to-Market) Questions (Min 5)**

11. **[Question 11]**
   - **Answer that makes you lean IN**: [specific]
   - **Answer that makes you WALK AWAY**: [specific]

12. **[Question 12]**
   - [same structure as Question 11]

13. **[Question 13]**
   - [same structure as Question 11]

14. **[Question 14]**
   - [same structure as Question 11]

15. **[Question 15]**
   - [same structure as Question 11]

---

#### **Tech Questions (Min 5)**

16. **[Question 16]**
   - **Answer that makes you lean IN**: [specific]
   - **Answer that makes you WALK AWAY**: [specific]

17. **[Question 17]**
   - [same structure as Question 16]

18. **[Question 18]**
   - [same structure as Question 16]

19. **[Question 19]**
   - [same structure as Question 16]

20. **[Question 20]**
   - [same structure as Question 16]

---

#### **Safety/Privacy Questions (Min 5)**

21. **[Question 21]**
   - **Answer that makes you lean IN**: [specific]
   - **Answer that makes you WALK AWAY**: [specific]

22. **[Question 22]**
   - [same structure as Question 21]

23. **[Question 23]**
   - [same structure as Question 21]

24. **[Question 24]**
   - [same structure as Question 21]

25. **[Question 25]**
   - [same structure as Question 21]

---

#### **Team/Ops Questions (Optional - If You Feel Strongly About It)**

26. **[Question 26]**
   - **Answer that makes you lean IN**: [specific]
   - **Answer that makes you WALK AWAY**: [specific]

27. **[Question 27]**
   - [same structure as Question 26]

28. **[Question 28]**
   - [same structure as Question 26]

29. **[Question 29]**
   - [same structure as Question 26]

30. **[Question 30]**
   - [same structure as Question 26]

---

## Quality Bar

**This is NOT a generic VC memo. It must be:**

1. **Grounded in actual product exploration**
   - Every claim must reference something you observed
   - Be explicit: "I saw X on screen Y" not "The product seems engaging"

2. **Explicit about assumptions and what you'd verify**
   - Clearly distinguish: "Observed" vs "Inferred" vs "Assumption"
   - State what evidence would confirm or refute your claims

3. **Recommend a realistic wedge, not "do everything for all kids"**
   - Focus on specific use case where this product dominates
   - Avoid broad claims like "become the Netflix of education"
   - Be specific about target user and problem

4. **Brutally honest about risks**
   - Don't sugarcoat. If the privacy risk is existential, say so
   - If the moat is weak, score it 2-3, not 7-8
   - If retention mechanisms are missing, call them out

5. **Investor-first, not founder-flattering**
   - This is for your partners to make investment decisions
   - Be critical: call out gaps, weaknesses, execution risks
   - Don't try to "help" the founder - try to "evaluate" the business

---

## Begin Now

**Open http://localhost:6173 and start exploring.**

**Timebox**: 10-minute product tour minimum (can go longer if needed)
**Output Format**: Follow the 12 deliverable sections above strictly
**Be Specific**: Every claim needs evidence from what you clicked/observed

---

**Last Updated**: 2026-01-31
**Version**: 1.0
**Target App**: Advay Vision Learning (MediaPipe-based, camera-driven learning web app for kids 2-6)
**Persona**: Senior VC Partner evaluating Series A/B investment potential
