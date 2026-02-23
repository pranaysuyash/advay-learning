# Product Spec: In-App Video Issue Reporting (Camera Redacted)

**Date:** 2026-02-23  
**Status:** Draft v1 (PM Review)  
**Audience:** Product, Engineering, QA, Privacy/Legal, Support

---

## 1) Problem Statement

Families reporting gameplay issues via text is slow, incomplete, and hard to reproduce. For a kids-first app, written bug reports also create parent friction.

We need an in-app issue reporting flow that captures what happened visually, while protecting child privacy by ensuring the camera feed/thumbnail is hidden in any shared recording.

---

## 2) Goal and Success Criteria

### Goal

Enable users to submit high-quality issue reports in under 60 seconds using short recordings, with privacy-safe defaults.

### Success Criteria (v1)

- ≥ 40% of issue reports are submitted via video within 30 days of launch
- Median support reproduction time decreases by ≥ 30% versus text-only reports
- Upload success rate ≥ 98%
- 0 incidents of unredacted camera feed in submitted clips

---

## 3) Core User Story

As a parent/user, when something goes wrong in a game, I can tap **Report Issue**, record a short clip of the problem, and submit it quickly—knowing my child’s camera feed is automatically hidden.

---

## 4) Product Requirements (v1)

1. **Entry Point**
   - Show `Report issue` from pause/settings/help surfaces in each game.

2. **Recording Flow**
   - Max recording duration: 30–45 seconds.
   - Countdown + “recording” indicator.
   - Stop anytime manually.

3. **Privacy Guardrail (Non-Negotiable)**
   - Camera tile/thumbnail must be excluded or black-masked in exported video.
   - Render overlay text: `Camera hidden for privacy` on masked area.
   - Mic audio OFF by default.

4. **Submission Flow**
   - Preview recording before send.
   - Parent confirmation gate (existing parent gate/PIN where applicable).
   - Optional quick tags (no typing required):
     - Game froze
     - Gesture not detected
     - Wrong scoring
     - Audio issue
     - Other

5. **Metadata Bundle**
   - Game ID, level/activity ID
   - App version/build hash
   - Device/browser/OS
   - Session ID + UTC timestamp
   - Last N client logs/events (redacted)

6. **Reliability + Limits**
   - Clip size cap (e.g., 25–40 MB)
   - Retry upload with exponential backoff
   - Local temp cleanup after successful upload

---

## 5) UX Flow (Proposed)

1. User taps `Report issue`  
2. Safety sheet: “Camera feed will be hidden in recording”  
3. Record starts (countdown + timer)  
4. User reproduces issue  
5. Stop + preview  
6. Select quick issue tag(s)  
7. Parent confirm `Send report`  
8. Success state with reference ID

---

## 6) Privacy and Trust Requirements

### Must-Haves

- No raw camera feed in uploaded clip
- Data minimization: only what support needs
- Encryption in transit and at rest
- Access controls for support staff
- Time-bound retention and deletion

### Recommended Defaults

- Mic OFF by default
- App-only capture over full-device capture
- Parent-facing copy explaining what is and is not sent

### Policy Alignment Needed

Current policy posture emphasizes no raw video storage. This feature introduces user-initiated issue recordings, so legal/privacy copy must explicitly state:

- When recording occurs
- What is captured
- What is masked
- How long data is retained
- How deletion requests are handled

---

## 7) Technical Approaches

### Option A (Preferred): App-Surface Compositing

Record only app/game surfaces and intentionally exclude camera layer. If camera element is part of same render tree, mask region during composition before encoding.

**Pros:** strongest control over privacy and consistency  
**Cons:** more engineering effort

### Option B: Full Screen Capture + Redaction Layer

Capture screen stream then redraw frames into a compositor with guaranteed mask rectangle over known camera region.

**Pros:** faster to prototype  
**Cons:** higher risk if camera region detection fails

**Decision recommendation:** Start with Option A for production-grade privacy assurance.

---

## 8) Non-Goals (v1)

- Free-form typed issue descriptions
- Real-time live support or screen sharing
- Voice transcription pipeline
- Cross-app/system-wide recording

---

## 9) Rollout Strategy

1. Internal dogfood (team + QA)  
2. Limited beta (5–10% users)  
3. Full rollout after privacy QA and incident-free beta

### Launch Gates

- Camera redaction test suite passes across target devices
- Upload reliability metrics stable
- Support workflow can triage incoming clips quickly

---

## 10) Analytics & Monitoring

Track events:

- `issue_report_opened`
- `issue_recording_started`
- `issue_recording_stopped`
- `issue_report_previewed`
- `issue_report_submitted`
- `issue_report_upload_failed`
- `issue_report_deleted_local`

Key dashboards:

- Submission funnel conversion
- Failure rates by device/browser
- Mean time to first engineer reproduction

---

## 11) Risks and Mitigations

1. **Risk:** Unmasked camera appears in clip  
   **Mitigation:** deterministic masking, automated visual QA, block upload if mask validation fails

2. **Risk:** Large files / poor network  
   **Mitigation:** duration + bitrate caps, resumable/retry uploads

3. **Risk:** Parent confusion about privacy  
   **Mitigation:** explicit UX copy + preview + parent confirmation

4. **Risk:** Support overload from many clips  
   **Mitigation:** tag-based triage, rate limits per account/day

---

## 12) Acceptance Criteria (Engineering Ready)

- User can record and submit a report within 60s median path
- Submitted video contains no visible camera feed on tested supported devices
- Parent confirmation gate blocks submission until approved
- Upload response returns a report ID and stores metadata bundle
- Failed uploads provide clear retry state; no silent failures

---

## 13) Open Decisions for Next Discussion

1. Recording duration cap: 30s vs 45s?
2. Retention period: 30 vs 60 vs 90 days?
3. Allow mic audio opt-in for v1 or defer to v1.1?
4. Keep issue tagging fixed list only, or allow optional short text in v1?

---

## 14) Recommendation

Proceed with v1 as a privacy-first launch feature:

- Screen/app recording for issue reporting
- Camera feed always hidden in shared clip
- Parent confirmation before upload
- Structured metadata for fast engineering triage

This balances support quality, implementation speed, and child safety trust.
