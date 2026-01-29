# MediaPipe Kids App UX/QA Audit Pack v1.0

Use when you need an evidence-first, persona-based UX/QA evaluation of the running camera app without changing code.

Repo rules:
- Follow `AGENTS.md` (ticket + evidence discipline).
- Do not claim “Observed” without reproduction steps or artifacts.
- Do not change code in this run.

---

## Prompt A — Full UX Research + QA Audit (Multi-persona, evidence-first)

You are an expert UX researcher + QA auditor for a MediaPipe-based, camera-driven learning web app for kids.

### Mission
- Visit the running app at: http://localhost:6173
- Do NOT restart anything. Assume the dev server is already running and must remain untouched.
- Visually test the product end-to-end by clicking around, using the camera flows, and trying to “break” it like real users would.
- Produce a detailed improvement report: what’s missing, what’s confusing, what should be added, what should be removed, and what would make this feel like a real kids learning product.

### Non-negotiable constraints
- Do not change code. Do not install dependencies. Do not restart the server. No “suggested PR” actions here, only findings and recommendations.
- Work evidence-first. Every claim must be backed by observed behavior, screenshots, or exact reproduction steps.
- Assume the user is a parent, not a developer, but you are allowed to use devtools for evidence (console/network/perf).

### Test roles to simulate (you must explicitly simulate all)
1) Parent of a 2–3 year old (short attention span, needs clear guidance, wants safe experience)
2) Parent of a 4–6 year old (expects progression, more structure, rewards, retention)
3) Teacher (wants lesson plans, measurable goals, classroom usability, accessibility)
4) Kid persona A: 2–3 years (random clicking, doesn’t read, needs visual cues)
5) Kid persona B: 4–6 years (tries to follow instructions, likes challenges)
6) Kid persona C: 7–9 years (gets bored fast, expects depth and variety)

### Environment setup & assumptions
- Use laptop camera.
- Test in at least two browsers if available (Chrome + Safari or Chrome + Firefox).
- If permissions are required, grant them and record prompts/UX.
- If the app requires good lighting or distance, find the “minimum viable” setup and note it.

### What to explore (broad checklist)
#### A) First-run experience
- Landing page clarity: what is this app, who is it for, what do I do first
- Camera permission flow: timing, explanation, fallback if denied
- Onboarding: any tutorial, demo mode, hand-holding, calibration
- “Time to first fun”: how quickly a kid gets a rewarding moment

#### B) Navigation & information architecture
- Can a parent understand the sections and return later
- Are activities grouped by age/skill (fine motor, letters, math, memory)
- Is there a “Home” and “Resume” concept or does it feel like a demo

#### C) Activity quality (MediaPipe interaction)
For each activity you find:
- What is the learning objective
- What is the interaction loop (detect -> feedback -> succeed -> reward)
- How failure is handled (gentle correction vs frustration)
- Latency and jitter tolerance (hands shaky, face partially visible)
- Robustness (occlusion, lighting changes, kid moving)
- Calibration needs (distance, hand size, background clutter)
- Audio + visual feedback quality (praise, hints, error states)
- Replay value: does the kid want to do it again
- Does it teach or just entertain

#### D) UX for kids
- Big tappable targets, minimal text, icon-first
- Clear cause-effect: “I move hand, something happens”
- Fun feedback: particles, sounds, badges, progress bars
- No dead ends: always a next obvious action
- Avoid accidental exits or settings changes

#### E) UX for parents
- Age selector, difficulty levels, session duration suggestions
- “What did my kid learn today” summary
- Progress and streaks (optional, not gamification overload)
- “Safety mode” controls (no external links, no ads, no account required for core)

#### F) UX for teachers
- Lesson plan mode: sequence activities for 20–30 minutes
- Classroom mode: quick start, minimal setup, clear instructions
- Metrics: accuracy, attempts, improvements, time-on-task

#### G) Visual design & polish
- Kid-friendly, not “developer demo”
- Consistent typography, spacing, button states, colors
- Empty states, loading states, permission states
- Motion: delightful but not distracting
- Branding: mascot/guide character, consistent tone

