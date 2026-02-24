# Persona Interviews Index

**Date**: 2026-02-23  
**Last Updated**: 2026-02-23  
**Purpose**: Document all simulated customer interviews conducted for Advay Vision Learning

## Documentation Overview

This index consolidates all persona interview findings. For complete transcripts and detailed analysis, see:

| Interview | Worklog Location | Status | Key Output |
|-----------|-----------------|--------|------------|
| Neha (Safety-First) | WORKLOG_TICKETS.md (TCK-20260223-001) | ✅ DONE | 6 P0/P1 features implemented |
| Vikram (Data-Driven) | WORKLOG_ADDENDUM_v3.md (TCK-20260223-007) | ✅ DONE | 7 findings, 6 recommendations |
| Ananya (Working Mom) | WORKLOG_ADDENDUM_v3.md (TCK-20260223-008) | ✅ DONE | 8 findings, 7 recommendations |
| Dadi (Non-Tech Guardian) | WORKLOG_ADDENDUM_v3.md (TCK-20260223-009) | ✅ DONE | 9 findings, Hindi UI critical |
| Dr. Meera Sharma (Child Psychologist) | personas/CHILD_PSYCHOLOGIST_Dr_Meera_Sharma.md | ✅ DONE | 8 findings, cognitive load focus |
| Ms. Deepa (School Teacher) | personas/TEACHER_Ms_Deepa.md | ✅ DONE | 7 findings, curriculum & B2B focus |

**Total Interviews Completed**: 6  
**Total Findings Documented**: 45  
**Total Recommendations**: 41 (22 P0, 19 P1)  
**Technical Audits**: 1 (Language Infrastructure Gap — TCK-20260223-010)  
**Implementations Completed**: 3 (Global i18n Infrastructure — TCK-20260223-011, Extended UI Translations — TCK-20260223-012, Calm Mode — TCK-20260223-013)

## Critical Technical Discovery → RESOLVED

**TCK-20260223-010: Language Infrastructure Gap**  
**TCK-20260223-011: Global i18n Infrastructure** ✅

Dadi's finding "Hindi. Poora app Hindi mein hona chahiye" is now **addressed**:

| Before | After (TCK-20260223-011) |
|--------|--------------------------|
| ❌ No i18n library | ✅ react-i18next implemented |
| ❌ No translation files | ✅ 15 languages configured |
| ❌ Hardcoded English UI | ✅ Settings page translated (POC) |
| ❌ ~500 strings to translate | ✅ Infrastructure ready for gradual translation |

**Implementation Highlights:**
- **15 Languages**: English, Hindi, Chinese, Spanish, Arabic + 10 Indian languages
- **Lazy Loading**: Only active language loaded (performance optimized)
- **RTL Support**: Arabic ready (direction switching)
- **Auto-Detection**: Browser language → localStorage persistence
- **Extensible**: Add new language in 3 steps (config, files, translate)

**Next Phase**: Gradual UI translation (dashboard, games, auth namespaces)

---

## Completed Interviews

### 1. Neha — The Safety-First Parent

**Date**: 2026-02-23
**Status**: ✅ COMPLETED

#### Profile

- **Age**: 32
- **Location**: Mumbai, Maharashtra
- **Occupation**: HR Manager at a tech company
- **Children**: Aarav (2y 8m) and Isha (5y)
- **Primary Concern**: Child safety, data privacy, screen time limits
- **Key Trait**: Primary conversion blocker — if privacy isn't addressed in 15 seconds, she abandons

#### Interview Focus Area

- Parent Dashboard (progress tracking, time limits, privacy settings)
- Weekly check-ins and trial-to-paid conversion

#### Key Findings

| Severity   | Finding                             | Impact                                                 |
| ---------- | ----------------------------------- | ------------------------------------------------------ |
| 🔴 HIGH    | No daily time breakdown             | Can't verify if child played 9 min/day or 45-min binge |
| 🔴 HIGH    | Only completion shown, not struggle | "Letter B ✓" hides attempts — missed intervention      |
| 🔴 HIGH    | No exportable progress reports      | Teacher asked for readiness — screenshot & WhatsApp    |
| 🟡 MEDIUM  | App restart bypasses time limits    | Isha discovered reset trick                            |
| 🟡 MEDIUM  | Camera settings label unclear       | Toggle confusing — disable vs hide indicator           |
| ✅ WORKING | Green dot = trust signal            | Keep prominent                                         |

