# POST-MERGE VALIDATION (GENERAL) PROMPT v1.0

**Goal**: Quickly detect regressions after a merge using deterministic smoke checks with evidence.

---

## INPUTS

- Environment: `<local dev | staging | prod-like>`
- Base URLs:
  - Frontend: `<url>`
  - Backend: `<url>`
- Scope hints: `<what changed>`
- Git availability: `<YES/NO/UNKNOWN>` (optional; if YES you may record merge SHA/branch for traceability)

---

## HARD RULES

- No new code changes.
- Every check must include Observed evidence (status code + key output or UI observation).

---

## CHECKS (run what applies; mark the rest Unknown)

### 1) Services start clean
- backend start command + first 20 log lines (no secrets)
- frontend start command + first 20 log lines

If Git availability is YES (optional):
```bash
git status --porcelain
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
```

### 2) Health checks
```bash
curl -s -i "<BACKEND_URL>/health"
curl -s -i "<BACKEND_URL>/"
```

### 3) Basic navigation smoke
- Open `/`, `/login`, `/register`, `/dashboard`, `/game`, `/settings`
- Note any blank screens, console errors (Observed)

### 4) Camera permission smoke (if camera is used by current build)
- First run: request appears
- Deny: app remains usable (fallback)
- Allow: camera indicator shows, stop works

### 5) Data safety smoke (if storage/export/delete exist in build)
- Export works (file created / JSON shown)
- Delete works (data cleared)

---

## OUTPUT (REQUIRED)

```markdown
POST-MERGE VALIDATION REPORT v1.0
- Check -> PASS/FAIL/UNKNOWN
- Evidence: command + output excerpt or UI observation
- Follow-ups: tickets to open if FAIL
```