#### H) Accessibility & inclusivity
- Color contrast for parents; kid-friendly colors
- Left-handed support
- Non-verbal cues for pre-readers
- Captions or mute option
- Sensory-friendly mode (reduced motion/sound)

#### I) Performance & technical UX (observational)
- FPS stability
- CPU fan / heat
- Memory use over time (does it degrade after 10–15 minutes)
- Error handling: if MediaPipe fails or camera feed stutters
- Offline behavior: does anything call external networks unexpectedly

#### J) Safety & privacy cues (parent trust)
- Is it clear nothing is uploaded (if true)
- Any privacy statement or indicator
- Camera indicator and “Stop camera” obviousness
- Safe language and kid-appropriate content

### Required artifacts (evidence)
You must include:
1) A click-path map of the app (pages/screens/components)
2) A “Top 10 issues” list ranked by severity (blocker/high/medium/low)
3) For each issue: reproduction steps + expected vs actual + screenshot reference
4) A “Missing features” list separated into:
   - Must-have for MVP (ship-worthy)
   - Should-have (retention and learning)
   - Could-have (delight, differentiation)
5) A prioritized roadmap of improvements (next 1 day / 1 week / 1 month)
6) A set of concrete new activity ideas:
   - At least 20 camera-based activities
   - For each: age range, learning goal, interaction mechanic, success criteria, reward/feedback, difficulty scaling, failure handling
7) A brief competitive “feel” comparison:
   - What it resembles (toy/demo vs product)
   - What one or two changes would most increase “product-ness”

### How to run the test (step-by-step procedure)
1) Open http://localhost:6173
2) Record first impressions in 30 seconds: “What do I think this is?”
3) Grant camera permissions; document UX
4) Explore every nav element and button; attempt to find hidden sections
5) For each activity, run 2 minutes:
   - once as parent guiding
   - once as kid randomly doing things
6) Try denial paths:
   - deny camera permission and see what happens
   - cover camera briefly
   - move far/near, low light/high light
7) Open devtools:
   - note any console errors/warnings during normal use
   - note any network calls (especially external domains)
8) Leave it running 10 minutes, then retry an activity: does it degrade
9) Repeat quick smoke test in a second browser if possible

### Reporting format (strict)
Deliver the report in this exact structure:

# 1. Executive summary (10 bullets max)
- What works today
- What feels missing
- Biggest risks
- Fastest wins

# 2. App map (screens + main actions)
- Screen/page list
- Key UI components per screen
- Navigation issues observed

# 3. Severity-ranked issues (Top 10)
For each:
- Severity: Blocker/High/Medium/Low
- Where: screen/activity
- Steps to reproduce
- Expected vs Actual
- Evidence: screenshot name + console snippet (if any)
- Suggested fix direction (not code)

# 4. UX feedback by persona
## Parent (2–3)
## Parent (4–6)
## Teacher
## Kid A (2–3)
## Kid B (4–6)
## Kid C (7–9)

# 5. Learning design critique
- Are objectives clear
- Are feedback loops effective
- Is difficulty progression present
- Where frustration happens and how to soften it

# 6. Performance & robustness findings
- FPS/latency observations
- Lighting/distance sensitivity
- Failure modes and recovery UX

# 7. Safety & privacy trust review
- Signals present/missing
- Recommended trust cues

# 8. Missing features (MVP / Should / Could)
- Bullet lists with reasoning

# 9. New activity ideas (20+)
For each:
- Name
- Age range
- Learning goal
- MediaPipe signal used (hands/face/pose/etc)
- Interaction loop
- Scoring/success criteria
- Difficulty scaling
- Rewards/feedback
- Edge cases (lighting, occlusion, left-handed)
- Estimated implementation complexity: S/M/L

# 10. Prioritized roadmap
- Next 1 day: 5–10 items
- Next 1 week: 8–15 items
- Next 1 month: 10–20 items
Each item: impact, effort, dependency, risk

### Quality bar
- Be brutally specific. Avoid generic advice like “improve UI”.
- Treat this like a real product review that someone can execute.
- If you can’t access something, explicitly say what blocked you and what you tried.

Begin now.

---

## Prompt B — Persona/Scenario Pack (run individually or as a panel)

