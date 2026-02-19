# Code Review and Audit Report: Advay Vision Learning

**Date**: 2026-01-29  
**Repo**: /Users/pranay/Projects/learning_for_kids  
**Primary angle**: Security and Privacy (child-focused application)  
**Secondary angles**: Feature Completeness, Code Health

---

## 1) Executive Summary

### What is in decent shape

- **Backend security foundation**: JWT with httpOnly cookies, CSRF protection, bcrypt password hashing, rate limiting, input validation
- **Parent verification for deletion**: Password re-authentication required for destructive operations with audit logging
- **Database cascade deletes**: Proper foreign key constraints and relationships
- **Test coverage**: 69 backend tests passing (auth, security, validation, deletion)
- **Frontend build**: Successful production build with Vite 7.3.1
- **Documentation**: Comprehensive AGENTS.md, security policy, and TODO tracking

### What is risky or misleading

- **TODOs in critical paths**: Game progress API integration stubbed out
- **No frontend tests**: Vitest configured but no actual test files found
- **Email service not configured**: Verification and password reset flows exist but use stub implementation
- **MediaPipe integration incomplete**: Hand tracking loaded but progress saving disabled
- **No structured logging**: Security events logged to audit table but no application logging

### What will block contributors or shipping

- **Q-002 unanswered**: Email service provider decision blocking production deployment
- **Missing frontend deletion UI**: Backend supports profile/account deletion but no UI exposed
- **No error handling UI**: Toast notifications mentioned in TODO but not implemented
- **Bundle size**: 532KB main chunk exceeds recommended 500KB

---

## 2) Repo Reality Map

### Structure

```
learning_for_kids/
├── src/
│   ├── frontend/          # React 18 + Vite + TypeScript
│   │   ├── src/
│   │   │   ├── pages/     # 7 pages (Home, Login, Register, Dashboard, Game, Progress, Settings)
│   │   │   ├── store/     # Zustand stores (auth, profile, progress, settings)
│   │   │   ├── services/  # API client (axios with cookies)
│   │   │   └── components/# UI components
│   │   └── tests/         # EMPTY - vitest configured but no tests
│   ├── backend/           # FastAPI + SQLAlchemy + SQLite
│   │   ├── app/
│   │   │   ├── api/v1/endpoints/  # Auth, users, profiles, progress
│   │   │   ├── core/      # Security, config, validation, email (stub)
│   │   │   ├── db/models/ # User, Profile, Progress, Achievement, AuditLog
│   │   │   └── services/  # Business logic
│   │   └── tests/         # 10 test files, 69 tests passing
│   └── ...
├── docs/                  # Extensive documentation
├── prompts/               # AI agent prompts
└── tests/                 # Additional test structure (mostly empty)
```

### Entrypoints

- **Frontend**: `src/frontend/src/main.tsx` → `App.tsx`
- **Backend**: `src/backend/app/main.py` → FastAPI app
- **Game**: `src/frontend/src/pages/Game.tsx` (MediaPipe hand tracking)

### Current Run Path

```bash
# Backend
cd src/backend && python -m uvicorn app.main:app --reload --port 8001

# Frontend
cd src/frontend && npm run dev  # Port 5173

# Tests
cd src/backend && uv run pytest tests/  # 69 passed
cd src/frontend && npm run test  # Vitest (no tests found)
```

---

## 3) Findings (Prioritized)

### F-001 [Email Service Not Configured] (Severity: Critical)

**What it is:**
Email verification and password reset flows exist in backend but use stub implementation. Tokens are generated and stored but no actual emails are sent.

**Evidence:**

- Observed:
  - File: `src/backend/app/core/email.py`
  - Snippet:

    ```python
    @staticmethod
    async def send_verification_email(email: str, token: str) -> None:
        """Send verification email."""
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        # TODO: Implement actual email sending
        print(f"[EMAIL] Verification link for {email}: {verification_url}")
    ```

  - TODO_NEXT.md marks Q-002 as blocking production deployment

**Why it matters:**

- Users cannot verify email addresses → cannot log in
- Password reset flow is non-functional
- Blocks production deployment

**Recommendations:**

- Fix approach A: Integrate SendGrid/AWS SES/Mailgun
  - Files: `app/core/email.py`, add email provider config
  - Pros: Production-ready, reliable
  - Cons: Requires external service, cost
- Fix approach B: Implement SMTP fallback
  - Pros: No third-party dependency
  - Cons: Deliverability issues, complex setup

**Acceptance criteria:**

- [ ] Email verification sent on registration
- [ ] Password reset email delivered
- [ ] Environment variables documented

---

### F-002 [Game Progress API Integration Stubbed] (Severity: High)

**What it is:**
Game page has TODO comment disabling progress API calls. Progress is only saved to local store, not backend.

