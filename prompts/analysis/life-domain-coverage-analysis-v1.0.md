# Life Domain Coverage Analysis Prompt v1.0

**Purpose:** Reusable prompt for any AI agent to perform a comprehensive "complete life learning map" analysis on a product/platform — mapping ALL domains of human experience against what the product covers, plans to cover, and is blind to.

**Use when:** You want to understand the full scope of what your product COULD be, not just what it IS.

**How to use:** Copy the prompt below and provide it to any AI agent (Claude, GPT, Gemini, Codex, etc.) along with your project context.

---

## THE PROMPT

```
You are performing a Complete Life Domain Coverage Analysis on a product/platform. The goal is to map EVERY area of human life, learning, and experience that the product's technology could serve — then identify what's built, planned, explored, and completely missing.

## Your Task

1. **Understand the product's core technology and vision.** Read any provided docs, code, or context to understand what the product does and what technology it uses (e.g., computer vision, audio processing, touch, AR, AI).

2. **Map ALL domains of human life** that the technology could digitize. Don't limit yourself to what the product currently targets. Think about:
   - Every age group (toddler → child → teen → adult → elderly)
   - Every life context (home, school, work, play, health, social, cultural)
   - Every developmental domain (cognitive, physical, emotional, social, creative, practical)
   - Every real-world activity that involves the body, hands, face, voice, or movement

3. **Use this comprehensive domain framework** (adapt/extend as needed):

   **ACADEMIC / COGNITIVE**
   - Literacy & Language (reading, writing, phonics, vocabulary, storytelling, sign language, second languages, public speaking)
   - Mathematics (counting, operations, measurement, geometry, money, time, data, estimation)
   - Science (physics, chemistry, biology, ecology, astronomy, weather, scientific method)
   - Logic & Problem-Solving (sequencing, classification, puzzles, coding concepts, strategy, debugging)

   **PHYSICAL & MOTOR**
   - Fine Motor (pinch grip, tracing, tool use, tying, buttoning, pouring, threading)
   - Gross Motor (balance, jumping, throwing, catching, crawling, stretching, coordination)
   - Sports & Athletics (martial arts, dance, swimming strokes, ball sports, gymnastics, athletic form)
   - Physical Therapy / Rehabilitation (hand therapy, ROM exercises, balance rehab, ergonomics)

   **CREATIVE & ARTISTIC**
   - Visual Arts (drawing, painting, sculpture, photography, origami, art history)
   - Music (rhythm, instruments, pitch, singing, composition, notation, cultural music)
   - Performing Arts (dance, acting, mime, puppetry, magic, storytelling performance)

   **SOCIAL & EMOTIONAL**
   - Emotional Intelligence (emotion recognition, expression, empathy, self-regulation, confidence, frustration tolerance, gratitude)
   - Social Skills (turn-taking, sharing, greetings, conversation, conflict resolution, teamwork, leadership)
   - Mindfulness & Mental Health (breathing, meditation, body scan, stress relief, sleep routines, positive affirmations)

   **LIFE SKILLS & SELF-CARE**
   - Personal Hygiene (tooth brushing, hand washing, bathing, grooming)
   - Dressing (weather-appropriate, shoe tying, buttoning, sequence)
   - Cooking & Kitchen (recipes, measuring, food groups, kitchen safety, table setting)
   - Home & Organization (cleaning, organizing, bed making, responsibility)

   **SAFETY & AWARENESS**
   - Road safety, fire safety, water safety, stranger awareness, internet safety, first aid, emergency numbers, body autonomy, disaster drills

   **CULTURAL & HERITAGE**
   - Festivals, traditional dances, classical music, regional languages, traditional art, mythology, cultural greetings, food culture, historical figures

   **NATURE & ENVIRONMENT**
   - Plant life, animals, weather, recycling, conservation, ecosystems, gardening, stargazing, seasons

   **FINANCIAL LITERACY**
   - Coin recognition, counting money, making change, saving vs spending, needs vs wants, budgeting, entrepreneurship

   **COMMUNICATION & PRESENTATION**
   - Eye contact, body language, voice projection, storytelling, active listening, giving instructions, asking questions

   **TECHNOLOGY & DIGITAL LITERACY**
   - Coding concepts, typing, digital citizenship, how computers work, robotics

   **OCCUPATIONS & CAREER AWARENESS**
   - Doctor, chef, firefighter, pilot, farmer, artist, musician, scientist, builder, teacher, astronaut, veterinarian

   **ETHICS, VALUES & CHARACTER**
   - Honesty, kindness, fairness, responsibility, patience, perseverance, environmental responsibility

   **TIME, PLANNING & EXECUTIVE FUNCTION**
   - Daily routines, time awareness, planning ahead, task sequencing, prioritization, goal setting, delayed gratification

4. **For each sub-domain, classify:**
   - ✅ **Covered** (2+ implemented features/games)
   - 🟡 **Partially covered** (1 feature or surface-level)
   - 🔵 **In plans/docs** (conceived but not built)
   - 🔴 **MISSING** (not conceived at all)

5. **Generate a coverage summary** showing:
   - Total sub-areas analyzed
   - % covered vs missing
   - The biggest blind spots (entire domains with zero coverage)
   - A visual progress bar

6. **Add your own ideas** for the missing areas. For each new idea:
   - Name it
   - Describe the concept in one sentence
   - Explain how the product's existing technology enables it
   - Rate feasibility (Easy / Medium / Hard)

7. **Identify the Top 10 highest-impact new ideas** — things that:
   - Fill the biggest gaps
   - Are uniquely enabled by the product's technology
   - Would have the most real-world value for users
   - Haven't been thought of before

8. **State the vision** in one sentence: what is this product REALLY about at its fullest potential?

## Output Format

Structure your output as a markdown document with:
- Executive summary (vision statement + honest coverage %)
- Domain-by-domain tables with status columns
- Gap analysis with blind spots highlighted
- Your new ideas list
- Top 10 recommendations
- A "what's next" section

## Key Principles

- **Be exhaustive.** Map MORE domains than you think are relevant. The point is to find what's been overlooked.
- **Be honest.** Don't inflate coverage. If only one feature touches a domain, it's "partial" not "covered."
- **Think beyond the current user.** If the product serves kids, also think about what it could do for adults, elderly, people with disabilities.
- **Think beyond the current context.** If it's an education app, also think about therapy, sports training, safety, culture.
- **Bring your own ideas.** The most valuable part of this analysis is the ideas YOU generate that nobody on the team has thought of.
- **Prioritize real-world impact.** A shoe-tying trainer or hand-washing game might matter more than another alphabet game.
```

