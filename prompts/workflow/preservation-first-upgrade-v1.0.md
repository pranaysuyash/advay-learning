# Preservation-First Upgrade Prompt v1.0

**Purpose**: Prevent “parallel re-implementations” (e.g., `*_v2` files) and ensure upgrades/refactors improve existing code instead of spawning competing versions.

**Use When**:

- You are asked to “improve”, “refactor”, “rewrite”, “optimize”, or “upgrade” something
- You see an agent created a second implementation rather than updating the original

---

## Non-Negotiable Rules

1) **Single source of truth**: there should be exactly one canonical implementation per feature/module.
2) **Preservation first**: keep contributor code unless clearly inferior; prefer incremental refactor.
3) **No shadow copies**: do not create `Foo_v2.ts`, `new_main.py`, `copy_of_*` as a “better version”.
4) **Evidence-first**: claims must be Observed / Inferred / Unknown.
5) **Scope discipline**: one hardening scope or one remediation scope per work unit.

---

## Step 1 — Find the Canonical Code (Mandatory)

Before writing anything:

```bash
rg -n "<feature name>|<component name>|<endpoint>" -S src docs
find src -maxdepth 6 -type f | sort
```

Identify:

- The canonical file(s)
- The public entrypoints (routes/components/imports)
- Existing tests/specs/docs that already define expected behavior

If you cannot find canonical code, STOP and write a short “Unknown” section + ask for the intended target.

---

## Step 2 — Decide the Upgrade Strategy (Pick One)

### A) In-place refactor (preferred)

Use when behavior should remain equivalent.

- Change the existing file(s)
- Keep exported APIs stable
- Add tests around the refactor boundary

### B) Rename/move (allowed, but explicit)

Use when the file location is wrong.

- Use a single rename/move
- Update all imports/references
- Record rationale (“single source of truth moved to X”)

### C) Replace-with-bridge (rare, for major redesign)

Use when the old structure blocks progress.

- Keep the existing entrypoint
- Implement the new core behind it
- Deprecate old code path with a clear migration note
- Add tests that prove equivalence for critical flows

**Never**: create a second version file as the new “candidate”.

---

## Step 3 — If You Encounter Duplicate Implementations

When multiple variants exist (e.g., `Game.tsx` and `Game_v2.tsx`):

1) Determine which is referenced by the app (Observed via imports/routes).
2) Select **one** to be canonical.
3) Merge the best parts *into the canonical file* (preserve useful logic).
4) Remove or quarantine the duplicate only if:
   - it is not referenced anywhere, and
   - you record evidence, and
   - you explain why it is safe to remove.

If removal is risky, keep it but move it to an explicit quarantine folder:

- `docs/audit/` (if it’s audit artifact)
- `docs/notes/` (if it’s a doc) (create folder only if already used)
- Otherwise: leave it, but open a ticket to resolve it

---

## Step 4 — Guardrails for “Upgrades”

### Behavioral invariants

Write down 3–7 invariants (testable statements), e.g.:

- “Endpoint `/auth/register` returns 201 on valid input”
- “Cursor matches mirrored webcam display”
- “No camera frames stored to disk”

### Tests

For any HIGH/MED change:

- Add/update tests that lock the invariants.
- If no test harness exists, add a minimal executable “verification script” and document how to run it.

### Documentation

Update docs only if behavior changed or a new configuration path exists.

---

## Worklog Requirements

Update `docs/WORKLOG_TICKETS.md` (append-only) with:

- Which file(s) were canonical and why (Observed evidence)
- What changed (diff summary)
- What invariants were preserved/changed (declare Behavior change allowed)
- How you verified (commands + outputs)

---

## Stop Condition

Stop when:

- There is exactly one canonical implementation in active use, and
- Tests/verification cover the stated invariants, and
- Worklog has evidence and status is updated.