#### Solutions Implemented

1. ✅ Daily Time Breakdown Chart (TCK-20260223-002)
2. ✅ Struggle Visibility - Attempt Count (TCK-20260223-003)
3. ✅ PDF Export for Progress Reports (TCK-20260223-004)
4. ✅ Time Limit Enforcement Fix (TCK-20260223-005)
5. ✅ Camera Settings Clarity (TCK-20260223-006)

#### Documentation

- Worklog: `docs/WORKLOG_TICKETS.md` (TCK-20260223-001)
- Full transcript captured in worklog entry

---

## Interview History

| #   | Persona                            | Area                     | Status  | Date       |
| --- | ---------------------------------- | ------------------------ | ------- | ---------- |
| 1   | Neha — Safety-First Parent         | Parent Dashboard         | ✅ DONE | 2026-02-23 |
| 2   | Vikram — Data-Driven Father        | Progress Data & Metrics  | ✅ DONE | 2026-02-23 |
| 3   | Ananya — Overwhelmed Working Mom   | Onboarding & Engagement  | ✅ DONE | 2026-02-23 |
| 4   | Dadi — Non-Tech Guardian           | Accessibility & Language | ✅ DONE | 2026-02-23 |
| 5   | Dr. Meera Sharma — Child Psychologist | Development & Cognition | ✅ DONE | 2026-02-23 |
| 6   | Ms. Deepa — School Teacher         | Curriculum & Classroom   | ✅ DONE | 2026-02-24 |
| 7   | TBD                                | TBD                      | 🔜 NEXT | —          |

---

### 2. Vikram — The Data-Driven Father

**Date**: 2026-02-23
**Status**: ✅ COMPLETED

#### Profile

- **Age**: 38
- **Location**: Hyderabad, Telangana
- **Occupation**: Senior Data Analyst at IT services company
- **Children**: Kabir (7y 3m) — CBSE board
- **Primary Concern**: Measurable learning outcomes, ROI on educational spend
- **Key Trait**: Retention decider — will cancel if data doesn't prove learning
- **Context**: Neha's husband, influences renewal decision

#### Interview Focus Area

- Progress data visibility and learning metrics
- Curriculum alignment (CBSE/NCERT/NEP)
- Competitive benchmarking and trend analysis
- Automated reporting for zero-effort parent insight

#### Key Findings

| Severity  | Finding                              | Impact                                                      |
| --------- | ------------------------------------ | ----------------------------------------------------------- |
| 🔴 HIGH   | No quantitative trend data           | "Great progress!" too qualitative; needs CSV, trend lines   |
| 🔴 HIGH   | No curriculum mapping                | Can't verify CBSE alignment — feels like entertainment      |
| 🔴 HIGH   | No competitive benchmarking          | "Is Kabir ahead/behind for age?" — no peer comparison       |
| 🔴 HIGH   | No automated weekly reports          | Wants Sunday 8 PM email with PDF — zero effort              |
| 🔴 HIGH   | Flat content = churn risk            | Plateaus or finishes content = immediate cancellation       |
| 🟡 MEDIUM | Skill breakdown by subject           | Needs "Alphabets 85%, Numbers 72%" with trend arrows        |
| 🟡 MEDIUM | Teacher-ready PDF                    | Specific struggle data for parent-teacher meetings          |

#### Solutions Recommended

**P0 (Immediate)**:
1. Skill-level breakdown charts (Alphabets/Numbers/Shapes with % and trends)
2. Curriculum alignment tags ("Teaches NEP FLN: Phonemic Awareness")
3. Weekly automated email (PDF report, Sundays 8 PM)

**P1 (Medium-term)**:
4. Percentile benchmarking ("Top X% for age 7")
5. CSV export for spreadsheet parents
6. Content roadmap visibility ("Coming next: Cursive at 80% accuracy")

#### Key Quote