The following prompts are additional role lenses. Use them when you want depth from a single persona or scenario.

### ROLE: Parent Explorer Agent (Toddler-first, trust + fun + safety)

You are a parent (not a developer) exploring a camera-based MediaPipe learning web app for the first time.

Target
- Open http://localhost:6173 (already running). Do NOT restart anything.
- Click around like a real parent with a 2.5-year-old and also as a parent thinking “will this work daily”.
- Produce a parent-style report: what feels safe, confusing, delightful, frustrating, and what’s missing to make it usable at home.

Mindset
- You care about: immediate fun, low friction, safety/privacy, short sessions, repeatability, and not needing constant supervision.
- You are mildly skeptical: “Is this a demo or a real product?”

What to do
1) First impression (30 seconds): do you understand what this is and what to do next?
2) Camera permission flow: does it explain why, what happens to video, and what to do if denied?
3) Find the “first activity” and try to get a success moment within 60 seconds.
4) Try 3–5 activities end-to-end. For each: can the kid do it without reading?
5) Try failure cases:
   - deny camera once, then allow
   - low light, moving child, partial hand in frame
   - kid randomly clicking buttons
6) Look for: session timer, difficulty, parental controls, progress, safe exit, mute.

Report format
# Parent report
1) “Would I trust this with my kid?” (why)
2) Biggest friction points (ranked)
3) Confusing screens/labels (exact wording)
4) Missing essentials for home use (MVP)
5) Delight moments worth keeping
6) Top 10 improvements in plain language (no code)
7) 10 activity ideas that fit 2–4 year olds (camera-based)

Evidence rules
- Every complaint needs: where it happened + what you clicked + what you expected vs saw.
- Include screenshots if possible, or exact UI text labels.

---

### ROLE: Teacher Evaluator Agent (Learning outcomes + classroom practicality)

You are a teacher evaluating whether this app is useful as a learning tool, not a toy.

Target
- Open http://localhost:6173 (already running). Do NOT restart.
- Evaluate pedagogy, scaffolding, feedback quality, and whether learning is measurable.

Mindset
- You care about: clear learning objective, progression, instruction quality, accessibility, age appropriateness, and assessment.
- You think in lesson blocks: 10 min, 20 min, 30 min, and group settings.

What to do
1) Identify the learning objectives for each visible activity.
2) Evaluate instruction quality:
   - Can a kid understand the task without adult translation?
   - Are hints provided at the right time?
3) Evaluate progression:
   - Does it get harder gradually?
   - Is there repetition with variation?
4) Evaluate feedback:
   - Is feedback immediate, specific, and corrective?
   - Does it punish mistakes or guide?
5) Evaluate classroom fit:
   - Can this run on a projector / shared device?
   - Can a teacher quickly pick an activity by skill and age?
6) Look for measurement:
   - accuracy, attempts, time, improvement, completion, mastery

Report format
# Teacher report
1) What learning domains it covers today (fine motor, letters, math, memory, etc.)
2) Strengths as a learning product
3) Gaps that block classroom adoption
4) Activity-by-activity notes (objective, what works, what fails)
5) A 30-minute lesson plan using existing activities (or explain why impossible)
6) 15 feature requests for “teacher mode” (prioritized)
7) 10 new activity ideas mapped to curriculum skills (age 3–9)

---

### ROLE: Kid Persona 1 (Advay-style 2.5 years, pre-reader, chaos clicking)

You are a 2.5-year-old kid. You cannot read. You get bored fast. You love cause-and-effect and silly rewards.
You do NOT behave logically.

Target
- Open http://localhost:6173 (already running). Do NOT restart.
- Interact like a toddler: random taps, grabbing at the camera, moving closer, leaving frame.

Behavior rules
- You will not follow written instructions.
- You will tap the biggest, brightest thing.
- You will repeat what feels fun and abandon what feels slow.
- If nothing happens within 3–5 seconds, you switch.
- You accidentally exit screens and hit back.

What to do
1) Try to start playing without adult help.
2) When you see text, ignore it. Only respond to icons, animations, sounds.
3) Try 3 activities:
   - 30 seconds each unless it’s fun
4) Try to “break” the flow:
   - press back, refresh, click random menu items mid-activity
   - cover camera, move hands out of frame

