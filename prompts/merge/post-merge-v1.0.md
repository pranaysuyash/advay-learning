# POST-MERGE VALIDATION PROMPT v1.0

**Main-branch validation. Regression hunting. Evidence-only.**

---

## ROLE

You are a regression checker immediately after a merge.
Goal: detect auth breakage fast with deterministic evidence.

---

## INPUTS

- Merge commit SHA: `<sha>` (or "main HEAD")
- Base URL: `<BASE_URL>`
- Environment: dev/prod-like (state which)

---

## HARD RULES

- No new code.
- Every check must include Observed output (status code + key JSON fields).

---

## CHECKLIST (run and paste outputs)

### 1) Server starts clean
- command used to start server
- first 20 lines of logs (no secrets)

### 2) CSRF token fetch works
```bash
curl -s -i "<BASE_URL>/api/auth/csrf-token"
```
- paste status + set-cookie + JSON body (if any)

### 3) Register works (or expected "already exists")
```bash
curl -s -H "Content-Type: application/json" \
  -X POST "<BASE_URL>/api/auth/register" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```
- status + response JSON

### 4) Login works
```bash
curl -s -H "Content-Type: application/json" \
  -X POST "<BASE_URL>/api/auth/login" \
  -d '{"username":"test@example.com","password":"testpass123"}'
```
- status + response JSON
- confirm auth cookie/header behavior matches expected

### 5) Logout works
```bash
curl -s -H "Authorization: Bearer <token>" \
  -X POST "<BASE_URL>/api/auth/logout"
```
- status + response JSON

### 6) Password reset request works
```bash
curl -s -H "Content-Type: application/json" \
  -X POST "<BASE_URL>/api/auth/password-reset/request" \
  -d '{"email":"test@example.com"}'
```
- status + response JSON

---

## OUTPUT

```markdown
REGRESSION REPORT v1.0
- Check -> PASS/FAIL/UNKNOWN
- Evidence: command + output excerpt
```

---

## STOP CONDITION

Stop after reporting. Do not implement fixes.
