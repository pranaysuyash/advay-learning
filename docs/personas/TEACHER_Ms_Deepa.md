# Persona Interview: Ms. Deepa (School Teacher)

## Overview

**Interview Date:** 2026-02-24  
**Persona:** Primary School Teacher  
**Location:** Bangalore, Karnataka  
**Experience:** 12 years teaching, currently Grade 1-2 teacher at CBSE-affiliated school  
**Current Role:** Early primary coordinator, parent-teacher meeting facilitator  
**Context:** Evaluates apps for classroom use and recommends to parents

---

## Interview Transcript

### Opening

**Interviewer:** Ms. Deepa, thank you for speaking with us. As a teacher who works with young children daily, how do you evaluate educational apps for your students?

**Ms. Deepa:** For me, it's not about the app — it's about *learning outcomes*. I need to see a clear mapping to NCERT learning outcomes. If I can't tell parents "this app teaches FLN Foundational Literacy standard 2.3(a)," then I can't recommend it. Parents trust me because I speak curriculum language.

Also, I need to manage 35 children in a class. Whatever I recommend must work in *my* context — unreliable school WiFi, shared tablets, 40-minute periods. If the app needs high-speed internet or individual devices, it's useless for me.

---

### Curriculum Alignment

**Interviewer:** Can you show us how you'd check curriculum alignment in our app?

**Ms. Deepa:** [Opens app, navigates to Alphabet Tracing]

Okay, so I see "Alphabets" — but what does that *mean*? In NEP 2020, Foundational Literacy has specific competencies:
- Recognizes letters
- Associates sounds with letters
- Blends sounds to read CVC words
- Writes letters with correct strokes

Your app says "Letter B mastered" — but mastered *what*? Recognition? Sound association? Writing fluency? I need granular learning outcome tags.

Also, the sequence is wrong. You teach A-Z sequentially. NCERT recommends *phonics order* — s, a, t, p, i, n first because they make more words. Teaching A then B doesn't help children read "sat" or "pin."

**Finding #1: No Curriculum Standard Mapping**
- **Severity:** CRITICAL (B2B blocker)
- **Evidence:** Games show "Letter B ✓" without learning outcome granularity
- **Impact:** Teachers cannot recommend app to parents; no credibility in school ecosystem
- **Recommendation:** 
  - Add NCERT/NEP learning outcome tags to each activity
  - Show mapping: "This teaches FLN 2.3(a) — Letter-sound correspondence"
  - Provide teacher dashboard with curriculum-aligned progress reports
  - Offer phonics-based teaching sequence option

---

### Classroom Context

**Interviewer:** Tell us about using apps in your actual classroom.

**Ms. Deepa:** [Laughs] Ideal vs. reality. Ideal: Each child has a tablet, fast WiFi, quiet room. Reality: 

1. **WiFi is terrible.** School has 100Mbps shared across 500 students. Peak hours? Unusable. Apps need to work *offline*, sync when connected.

2. **Shared devices.** I have 8 tablets for 35 children. Children work in groups of 4-5. App needs "group mode" — multiple children can play sequentially without logging in/out each time.

3. **40-minute periods.** App needs to fit my lesson plan: 5 min intro, 20 min activity, 10 min assessment, 5 min wrap-up. I can't have children "just exploring" — I need structured sessions.

4. **Noise!** 35 children in a room. If the app gives voice instructions, child can't hear. Need visual instructions, captions, or headphone support.

**Finding #2: Not Designed for Classroom Constraints**
- **Severity:** HIGH
- **Evidence:** App assumes individual device, constant connectivity, unlimited time
- **Impact:** Cannot be used in schools — massive B2B opportunity lost
- **Recommendation:**
  - **Offline mode:** Cache lessons, sync progress when connected
  - **Group mode:** Quick-switch profiles without full login
  - **Session timers:** Teacher sets 20-min session, app auto-wraps up
  - **Visual-first instructions:** Don't rely on audio in noisy classrooms

