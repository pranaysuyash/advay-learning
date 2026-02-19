# Docs Index Enforcer Prompt v1.0

**Purpose**: Ensure documentation stays discoverable and doesn’t become a pile of unlinked markdown files. This prompt enforces consistent placement and mandatory linking from index docs.

**Use When**:

- Adding a new doc in `docs/`
- Updating core docs for a new feature or workflow
- Reviewing a PR that adds docs

---

## Non-Negotiable Rules

1) **Append-only**: do not rewrite historical worklog entries.
2) **No orphan docs**: any “core” doc must be linked from `docs/PROJECT_OVERVIEW.md`.
3) **Scope discipline**: docs changes must match the ticket scope.
4) **Evidence-first**: Observed / Inferred / Unknown.

---

## Step 1 — Classify the Doc

For each new/edited doc, classify:

- **Core**: essential reference (must be linked from `docs/PROJECT_OVERVIEW.md`)
- **Feature spec**: belongs in `docs/features/specs/`
- **Process**: belongs in `docs/project-management/`
- **Audit artifact**: belongs in `docs/audit/`
- **Plan**: belongs in `docs/plans/`

If classification is unclear, STOP and create a ticket to decide.

---

## Step 2 — Detect Orphan Docs

Run:

```bash
find docs -maxdepth 2 -type f -name '*.md' | sort
```

Then verify linking for any new core doc:

```bash
rg -n "<DocName.md>" docs/PROJECT_OVERVIEW.md docs/QUICKSTART.md docs/SETUP.md || true
```

If not linked:

- add a link to `docs/PROJECT_OVERVIEW.md` (preferred)
- optionally add a second link from a more specific index doc

---

## Step 3 — Verify No Scope Creep

If the doc introduces new decisions or requirements:

- ensure there is a ticket for it, or
- move it to a draft section and open a PRODUCT/ADR ticket

---

## Step 4 — Worklog Update

Append to `docs/WORKLOG_TICKETS.md`:

- what docs were added/updated
- where they were linked
- evidence commands + outputs

---

## Output (Required)

- List of docs touched and their classification
- Links added to index docs
- Worklog ticket ID updated

---

## Stop Condition

Stop after no new doc is orphaned and worklog is updated.
