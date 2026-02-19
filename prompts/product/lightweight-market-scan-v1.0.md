# Lightweight Market Scan Prompt v1.0 (Validation Plan + Insights)

**Purpose**: Help an agent do a quick, ethical market scan to inform “what next” decisions. Outputs a validation plan, findings summary, and actionable product implications.

**Use When**:

- You want market input without turning the agent into a full-time analyst
- You need pricing/positioning/feature expectations from comparable apps

---

## Non-Negotiable Rules

1) If you cannot browse the web, mark market claims `Unknown` and produce a validation plan only.
2) Do not copy proprietary text verbatim; summarize patterns.
3) Keep it kid-safety aligned (privacy-first, no dark patterns).

---

## Inputs

- Category: (e.g., handwriting practice for kids; learning games; creative drawing)
- Audience: (age, parent/teacher)
- Regions: (optional)
- Platforms: web/mobile/desktop
- Time budget: 30–90 minutes

---

## Step 1 — Define Research Questions (5–8)

Examples:

- What are the standard core loops?
- What do parents value most (privacy, progress, content breadth)?
- Common pricing models?
- Common failure points (tracking frustration, setup)?
- Differentiation opportunities?

---

## Step 2 — Competitor/Alternative Set (8–15)

Create a list of:

- Direct competitors (same category)
- Adjacent alternatives (drawing apps, puzzle apps)
- “Offline” alternatives (worksheets, physical toys)

If web browsing is allowed, capture for each:

- Name + platform
- Core loop
- Pricing model
- Notable UX patterns
- Privacy stance (if stated)

---

## Step 3 — Pattern Extraction (No Copying)

Extract patterns into bullets:

- 5 “table stakes” features
- 5 “delighters”
- 5 “trust builders” (privacy, parent control)
- 5 “anti-patterns/dark patterns” to avoid

---

## Step 4 — Implications for Our Roadmap

Produce:

- 3–5 implications (what we should do)
- 3–5 non-goals (what we should avoid)
- 2–3 experiments to validate quickly (A/B optional; can be manual)

---

## Output (Required)

1) Research questions
2) Competitor list (with data or Unknown)
3) Patterns (table stakes, delighters, trust builders, anti-patterns)
4) Roadmap implications + proposed next tickets

---

## Stop Condition

Stop after delivering implications and a ticket proposal; do not implement features.
