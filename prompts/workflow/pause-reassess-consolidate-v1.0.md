# Pause / Reassess / Consolidate Prompt v1.0

**Purpose**: Stop reactive changes, consolidate what’s known, and produce a clear, scoped next plan (with tickets) when things feel messy or uncertain.

**Use When**:
- Multiple partial fixes happened without confidence
- There’s disagreement about “what the real problem is”
- You feel context switching or scope creep starting
- You need to hand off cleanly

---

## Non-Negotiable Rules

1) No new code changes while running this prompt.
2) Evidence-first: Observed / Inferred / Unknown labels.
3) Append-only worklog updates: `docs/WORKLOG_TICKETS.md`.
4) One clear next work unit (or a small prioritized list) at the end.

---

## Step 1 — Snapshot the Current State (Observed)

If possible:
```bash
rg -n "TCK-\\d{8}-\\d{3}" docs/WORKLOG_TICKETS.md | tail -n 30
rg -n "OPEN|IN_PROGRESS|BLOCKED" docs/WORKLOG_TICKETS.md | tail -n 40
```

If git is available:
```bash
git status --porcelain
```

Record raw outputs.

---

## Step 2 — List Facts vs Assumptions

Create two lists:
- **Observed facts**: (what you saw in files/outputs)
- **Inferred/Unknown**: (what you suspect or can’t verify)

Do not upgrade Inferred to Observed.

---

## Step 3 — Consolidate Findings into Buckets

Group all issues/notes into buckets:
- Product/UX
- Frontend
- Backend
- Tests/CI
- Docs/Process
- Security/Privacy

For each bucket:
- What’s broken?
- What’s risky?
- What’s the smallest next experiment/fix?

---

## Step 4 — Identify the “One Thing” Bottleneck

Pick the single biggest blocker right now:
- Example: “backend tests failing”, “hand tracking mismatch”, “setup instability”

State why it’s the bottleneck and what it blocks.

---

## Step 5 — Propose a Minimal Next Plan

Output 1–3 next work units, each with:
- Scope contract (in/out)
- Acceptance criteria (3–7 bullets)
- Verification commands
- Recommended prompt to run next (planning/audit/hardening/etc.)

If more than 3 items, you are not being minimal—reduce.

---

## Step 6 — Worklog Update (Required)

Append to `docs/WORKLOG_TICKETS.md`:
- A short “pause/reassess” note under the relevant ticket(s), or
- A new TRIAGE ticket if the situation is ambiguous

Include:
- evidence outputs
- your chosen bottleneck
- next plan

---

## Output (Required)

1) Current state snapshot (evidence)
2) Observed vs Unknown list
3) Buckets summary
4) Bottleneck statement
5) Next 1–3 work units + which prompt to run

---

## Stop Condition

Stop after producing the next plan and updating the worklog. Do not implement fixes in this prompt.