> *"Tuition gives me a notebook with daily corrections. The app gives me... a plant emoji. If I had skill-level breakdowns with trend arrows, I could argue it's worth it."*

#### Documentation

- Worklog: `docs/WORKLOG_TICKETS.md` (TCK-20260223-007)
- Full transcript captured in worklog entry

---

## Available Personas for Interview

Based on `docs/USER_PERSONAS.md`:

### Vikram — The Data-Driven Father

- **Segment**: 6-8 age group, retention risk
- **Concern**: Data proving learning, curriculum mapping, stale content
- **Suggested Area**: Progress data visibility, teacher reports, learning metrics

### Ananya — The Overwhelmed Working Mom

- **Segment**: Highest-volume growth segment (Tier 2/3)
- **Concern**: Independent play (20 min), zero setup, child safety net
- **Suggested Area**: Onboarding, independent play, share features

### Dadi — The Non-Tech Guardian

- **Segment**: Grandparents, non-English speakers
- **Concern**: Simple UI, language barriers
- **Suggested Area**: Non-tech user experience, language support

---

## Workflow for New Interviews

Following the mandatory workflow:

1. **Analysis** — Review persona profile, identify focus area
2. **Document** — Create worklog ticket
3. **Plan** — Define interview questions, scope
4. **Research** — Explore codebase for relevant areas
5. **Document** — Update ticket with research
6. **Implement** — Conduct interview simulation
7. **Test** — Verify findings
8. **Document** — Mark ticket complete with evidence

---

### 3. Ananya — The Overwhelmed Working Mom

**Date**: 2026-02-23
**Status**: ✅ COMPLETED

#### Profile

- **Age**: 29
- **Location**: Jaipur, Rajasthan (Tier 2 city)
- **Occupation**: Freelance graphic designer (work from home)
- **Children**: Saanvi (4y 2m)
- **Household Income**: ₹55K/month — price-sensitive purchase
- **Tech Savviness**: Medium (UPI/WhatsApp comfortable; app settings less so)
- **Primary Concern**: Needs 20 minutes of child-safe, self-directed activity for work calls
- **Key Trait**: Viral growth engine — WhatsApp parenting group (200+ members)

#### Interview Focus Area

- Onboarding flow and first-time user experience
- Independent play validation (20 minutes without supervision)
- Offline mode for unreliable internet
- Share features for family engagement

#### Key Findings

| Severity  | Finding                          | Impact                                                   |
| --------- | -------------------------------- | -------------------------------------------------------- |
| 🔴 HIGH   | No guest mode                    | 5+ min setup before first play = immediate drop-off      |
| 🔴 HIGH   | Camera permission without context | Fear → "Don't Allow" = broken app experience             |
| 🔴 HIGH   | No offline mode                  | Power cuts 3-4 hrs/day in Tier 2/3 = unusable            |
| 🔴 HIGH   | No UPI payment option            | Credit card only = checkout abandonment                  |
| 🔴 HIGH   | App crashes mid-game             | Crying child + broken work concentration = churn         |
| 🟡 MEDIUM | No WhatsApp share                | Missed viral growth, family engagement                   |
| 🟡 MEDIUM | Progress too complex             | Needs simple "safe/learning/playing" only                |
| 🟡 MEDIUM | No timed session mode            | Can't match app duration to work call length             |

#### Solutions Recommended

**P0 (Immediate)**:
1. Guest mode — "Play Now" immediate, gate saving behind account
2. Camera permission context — Custom modal before system popup
3. UPI payment option — Primary for India market
4. Offline mode — Cache games, sync when connected

**P1 (Medium-term)**:
5. WhatsApp share integration — One-tap with auto-generated image
6. Simplified parent status — Three indicators: Safe/Learning/Playing
7. Timed session mode — "Engage for X minutes" with gentle end

#### Key Quote

> *"I just need to know: Is she safe? Is she learning? Is she still playing? Three things."*

#### Documentation

- Worklog: `docs/WORKLOG_ADDENDUM_v3.md` (TCK-20260223-008)
- Full transcript captured in worklog entry

---

### 4. Dadi — The Non-Tech Guardian

**Date**: 2026-02-23
**Status**: ✅ COMPLETED

#### Profile

