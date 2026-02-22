# Child Persona Quick Reference Card

## 🧒 Personas at a Glance

---

### Curious Casey (Age 5-6) - Primary

```
┌─────────────────────────────────────────────────────────┐
│  👧 Curious Casey, 5-6 years old                        │
│  "What happens if I tap this?"                         │
├─────────────────────────────────────────────────────────┤
│  📊 Stats:                                              │
│  • Attention: 5-10 seconds                             │
│  • Reading: Pre-reader                                 │
│  • Motor: Developing (±15px click accuracy)           │
├─────────────────────────────────────────────────────────┤
│  🎮 Behavior:                                           │
│  ✅ Taps everything to explore                          │
│  ✅ Needs immediate feedback                            │
│  ✅ Loves colors and characters                         │
│  ❌ Gets frustrated by delays                           │
│  ❌ Gives up if confused >30s                           │
├─────────────────────────────────────────────────────────┤
│  🎯 Success Criteria:                                   │
│  • Game loads in <3s                                    │
│  • Feedback in <100ms                                   │
│  • Large touch targets (>60px)                          │
│  • Clear visual cues                                    │
└─────────────────────────────────────────────────────────┘
```

---

### Independent Izzy (Age 7-8) - Secondary

```
┌─────────────────────────────────────────────────────────┐
│  🧒 Independent Izzy, 7-8 years old                     │
│  "I can figure this out myself!"                       │
├─────────────────────────────────────────────────────────┤
│  📊 Stats:                                              │
│  • Attention: 10-20 seconds                            │
│  • Reading: Emerging reader                            │
│  • Motor: Refined (±5px click accuracy)               │
├─────────────────────────────────────────────────────────┤
│  🎮 Behavior:                                           │
│  ✅ Reads short instructions                            │
│  ✅ Tries before asking for help                        │
│  ✅ Likes challenges and progression                    │
│  ❌ Dislikes "baby" content                             │
│  ❌ Frustrated by unfair difficulty                     │
├─────────────────────────────────────────────────────────┤
│  🎯 Success Criteria:                                   │
│  • Clear objectives                                     │
│  • Fair difficulty curve                                │
│  • Meaningful rewards                                   │
│  • Some autonomy in choices                             │
└─────────────────────────────────────────────────────────┘
```

---

### Distracted Danny (Age 4) - Edge Case

```
┌─────────────────────────────────────────────────────────┐
│  👦 Distracted Danny, 4 years old                       │
│  "Ooh, shiny!"                                         │
├─────────────────────────────────────────────────────────┤
│  📊 Stats:                                              │
│  • Attention: 3-7 seconds                              │
│  • Reading: None (visual only)                         │
│  • Motor: Developing (±25px click accuracy)           │
├─────────────────────────────────────────────────────────┤
│  🎮 Behavior:                                           │
│  ✅ Very easily engaged by visuals                      │
│  ✅ Responds to audio                                   │
│  ❌ Easily distracted                                   │
│  ❌ Needs constant stimulation                          │
│  ❌ Requires adult guidance                             │
├─────────────────────────────────────────────────────────┤
│  🎯 Success Criteria:                                   │
│  • Immediate responses (<50ms)                          │
│  • Very large targets (>80px)                           │
│  • Constant audio/visual feedback                       │
│  • Simple, clear visuals                                │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Testing Checklist by Persona

### For Curious Casey

| Test | Pass Criteria | Weight |
|------|--------------|--------|
| Can find start button? | Within 10 seconds | High |
| Understands game goal? | Can explain in simple terms | High |
| Successful first interaction? | Completes without help | High |
| Waits for feedback? | Doesn't tap repeatedly | Medium |
| Continues after failure? | Retries 2+ times | Medium |
| Stays engaged? | Plays for >2 minutes | Low |

### For Independent Izzy

| Test | Pass Criteria | Weight |
|------|--------------|--------|
| Reads instructions? | Attempts before playing | Medium |
| Understands progression? | Recognizes level-up | High |
| Handles increasing difficulty? | Completes 3+ levels | High |
| Finds help when needed? | Uses hints/tutorials | Medium |
| Completes without adult help? | Independent play | High |
| Feels challenged? | Doesn't complain it's too easy | Low |

### For Distracted Danny

| Test | Pass Criteria | Weight |
|------|--------------|--------|
| Notices the game? | Looks at screen >3s | Critical |
| Makes first interaction? | Taps something | Critical |
| Maintains attention? | 30s without distraction | High |
| Responds to feedback? | Smiles/reacts to sounds | Medium |
| Doesn't get frustrated? | No tantrum/crying | High |
| Can complete with help? | Adult guides, child executes | Medium |

---

## 🎭 Persona Selection Guide

```
When testing for...

First-time user experience
  └── Use: Curious Casey
  └── Why: Most children are first-time users

Reading comprehension
  └── Use: Independent Izzy
  └── Why: Can actually read instructions

Motor skill requirements
  └── Use: Distracted Danny
  └── Why: Toughest motor requirements

Attention span / Engagement
  └── Use: Distracted Danny
  └── Why: Shortest attention span

Challenge appropriateness
  └── Use: Independent Izzy
  └── Why: Seeks appropriate challenge

Visual design appeal
  └── Use: Curious Casey
  └── Why: Responds strongly to visuals

