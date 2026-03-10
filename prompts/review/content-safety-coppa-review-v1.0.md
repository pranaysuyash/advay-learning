# Content Safety & COPPA Review Prompt — v1.0

**Category:** Review / Compliance  
**Use when:** Reviewing any changes that affect data collection, user-visible content, camera/microphone usage, analytics, storage, or any feature that touches child users directly. This is mandatory for any new game page, new data collection path, or changes to permissions/consent flows.

---

## MISSION

Ensure the app remains compliant with child safety regulations (COPPA, GDPR-K, CCPA) and internal child-safety standards:
1. **No PII collection** from children without verifiable parental consent
2. **Camera/microphone** usage is transparent, minimal, and easily dismissible
3. **Content** is age-appropriate and free of violence, fear, shame, or harmful messaging
4. **Data storage** is minimal, local, and clearly scoped
5. **External calls** are audited — no unexpected third-party data sharing

---

## OPERATING RULES

- Do NOT modify files unless explicitly authorized.
- Do NOT use /tmp.
- Flag any potential compliance issue conservatively — better to over-flag than miss.
- Every finding must cite file path + line range + specific evidence.

---

## REVIEW WORKFLOW

### STEP 0 — Find compliance-relevant changes

```bash
# Camera / microphone access
git diff --staged | grep -E "^\+" | grep -iE "(getUserMedia|camera|webcam|microphone|MediaStream|VideoCapture)"

# Data storage
git diff --staged | grep -E "^\+" | grep -iE "(localStorage|sessionStorage|indexedDB|cookie|storage\.set)"

# Analytics / tracking
git diff --staged | grep -E "^\+" | grep -iE "(analytics|track|telemetry|amplitude|mixpanel|segment|gtag|fbq|hotjar)"

# External network calls
git diff --staged | grep -E "^\+" | grep -iE "(fetch\(|axios\.|http\.|https\.|api\.|endpoint)"

# PII patterns
git diff --staged | grep -E "^\+" | grep -iE "(email|phone|address|birthdate|name.*input|firstName|lastName)"

# Consent / permission flows
git diff --staged | grep -E "^\+" | grep -iE "(consent|permission|allow|deny|parental|coppa)"
```

### STEP 1 — Camera / Microphone audit

For any new or changed camera/mic usage:

| Check | Criteria |
|-------|----------|
| **Visual indicator** | Is there a visible indicator when camera is active? (e.g., green dot, "Camera On" label) |
| **Easy dismiss** | Can the child/parent easily stop camera access without closing the app? |
| **No recording** | Is video/audio data only processed in memory? No recording to disk or upload? |
| **Permission prompt** | Is the browser/OS permission prompt preceded by an in-app explanation of WHY camera is needed? |
| **Fallback** | Is there a non-camera mode (mouse/touch) if permission is denied? |
| **Minimal access** | Is camera used only for the stated purpose (hand tracking, pose detection)? No thumbnail capture? |

### STEP 2 — Data storage audit

For any new localStorage/sessionStorage/analytics writes:

| Check | Criteria |
|-------|----------|
| **No PII in keys** | Storage keys don't include names, emails, or identifiers |
| **No PII in values** | Stored values don't contain names, emails, or device identifiers |
| **Data minimization** | Only store what's needed for the feature (scores, progress, settings) |
| **TTL / expiry** | Session data has a reasonable TTL (24h max for play sessions) |
| **Storage key naming** | Follows repo convention: `advay.<scope>.<version>` |
| **Unified analytics** | All analytics writes use `advay.analytics.v2` (unified SDK) not legacy game-specific keys |

### STEP 3 — Content safety audit

For any new user-visible content:

| Check | Criteria |
|-------|----------|
| **No violence** | No weapons, fighting, blood, or scary imagery in game mechanics, art, or text |
| **No shame/fear** | Error messages never shame or frighten the child. No "You failed", "Wrong!", "Bad job" |
| **No advertising** | No ads, sponsored content, or commercial links |
| **No external links** | No links leaving the app to external sites without parental notification |
| **Age appropriateness** | All imagery, characters, and themes suitable for ages 3–8 |
| **Inclusive language** | No stereotypes, no gendered assumptions in game characters or mechanics |

### STEP 4 — External calls audit

For any new `fetch()` or API calls:

| Check | Criteria |
|-------|----------|
| **Destination known** | URL is documented and owned by the project |
| **No child data sent** | Request body contains no PII, no game identifiers linkable to a child |
| **HTTPS only** | All external calls use HTTPS |
| **No third-party SDKs added** | No new analytics, advertising, or tracking SDKs imported |

### STEP 5 — Classify findings

```
SAFETY-001
Severity: CRITICAL | HIGH | MEDIUM | LOW
File: path/to/file.tsx  Line: 45
Category: Camera | Storage | Content | External | PII
Issue: Description of the compliance concern
Evidence: Quote the relevant code
Regulation: COPPA § / GDPR-K Art. / Internal policy
Fix: Concrete suggested remediation
```

**Severity guide:**
- **CRITICAL**: PII collection, video recording/upload, third-party data sharing without consent
- **HIGH**: Missing camera indicator, no dismiss mechanism, shame-based messaging, external link without warning
- **MEDIUM**: Legacy analytics storage key used, missing TTL, minor age-appropriateness concern
- **LOW**: Inconsistent storage key naming, non-standard permission flow

### STEP 6 — Verdict

```
SAFETY APPROVED   — No CRITICAL or HIGH findings. Compliant with COPPA and internal standards.
SAFETY WITH NOTES — MEDIUM/LOW issues noted. Safe to ship; review before public launch.
SAFETY BLOCKED    — CRITICAL or HIGH finding. Must fix before any push.
```

---

## REPORT FORMAT

```markdown
## Content Safety & COPPA Review — <date>

### Compliance-Relevant Changes Found
[List by category: camera, storage, analytics, content, external calls]

### Findings

#### CRITICAL
[SAFETY-XXX or "None"]

#### HIGH
[SAFETY-XXX or "None"]

#### MEDIUM
[SAFETY-XXX or "None"]

#### LOW
[SAFETY-XXX or "None"]

### Verdict
[SAFETY APPROVED / SAFETY WITH NOTES / SAFETY BLOCKED]
```

---

## COPPA QUICK REFERENCE (for this repo)

- **Age range:** 3–8 (under 13 → full COPPA scope)
- **Camera data:** Processed locally only. No upload. No thumbnails stored.
- **Analytics:** Aggregated play data only. No name, device ID, or IP linkage.
- **Storage:** All data local to the device. No server sync without explicit parental consent flow.
- **Consent model:** Parent creates profile → child plays. No child-facing account creation.
- **Data retention:** Session data: 24h TTL. Progress data: until parent deletes profile.

---

*Prompt version: v1.0 | Created: 2026-03-10 | Owner: Copilot agent coordination*