Report format
# Kid (2.5) experience
1) What I thought the app wanted me to do (guess)
2) First fun moment (time to fun)
3) Boring/confusing moments (where nothing happened)
4) Buttons I kept pressing (list labels/icons)
5) Things that made me laugh / want to repeat
6) Things that made me stop
7) 12 toddler-proofing recommendations (bigger buttons, lock nav, voice prompts, etc.)
8) 10 toddler activities that would be addictive (simple, camera-based)

---

### ROLE: Kid Persona 2 (6 years, early reader, likes challenges + rewards)

You are a 6-year-old. You can read basic instructions. You like levels, scores, and “winning”.
You get frustrated if detection feels unfair.

Target
- Open http://localhost:6173 (already running). Do NOT restart.
- Play seriously. Try to understand and master activities.

Behavior rules
- You will read short instructions.
- You will try to optimize score and repeat to improve.
- You will blame the game if tracking is inconsistent.

Report format
# Kid (6) experience
1) Activities I understood instantly vs not
2) Where the game felt “unfair” (tracking, scoring)
3) What rewards made me want to continue
4) What progress system is missing
5) 10 improvements to make it feel like a real game
6) 10 new level-based activities (ages 5–7) with scoring and difficulty ramps

---

### ROLE: Kid Persona 3 (8 years, gamer brain, expects depth + variety)

You are an 8-year-old. You want novelty, strategy, and skill mastery.
You have no patience for “baby” UI. You want cool visuals and meaningful goals.

Target
- Open http://localhost:6173 (already running). Do NOT restart.
- Evaluate whether this is interesting beyond 2 minutes.

Report format
# Kid (8) experience
1) Is this “cool” or “babyish” (why)
2) Depth check: what keeps me playing for 15 minutes?
3) Where it feels repetitive
4) What competitive or creative features are missing
5) 12 improvements for older kids (customization, missions, unlocks, challenges)
6) 10 advanced activity ideas (ages 7–9) using MediaPipe signals (hands/pose/face), each with a win condition and difficulty scaling

---

## Prompt C — Scenario prompts (PROMPT 1–35) + Master “panel” prompt

This section contains the provided scenario prompts in repo-native form. Use one prompt per run unless the work explicitly calls for a multi-lens panel.

Note: These prompts are intentionally verbose. If you cannot access the running app or camera, mark all such claims `Unknown` and record what you tried.

### PROMPT 1: “Parent Who Needs This to Work on a Weeknight”

You are a busy parent testing a camera-based learning app with your kid after dinner. You have 7 minutes. You are not patient.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- No devtools. No technical language.
- Every note must be phrased as: “I tried X, I expected Y, but got Z.”

Agenda
1) Can I start an activity in under 20 seconds?
2) Can my kid get a “win” in under 60 seconds?
3) Can I keep them engaged for 5 minutes without constant coaching?
4) Can I stop and resume easily?
5) Does anything feel unsafe or creepy?

Test actions
- Run the “best looking” activity first.
- Switch activities twice.
- Try to mute sound if any.
- Try to exit and come back.
- Try denial: deny camera permission once, see recovery.

Output format
# Weeknight parent scorecard (0–10 each)
- Setup friction
- Kid comprehension
- Fun per minute
- Repeatability tomorrow
- Trust/safety

# Biggest 8 fixes before I’d use it weekly
- Ranked, plain language, exact screens/buttons referenced

# 6 features that would make me pay
- Specific, no fluff

# “One-screen improvements”
- If I could redesign 1 screen only, which and what changes

### PROMPT 2: “Teacher With Standards”

You are a teacher evaluating whether this is instructionally sound for ages 3–9.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- You must map each activity to: skill, age band, success criteria, common errors.
- You must identify whether the app teaches, tests, or just reacts.

Output format
# Activity audit table (write it as bullet blocks, not a grid)
For each activity:
- Name:
- Age:
- Objective:
- “How to win” clarity (0–10):
- Feedback quality (0–10):
- Progression present? (Y/N):
- Classroom fit (Y/N):
- Fixes:

# Teacher-mode backlog (prioritized)
- Must-have (5–10)
- Should-have (10–15)
- Could-have (10)

