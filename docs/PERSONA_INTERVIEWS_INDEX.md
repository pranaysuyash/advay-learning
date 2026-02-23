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

**Total Interviews Completed**: 3  
**Total Findings Documented**: 21  
**Total Recommendations**: 19 (11 P0, 8 P1)

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
| 4   | TBD                                | TBD                      | 🔜 NEXT | —          |

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

## Interview Insights Comparison

### Combined Persona Insights — Three Perspectives

| Aspect              | Neha (Safety-First)                     | Vikram (Data-Driven)                 | Ananya (Working Mom)                    |
| ------------------- | --------------------------------------- | ------------------------------------ | --------------------------------------- |
| **Primary Focus**   | Safety, privacy, screen time            | Learning metrics, ROI, curriculum    | Convenience, independent play, price   |
| **Dashboard Needs** | Time tracking, daily limits             | Trend charts, skill breakdowns       | Simple status (safe/learning/playing)  |
| **Onboarding**      | Wants privacy explanation               | Wants curriculum alignment proof     | **Needs guest mode** — 5+ min = drop   |
| **Payment**         | Secure, transparent pricing             | Justified by data vs tuition         | **UPI required**, price-sensitive      |
| **Trust Signals**   | Green dot, "video stays on device"      | Curriculum badges, accuracy slopes   | App doesn't crash, works offline       |
| **Churn Triggers**  | Privacy concerns, no time controls      | Flat data, no curriculum mapping     | **Crashes, no offline, complex setup** |
| **Key Decision**    | Converts trial → paid                   | Decides Month 3+ renewal             | Viral spread (200+ WhatsApp group)     |

### Combined Insights

Together, Neha, Vikram, and Ananya represent **three critical decision points**:
- **Neha** decides to *start* (safety, ease of use, child engagement)
- **Vikram** decides to *continue* (learning proof, curriculum value, data)
- **Ananya** decides to *recommend* (convenience, reliability, viral growth)

**Coverage Gaps Identified**:

| Area | Neha | Vikram | Ananya | Status |
|------|------|--------|--------|--------|
| Time tracking | ✅ | — | — | Implemented |
| Struggle visibility | ✅ | — | — | Implemented |
| Export/sharing | ✅ | ✅ | ✅ | Implemented |
| Privacy indicators | ✅ | — | — | Implemented |
| Guest mode | — | — | 🔴 | **P0 Gap** |
| Offline mode | — | — | 🔴 | **P0 Gap** |
| UPI payment | — | — | 🔴 | **P0 Gap** |
| Skill breakdown charts | — | 🔴 | — | Pending |
| Curriculum alignment | — | 🔴 | — | Pending |
| Competitive benchmarking | — | 🔴 | — | Pending |
| Automated weekly reports | — | 🔴 | — | Pending |
| Crash stability | — | — | 🔴 | **P0 Gap** |

**Priority Matrix**:
- **P0 (Immediate)**: Guest mode, Offline mode, UPI payment, Crash fixes (Ananya blockers)
- **P1 (Short-term)**: Skill breakdown, Curriculum alignment, Weekly reports (Vikram retention)
- **P2 (Medium-term)**: Competitive benchmarking, Timed session mode (Nice-to-have)

---

## Next Interview Recommendation

**Recommended**: Dadi — The Non-Tech Guardian

**Rationale**:

- Only caregiver persona not yet interviewed (grandparent vs. parent)
- Tests UI simplicity for non-English, non-tech users
- Validates Hindi UI translation effectiveness (62, Hindi-only)
- Critical for Indian market — grandparents often daytime caregivers
- Different use case entirely: "Tap here, game starts" — nothing else

**Suggested Focus Area**: 
- One-button interface test
- Hindi language support validation
- Error recovery (what happens when she accidentally taps Settings?)
- Camera permission flow (will always tap "Don't Allow" if in English)

**Alternative**: Ms. Deepa — The Preschool Teacher
- B2B channel validation (school pricing at ₹100/student/year)
- Classroom mode requirements (25 kids, 1 tablet)
- Bulk reporting needs
- Different from parent personas (logistics vs. emotional)

**Alternative**: Kabir — The Competitive Learner (Child)
- Upper age boundary (7y 3m) — retention risk
- "Babyish" UI feedback
- Needs challenge/mastery validation
- Different from toddler personas (Meera, Aarav)
