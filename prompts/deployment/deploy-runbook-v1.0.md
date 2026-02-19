# DEPLOY / RUNBOOK PROMPT v1.0

**Goal**: Create a practical runbook for deploying or running the app in a given environment, with explicit prerequisites and rollback.

---

## INPUTS

- Target environment: `<local dev | staging | prod>`
- Deployment target: `<Vercel/Netlify/docker/custom server/desktop packaging>`
- Repo access: `<YES/NO>`
- Git availability: `<YES/NO/UNKNOWN>`

---

## REQUIRED DISCOVERY (if repo access)

```bash
sed -n '1,200p' docs/SETUP.md
sed -n '1,200p' docs/QUICKSTART.md
ls -la src/frontend src/backend
```

---

## OUTPUT (REQUIRED)

### A) Preconditions

- Required versions (node/python/etc)
- Env vars needed (names only, no secrets)

### B) Deploy/run steps

- Exact commands
- Verification steps (health checks, key routes)

### C) Observability

- What logs to check
- What “healthy” looks like

### D) Rollback plan

- Steps to revert safely

---

## STOP CONDITION

Stop after the runbook draft. Do not implement infra changes unless explicitly requested.
