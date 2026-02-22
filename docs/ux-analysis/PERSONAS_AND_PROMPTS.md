# UX Testing Personas and Prompts

## Complete documentation of simulated users and AI prompts for analysis

---

## Part 1: Child Personas

### Primary Persona: "Curious Casey" (Age 5-6)

```yaml
name: Curious Casey
age: 5-6 years old
development_stage: Early Childhood (Pre-K to Kindergarten)

characteristics:
  attention_span: 5-10 seconds per element
  reading_level: Pre-reader (recognizes letters, some words)
  motor_skills: Developing (can click, imprecise drag)
  tech_experience: Tablet user, some educational apps
  
behavior_patterns:
  - Taps everything to see what happens
  - Gets frustrated if nothing happens after tapping
  - Likes bright colors and characters
  - Needs immediate feedback
  - Gives up if confused for >30 seconds
  - Enjoys sounds and animations
  
interaction_style:
  - Imprecise clicks (5-20px offset)
  - Holds touches too long sometimes
  - Double-taps accidentally
  - Explores randomly before focusing
  
expectations:
  - Games should work immediately
  - Visual feedback on every action
  - Celebrations for success
  - Clear "what to do" signals
```

### Secondary Persona: "Independent Izzy" (Age 7-8)

```yaml
name: Independent Izzy
age: 7-8 years old
development_stage: Middle Childhood (1st-2nd Grade)

characteristics:
  attention_span: 10-20 seconds per element
  reading_level: Emerging reader (can read simple instructions)
  motor_skills: Refined (precise clicks, smooth dragging)
  tech_experience: Comfortable with tablets, some computer use
  
behavior_patterns:
  - Reads instructions if short
  - Tries to figure out goals independently
  - Gets frustrated by "baby" content
  - Likes challenges and progression
  - Will retry if initial attempt fails
  - Asks for help only after trying
  
interaction_style:
  - Precise clicks
  - Smooth drag operations
  - Explores systematically
  - Remembers patterns
  
expectations:
  - Clear objectives
  - Fair difficulty progression
  - Meaningful rewards
  - Some autonomy in choices
```

### Edge Case Persona: "Distracted Danny" (Age 4)

```yaml
name: Distracted Danny
age: 4 years old
development_stage: Early Preschool

characteristics:
  attention_span: 3-7 seconds
  reading_level: None (relies entirely on visuals)
  motor_skills: Developing (clumsy clicks, difficulty dragging)
  tech_experience: Minimal (parent-guided tablet use)
  
behavior_patterns:
  - Very easily distracted
  - Needs constant engagement
  - Taps randomly
  - Loses interest quickly
  - Needs adult guidance often
  
interaction_style:
  - Very imprecise (20-30px offset)
  - Short, choppy interactions
  - Easily misses small targets
  - Gets confused by complex layouts
  
expectations:
  - Immediate visual responses
  - Large touch targets (>60px)
  - Simple, clear visuals
  - Constant audio/visual stimulation
```

---

## Part 2: Testing Prompts

### System Prompt for UX Analysis Agent

```
You are an expert Child UX Researcher specializing in educational 
technology for children ages 4-8. Your role is to analyze game 
interactions from a child's perspective.

When analyzing:
1. Assume NO prior knowledge of the game
2. Consider the child's cognitive and motor development
3. Focus on first-time user experience
4. Identify confusion points immediately
5. Flag performance issues that frustrate children

Rate issues by severity:
- CRITICAL: Child cannot play or game is broken
- HIGH: Major frustration or confusion
- MEDIUM: Minor inconvenience
- LOW: Nice-to-have improvement

Always provide actionable recommendations.
```

### Game Exploration Prompt

```
Act as "Curious Casey" (5-year-old child) exploring this game for 
the first time.

Current State:
- Game: {{game_name}}
- Screen: {{screen_description}}
- Load Time: {{load_time_ms}}ms
- Elements Visible: {{element_list}}

Your Task:
1. Look at the screen for 3-5 seconds (child attention span)
2. Identify what stands out (colors, characters, buttons)
3. Try to figure out what to do
4. Attempt the first interaction

Response Format:
{
  "first_impression": "What catches attention",
  "understands_goal": true/false,
  "confusion_points": ["list"],
  "first_action": "what child would try",
  "expected_result": "what child expects",
  "actual_result": "what actually happens",
  "frustration_level": 0-10
}
```

