# TODO - Next Steps

**Created**: 2026-01-29  
**Purpose**: Prioritized list of next actions

---

## Immediate (Do Today)

- [ ] **DECISION**: Answer Q-002, Q-003, Q-004 in clarity/questions.md
  - Email service provider?
  - Password policy strictness?
  - Session timeout duration?

---

## This Week (P1 Priority)

### Security (Recommended Order)

1. [x] **BACKEND-MED-002**: Input Validation ✅ DONE
   - UUID format validation for IDs
   - Email validation
   - Age range validation (0-18)
   - Language code validation
   - Effort: Low
   - Impact: Prevents errors, improves UX

2. [x] **SECURITY-HIGH-005**: Password Strength Requirements ✅ DONE
   - Minimum 8 chars + uppercase + lowercase + digit
   - Backend validation implemented
   - Tests updated with strong passwords
   - Effort: Low
   - Impact: Better security for parent accounts

3. [x] **BACKEND-MED-006**: Parent Verification for Data Deletion ✅ DONE
   - DELETE /api/v1/users/me - Account deletion with password verification
   - DELETE /api/v1/users/me/profiles/{id} - Profile deletion with password verification
   - Audit log table with all deletion events
   - Failed attempts logged for security monitoring
   - Cascade delete: User → Profiles → Progress/Achievements
   - Effort: Medium
   - Impact: Child data protection

### Infrastructure

4. [x] **INFRA-MED-001**: Fix Frontend Vulnerabilities ✅ DONE
   - Updated vite to 7.3.1
   - Updated vitest to latest
   - Build successful
   - 0 vulnerabilities remaining
   - Effort: Low
   - Impact: Security (dev-only)

---

## This Month (P2 Priority)

### Backend

5. [ ] **BACKEND-MED-003**: Add Logging
   - Structured logging (JSON)
   - Audit trail for security operations
   - Effort: Medium

6. [ ] **BACKEND-MED-004**: Error Handling
   - Custom exceptions
   - Better error messages
   - Effort: Medium

7. [ ] **SECURITY-HIGH-006**: Refresh Token Rotation
   - One-time use refresh tokens
   - Token family tracking
   - Effort: Medium
   - Impact: Prevents token replay

### Frontend

8. [ ] **FRONTEND-MED-002**: Error Handling & Toast Notifications
   - Toast notifications for errors
   - Better loading states
   - Effort: Medium
   - Impact: Better UX

9. [ ] **UI-LOW-002**: Improve Loading States
   - Animated spinner instead of "Loading..."
   - Skeleton screens where appropriate
   - Effort: Low
   - Impact: Better UX

---

## Later (P3 Priority)

10. [ ] **UI-LOW-001**: Mobile Navigation Menu
11. [ ] **UI-LOW-003**: Keyboard Navigation Support
12. [ ] **INFRA-MED-002**: Backend Dependency Scanning
13. [ ] **BACKEND-MED-005**: Configurable Completion Threshold

---

## Questions Needing Answers

See `docs/clarity/questions.md`:

- **Q-002**: Email service provider for production?
  - Options: SendGrid, AWS SES, Mailgun
  - Blocking: Production deployment

- **Q-003**: ~~Password policy strictness?~~ ✅ DECIDED
  - **Decision**: Moderate policy (8+ chars, uppercase, lowercase, digit)
  - **Rationale**: Balances security with parent usability for a kids' app
  - **Implemented**: SECURITY-HIGH-005 complete

- **Q-004**: Session timeout duration?
  - Options: Short (15m/1d), Medium (15m/7d), Long
  - Blocking: None, can use current

---

## Technical Debt

- [x] Fix Pydantic deprecation warning (class-based config) ✅ DONE
- [x] Address Python 3.13 `crypt` deprecation ✅ DONE
- [ ] Add password strength indicator to UI (frontend)
- [ ] Add Redis for distributed rate limiting (when scaling)
- [ ] Add type safety to frontend error handling

---

## AI-Native Features (Phase 1 - In Progress)

### Completed ✅

- [x] **AI-001**: Pip Voice (TTS)
  - TTSService with Web Speech API
  - useTTS hook for React components
  - Pip-friendly voice settings
  - Multi-language support (en, hi, kn, te, ta)

- [x] **AI-003**: Pip Quick Responses
  - 60+ child-friendly response templates
  - Stars instead of percentages (⭐⭐⭐)
  - Streak milestone celebrations
  - TTS-Mascot integration

### Remaining (Phase 1)

- [ ] **AI-002**: Letter Pronunciation Audio
  - Need ~334 audio files for all 5 languages
  - English: 52 files (26 letters × 2 sounds)
  - Hindi: 70 files, Kannada/Telugu: 76 each, Tamil: 60
  - Options: Record, source from educational resources, or use TTS

### Phase 2+ (Future)

- [ ] **AI-004**: Voice Input (STT)
- [ ] **AI-005**: Simple Conversations
- [ ] **AI-006**: Story Time
- [ ] **AI-007**: Activity Suggestions

---

## Feature Ideas (Future)

- [ ] Achievement system
- [ ] Data export (JSON/CSV)
- [ ] Parent dashboard analytics
- [ ] Multi-device sync
- [ ] Offline mode

---

## How to Use This List

1. Pick items from "Immediate" or "This Week"
2. Create tickets in WORKLOG_TICKETS.md
3. Follow AGENTS.md workflow
4. Update this list as items complete

---

**Last Updated**: 2026-01-29 (TTS Implementation Complete)
