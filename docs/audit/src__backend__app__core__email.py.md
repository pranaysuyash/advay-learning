# Audit: src/backend/app/core/email.py

**Audit Version**: v1.5.1  
**Date/Time**: 29 January 2026, 12:00 UTC  
**Audited File Path**: src/backend/app/core/email.py  
**Base Commit SHA**: bd2cca1fe594247e7d3c879fce8ff5acadd6db36  
**Auditor Identity**: GitHub Copilot

## Discovery Evidence

**Command**: `git rev-parse --is-inside-work-tree`  
**Output**: true

**Command**: `git ls-files -- src/backend/app/core/email.py`  
**Output**: src/backend/app/core/email.py

**Command**: `git status --porcelain -- src/backend/app/core/email.py`  
**Output**: M src/backend/app/core/email.py

**Command**: `git log -n 20 --follow -- src/backend/app/core/email.py`  
**Output**: commit bd2cca1fe594247e7d3c879fce8ff5acadd6db36  
Author: Pranay Suyash <pranay.suyash@gmail.com>  
Date: Wed Jan 28 23:46:48 2026 +0530

    feat: Batch commit of accumulated changes

**Command**: `git log --follow --name-status -- src/backend/app/core/email.py`  
**Output**: commit bd2cca1fe594247e7d3c879fce8ff5acadd6db36  
Author: Pranay Suyash <pranay.suyash@gmail.com>  
Date: Wed Jan 28 23:46:48 2026 +0530

    feat: Batch commit of accumulated changes

A src/backend/app/core/email.py

**Command**: `rg -n --hidden --no-ignore -S "EmailService" .`  
**Output**: (excerpts from user_service.py, auth.py, email.py)

**Command**: `rg -n --hidden --no-ignore -S "send_verification_email" .`  
**Output**: (excerpts from user_service.py, auth.py, email.py)

**Command**: `rg -n --hidden --no-ignore -S "send_password_reset_email" .`  
**Output**: (excerpts from auth.py, email.py)

**Command**: `rg -n --hidden --no-ignore -S "generate_verification_token" .`  
**Output**: (excerpts from user_service.py, auth.py, email.py)

**Command**: `rg -n --hidden --no-ignore -S "get_verification_expiry" .`  
**Output**: (excerpts from user_service.py, auth.py, email.py)

**Command**: `rg -n --hidden --no-ignore -S "generate_secure_token" .`  
**Output**: (excerpt from email.py)

**Command**: `rg -n --hidden --no-ignore -S "email|EmailService|send_verification_email|send_password_reset_email|generate_verification_token|get_verification_expiry" test tests __tests__ .`  
**Output**: (no matches found)

## Findings

### 1. ID: EXPIRY_INCONSISTENCY

**Severity**: MEDIUM  
**Evidence Label**: Observed  
**Evidence Snippet**: In send_password_reset_email, body says "This link will expire in 1 hour." but get_verification_expiry returns 24 hours.  
**Failure Mode**: User confusion about link validity.  
**Blast Radius**: Password reset functionality.  
**Suggested Minimal Fix Direction**: Update body text or create separate expiry method.

### 2. ID: NO_EMAIL_VALIDATION

**Severity**: MEDIUM  
**Evidence Label**: Observed  
**Evidence Snippet**: No validation of email parameter in send\_\*\_email methods.  
**Failure Mode**: Invalid URLs constructed, potential errors.  
**Blast Radius**: Email sending operations.  
**Suggested Minimal Fix Direction**: Add email format validation.

### 3. ID: SENSITIVE_DATA_LOGGING

**Severity**: MEDIUM  
**Evidence Label**: Observed  
**Evidence Snippet**: Email addresses and content logged in plain text.  
**Failure Mode**: Data exposure if logs are accessible.  
**Blast Radius**: User privacy.  
**Suggested Minimal Fix Direction**: Sanitize or avoid logging sensitive data in production.

### 4. ID: MISSING_ERROR_HANDLING

**Severity**: LOW  
**Evidence Label**: Observed  
**Evidence Snippet**: No try/catch for settings access or logging.  
**Failure Mode**: Unhandled exceptions.  
**Blast Radius**: Application crashes.  
**Suggested Minimal Fix Direction**: Add error handling.

### 5. ID: NO_ACTUAL_EMAIL_SENDING