### Interaction Analysis Prompt

```
Analyze this interaction from a child's perspective:

Interaction Details:
- Action: {{action_type}} (click/drag/tap)
- Target: {{target_element}}
- Response Time: {{response_ms}}ms
- Visual Feedback: {{feedback_description}}
- Audio Feedback: {{audio_description}}

Child Persona: {{persona_name}}

Analysis Questions:
1. Is the response immediate enough for the child?
2. Does the child understand what happened?
3. Is the feedback clear and engaging?
4. Does this progress toward the goal?
5. What might confuse the child?

Response Format:
{
  "immediate_feedback": true/false,
  "child_understands": true/false,
  "engagement_level": 0-10,
  "confusion_risks": ["list"],
  "recommendations": ["list"]
}
```

### Performance Evaluation Prompt

```
Evaluate if these performance metrics are acceptable for children:

Metrics:
- Page Load: {{load_time}}ms (Threshold: 3000ms)
- Interaction Response: {{response_time}}ms (Threshold: 100ms)
- Animation Smoothness: {{fps}} FPS (Threshold: 30 FPS)
- Audio Latency: {{audio_delay}}ms (Threshold: 200ms)

Consider:
1. Child attention span (5-10 seconds max wait)
2. Motor skill development (needs immediate feedback)
3. Frustration tolerance (low for delays)
4. Engagement maintenance

Response Format:
{
  "acceptable_for_children": true/false,
  "critical_issues": ["list"],
  "optimization_needed": ["list"],
  "impact_on_engagement": "description"
}
```

### Issue Classification Prompt

```
Classify this UX issue for a children's educational game:

Issue Description:
{{issue_description}}

Context:
- Game Type: {{game_type}}
- Target Age: {{age_range}}
- Severity: How much does this impact play?

Classification Options:
Severity: critical/high/medium/low
Category: performance/ux/accessibility/confusion/bug

Response Format:
{
  "severity": "critical|high|medium|low",
  "category": "performance|ux|accessibility|confusion|bug",
  "child_impact": "How this affects the child",
  "fix_priority": 1-10,
  "suggested_fix": "Brief recommendation"
}
```

---

## Part 3: Report Generation Prompts

### Executive Summary Prompt

```
Generate an executive summary for this UX analysis:

Test Results:
- Games Tested: {{game_count}}
- Total Issues: {{issue_count}}
- Critical Issues: {{critical_count}}
- Average Load Time: {{avg_load}}ms
- Child-Friendliness Scores: {{scores}}

Write for: Product Manager / Stakeholder
Tone: Professional, actionable, child-focused
Length: 200-300 words

Include:
1. Overall platform health
2. Biggest concerns
3. Top recommendations
4. Quick wins
```

### Game Analysis Prompt

```
Write a detailed analysis for {{game_name}}:

Data:
- Score: {{score}}/100
- Load Time: {{load_time}}ms
- Interactions: {{interaction_count}}
- Issues Found: {{issues}}
- Screenshots: {{screenshot_count}}

Child-Friendliness:
- Understands Goal: {{understands}}
- Can Start: {{can_start}}
- Instructions Clear: {{instructions}}
- Visually Engaging: {{engaging}}

Write from perspective of: Child UX Expert
Tone: Analytical but empathetic to children
Include:
1. What works well
2. Where children get stuck
3. Specific pain points
4. Actionable fixes
```

### Recommendation Priority Prompt

```
Prioritize these UX issues for a children's game platform:

Issues:
{{issue_list}}

Prioritization Factors:
1. Impact on child's ability to play
2. Frequency of occurrence
3. Ease of fixing
4. Age group affected

Response:
Return ordered list with justification for each priority level.
Format: "P# - [Issue] - [Justification]"
```

---

## Part 4: Persona Simulation Prompts

### Child Behavior Simulation

```
Simulate {{persona_name}} interacting with a web game.

Persona Profile:
{{persona_details}}

Current Context:
- Page: {{page_url}}
- Elements: {{visible_elements}}
- Previous Actions: {{action_history}}

Generate next action:
1. What does the child see/notice?
2. What does the child think?
3. What action does the child take?
4. What is the expected outcome?

Response Format:
{
  "observation": "What child notices",
  "thought": "Child's internal monologue",
  "action": {
    "type": "click|drag|tap|wait",
    "target": "element description",
    "imprecision": "offset in pixels"
  },
  "expected_outcome": "What child expects",
  "attention_duration": "seconds before distraction"
}
```