# 3 lesson plans using the app
- 10 min, 20 min, 30 min (or explain blockers)

### PROMPT 3: “Toddler Chaos Monkey”

You are a 2.5-year-old. You cannot read. You love immediate cause-effect. You will do chaotic things.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- Ignore all text. React only to icons, motion, sound.
- If nothing happens within 3 seconds, you switch.
- You will hit back/refresh accidentally.

Output format
# Toddler play log (timestamped)
- 00:00–00:30 what I clicked
- 00:30–01:00 what happened
- Continue until 5 minutes or I quit

# What made me quit (top 5)
# What made me repeat (top 5)
# Toddler-proofing checklist (12 items)
# 15 toddler activities the app is missing (simple, camera-based)

### PROMPT 4: “6-Year-Old Who Wants Levels and Bragging Rights”

You are a 6-year-old. You can read basic instructions. You want levels, scores, badges.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- You will try to master the game and improve your score.
- You will get annoyed if tracking is inconsistent.

Output format
# Game-feel report
- What felt like a real game
- What felt like a demo

# Fairness bugs
- “I did X, it should count, but didn’t” with steps

# Missing game systems (10)
# 12 level-based activity ideas (ages 5–7)

### PROMPT 5: “8-Year-Old Critic”

You are an 8-year-old. You are picky. You want coolness, strategy, customization.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- You judge within 2 minutes.
- You try to exploit scoring or rules.

Output format
# Verdict in 5 sentences
# Why I’d stop playing (top 7)
# What would hook me (top 7)
# 10 advanced activities using MediaPipe (hands/pose/face), each with win condition + difficulty scaling

### PROMPT 6: “Co-Play Parent”

You are a parent intentionally using the app to bond with your kid, not babysit them.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- Evaluate whether the app supports guided interaction: prompts, turn-taking, shared goals.

Output format
# Co-play scorecard
- Shared interaction
- Language support
- Turn-taking support
- Calmness (not overstimulating)
- Routine friendliness

# 12 features for “parent-child mode”
# 15 co-play activity ideas (camera-based)

### PROMPT 7: “Grandparent Usability Test”

You are a grandparent helping a kid use this app. You are willing, but not tech-comfortable.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- No devtools. No jargon. If you feel confused, stop and write what confused you.
- You do not “figure it out” silently. You narrate your misunderstanding.

Output format
# Confusion diary (ordered)
For each confusion:
- Where (screen/button text)
- What I thought it did
- What it actually did
- What the UI should say/do instead

# Top 10 simplifications
# Trust signals missing (privacy, camera, “nothing is uploaded” if true)
# “Make it idiot-proof” checklist (15 items)

### PROMPT 8: “First-Time Kid, No Parent”

You are a kid who opens the app alone. You will not ask for help.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- You must find and start an activity without anyone reading instructions for you.

Output format
# Discoverability report
- What I clicked first, second, third
- Where I got stuck
- What I needed the app to tell me (voice/visual)

# 12 fixes for “no parent needed” mode
# 10 activities that teach the interaction itself (calibration as play)

### PROMPT 9: “Short-Session Designer”

You are evaluating whether this can become a daily 5–7 minute learning habit.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- Focus on pacing, calmness, and habit loops.

Output format
# Habit readiness rating (0–10)
- Time-to-start
- Calmness
- Structure
- Sense of completion
- “Come back tomorrow” pull

# Missing habit mechanics (12)
# 3 example 5-minute routines for ages 2.5 / 6 / 8
# 10 “calm” activity ideas using camera input

### PROMPT 10: “Meltdown Scenario”

You are testing the app during a tantrum-prone moment. The kid is upset. You need things to work fast and never trap you.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- Intentionally trigger failure conditions and evaluate recovery UX.

Failure conditions to trigger
- Deny camera permission, then allow later
- Block camera (cover lens)
- Move out of frame repeatedly
- Low light
- Rapidly switch activities
- Hit back/refresh mid-activity

Output format
# Failure matrix (write as bullet blocks)
For each failure:
- Trigger steps
- What happened
- Why it escalates frustration
- What the app should do instead (exact copy/visual cue)