---

## Adaptation Notes

- **For non-CV products:** Replace the physical/motor domains with whatever your product's technology enables (e.g., for an audio app, focus on listening, music, language, accessibility)
- **For B2B products:** Replace life domains with business domains (operations, sales, HR, compliance, etc.)
- **For health products:** Expand the therapy/rehabilitation and mental health sections significantly
- **For cultural products:** Expand heritage, languages, and regional content sections

---

## Example Usage

### For this project (Advay Vision Learning):
```
[Paste the prompt above]

Context: This is a children's learning platform that uses computer vision (hand tracking, face tracking, pose tracking) via MediaPipe in the browser. Kids interact with games using their hands, body, and face through a webcam. Currently 21 games implemented, 270+ ideas in docs.

Please read these files for context:
- docs/COMPLETE_GAMES_UNIVERSE.md
- src/frontend/src/pages/Games.tsx
- docs/GAME_IDEAS_CATALOG.md
```

### For a music learning app:
```
[Paste the prompt above]

Context: This is a music learning platform that uses microphone input for pitch detection and rhythm analysis. Currently teaches piano and guitar basics. What domains of human musical experience are we missing?
```

### For a fitness/wellness app:
```
[Paste the prompt above]

Context: This is a fitness app using phone camera for pose estimation during workouts. Currently supports 50 exercises. What domains of physical wellness and rehabilitation are we missing?
```

---

**Version:** 1.0
**Created:** 2026-02-22
**Author:** Amp Agent (Life Domain Coverage Analysis)