**Evidence:**

- Observed:
  - File: `src/frontend/src/pages/Game.tsx:7`
  - Snippet: `// import { progressApi } from '../services/api'; // TODO: Enable when profile ID available`
  - File: `src/frontend/src/pages/Progress.tsx`
  - Snippet: `// TODO: Fetch actual progress data from API`

**Why it matters:**

- Learning progress not persisted across devices
- Parent dashboard shows no data
- Core value proposition (progress tracking) broken

**Recommendations:**

- Fix: Connect profile selection to game page
  - Files: `Game.tsx`, `progressApi.ts`, `profileStore.ts`
  - Pass selected profile ID to game page
  - Enable progress API calls

**Acceptance criteria:**

- [ ] Game saves progress to backend
- [ ] Progress page fetches from API
- [ ] Progress persists across sessions

---

### F-003 [No Frontend Tests] (Severity: High)

**What it is:**
Vitest is configured but `src/frontend/src/test/` directory is empty. No component, integration, or E2E tests.

**Evidence:**

- Observed:
  - Command: `ls src/frontend/src/test/`
  - Output: `setup.ts` (only setup file)
  - Command: `find src/frontend -name "*.test.ts*"`
  - Output: (empty)

**Why it matters:**

- No regression protection for UI
- Manual testing burden
- Deployment risk

**Recommendations:**

- Fix approach A: Add critical path tests
  - Auth flow (login/logout)
  - Profile CRUD
  - Game initialization
- Fix approach B: Add Storybook for component testing
  - Pros: Visual regression testing
  - Cons: Additional setup

**Acceptance criteria:**

- [ ] Auth tests passing
- [ ] Profile management tests
- [ ] CI runs frontend tests

---

### F-004 [Bundle Size Warning] (Severity: Medium)

**What it is:**
Main JS chunk is 532KB (gzipped: 169KB), exceeds 500KB recommendation.

**Evidence:**

- Observed:
  - Command: `npm run build`
  - Output:

    ```
    dist/assets/index-CCoYrLSS.js   532.05 kB │ gzip: 168.56 kB
    (!) Some chunks are larger than 500 kB after minification
    ```

**Why it matters:**

- Slower initial load on mobile/slow connections
- Children may abandon during load
- MediaPipe libraries likely contributing

**Recommendations:**

- Fix: Implement code splitting
  - Lazy load MediaPipe: `const HandLandmarker = await import('@mediapipe/tasks-vision')`
  - Route-based splitting for Dashboard/Settings
  - Move `framer-motion` to lazy imports

**Acceptance criteria:**

- [ ] Main chunk < 500KB
- [ ] MediaPipe loaded on-demand
- [ ] Lighthouse performance score > 80

---

### F-005 [Missing Deletion UI] (Severity: Medium)

**What it is:**
Backend supports profile and account deletion with parent verification, but no UI exists in frontend.

**Evidence:**

- Observed:
  - Backend: `DELETE /api/v1/users/me` and `DELETE /api/v1/users/me/profiles/{id}`
  - Frontend Settings: No delete buttons found
  - File: `src/frontend/src/pages/Settings.tsx` (405 lines, no deletion UI)

**Why it matters:**

- COPPA compliance requires data deletion capability
- Parents cannot remove child profiles
- Account deletion not possible through UI

**Recommendations:**

- Fix: Add deletion UI to Settings page
  - "Delete Profile" button with confirmation modal
  - "Delete Account" in danger zone
  - Password re-authentication form

**Acceptance criteria:**

- [ ] Profile deletion UI functional
- [ ] Account deletion UI functional
- [ ] Confirmation dialogs prevent accidents

---

### F-006 [No Toast/Error Notification System] (Severity: Medium)

**What it is:**
TODO_NEXT.md lists "Error Handling & Toast Notifications" as P2 priority. Currently errors only logged to console.

**Evidence:**

- Observed:
  - File: `src/frontend/src/store/authStore.ts`
  - Snippet: `console.error('Login error:', error)`
  - No toast/notification component found

**Why it matters:**

- Users don't see error messages
- Failed operations appear to do nothing
- Poor UX

**Recommendations:**

- Fix: Add toast notification system
  - Use `react-hot-toast` or `sonner`
  - Integrate with API error interceptors
  - Show success/error for all mutations

---

## 4) Cross-cutting Risks

### Security/Privacy Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Email verification bypass | High | High | Implement email service (F-001) |
| No audit log review | Medium | Medium | Add admin endpoint for audit queries |
| Session fixation | Low | Medium | Refresh token rotation (TODO) |
| Camera permission confusion | Medium | Low | Better UX in Settings |

### Dependency Risks