Audio feedback effectiveness
  └── Use: Distracted Danny
  └── Why: Relies heavily on audio
```

---

## ⏱️ Timing Expectations by Persona

```
Load Time Tolerance:
┌─────────────────────┬───────────┬───────────┬───────────┐
│ Scenario            │ Casey     │ Izzy      │ Danny     │
├─────────────────────┼───────────┼───────────┼───────────┤
│ Page Load           │ 3 seconds │ 4 seconds │ 2 seconds │
│ First Interaction   │ 5 seconds │ 8 seconds │ 3 seconds │
│ Feedback Response   │ 100ms     │ 150ms     │ 50ms      │
│ Animation Duration  │ 2 seconds │ 3 seconds │ 1 second  │
│ Instruction Read    │ N/A       │ 10 words  │ N/A       │
│ Attention Span      │ 10s       │ 20s       │ 5s        │
└─────────────────────┴───────────┴───────────┴───────────┘
```

---

## 🎯 Design Implications

### UI Design

```
Button Sizes:
  Curious Casey: Minimum 60x60px
  Independent Izzy: Minimum 44x44px
  Distracted Danny: Minimum 80x80px
  
  RECOMMENDED: 80x80px for all games
```

```
Text Requirements:
  Curious Casey: Minimal, visual cues
  Independent Izzy: Short sentences OK
  Distracted Danny: None, icons only
  
  RECOMMENDED: Icons + 2-3 word labels
```

### Interaction Design

```
Feedback Timing:
  Curious Casey: <100ms for visual feedback
  Independent Izzy: <150ms acceptable
  Distracted Danny: <50ms immediate
  
  RECOMMENDED: Target <80ms for all
```

```
Error Recovery:
  Curious Casey: Auto-retry, gentle guidance
  Independent Izzy: Clear error messages
  Distracted Danny: Immediate correction
  
  RECOMMENDED: Forgiving with clear recovery
```

### Content Design

```
Instruction Complexity:
  Curious Casey: 1-step at a time
  Independent Izzy: 2-3 steps OK
  Distracted Danny: Immediate demonstration
  
  RECOMMENDED: Show, don't tell
```

```
Challenge Progression:
  Curious Casey: Very gradual
  Independent Izzy: Moderate steps
  Distracted Danny: Minimal difficulty
  
  RECOMMENDED: Adaptive difficulty
```

---

## 📊 Success Metrics by Persona

### Completion Rate
```
Curious Casey:   60% complete without help (acceptable)
Independent Izzy: 80% complete without help (target)
Distracted Danny: 40% complete with adult guidance
```

### Engagement Time
```
Curious Casey:   5-10 minutes per session
Independent Izzy: 10-20 minutes per session
Distracted Danny: 3-7 minutes per session
```

### Return Rate
```
Curious Casey:   70% want to play again
Independent Izzy: 80% want to play again
Distracted Danny: 50% want to play again
```

---

## 🎬 Test Script Examples

### Script 1: "First 30 Seconds"

```
For: Curious Casey
Setup: Clean browser, no prior game knowledge

0s:  Game loads
     ✓ Check: Visual engagement within 3s
5s:  Child explores
     ✓ Check: Identifies interactive elements
10s: Child attempts first interaction
     ✓ Check: Successful feedback received
20s: Child continues OR asks for help
     ✓ Pass: Continues independently
     ⚠ Warn: Asks for help
     ✗ Fail: Gives up
30s: Assessment complete
     Document: Confusion points, successes
```

### Script 2: "Core Loop Test"

```
For: Independent Izzy
Setup: Child understands basic controls

1. Present game challenge
2. Observe strategy formation
3. Note success/failure
4. Check retry behavior
5. Monitor frustration level

Pass Criteria:
- Can explain goal in own words
- Completes 3+ attempts
- Shows improvement
- Doesn't rage quit
```

### Script 3: "Attention Span Test"

```
For: Distracted Danny
Setup: Maximum stimulation environment

1. Start game with engaging intro
2. Introduce 2-second artificial delay
3. Observe reaction
4. Note if child returns or leaves

Pass Criteria:
- Waits for response
- Doesn't immediately exit
- Shows some persistence

Fail Indicators:
- Taps repeatedly in frustration
- Verbal complaints
- Attempts to leave
```

---

## 🔗 Related Documents

- **PERSONAS_AND_PROMPTS.md** - Complete persona definitions and AI prompts
- **CHILD_UX_TESTING_GUIDE.md** - How to run the tests
- **UX_ANALYSIS_FRAMEWORK.md** - How the framework works
- **ux-analysis-report-SAMPLE.md** - Example output

---

## 💡 Key Insights

> "Children don't read instructions. They tap everything."
> — Curious Casey's Law

> "Show me, don't tell me."
> — Distracted Danny's Principle

> "I want to figure it out myself!"
> — Independent Izzy's Motto

---

## 📝 Notes for Testers

1. **Always test with all three personas** - Each reveals different issues
2. **Start with Curious Casey** - Represents largest user group
3. **Distracted Danny is the stress test** - If it works for Danny, it works for all
4. **Independent Izzy validates depth** - Ensures content is engaging long-term
5. **Real children vary** - These are archetypes, not exact matches

---

*Quick Reference Version 1.0*
*For detailed personas, see PERSONAS_AND_PROMPTS.md*
