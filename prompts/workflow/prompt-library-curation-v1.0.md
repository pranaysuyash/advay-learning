# Prompt Library Curation Prompt v1.0

**Purpose**: Upgrade/add prompts to this repo using external prompt libraries as inspiration, while avoiding verbatim copying and enforcing this repo’s workflow (evidence-first, scope discipline, append-only worklog).

**Use When**:
- You want to create a new prompt file in `prompts/`
- You found a good prompt online and want an equivalent “repo-native” version
- You want to refactor an existing prompt to be clearer/more reliable

---

## Non-Negotiable Rules

1) **No verbatim imports** from external prompt libraries. Use them only as inspiration for structure and techniques.
2) **Repo-native conventions**:
   - Worklog is canonical: `docs/WORKLOG_TICKETS.md` (append-only).
   - Evidence-first labels: Observed / Inferred / Unknown.
   - Scope discipline: one work unit per prompt or per change.
3) **Preservation-first**: improve existing prompts instead of creating parallel versions.

---

## Step 1 — Select Target + Work Type

Choose one:
- New prompt (add file)
- Prompt refactor (update one file)
- Prompt index only (update `prompts/README.md`)

Write a scope contract:
- In-scope:
- Out-of-scope:
- Behavior change allowed: N/A (prompts/docs only)

---

## Step 2 — Extract Patterns (Not Words)

From the external source(s), extract only *patterns* such as:
- “Role / Goal / Inputs / Constraints / Output format”
- “Gating checklist before execution”
- “Rubric-based self-check”
- “Stop conditions”
- “Test-case driven verification”

Do NOT copy:
- long phrasing
- full templates
- unique examples that look like the source

---

## Step 3 — Draft the Repo-Native Prompt

Prompts should be:
- Clear about when to use it
- Deterministic about required outputs
- Explicit about stop conditions

Recommended structure:
1) Purpose
2) Use When
3) Non-negotiable rules
4) Preconditions (if any)
5) Steps (1..N) with required commands where applicable
6) Output format (required sections)
7) Stop condition

---

## Step 4 — Add a Quality Gate Section

Every new/updated prompt should include:
- A small rubric: “PASS if …”
- A minimal “evidence block” requirement (commands + outputs)
- A “don’t do” list (e.g., no scope creep, no parallel versions, no stray files)

If you don’t want a rubric per prompt, ensure the prompt references:
`prompts/workflow/prompt-quality-gate-v1.0.md`

---

## Step 5 — Index + Worklog

1) Update `prompts/README.md` to include the new prompt.
2) Append a worklog ticket:
   - what you added/changed
   - why
   - evidence (file list + links)

Evidence commands (examples):
```bash
ls -la prompts/<category>/<file>.md
rg -n "<file>.md" prompts/README.md
```

---

## Output (Required)

- Files added/changed
- Prompt(s) purpose summary (1–2 lines each)
- How it avoids verbatim copying (1 line)
- Worklog ticket ID + status

---

## Stop Condition

Stop when the prompt is added/updated, indexed, and recorded in the worklog with evidence.
