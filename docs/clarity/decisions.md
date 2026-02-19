# Architecture & Design Decisions

**Purpose**: Log of significant technical and UX decisions with rationale.

Format based on [Architecture Decision Records (ADRs)](https://adr.github.io/).

---

## ADR-001: Drawing Control Modes Architecture

**Status**: Accepted  
**Date**: 2026-01-28  
**Deciders**: Development team

### Context

Need multiple ways for kids to control drawing (button, pinch, dwell, etc.)

### Decision

Implement all modes in Game.tsx with unified state management. Use `isDrawing` state that can be controlled by any input method.

### Consequences

- **Positive**: Easy to add new control modes
- **Positive**: Modes can work simultaneously (button + pinch)
- **Negative**: Game.tsx grows larger
- **Mitigation**: May extract to custom hook later

### Related

- TCK-20260128-009 through TCK-20260128-015

---

## ADR-002: Letter Smoothing Algorithm

**Status**: Accepted  
**Date**: 2026-01-28  
**Deciders**: Development team

### Context

Shaky hand tracking creates jagged lines that don't look good.

### Decision

Use 3-point moving average smoothing applied at render time. Original points stored, smoothed for display only.

### Consequences

- **Positive**: Visual quality improved
- **Positive**: Original data preserved for accuracy calculation
- **Negative**: Slight computational overhead
- **Mitigation**: Negligible with frame skipping

### Related

- Batch update 2026-01-28

---

## ADR-003: Frame Skipping for Performance

**Status**: Accepted  
**Date**: 2026-01-28  
**Deciders**: Development team

### Context

60fps hand tracking causes lag on some devices.

### Decision

Process every 2nd frame (30fps effective) using frame counter modulo.

### Consequences

- **Positive**: Reduced CPU/GPU load
- **Positive**: Smoother overall experience
- **Negative**: Slightly less responsive tracking
- **Mitigation**: 30fps still very responsive for drawing

### Related

- Batch update 2026-01-28

---

## Template

```markdown
## ADR-###: [Title]
**Status**: Proposed | Accepted | Deprecated | Superseded by ADR-###  
**Date**: YYYY-MM-DD  
**Deciders**: [Names]

### Context
[What is the issue that we're seeing that is motivating this decision or change.]

### Decision
[What is the change that we're proposing or have agreed to implement.]

### Consequences
[What becomes easier or more difficult to do and any risks introduced by the change that will need to be mitigated.]

### Related
[Links to tickets, questions, etc.]
```

---

**Last Updated**: 2026-01-28

---

## ADR-004: Cookie-Based Authentication with httpOnly

**Status**: Accepted  
**Date**: 2026-01-29  
**Deciders**: Development team

### Context

JWT tokens were stored in localStorage, vulnerable to XSS attacks. Threat model identified this as HIGH risk.

### Decision

Migrate to httpOnly cookies for token storage. Tokens not accessible via JavaScript.

### Implementation Details

- `access_token` cookie: 15 min, httpOnly, Secure (prod), SameSite=lax
- `refresh_token` cookie: 7 days, httpOnly, Secure (prod), SameSite=lax
- Backend sets cookies on login/refresh
- Frontend uses `withCredentials: true` for CORS
- Backward compatible: Still accepts Bearer tokens in Authorization header

### Consequences

- **Positive**: XSS protection - tokens not in localStorage
- **Positive**: Automatic handling - cookies sent with every request
- **Positive**: Server can invalidate sessions
- **Negative**: CSRF risk (mitigated by SameSite=lax)
- **Negative**: Slightly more complex CORS setup
- **Negative**: Harder to debug (can't see token in DevTools)

### Related

- SECURITY-HIGH-004
- threat-model__src__backend__app__api__v1__endpoints__auth.py.md

---

## ADR-005: Constant-Time Authentication to Prevent Timing Attacks

**Status**: Accepted  
**Date**: 2026-01-29  
**Deciders**: Development team

### Context

Authentication had timing difference between "user not found" (fast) and "wrong password" (slow hash verification). This allows user enumeration via timing analysis.

### Decision

Always perform bcrypt verification, even for non-existent users, using a dummy hash.

### Implementation

```python
if not user:
    # Dummy verification for constant time
    verify_password(password, DUMMY_BCRYPT_HASH)
    return None
```

### Consequences

- **Positive**: Prevents user enumeration attacks
- **Positive**: Minimal performance impact
- **Negative**: Slightly more complex code
- **Negative**: One extra bcrypt operation per failed login

### Related

- SECURITY-HIGH-001
- src__backend__app__services__user_service.py.md (audit)

---

## ADR-006: Email Verification Required for Login

**Status**: Accepted  
**Date**: 2026-01-29  
**Deciders**: Development team

### Context

Kids' app requires parent email verification for safety and account recovery. Previously users could login immediately after registration.

### Decision

Require email verification before allowing login. Block login with 403 if email not verified.

### Implementation

- `email_verified` field on User model
- Verification token sent on registration
- `/auth/verify-email` endpoint
- `/auth/resend-verification` for retries
- Login check: `if not user.email_verified: raise HTTPException(403, ...)`

### Consequences

- **Positive**: Verified parent contact for safety
- **Positive**: Enables password reset functionality
- **Positive**: Reduces spam/fake accounts
- **Negative**: Extra friction during signup
- **Negative**: Email delivery required for app usage
- **Mitigation**: Clear messaging, resend option, console logging for dev

### Related

- SECURITY-HIGH-002
- functional__src__backend__app__api__v1__endpoints__auth.py.md (audit)

---

## ADR-007: Rate Limiting Strategy (Pending Decision)

**Status**: Proposed  
**Date**: 2026-01-29  
**Deciders**: Development team

### Context

No rate limiting currently implemented. Vulnerable to brute force attacks on auth endpoints.

### Proposed Decision

Implement per-IP and per-account rate limiting using slowapi or custom middleware.

### Open Questions

- Use slowapi library or custom implementation?
- Redis required for distributed rate limiting, or in-memory sufficient?
- What are the limits?
  - Auth endpoints: 5 req/min per IP?
  - General API: 100 req/min per user?
  - Progress tracking: 1000 req/min?

### Related

- BACKEND-MED-001 (ticket)
- tests/test_security.py (skipped test)

---

---

## ADR-008: Rate Limiting with slowapi

**Status**: Accepted  
**Date**: 2026-01-29  
**Deciders**: Development team

### Context

No rate limiting existed on any endpoints. Vulnerable to brute force attacks and abuse.

### Decision

Implement rate limiting using `slowapi` library with IP-based limits.

### Implementation

- **Library**: slowapi (FastAPI-compatible rate limiter)
- **Strategy**: IP-based limiting using `get_remote_address`
- **Storage**: In-memory (sufficient for single-instance deployment)
- **Test Mode**: High limits (10000/min) when TESTING=true to avoid test interference

### Rate Limits

| Category | Limit | Endpoints |
|----------|-------|-----------|
| AUTH_STRICT | 5/min | Login, Register |
| AUTH_MEDIUM | 10/min | Verify, Reset, Refresh |
| API_GENERAL | 100/min | Most API calls |
| API_HEAVY | 20/min | Stats, exports |
| PROGRESS_WRITE | 60/min | Save progress |
| PROGRESS_READ | 120/min | Read progress |

### Consequences

- **Positive**: Brute force protection on auth endpoints
- **Positive**: DoS prevention for API
- **Positive**: Fair resource usage
- **Negative**: In-memory storage doesn't work across multiple server instances
- **Mitigation**: For multi-instance deployment, add Redis backend to slowapi

### Related

- BACKEND-MED-001
- Multiple audit findings (MED-SEC-001)

---