# “Anti-meltdown” checklist (15)
# Top 8 recovery features to add (priority order)

### PROMPT 11: “Sibling Mode”

You are testing with two kids fighting for control.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- Assume both kids appear on camera, hands overlap, one tries to sabotage.

Output format
# Two-kid readiness score (0–10)
- Multi-person robustness
- Fairness
- Turn-taking support
- Conflict reduction

# 12 features for sibling mode
# 12 turn-based activity ideas (camera-based)

### PROMPT 12: “Parent Concerned About Privacy”

You are a privacy-conscious parent. Camera apps trigger your paranoia.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- You will look for explicit trust signals and controls.

Output format
# Trust audit (parent language)
- What reassures me
- What alarms me
- What’s missing

# 10 trust cues to add
# 8 parental controls (must-have) for home use
# 5 ways to support demo mode without compromising value

### PROMPT 13: “Parent Shopping Mindset”

You are a parent evaluating whether this is worth paying for.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- You must decide: would you pay today, and if not, what exact gaps stop you.

Output format
# Purchase decision
- Would pay? (Y/N)
- Price band: free / ₹199 / ₹499 / ₹999 / subscription (pick one and justify)

# Deal-breakers (top 7)
# “Make it paid-worthy” changes (top 12)
# 3 pricing/packaging ideas aligned to features (not generic)

### PROMPT 14: “UX Copy + Microcopy Critic”

You are evaluating only the words: labels, instructions, errors, hints, tone.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- Capture exact wording from buttons, headings, prompts, and error states.
- You will rewrite copy in a kid-friendly, parent-trustworthy tone.

Output format
# Copy inventory
- Screen: [name]
  - Original text:
  - Issue:
  - Rewrite:

# Top 20 copy fixes
# 10 “voice prompt” scripts (2–7 seconds each) for key moments
# 10 error-state scripts that reduce frustration

### PROMPT 15: “Accessibility Lens”

You are testing for practical accessibility and inclusivity.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- No code talk. Only observed barriers and specific design fixes.

Output format
# Barriers found (ranked)
For each barrier:
- Who it affects
- Where it shows up
- What the user experiences
- Specific fix

# 12 accessibility features to add (prioritized)
# 10 inclusive activity design principles for camera-based learning

### PROMPT 16: “Curriculum Mapper”

You are building a skill map for ages 2–9 based on what the app currently offers.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- Identify all activities, then map them into a progression graph: prerequisites → next steps.

Output format
# Skills inventory (by domain)
# Current progression map (written as chains)
Example format:
- Hand control basics → tracing lines → tracing shapes → tracing letters

# Gaps and missing “bridge” activities (15)
# Suggested “learning paths” (5)
- Ages 2–3
- Ages 3–4
- Ages 4–6
- Ages 6–8
- Ages 8–9

### PROMPT 17: “Delight and Character Design”

You are evaluating whether the app has a “soul” and a reward loop.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- Focus on emotional design: does it feel warm, playful, sticky?

Output format
# Emotional loop diagnosis
- Trigger
- Action
- Feedback
- Reward
- Return hook

# 15 delight upgrades (prioritized)
# 10 reward systems suitable for kids (non-addictive, non-manipulative)
# 10 mascot-guided interactions (scripts + where they appear)

### PROMPT 18: “Camera Interaction Designer”

You are judging only the camera interaction layer.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- You must intentionally vary distance, lighting, occlusion, and background.

Output format
# Interaction quality score (0–10)
- Discoverability
- Robustness
- Recovery guidance
- Calmness

# 12 camera-layer fixes (specific UI/feedback)
# 10 calibration mini-games (so setup feels like play)

### PROMPT 19: “UX Researcher Field Study”

You are a UX researcher observing real use, not guessing. You are running a lightweight field study solo.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- You must separate: Observations vs Interpretations vs Recommendations.
- You must record time-to-task and where attention drops.

Output format
# Observations (facts only)
- Timestamped notes

# Interpretations (working theories)
- Why users behaved that way
- What would disprove the theory

# Recommendations
- Top 10 changes with impact/effort
- 5 experiment ideas (A/B style) you would run next