---

### Assessment & Progress Tracking

**Interviewer:** How do you currently track student progress? Would our app's progress tracking help?

**Ms. Deepa:** I use a physical "Progress Register" — yes, pen and paper. Columns for each child, rows for each learning outcome. I tick when they achieve it.

Your app shows "stars" and "completion." I can't use that. I need:
- **Rubric-based assessment:** "Emerging / Developing / Proficient / Advanced"
- **Date of achievement:** When did Arjun master letter sounds?
- **Evidence:** Can I see his actual tracing attempts? His errors?
- **Export:** CSV I can import into my Progress Register

Also, I need *class-level* data, not just individual. "18 of 35 children are struggling with letter recognition" — that tells me to re-teach that concept.

**Finding #3: Progress Data Not Teacher-Usable**
- **Severity:** HIGH
- **Evidence:** Stars/completion metrics don't map to assessment rubrics
- **Impact:** Teachers maintain parallel tracking systems = extra work
- **Recommendation:**
  - Add teacher dashboard with class-level analytics
  - Rubric-based assessment (Emerging/Developing/Proficient/Advanced)
  - Show error patterns: "Common mistake: Confusing 'b' and 'd'"
  - Bulk export: CSV with child names, learning outcomes, dates achieved
  - "Ready for next level" indicator for each child

---

### Parent-Teacher Meetings

**Interviewer:** You mentioned parent-teacher meetings. How does the app fit there?

**Ms. Deepa:** Every month, I meet 35 sets of parents. They ask: "Is my child learning?" I show them my Progress Register. Some parents want "proof" the app is working.

Right now, I have nothing from your app I can show. I need:
1. **One-page summary:** Child's photo, achievements this month, areas to practice at home
2. **Home activities:** "Practice 's' and 'a' sounds this week. Play the 'Sound Hunt' game."
3. **Compare to class average:** "Your child is at class average for writing, above average for recognition"

If I had this, I'd print it and give to parents. They'd see me as tech-savvy, and they'd trust the app more.

**Finding #4: No Teacher-Parent Communication Bridge**
- **Severity:** MEDIUM-HIGH
- **Evidence:** No printable reports, no home practice assignments
- **Impact:** Missed opportunity for teacher advocacy; parents don't see value
- **Recommendation:**
  - "Send home" feature: Generate one-page PDF for parent-teacher meetings
  - Home practice assignments teachers can set
  - Class percentile ranking (anonymized)
  - "Teacher says" badge on progress — adds teacher credibility

---

### Inclusive Education

**Interviewer:** Do you have children with learning differences in your class?

**Ms. Deepa:** Of course. In a class of 35, 3-4 have some learning challenge — dyslexia, ADHD, slow processing. I also have 2 children who don't speak English at home.