**Severity**: LOW  
**Evidence Label**: Observed  
**Evidence Snippet**: Methods only log, no integration with email service.  
**Failure Mode**: No emails sent in production.  
**Blast Radius**: Email functionality broken.  
**Suggested Minimal Fix Direction**: Integrate with email provider.

## Out-of-Scope Findings

None.

## Next Actions

- Remediation PR for HIGH/MEDIUM findings: EXPIRY_INCONSISTENCY, NO_EMAIL_VALIDATION, SENSITIVE_DATA_LOGGING
- Verification: Test email validation, check logs for sensitive data, verify expiry consistency.

## What This File Actually Does

This file defines an EmailService class that provides static methods for generating secure tokens, calculating verification expiries, and sending verification and password reset emails. For development, it logs email content to the console instead of sending actual emails.

## Key Components

- EmailService class: Contains static methods for email-related operations.
- generate_verification_token(): Generates a URL-safe token using secrets.token_urlsafe(32).
- get_verification_expiry(): Returns a datetime 24 hours from now.
- send_verification_email(email, token): Constructs a verification URL and logs the email details.
- send_password_reset_email(email, token): Constructs a reset URL and logs the email details.
- generate_secure_token(): Module-level function that does the same as generate_verification_token.

Inputs: email addresses, tokens.  
Outputs: tokens, expiry datetimes, logged email content.  
Side effects: Logging to console, no actual email sending.

## Dependencies and Contracts

### 5a) Outbound Dependencies (Observed)

- Load-bearing imports: logging, secrets, datetime, timedelta, app.core.config.settings
- External binaries/CLIs invoked: None
- Environment variables referenced: None directly
- Global mutations and side effects: None
- Ordering constraints and lifecycle assumptions: Assumes settings.FRONTEND_URL is available

### 5b) Inbound Dependencies (Observed)

- Who imports/calls this file: user_service.py, auth.py
- How: import EmailService
- What they likely assume: Methods are available and return expected types without exceptions

## Capability Surface

### 6a) Direct Capabilities (Observed)

- Generate secure random tokens
- Calculate future expiry times
- Log formatted email content for verification and password reset

### 6b) Implied Capabilities (Inferred)

- Email sending infrastructure (though not implemented)

## Gaps and Missing Functionality

- No actual email sending; only logging
- No error handling for missing settings
- No validation of email format
- No rate limiting or spam prevention
- No email templates or internationalization

## Problems and Risks

- Logic and correctness: Expiry inconsistency between stated and actual
- Edge cases: Invalid email inputs not handled
- Security: Sensitive data logged
- Observability: Only basic logging
- Testability: No tests found

## Extremes and Abuse Cases

- Malformed emails: No validation, may cause issues
- Missing settings: Will raise exceptions
- Large inputs: No limits enforced

## Inter-File Impact Analysis

### 10.1 Inbound Impact

- Which callers could break: user_service.py, auth.py if method signatures change
- Which implicit contracts must be preserved: Method return types and no exceptions

### 10.2 Outbound Impact

- Which dependencies could break this file: app.core.config if FRONTEND_URL changes

### 10.3 Change Impact per Finding

For EXPIRY_INCONSISTENCY: Could confuse users, no direct breakage  
For NO_EMAIL_VALIDATION: Could cause invalid operations, callers unaffected  
For SENSITIVE_DATA_LOGGING: Privacy risk, no functional impact

## Clean Architecture Fit

Belongs in core as email service. No responsibility leakage.

## Patch Plan

For EXPIRY*INCONSISTENCY: Update send_password_reset_email body to say 24 hours or create get_password_reset_expiry method. Invariant: Stated expiry matches actual. Test: Assert body text.  
For NO_EMAIL_VALIDATION: Add email validation in send*\*\_email. Invariant: email is valid format. Test: Raise on invalid email.  
For SENSITIVE_DATA_LOGGING: Remove email logging in production. Invariant: No emails in logs. Test: Check log output.

## Verification and Test Coverage

Tests: Unknown (none found)  
Critical paths untested: All methods  
Propose: Unit tests for token generation, expiry, validation, logging

## Risk Rating

MEDIUM  
Justification: Potential user confusion, data exposure, no validation, but no production email sending yet.

## Regression Analysis

Commands: git log --follow -- src/backend/app/core/email.py  
Concrete deltas: File added in initial commit, no subsequent changes  
Classification: unknown