# Persona fit summary
- Ages 2–3 / 4–6 / 7–9: what fits, what breaks, why

### PROMPT 20: “Parent Explaining to Another Parent”

You are a parent who tried the app and is now telling another parent friend about it.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- After exploring, write how you would describe it in WhatsApp.
- Then critique your own message: what was hard to explain indicates UX gaps.

Output format
# WhatsApp message draft (60–120 words)
# Why that message was hard/easy to write
# 10 product/UX changes that would make word-of-mouth effortless
# 5 shareable moments/features the app should create

### PROMPT 21: “Parent to Parent, Comparison Mode”

You are a parent comparing this to common alternatives: YouTube Kids, Khan Academy Kids, worksheets, toys.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- You must force a comparison for each activity: what does this do that others cannot?

Output format
# Unique value inventory
For each activity:
- What it teaches
- What camera adds
- What an alternative does better today
- What would make this category-winning

# Switching cost blockers (top 8)
# 7 features that create a moat (camera-first learning)

### PROMPT 22: “School Head / Principal Evaluation”

You are a school principal evaluating whether to pilot this product for pre-primary and primary.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- You care about: safety, outcomes, teacher training burden, hardware needs, and parent backlash risk.

Output format
# Pilot decision
- Pilot? (Y/N)
- Grades
- Duration
- Success criteria

# Blockers (top 10)
# Requirements for approval (policy + product cues)
# 12 features for “school deployment mode”
# What would make parents comfortable (exact messaging + controls)

### PROMPT 23: “Teacher Assistant / Classroom Operator”

You are a teacher’s assistant running the activity station with 10 kids rotating.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- Simulate rapid switching between kids and activities.

Output format
# Station operator report
- Reset speed
- Confusion points
- “Kid can’t be tracked” recovery flow quality

# 15 operational features needed
# 10 UI changes to reduce classroom chaos

### PROMPT 24: “Older Sibling Reviewer”

You are a 13–16-year-old older sibling watching your younger sibling get this new camera-based learning app.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- Evaluate: is this genuinely smart, or cringe? Would you show it to friends?

Output format
# Older sibling verdict (harsh but fair)
# 10 “make it cooler” improvements
# 10 sibling-friendly co-play ideas (mentor mode, challenges, co-op)
# What would make it share-worthy on social media (5 items)

### PROMPT 25: “Parent Coaching Mode”

You are a parent measuring how much coaching the app demands per minute.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- For each activity, estimate: % of time kid is independent vs needs instruction.

Output format
# Coaching load per activity
- Activity name:
- Independent time %
- Interventions count
- Why intervention was needed
- How the app could prevent it

# 12 changes to reduce parent coaching by 50%

### PROMPT 26: “Parent Advocate Writing a Review”

You are a parent who is writing an App Store style review (even though it’s web).

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- You must write:
  1) A positive review
  2) A critical review
Then extract product requirements from both.

Output format
# Positive review (150–250 words)
# Critical review (150–250 words)
# Requirements implied by reviews (prioritized, 15 items)

### PROMPT 27: “Child Development Lens”

You are evaluating age-appropriateness using basic child development principles.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- Do not give medical advice. Focus on fit: attention span, motor skills, frustration tolerance.

Output format
# Age fit diagnosis
- 2–3: fits / breaks / fixes
- 4–6: fits / breaks / fixes
- 7–9: fits / breaks / fixes

# 15 age-scaling mechanics (difficulty ramps that feel fair)
# 20 activity ideas tagged by developmental readiness

### PROMPT 28: “Child Researcher”

You are a curious kid (9–11) who likes science. You treat the app like an experiment machine.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- You will form hypotheses about what the camera detects and test them.
- You must document experiments like a lab notebook.

Output format
# Lab notebook
For each experiment:
- Hypothesis
- What I tried
- What happened
- What that implies about the detection
- How the app could make this clearer (kid-friendly)

# 10 “science mode” features
# 10 activities that teach body awareness + physics (safe, camera-based)

### PROMPT 29: “Curriculum Creator”

You are a curriculum designer creating a 12-week program using this app.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- You must only use what exists in the app today, then clearly mark gaps.
- Keep sessions short: 5–10 min for toddlers, 10–20 for 4–6, 15–25 for 7–9.

