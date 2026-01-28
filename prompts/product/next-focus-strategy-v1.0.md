# Next Focus Strategy Prompt v1.0 (Market + Audience + Repo Reality)

**Purpose**: Recommend what to work on next using a blend of:
- product thinking (audience, personas, value prop, SWOT)
- market awareness (alternatives, differentiation, risks)
- repo reality (current capabilities, constraints, technical debt)

**Use When**:
- Founder asks “what next?”
- Roadmap feels unclear or overly code-driven
- You need to pick 1–3 high-leverage bets for the next sprint

---

## Inputs

- Product context: kids learning app; local-first; camera-based interactions (if enabled)
- Target audience location/culture (optional):
- Age range focus: (e.g., 3–8)
- Platforms: (web only vs desktop/mobile later)
- Constraints: privacy/COPPA posture, offline-first, budget/time
- Current repo reality: summarize what exists and what’s broken (Observed evidence if possible)

---

## Non-Negotiable Rules

1) Do not invent market facts. If you can’t research, mark as `Unknown` and propose how to validate.
2) Don’t recommend features that violate privacy policy (see `docs/security/SECURITY.md`).
3) Output must end with 1–3 concrete next bets + a ticketing plan.

---

## Step 1 — Baseline “Repo Reality” (Observed)

If you can run commands, capture:
- what features exist (pages/modules)
- what’s broken (failing tests, flaky tracking)
- biggest tech debt items blocking iteration

Required evidence block (if possible):
```bash
ls -la docs
rg -n "TODO|FIXME|HACK" -S src docs prompts || true
```

---

## Step 2 — Audience & Personas (2–3)

Create 2–3 personas, each with:
- Who: (child/parent)
- Context: (home learning, school supplement, special needs, multilingual)
- Jobs-to-be-done: (what success looks like)
- Pain points: (attention span, frustration, setup complexity)
- Key constraints: (privacy, time caps, device availability)

---

## Step 3 — SWOT (Product-Level)

Create a simple SWOT table for *this product* (not the repo).
- Strengths: e.g., local-first privacy, camera play, multilingual
- Weaknesses: e.g., reliability, content breadth, setup friction
- Opportunities: e.g., parent dashboards, differentiated creative play
- Threats: e.g., existing learning apps, trust/privacy concerns

If you lack evidence for any item, label it `Inferred` or `Unknown`.

---

## Step 4 — Market Alternatives (Lightweight)

Without heavy research, list 5–10 “alternatives” categories:
- school apps, handwriting apps, puzzle apps, creative drawing apps, etc.

Then define **positioning**:
- “For <persona>, who <need>, our product is a <category> that <unique benefit>.”

If web research is allowed, propose a 30-minute validation plan:
- keywords to search
- what to extract (pricing, core loops, differentiation)

---

## Step 5 — Candidate Bets (Generate 6–10)

Brainstorm 6–10 possible next focus areas across:
- Reliability (tracking stability, tests green)
- Core learning loop improvements (scoring, adaptive difficulty)
- Content expansion (numbers, puzzles, creative)
- Parent controls (time caps, exports)
- UX improvements (onboarding, calibration)

For each bet, score:
- Impact (1–5)
- Effort (1–5)
- Risk (1–5)
- Confidence (1–5)
- Privacy risk (LOW/MED/HIGH)

---

## Step 6 — Choose 1–3 Next Bets + Define Success

Pick the top 1–3 bets and define:
- Success metric (observable)
- User-facing outcome
- Minimum viable scope (1 sprint)
- “Not doing” list (explicit)

---

## Step 7 — Convert into Work Tickets (Repo-Native)

Create:
- 1 “epic” ticket (optional)
- 2–5 implementation tickets with:
  - explicit file targets (if known)
  - acceptance criteria
  - verification steps

Append to `docs/WORKLOG_TICKETS.md` using `prompts/workflow/worklog-v1.0.md`.

---

## Output (Required)

1) Repo reality summary (Observed/Inferred/Unknown)
2) Personas (2–3)
3) SWOT
4) Positioning statement
5) Bets table (6–10 with scores)
6) Top 1–3 recommendations (with success metrics)
7) Ticket plan (IDs to create + prompt to run next)

---

## Stop Condition

Stop after producing the 1–3 next bets and a ticket plan. Do not implement features in this prompt.
