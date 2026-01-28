# Canonical File Finder Prompt v1.0

**Purpose**: Given a feature request or bug report, identify the *canonical* files and entrypoints that should be changed (and avoid creating parallel versions).

**Use When**:
- A request is vague (“fix settings”, “improve game”, “auth failing”)
- Multiple versions exist (`*_v2`, `*_new`, etc.)
- You need to prove which file is actually used

---

## Inputs

- Feature/bug keywords: `<words to search>`
- Suspected area: `<frontend|backend|docs|unknown>`

---

## Non-Negotiable Rules

1) **Evidence-first**: every “this is the file” claim must be Observed.
2) **No new files yet**: do not create `*_v2` or alternates.
3) **Stop when canonical set is known**: this is a discovery prompt, not implementation.

---

## Step 1 — Locate Candidate Files (Mandatory)

Run:
```bash
rg -n "<keyword1>|<keyword2>" -S src docs
```

If frontend suspected:
```bash
rg -n "react-router|Routes\\b|<Route\\b" -S src/frontend/src
rg -n "export function|export const|function\\s+\\w+\\(" -S src/frontend/src
```

If backend suspected:
```bash
rg -n "FastAPI\\(|APIRouter\\(|include_router\\(" -S src/backend/app
rg -n "@router\\.(get|post|put|delete)" -S src/backend/app
```

---

## Step 2 — Prove the Entrypoint (Observed)

### Frontend
Identify:
- which component is routed (e.g., `App.tsx` routes)
- which page component is actually imported/used

Evidence examples:
- Route declaration line(s)
- Import statements showing the canonical module

### Backend
Identify:
- where routers are included (e.g., `app/main.py`)
- which endpoint module defines the failing route

---

## Step 3 — Detect “Shadow Implementations”

Search for suspicious duplicates:
```bash
find src -maxdepth 8 -type f \\( -name '*_v2.*' -o -name '*_new.*' -o -name '*copy*' -o -name '*backup*' -o -name '*old*' \\)
```

If you find any:
- list them
- prove whether they are referenced via imports/routes
- recommend: merge into canonical file or remove/quarantine (do not execute removals in this prompt)

---

## Output (Required)

1) **Canonical files to change** (1–5 paths) with Observed evidence snippets (short).
2) **Non-canonical duplicates found** (if any) + recommendation.
3) **Next prompt to run**:
   - planning: `prompts/planning/implementation-planning-v1.0.md`
   - audit: `prompts/audit/audit-v1.5.1.md`
   - remediation: `prompts/remediation/implementation-v1.6.1.md`
   - hardening: `prompts/hardening/hardening-v1.1.md`

---

## Stop Condition

Stop after producing the canonical file list + evidence.
