# Auth Robustness + Verification Research Addendum (2026-03-08)

## TCK-20260308-101 :: Auth login robustness and email verification provider survey
Ticket Stamp: STAMP-20260308T163200Z-codex-auth

Type: REMEDIATION + RESEARCH
Owner: Pranay
Created: 2026-03-08
Status: DONE

Prompt Trace: prompts/review/local-pre-commit-review-v1.0.md

## Scope contract

- In-scope:
  - Fix misleading auth refresh/login error behavior
  - Improve lockout copy and metadata exposed to clients
  - Normalize email lookup behavior for login reliability
  - Research hosted + open-source email verification providers
- Out-of-scope:
  - Full provider migration in this ticket
  - Production infra rollout and DNS cutover
- Behavior change allowed: YES (error copy and auth normalization)

## Execution log

- 2026-03-08: Updated frontend response interceptor to avoid refresh retry loops on auth endpoints.
- 2026-03-08: Improved frontend auth error mapping for lockout/session-expired copies.
- 2026-03-08: Updated backend `AccountLockedError` to include retry metadata and clearer message formatting.
- 2026-03-08: Wired retry-after seconds from auth login lockout path.
- 2026-03-08: Fixed backend auth import issue (`AuthenticationError`) in refresh path.
- 2026-03-08: Added backend email normalization (`strip().lower()`) for create/get/update/authenticate.
- 2026-03-08: Added backend test for login success with mixed-case + whitespace email input.
- 2026-03-08: Ran focused backend auth tests:
  - Command: `pytest -q tests/test_auth.py -k "login_success_with_case_and_spaces_in_email or login_success"`
  - Result: `2 passed`.
- 2026-03-08: Ran focused frontend auth store tests:
  - Command: `npx vitest run src/store/authStore.test.ts`
  - Result: `1 file passed, 19 tests passed`.
- 2026-03-08: Completed provider landscape research and documented results in:
  - `docs/research/EMAIL_VERIFICATION_PROVIDERS_SURVEY_2026-03-08.md`

## Evidence summary

Observed:
- Live backend DB includes a mix of verified and unverified users.
- Login failure can be caused by account lockout and/or verification status.
- Case/whitespace differences in email input were a reliability risk before normalization.

Inferred:
- Provider adapter abstraction is the safest next implementation step for swapping SMTP/API vendors.

Unknown:
- Final production provider selection pending owner decision and regional cost validation.

## Next actions

1. Choose primary provider (SES vs Resend) and fallback provider.
2. Implement provider adapter + environment-based provider switch.
3. Add webhook processing for bounce/complaint + resend flow analytics.
4. Add signup-time disposable-domain check and optional external validator gate.