- **Age**: 62
- **Location**: Lucknow, Uttar Pradesh
- **Occupation**: Retired school principal (35 years experience)
- **Grandchildren**: Aarav (2y 8m) and Kabir (7y 3m)
- **Tech Savviness**: Low — WhatsApp video calls only; struggles with app navigation
- **Primary Concern**: Not "breaking anything" on the device
- **Language**: Hindi only; cannot read English UI
- **Context**: Daytime caregiver while parents work

#### Interview Focus Area

- One-button interface for non-tech users
- Hindi language support validation
- Error recovery without panic
- Accidental navigation prevention

#### Key Findings

| Severity   | Finding                         | Impact                                                |
| ---------- | ------------------------------- | ----------------------------------------------------- |
| 🔴 CRITICAL| No Hindi UI support             | "Nahi toh main use nahi kar paungi" (Can't use it)   |
| 🔴 CRITICAL| Language setting incomplete     | Only game content Hindi, UI stays English            |
| 🔴 HIGH    | English-only UI barrier         | Feels "stupid" — was principal, now can't press button|
| 🔴 HIGH    | Camera permission in English    | Always taps "Don't Allow" — game breaks               |
| 🔴 HIGH    | Small text/icons invisible      | Not visible even with glasses                         |
| 🔴 HIGH    | Accidental navigation = panic   | Swipe to Settings → closes app, waits for help        |
| 🔴 HIGH    | Profile selection confusing     | Guesses which grandchild — often wrong                |
| 🔴 HIGH    | Needs "one big button" mode     | "Bas ek bada sa button. Aarav ki photo."             |
| 🟡 MEDIUM  | Home button exits, no recovery  | Full restart, re-selection needed                     |
| 🟡 MEDIUM  | Fear of "breaking" device       | Emotional barrier — won't explore                     |

#### Solutions Recommended

**P0 (Immediate)**:
1. Full Hindi UI translation — All labels, buttons, modals in Hindi
2. "Dadi Mode" — Grandparent interface: one giant button per child with photo
3. Pre-approved camera permission — Parent config, Dadi never sees English popup
4. Large text mode — 24px+ minimum, high contrast

**P1 (Medium-term)**:
5. Child-proof game container — Home button → rest mode, auto-resume
6. Gesture guardrails — Disable swipe, prevent accidental Settings
7. Audio-first instructions — Pip speaks in Hindi

#### Key Quote

> *"Main toh principal thi... 35 saal school chalaya. Ab ek chhota sa button daba nahi paati."*  
> *(I was a principal... ran school for 35 years. Now can't press a small button.)*

> *"Hindi. Poora app Hindi mein hona chahiye. Nahi toh main use nahi kar paungi."*  
> *(Hindi. Whole app should be in Hindi. Otherwise I can't use it.)*

#### Documentation

- Worklog: `docs/WORKLOG_ADDENDUM_v3.md` (TCK-20260223-009)
- Full transcript in Hindi/English captured in worklog entry

---

## Interview Insights Comparison

### Combined Persona Insights — Four Perspectives

| Aspect              | Neha (Safety-First)                     | Vikram (Data-Driven)                 | Ananya (Working Mom)                    | Dadi (Non-Tech Guardian)                |
| ------------------- | --------------------------------------- | ------------------------------------ | --------------------------------------- | ---------------------------------------- |
| **Primary Focus**   | Safety, privacy, screen time            | Learning metrics, ROI, curriculum    | Convenience, independent play, price   | Simplicity, Hindi language, no errors   |
| **Dashboard Needs** | Time tracking, daily limits             | Trend charts, skill breakdowns       | Simple status (safe/learning/playing)  | No dashboard — one button only          |
| **Onboarding**      | Wants privacy explanation               | Wants curriculum alignment proof     | **Needs guest mode** — 5+ min = drop   | **Needs pre-config by parent**          |
| **Language**        | English + Hindi OK                      | English preferred                    | Hindi preferred                        | **Hindi ONLY** — cannot read English    |
| **Payment**         | Secure, transparent pricing             | Justified by data vs tuition         | **UPI required**, price-sensitive      | Never pays — parent handles             |
| **Trust Signals**   | Green dot, "video stays on device"      | Curriculum badges, accuracy slopes   | App doesn't crash, works offline       | Nothing breaks, can ask for help        |
| **Churn Triggers**  | Privacy concerns, no time controls      | Flat data, no curriculum mapping     | **Crashes, no offline, complex setup** | **English UI, small text, errors**      |
| **Key Decision**    | Converts trial → paid                   | Decides Month 3+ renewal             | Viral spread (200+ WhatsApp group)     | Enables daily usage (childcare)         |

### Combined Insights

Together, Neha, Vikram, Ananya, and Dadi represent **four critical ecosystem roles**:
- **Neha** decides to *start* (safety, ease of use, child engagement)
- **Vikram** decides to *continue* (learning proof, curriculum value, data)
- **Ananya** decides to *recommend* (convenience, reliability, viral growth)
- **Dadi** enables *daily usage* (grandparent caregiver, 9 AM - 5 PM coverage)

**Coverage Gaps Identified**:

| Area | Neha | Vikram | Ananya | Dadi | Status |
|------|------|--------|--------|------|--------|
| Time tracking | ✅ | — | — | — | Implemented |
| Struggle visibility | ✅ | — | — | — | Implemented |
| Export/sharing | ✅ | ✅ | ✅ | — | Implemented |
| Privacy indicators | ✅ | — | — | — | Implemented |
| **i18n Infrastructure** | — | — | — | ✅ | **DONE** (TCK-20260223-011) |
| Guest mode | — | — | 🔴 | 🔴 | **P0 Gap** |
| Offline mode | — | — | 🔴 | — | **P0 Gap** |
| UPI payment | — | — | 🔴 | — | **P0 Gap** |
| Hindi UI translation | — | — | — | 🟡 | In Progress (core) |
| "Dadi Mode" (one button) | — | — | — | 🔴 | **P0 Gap** |
| Large text mode | — | — | — | 🔴 | **P0 Gap** |
| Pre-approved camera | — | — | — | 🔴 | **P0 Gap** |
| Skill breakdown charts | — | 🔴 | — | — | Pending |
| Curriculum alignment | — | 🔴 | — | — | Pending |
| Competitive benchmarking | — | 🔴 | — | — | Pending |
| Automated weekly reports | — | 🔴 | — | — | Pending |
| Crash stability | — | — | 🔴 | — | **P0 Gap** |

**Priority Matrix**:
- ✅ **COMPLETED**: i18n Infrastructure (15 languages, lazy loading, RTL support) — TCK-20260223-011
- **P0 (Critical)**: Hindi UI translation, "Dadi Mode", Large text mode, Pre-approved camera (Dadi blockers)
- **P0 (Immediate)**: Guest mode, Offline mode, UPI payment, Crash fixes (Ananya blockers)
- **P1 (Short-term)**: Skill breakdown, Curriculum alignment, Weekly reports (Vikram retention)
- **P2 (Medium-term)**: Competitive benchmarking, Timed session mode, Gesture guardrails (Nice-to-have)

---

## Next Interview Recommendation

**Recommended**: Ms. Deepa — The Preschool Teacher

**Rationale**:

- B2B channel not yet validated (₹100/student/year pricing)
- Different use case: 25 children, 1 tablet, 45-minute activity periods
- Institutional requirements vs. parent needs
- Bulk reporting for parent-teacher meetings
- Currently have 4 parent/caregiver perspectives — need institutional view

**Suggested Focus Area**:
- Classroom mode: Quick-switch roster (25 profiles, no login per child)
- Bulk progress reports ("15 of 25 mastered letter tracing")
- Offline-first (school WiFi unreliable)
- Audio fallback (visual instructions for noisy classrooms)
- Curriculum mapping (NCERT/NEP learning outcomes for credibility)

**Alternative**: Kabir — The Competitive Learner (Child)
- Upper age boundary (7y 3m) — biggest churn risk
- "Babyish" UI feedback (will tell father "this is boring")
- Needs challenge/mastery validation
- Different from toddler personas (Aarav, Meera)
- Would validate age-adaptive UI needs

**Alternative**: Riya — The Parenting Micro-Influencer
- Growth channel validation (₹80-120 CAC)
- Shareable content requirements
- Referral program needs
- Authenticity concerns (will share broken features publicly)

---

### 5. Dr. Meera Sharma — Child Psychologist & Developmental Specialist

**Date**: 2026-02-23  
**Status**: ✅ COMPLETED  
**Full Transcript**: `docs/personas/CHILD_PSYCHOLOGIST_Dr_Meera_Sharma.md`

#### Profile

- **Age**: 42
- **Location**: Mumbai, India
- **Occupation**: Child Psychologist / Developmental Specialist
- **Experience**: 15 years in child development, digital learning tools researcher
- **Current Role**: Consultant for ed-tech startups, runs child development clinic
- **Primary Concern**: Cognitive load, developmental appropriateness, screen time impact
- **Key Trait**: Evaluates apps through lens of developmental psychology and cognitive science

#### Interview Focus Area

- Cognitive load assessment during gameplay
- Dopamine/reward system analysis
- Developmental appropriateness by age group
- Physical development via hand-tracking games
- Sensory sensitivity considerations

#### Key Findings

| Severity   | Finding                              | Impact                                                   |
| ---------- | ------------------------------------ | -------------------------------------------------------- |
| 🔴 HIGH    | Celebration cognitive overload       | 4+ simultaneous sensory inputs dilute learning           |
| 🔴 HIGH    | No Calm Mode for sensory sensitivity | Children shut down with bright/fast stimuli              |
| 🔴 HIGH    | Age ranges too broad (2-8 years)     | 2yo and 8yo are cognitively completely different         |
| 🔴 HIGH    | Extrinsic rewards undermine motivation | Stars create dopamine loops, reduce intrinsic drive    |
| 🟡 MEDIUM  | No adaptive difficulty               | Static Easy/Medium/Hard doesn't respond to performance   |
| 🟡 MEDIUM  | Missing SEL opportunities            | No emotional coaching during failures                    |
| 🟡 MEDIUM  | Parents as administrators only       | Missing co-learner features, conversation starters       |
| ✅ POSITIVE| Hand-tracking supports physical dev  | Active movement vs passive screen time                   |

#### Top Recommendations

**P0 (Immediate)**:
1. **Calm Mode** — Muted colors, slower animations, no background music for sensory-sensitive children
2. **Reduce Celebration Overload** — Sequence celebrations (animation → wait 1s → voice), not simultaneous
3. **Split Age Categories** — "Early Explorers (2-3)", "Little Learners (4-5)", "Big Kids (6-8)"

**P1 (Medium-term)**:
4. **Adaptive Difficulty** — Auto-adjust based on success/failure patterns
5. **Reduce Extrinsic Rewards** — Option to hide stars, focus on process praise
6. **SEL Integration** — Emotional coaching: "It's okay to feel frustrated"

**Leverage (Marketing)**:
7. **Market "Active Screen Time"** — Hand-tracking games require movement, unlike passive apps

#### Critical Insight

> *"Stars and rewards create dopamine loops. Children play for the reward, not the learning. That's addiction, not education."*

> *"The hand-tracking is brilliant. Most screen time is passive. This is active. That's developmentally appropriate."*

> *"Where's the 'Calm Mode'? Some children shut down with bright colors and fast sounds. You're losing them."*

#### Related Worklog Tickets

- TCK-20260223-013: Implement Calm Mode for Sensory-Sensitive Children
- TCK-20260223-014: Reduce Celebration Cognitive Overload
- TCK-20260223-015: Add Adaptive Difficulty System
- TCK-20260223-016: Split Age Categories (2-3, 4-5, 6-8)

---

## Priority Matrix (All Personas)

### P0 Critical (Implement Next)

| Finding | Source | Ticket |
|---------|--------|--------|
| Calm Mode for sensory sensitivity | Dr. Sharma | TCK-20260223-013 |
| Reduce celebration cognitive overload | Dr. Sharma | TCK-20260223-014 |
| Guest mode for instant play | Ananya | TCK-20260223-008 |
| Offline mode for Tier 2/3 | Ananya | TCK-20260223-008 |
| Hindi UI full translation | Dadi | TCK-20260223-012 (partial) |
| UPI payment option | Ananya | TCK-20260223-008 |
| App crash stability | Ananya | TCK-20260223-008 |
| Dadi Mode (one-button interface) | Dadi | — |

### P1 Important (Schedule Soon)

| Finding | Source | Ticket |
|---------|--------|--------|
| Adaptive difficulty system | Dr. Sharma | TCK-20260223-015 |
| Split age categories (2-3, 4-5, 6-8) | Dr. Sharma | TCK-20260223-016 |
| Skill breakdown with trends | Vikram | TCK-20260223-007 |
| Weekly automated reports | Vikram | TCK-20260223-007 |
| Curriculum alignment tags | Vikram | TCK-20260223-007 |
| WhatsApp share integration | Ananya | TCK-20260223-008 |
| Reduce extrinsic rewards option | Dr. Sharma | — |

### P2 Nice-to-Have

| Finding | Source |
|---------|--------|
| SEL emotional coaching | Dr. Sharma |
| Parent co-learner features | Dr. Sharma |
| Percentile benchmarking | Vikram |
| CSV export for data parents | Vikram |
| Competitive multiplayer | Kabir (future persona) |

---

## Remaining Persona Candidates

### Ms. Deepa — The School Teacher

- **Segment**: Primary school educators
- **Concern**: Classroom integration, bulk progress reports, curriculum alignment
- **Value**: B2B channel, credibility through school adoption
- **Suggested Area**: Teacher dashboard, class management, NCERT/NEP mapping

### Kabir — The Competitive Learner (Child, 7y)

- **Segment**: Upper age boundary, biggest churn risk
- **Concern**: "Babyish" UI, needs challenge, mastery validation
- **Value**: Validates age-adaptive UI needs
- **Suggested Area**: Challenge modes, leaderboards (appropriate), complexity scaling

### Riya — The Parenting Micro-Influencer

- **Segment**: Growth channel validation
- **Concern**: Shareable content, referral programs, authenticity
- **Value**: Viral growth, social proof
- **Suggested Area**: Share features, referral mechanics, content creation tools

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| **Interviews Completed** | 5 |
| **Total Findings** | 38 |
| **Total Recommendations** | 34 |
| **P0 Critical** | 19 |
| **P1 Important** | 15 |
| **Tickets Created** | 16 |
| **Features Implemented** | 7 |

---

*Last Updated: 2026-02-23*

---

### 6. Ms. Deepa — School Teacher (Grade 1-2, CBSE)

**Date**: 2026-02-24  
**Status**: ✅ COMPLETED  
**Full Transcript**: `docs/personas/TEACHER_Ms_Deepa.md`

#### Profile

- **Age**: 38
- **Location**: Bangalore, Karnataka
- **Occupation**: Primary School Teacher (Grade 1-2), Early Primary Coordinator
- **School**: CBSE-affiliated school
- **Experience**: 12 years teaching
- **Class Size**: 35 students, 8 shared tablets
- **Primary Concern**: Curriculum alignment (NCERT/NEP), classroom logistics
- **Key Trait**: Gateway to B2B adoption — parents trust her recommendations

#### Interview Focus Area

- Curriculum standard mapping (NCERT/NEP)
- Classroom constraints (offline, shared devices, noise)
- Teacher-usable progress tracking
- Inclusive education for learning differences

#### Key Findings

| Severity   | Finding                              | Impact                                                   |
| ---------- | ------------------------------------ | -------------------------------------------------------- |
| 🔴 CRITICAL| No curriculum standard mapping       | Teachers cannot recommend; no B2B credibility            |
| 🔴 HIGH    | Not designed for classroom use       | Needs offline mode, group mode, session timers           |
| 🔴 HIGH    | Progress data not teacher-usable     | Stars ≠ rubric assessment; no class analytics            |
| 🔴 HIGH    | Not inclusive for learning differences| 10-15% of children excluded (motor, language, attention) |
| 🟡 MEDIUM  | No teacher-parent communication      | Missed advocacy opportunity                              |
| 🟡 MEDIUM  | No teacher onboarding/support        | Low adoption when issues arise                           |
| 🟡 MEDIUM  | Positioned as "entertainment"        | Teachers view as "supplementary" not "serious learning"  |

#### Top Recommendations

**P0 (Critical - B2B Blockers)**:
1. **NCERT/NEP curriculum mapping** — Learning outcome tags on each activity
2. **Offline mode** — Cache lessons, sync when connected (school WiFi is unreliable)
3. **Classroom Mode** — Group/shared device support, quick profile switching

**P1 (High Priority)**:
4. **Teacher dashboard** — Class-level analytics, rubric-based assessment
5. **Inclusive Mode** — Larger touch targets, regional language UI, micro-lessons
6. **Printable reports** — One-page summaries for parent-teacher meetings

**Positioning**:
7. **"Teacher Approved" certification** — CBSE/NCERT partnership badge

#### Critical Insight

> *"If I can't tell parents 'this app teaches FLN Foundational Literacy standard 2.3(a),' then I can't recommend it. Parents trust me because I speak curriculum language."*

> *"I'd tell parents it's 'a fun supplementary activity' — not a serious learning tool. That's not what you want, right?"*

#### Documentation

- Persona file: `docs/personas/TEACHER_Ms_Deepa.md`
- Worklog tickets: TCK-20260224-017 through TCK-20260224-020

---

## Updated Priority Matrix (All Personas)

### P0 Critical (Implement Next)

| Finding | Source | Ticket |
|---------|--------|--------|
| Calm Mode for sensory sensitivity | Dr. Sharma | ✅ TCK-20260223-013 DONE |
| NCERT/NEP curriculum mapping | Ms. Deepa | TCK-20260224-017 |
| Offline mode for classroom/Tier 2-3 | Ananya + Ms. Deepa | TCK-20260223-008 |
| Guest mode for instant play | Ananya | TCK-20260223-008 |
| Hindi UI full translation | Dadi | TCK-20260223-012 (partial) |
| UPI payment option | Ananya | TCK-20260223-008 |
| Classroom mode (shared devices) | Ms. Deepa | TCK-20260224-018 |
| Reduce celebration overload | Dr. Sharma | TCK-20260223-014 |

### P1 Important (Schedule Soon)

| Finding | Source | Ticket |
|---------|--------|--------|
| Teacher dashboard | Ms. Deepa | TCK-20260224-019 |
| Inclusive mode (accessibility) | Ms. Deepa | TCK-20260224-020 |
| Adaptive difficulty | Dr. Sharma | TCK-20260223-015 |
| Split age categories (2-3, 4-5, 6-8) | Dr. Sharma | TCK-20260223-016 |
| Skill breakdown with trends | Vikram | TCK-20260223-007 |
| Weekly automated reports | Vikram | TCK-20260223-007 |

---

## Summary Statistics (Updated)

| Metric | Count |
|--------|-------|
| **Interviews Completed** | 6 |
| **Total Findings** | 45 |
| **Total Recommendations** | 41 |
| **P0 Critical** | 22 |
| **P1 Important** | 19 |
| **Tickets Created** | 20 |
| **Features Implemented** | 7 |

### Persona Coverage

| Stakeholder | Persona | Status | Key Contribution |
|-------------|---------|--------|------------------|
| Parent (Safety) | Neha | ✅ Done | Privacy, time limits, progress visibility |
| Parent (Data) | Vikram | ✅ Done | Metrics, curriculum alignment, reports |
| Parent (Working) | Ananya | ✅ Done | Guest mode, offline, UPI, viral features |
| Guardian (Non-tech) | Dadi | ✅ Done | Hindi UI, accessibility, simplicity |
| Expert (Psychology) | Dr. Sharma | ✅ Done | Calm Mode, cognitive load, development |
| Educator (Teacher) | Ms. Deepa | ✅ Done | Curriculum mapping, B2B, classroom use |

### Remaining Personas

1. **Kabir — The Competitive Learner (Child, 7y)**
   - Upper age boundary, biggest churn risk
   - Needs: Challenge, mastery validation, "not babyish" UI

2. **Riya — The Parenting Micro-Influencer**
   - Growth channel validation
   - Needs: Shareable content, referral programs, authenticity

---

*Last Updated: 2026-02-24*