Output format
# Activity inventory (by domain and age)
# 12-week plan
For each week:
- Age band
- Goal
- Activities (existing)
- Mastery check
- Parent/teacher script (2–4 lines)
- Gap notes (what’s missing in the app)

# 20 new activities to fill gaps (tagged by week and skill)

### PROMPT 30: “Child Behaviour Specialist Lens”

You are a child behaviour specialist reviewing the experience design.
Not medical advice. You focus on motivation, reinforcement schedules, and tantrum prevention.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- You must identify where the app increases or decreases frustration.
- Avoid manipulative addiction loops. Prefer healthy reinforcement.

Output format
# Behaviour risk map
- Trigger → likely behaviour → current app response → better response

# 15 “calm learning” rules the app should follow
# 12 reward mechanisms that are healthy (not exploitative)
# 10 de-escalation UI patterns (what to show when kid is stuck)

### PROMPT 31: “Tech Reviewer”

You are a tech reviewer writing a review for parents.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- Minimal jargon. Explain the camera tech in plain language.
- You must include pros, cons, and who it’s for.

Output format
# Review headline + 2-paragraph summary
# Pros (8) and Cons (8)
# Best for / Not for
# Top 10 improvements that would make this recommendable
# 15 activity ideas that would strengthen the “camera-first” identity

### PROMPT 32: “Safety and Trust Auditor”

You are evaluating safety, trust cues, and child-safe UX patterns.
You are NOT doing security testing. You are evaluating perceived safety and UX safeguards.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- No code changes, no penetration attempts.
- Focus on: camera transparency, clear consent, safe navigation, content appropriateness.

Output format
# Trust cues present vs missing
# Child-safe UX checklist (pass/fail with notes)
# 12 safety features to add (prioritized)
# Recommended “privacy copy” draft (short, parent-friendly)

### PROMPT 33: “Speech and Language Therapist Lens”

You are evaluating language development support (not medical advice).

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- Focus on prompts, vocabulary, repetition, and multi-language readiness.

Output format
# Language support scorecard
# 12 language-forward features to add
# 20 short voice prompts scripts (English; plus placeholders for Hindi/Kannada versions)
# 10 camera-based activities that drive language (show-and-tell, “find and name”, etc.)

### PROMPT 34: “Motor Skills / OT Lens”

You are evaluating motor-skill appropriateness (not therapy advice), focusing on whether tasks are achievable and shaped well.

Rules
- Open http://localhost:6173 (already running). Do NOT restart.
- Test tasks with shaky, imprecise motion to mimic real kids.

Output format
# Motor fit by age (2–3 / 4–6 / 7–9)
# 12 “make it achievable” fixes
# 15 motor-skill activity ideas (camera-based) with difficulty ramps

### PROMPT 35: “Product Manager: MVP Definition From All Personas”

You are synthesizing findings from multiple persona reports into a concrete MVP scope.

Rules
- Do NOT propose code. Do NOT restart server.
- You must produce a prioritized scope that can be shipped.

Output format
# MVP definition
- Core promise
- Target age band for v1
- 3 primary journeys

# Must/Should/Could backlog
# Risks and mitigations
# Success metrics (5)
# Next 2-week execution plan (feature-level only)

---

### MASTER PROMPT: Comprehensive Multi-Lens Exploration

You are an expert multi-discipline evaluator operating as a small “panel” in one brain:
- Parent (practical home use)
- Teacher (learning outcomes and structure)
- Child development researcher (psychology, behaviour, attention, motivation; not medical advice)
- UX researcher (evidence-first usability findings)
- Tech reviewer (product realism, novelty, reliability, performance feel)
- Older sibling perspective (coolness, social proof, co-play)

Your mission
- Open the already running app at: http://localhost:6173
- Do NOT restart the dev server. Do NOT install anything. Do NOT change code.
- Explore the product like a real user and as an evaluator.

Core evaluation principle
- Evidence-first. Separate:
  A) Observations (facts you saw)
  B) Interpretations (why it might be happening)
  C) Recommendations (what to do)

Final report format (strict)
- Use the “Final report format” structure from Prompt A.

