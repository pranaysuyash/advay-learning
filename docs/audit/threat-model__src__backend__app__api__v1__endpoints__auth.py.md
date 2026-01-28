# THREAT MODEL AUDIT v1.0 - Authentication Endpoints

**Scope**: auth (backend authentication endpoints)  
**Target File**: `src/backend/app/api/v1/endpoints/auth.py`  
**Assumptions**: Local-only deployment, parent accounts only, no cloud sync, SQLite storage  

---

## A) Data Flow Diagram

```
Parent Email + Password
        ↓
[FastAPI /register endpoint]
        ↓
bcrypt.hash(password) → SQLite users table
        ↓
JWT tokens created (access + refresh)
        ↓
Tokens returned to client
        ↓
Client stores in localStorage
        ↓
Tokens used for API authentication
```

**Key Data Elements**:
- Email (PII - parent contact)
- Password (sensitive - hashed with bcrypt)
- JWT tokens (session credentials)
- User ID (internal identifier)

---

## B) Assets + Trust Boundaries

**Assets**:
- Parent credentials (email/password)
- JWT signing key (SECRET_KEY)
- User database (SQLite)
- Authentication tokens

**Trust Boundaries**:
- Client ↔ Backend API (HTTP)
- Backend ↔ SQLite database (local)
- Browser localStorage (client-side storage)

**Threat Actors**:
- Malicious parent (insider threat)
- Network attacker (MITM)
- Malware on device
- Compromised client app

---

## C) Threats (Prioritized)

### HIGH Impact Threats

#### T1: Timing Attack on Password Verification
**Claim Type**: Observed  
**Impact**: HIGH (credential enumeration)  
**Likelihood**: MED (requires automated attacks)  
**Evidence**: `UserService.authenticate()` returns boolean, potential timing differences  
**Mitigations**:
1. Use constant-time comparison (hmac.compare_digest)
2. Add random delay to auth responses
3. Rate limiting on auth endpoints
**Tests**: Automated timing attack simulation, verify constant response times

#### T2: JWT Token Theft via localStorage
**Claim Type**: Observed  
**Impact**: HIGH (session hijacking)  
**Likelihood**: HIGH (XSS/CSRF common)  
**Evidence**: Tokens stored in browser localStorage (lines 68-69 in authStore.ts)  
**Mitigations**:
1. Use httpOnly cookies instead of localStorage
2. Implement CSRF protection
3. Add token expiration and refresh rotation
**Tests**: XSS injection attempts, CSRF token validation

#### T3: Weak Password Policy
**Claim Type**: Inferred  
**Impact**: HIGH (weak credentials)  
**Likelihood**: MED (depends on user behavior)  
**Evidence**: No password strength requirements visible in schema  
**Mitigations**:
1. Add password complexity validation (length, character types)
2. Implement password history (prevent reuse)
3. Add account lockout after failed attempts
**Tests**: Password policy enforcement, brute force protection

### MEDIUM Impact Threats

#### T4: Refresh Token Reuse
**Claim Type**: Observed  
**Impact**: MED (extended session compromise)  
**Likelihood**: LOW (requires token theft first)  
**Evidence**: Refresh endpoint creates new tokens but doesn't invalidate old refresh token  
**Mitigations**:
1. Implement refresh token rotation (one-time use)
2. Add refresh token blacklist/revocation
3. Shorter refresh token expiry
**Tests**: Token reuse attempts, refresh token invalidation

#### T5: No Account Lockout Protection
**Claim Type**: Inferred  
**Impact**: MED (brute force success)  
**Likelihood**: LOW (local deployment limits attack surface)  
**Evidence**: No rate limiting or lockout logic in auth endpoints  
**Mitigations**:
1. Add progressive delays on failed attempts
2. Temporary account lockout after N failures
3. IP-based rate limiting
**Tests**: Brute force simulation, lockout behavior

#### T6: Missing Email Verification
**Claim Type**: Observed  
**Impact**: MED (fake accounts, spam)  
**Likelihood**: LOW (local app, controlled users)  
**Evidence**: Register endpoint creates accounts without email verification  
**Mitigations**:
1. Add email verification flow
2. Require parent approval for new accounts
3. Add account activation requirement
**Tests**: Registration without verification, account enumeration

### LOW Impact Threats

#### T7: Information Disclosure in Errors
**Claim Type**: Observed  
**Impact**: LOW (enumeration aid)  
**Likelihood**: LOW (generic error messages)  
**Evidence**: "Email already registered" reveals account existence  
**Mitigations**:
1. Use generic error messages ("Invalid credentials")
2. Add random delays to prevent timing enumeration
3. Implement consistent error responses
**Tests**: Error message analysis, account enumeration attempts

#### T8: No Logout Endpoint
**Claim Type**: Inferred  
**Impact**: LOW (incomplete session management)  
**Likelihood**: LOW (client-side logout exists)  
**Evidence**: No server-side token revocation endpoint  
**Mitigations**:
1. Add logout endpoint for token blacklisting
2. Implement token revocation on password change
3. Add "logout all devices" functionality
**Tests**: Token validity after logout, concurrent session handling

---

## Security Recommendations

**Immediate (HIGH Priority)**:
1. Fix timing attack vulnerability with constant-time comparison
2. Move tokens from localStorage to httpOnly cookies
3. Add password strength requirements

**Short-term (MED Priority)**:
1. Implement refresh token rotation
2. Add rate limiting and account lockout
3. Add email verification for registration

**Long-term (LOW Priority)**:
1. Generic error messages
2. Server-side logout endpoint
3. Multi-factor authentication option

**Testing Focus**:
- Authentication flow security testing
- Token storage and transmission security
- Password policy enforcement
- Brute force and timing attack prevention</content>
<parameter name="filePath">/Users/pranay/Projects/learning_for_kids/docs/audit/threat-model__src__backend__app__api__v1__endpoints__auth.py.md