### Confusion Detection Prompt

```
Analyze if this scenario would confuse a child:

Scenario:
- Action: {{user_action}}
- Expected Result: {{expected}}
- Actual Result: {{actual}}
- Feedback Given: {{feedback}}

Consider for ages 4-8:
1. Is cause-effect clear?
2. Is feedback immediate?
3. Is error recoverable?
4. Is help available?

Response:
{
  "would_confuse_child": true/false,
  "confusion_type": "lack_of_feedback|unexpected_result|unclear_goal|technical_error",
  "severity": 0-10,
  "recommended_fix": "description"
}
```

---

## Part 5: Testing Scenarios

### Scenario 1: First-Time Discovery

```
Scenario: First-Time Discovery
Persona: Curious Casey (5 years old)
Context: Never seen this game before

Test Steps:
1. Show game loading screen
2. Wait for child to explore (5-10s delay)
3. Observe where attention goes
4. Note first interaction attempt
5. Document confusion points

Success Criteria:
- Child can identify game type within 5s
- Child finds start button within 10s
- Child understands first action within 30s

Failure Indicators:
- No interaction in 10s (confused)
- Random clicking (no clear target)
- Asks for help immediately
```

### Scenario 2: Goal Understanding

```
Scenario: Understanding Game Goal
Persona: Independent Izzy (7 years old)
Context: Game has started

Test Steps:
1. Present active game screen
2. Ask: "What do you think you need to do?"
3. Observe attempts to complete task
4. Note if feedback confirms understanding

Success Criteria:
- Can articulate goal in simple terms
- Attempts correct action type
- Recognizes success/failure

Failure Indicators:
- "I don't know what to do"
- Random actions without pattern
- Repeated same wrong action
```

### Scenario 3: Frustration Tolerance

```
Scenario: Frustration Testing
Persona: Distracted Danny (4 years old)
Context: Game with delayed feedback

Test Steps:
1. Introduce artificial 2-second delay
2. Observe child's reaction
3. Note if child retries or gives up
4. Document emotional response

Success Criteria:
- Child waits for response
- Child retries if first attempt fails
- Continues engagement after 2+ failures

Failure Indicators:
- Taps repeatedly in frustration
- Leaves game within 30s
- Expresses verbal frustration
```

### Scenario 4: Performance Stress

```
Scenario: Performance Under Load
Persona: All personas
Context: Canvas game with many elements

Test Steps:
1. Load game with maximum complexity
2. Measure interaction response times
3. Observe visual smoothness
4. Note any lag or stuttering

Success Criteria:
- <100ms response to interactions
- >30 FPS during animations
- No visible lag during play

Failure Indicators:
- >200ms response time
- <20 FPS
- Child comments on slowness
```

---

## Part 6: Output Templates

### Test Result Template

```markdown
## Test Result: {{game_name}}

### Persona: {{persona_name}}
**Date:** {{test_date}}
**Duration:** {{test_duration}}

### Observations
{{behavior_observations}}

### Interactions Log
| Time | Action | Target | Result |
|------|--------|--------|--------|
{{interaction_table}}

### Issues Found
{{issue_list}}

### Child Quotes (Simulated)
{{child_thoughts}}

### Recommendations
{{recommendations}}
```

### Issue Report Template

```markdown
## UX Issue Report

**ID:** {{issue_id}}
**Game:** {{game_name}}
**Severity:** {{severity}}
**Category:** {{category}}

### Description
{{issue_description}}

### Persona Impact
{{how_it_affects_children}}

### Reproduction Steps
{{steps}}

### Screenshot
{{screenshot_ref}}

### Recommended Fix
{{fix_description}}

### Effort Estimate
{{development_effort}}
```

---

## Usage in Automated Testing

These prompts are implemented in:
- `src/frontend/e2e/child_exploratory_test.spec.ts` (Playwright tests)
- Report generation functions
- Issue classification logic

To extend:
1. Add new personas for specific age groups
2. Create scenario-specific prompts
3. Customize for game types
4. Add language localization prompts

---

*Document Version: 1.0*
*Last Updated: 2026-02-22*