- **MediaPipe**: Heavy bundle size, limited tree-shaking
- **Axios**: Well-maintained, no immediate risk
- **Zustand**: Lightweight, low risk
- **FastAPI/SQLAlchemy**: Stable, secure defaults

### Maintainability Risks

- **TODO comments in production code**: 2 found in Game.tsx, Progress.tsx
- **No frontend tests**: Regression risk
- **Mixed async patterns**: Some `async/await`, some `.then()`

---

## 5) Suggested Next Work Units (max 3)

### Work Unit 1: Email Service Integration (P0 - Blocking)

**Scope contract:**

- In-scope: SendGrid/AWS SES integration, verification email, password reset email, environment config
- Out-of-scope: Email templates, marketing emails

**Why now:** Blocks production deployment (Q-002)

**Acceptance criteria:**

- [ ] Registration sends verification email
- [ ] Password reset email delivered
- [ ] Works in both dev (console) and prod (SES/SendGrid)

**Reviewer checklist:**

- [ ] API keys in environment, not code
- [ ] Rate limiting on email sends
- [ ] Error handling for failed sends

---

### Work Unit 2: Game Progress Persistence (P1)

**Scope contract:**

- In-scope: Connect Game.tsx to progress API, profile selection flow, progress display
- Out-of-scope: Real-time sync, offline mode

**Why now:** Core feature broken, blocks MVP

**Acceptance criteria:**

- [ ] Game saves progress to backend
- [ ] Progress page shows actual data
- [ ] Profile selection before game start

**Reviewer checklist:**

- [ ] Loading states handled
- [ ] Error states handled
- [ ] Optimistic updates or loading indicators

---

### Work Unit 3: Frontend Test Foundation (P1)

**Scope contract:**

- In-scope: Vitest setup verification, auth flow tests, profile CRUD tests
- Out-of-scope: E2E tests, visual regression

**Why now:** Prevents regression as features are added

**Acceptance criteria:**

- [ ] 5+ component tests passing
- [ ] Auth store tests
- [ ] CI runs frontend tests

**Reviewer checklist:**

- [ ] Tests run in CI
- [ ] Mock service worker for API calls
- [ ] Coverage report generated

---

## 6) Questions for the Team

### Blocking

1. **Q-002**: Email service provider decision needed (SendGrid vs AWS SES vs Mailgun)
2. **Profile selection flow**: Should user select profile before entering game, or auto-select last used?

### Non-blocking

1. **Q-004**: Session timeout duration - keep current 15m/7d or adjust?
2. **Offline mode**: Should game work without internet? (impacts architecture)
3. **Analytics**: Any usage tracking needed (privacy-compliant)?

---

## 7) Appendix: Evidence Log

### Commands Run

```bash
# Repo structure
pwd  # /Users/pranay/Projects/learning_for_kids
find . -maxdepth 3 -type d | sed -n '1,200p'

# TODOs
grep -r "TODO\|FIXME\|HACK" src/frontend/src src/backend/app
# Found: 2 TODOs in Game.tsx, Progress.tsx

# Security patterns
grep -rn "auth\|login\|token\|session\|cookie" src/backend/app | wc -l
# 100+ matches

# API calls
grep -rn "fetch\|axios" src/frontend/src | head -20
# Axios withCredentials: true for cookies

# MediaPipe usage
grep -rn "mediapipe\|camera\|webcam" src/frontend/src | head -20
# Webcam + HandLandmarker in Game.tsx

# Environment variables
grep -rn "import.meta.env" src/frontend/src
# VITE_API_BASE_URL, VITE_API_VERSION

# Tests
ls src/backend/tests/  # 10 files
wc -l src/backend/tests/*.py  # 1352 total lines
ls src/frontend/src/test/  # Only setup.ts

# Build
npm run build  # Success, 532KB chunk warning

# Backend tests
uv run pytest tests/  # 69 passed, 1 skipped
```

### Files Reviewed

- `src/backend/app/core/email.py` - Stub implementation
- `src/backend/app/api/v1/endpoints/auth.py` - Complete auth flow
- `src/backend/app/api/v1/endpoints/users.py` - Deletion endpoints
- `src/frontend/src/pages/Game.tsx` - MediaPipe integration, TODO
- `src/frontend/src/pages/Progress.tsx` - TODO for API integration
- `src/frontend/src/pages/Settings.tsx` - No deletion UI
- `src/frontend/src/services/api.ts` - Axios config with cookies
- `docs/TODO_NEXT.md` - Priority tracking
- `docs/security/SECURITY.md` - Privacy policy

### External Docs Consulted

- FastAPI security best practices (<https://fastapi.tiangolo.com/tutorial/security/>)
- MediaPipe Tasks Vision API (<https://developers.google.com/mediapipe/solutions/vision/hand_landmarker>)
- Vite build optimization (<https://vitejs.dev/guide/build.html>)