Your app assumes:
- Child can hold pencil/tablet properly (some have motor delays)
- Child can understand English instructions
- Child can focus for 10+ minutes (ADHD children can't)

I need:
- **Larger touch targets** for motor delays
- **Regional language support** — Kannada instructions, not just content
- **Shorter activities** — 3-5 minute micro-lessons for short attention spans
- **Multiple input methods** — Some children type better than write

**Finding #5: Not Inclusive for Learning Differences**
- **Severity:** HIGH
- **Evidence:** Assumes typical motor, language, attention abilities
- **Impact:** 10-15% of children excluded; teacher can't use app for whole class
- **Recommendation:**
  - "Inclusive Mode" with larger touch targets (2x size)
  - Instruction language separate from content language (Kannada UI, English letters)
  - Micro-lesson format: 3-minute activities with clear endpoints
  - Alternative input: Tap instead of trace, voice instead of write

---

### Teacher Training & Support

**Interviewer:** If your school adopted this app, what would you need?

**Ms. Deepa:** Training! Not how to use the app — I can figure that out. I need:

1. **Pedagogy training:** "How to integrate this into your lesson plan"
2. **Troubleshooting guide:** "Child can't log in — what do I do?"
3. **Data interpretation:** "What do these progress graphs mean?"
4. **Parent communication templates:** "Here's how to explain this app to parents"

Also, I need a direct support channel. If I'm in class and the app isn't working, I can't wait 24 hours for email support. WhatsApp support group would be ideal — I can send screenshot, get quick fix.

**Finding #6: No Teacher Onboarding or Support**
- **Severity:** MEDIUM
- **Evidence:** No teacher training materials, no educator support channel
- **Impact:** Low adoption in schools; teachers abandon app when issues arise
- **Recommendation:**
  - Teacher onboarding kit: Lesson plan integration guide
  - Troubleshooting FAQ for common classroom issues
  - WhatsApp support group for teachers
  - Monthly webinar: "Best practices for using Advay in your classroom"

---

### The Trust Question

**Interviewer:** What would make you *recommend* this app to every parent in your class?

**Ms. Deepa:** Three things:

1. **Curriculum credibility:** I can show parents "This teaches exactly what CBSE requires."

2. **Time savings:** It reduces my workload, not adds to it. If I can export progress data instead of maintaining my Register manually, that's value.

3. **Inclusive:** Works for *all* my children — the fast learners, the struggling ones, the ones with learning differences.

Right now? [Pauses] I'd tell parents it's "a fun supplementary activity" — not a serious learning tool. That's not what you want, right?

**Finding #7: App Positioned as "Entertainment" Not "Education"**
- **Severity:** CRITICAL (Positioning problem)
- **Evidence:** Teacher views app as "fun supplementary" not "serious learning"
- **Impact:** Teachers won't advocate; low perceived value
- **Recommendation:**
  - Get curriculum alignment certification (CBSE/NCERT partnership badge)
  - Teacher testimonials on homepage
  - "Teacher Approved" badge with verification
  - Position as "curriculum companion" not "learning game"

---

## Summary: Ms. Deepa's Top Recommendations

| Priority | Finding | Fix Complexity | B2B Impact |
|----------|---------|----------------|------------|
| P0 | Curriculum standard mapping (NCERT/NEP) | Medium | Critical |
| P0 | Offline mode for classroom use | High | Critical |
| P1 | Teacher dashboard with class analytics | Medium | High |
| P1 | Group mode for shared devices | Medium | High |
| P1 | Inclusive mode (accessibility) | Medium | High |
| P2 | Teacher-parent communication tools | Low | Medium |
| P2 | Teacher training & WhatsApp support | Low | Medium |
| Positioning | "Teacher Approved" certification | Medium | Critical |

---

## Key Quotes

> *"If I can't tell parents 'this app teaches FLN Foundational Literacy standard 2.3(a),' then I can't recommend it."*

> *"I have 8 tablets for 35 children. App needs 'group mode' — multiple children can play sequentially without logging in/out each time."*

> *"Your app shows 'stars' and 'completion.' I can't use that. I need rubric-based assessment: 'Emerging / Developing / Proficient / Advanced.'"*

> *"I'd tell parents it's 'a fun supplementary activity' — not a serious learning tool. That's not what you want, right?"*

---

## Evidence Artifacts

- **Observed**: App shows "Letter B mastered" without learning outcome granularity
- **Observed**: No NCERT/NEP curriculum tags visible
- **Observed**: App assumes individual device, constant connectivity
- **Observed**: Progress metrics (stars) don't map to teacher assessment rubrics
- **Observed**: No class-level analytics for teachers
- **Inferred**: 10-15% of children likely excluded due to accessibility assumptions

---

## Related Tickets

- **TCK-20260224-017**: Add NCERT/NEP Curriculum Mapping
- **TCK-20260224-018**: Implement Classroom Mode (Group/Shared Devices)
- **TCK-20260224-019**: Create Teacher Dashboard with Class Analytics
- **TCK-20260224-020**: Add Inclusive Mode for Learning Differences
