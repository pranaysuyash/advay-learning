# Prompts Index

This folder contains the reusable prompts that govern how agents work on this repo.

## Start Here (Any Agent)

1) Use: `prompts/workflow/agent-entrypoint-v1.0.md`
2) Update tracking: `docs/WORKLOG_TICKETS.md` (append-only)

## Prompt Map (By Role / Job)

### Project Manager (PM)
- Feature PRD + ticket split: `prompts/product/feature-prd-and-ticketing-v1.0.md`
- Backlog grooming: `prompts/product/backlog-grooming-v1.0.md`
- Next focus strategy (personas/SWOT/roadmap): `prompts/product/next-focus-strategy-v1.0.md`
- Lightweight market scan (validation + insights): `prompts/product/lightweight-market-scan-v1.0.md`

### UI / UX
- Repo-aware UX audit: `prompts/ui/repo-aware-ui-auditor-v1.0.md`
- Generic UI review (artifact-based): `prompts/ui/generic-ui-reviewer-v1.0.md`
- UI change spec writer: `prompts/ui/ui-change-spec-v1.0.md`
- Single UI file audit: `prompts/ui/ui-file-audit-v1.0.md`

### Engineering (Dev)
- One-file audit: `prompts/audit/audit-v1.5.1.md`
- Implement audit findings: `prompts/remediation/implementation-v1.6.1.md`
- **Implementation planning (before coding)**: `prompts/planning/implementation-planning-v1.0.md`
- Implement a feature slice (non-audit): `prompts/implementation/feature-implementation-v1.0.md`
- Hardening (one scope): `prompts/hardening/hardening-v1.1.md`
- Generalized hardening (local review, no PR): `prompts/hardening/generalized-implementer-v1.0.md`
- PR review: `prompts/review/pr-review-v1.6.1.md`
- Verify remediation: `prompts/verification/verification-v1.2.md`
- Merge conflicts: `prompts/merge/merge-conflict-v1.2.md`

### Completeness / Delivery
- Completeness check (PASS/FAIL gate): `prompts/review/completeness-check-v1.0.md`

### QA / Tester
- Test plan (manual + automated): `prompts/qa/test-plan-v1.0.md`
- Test execution report: `prompts/qa/test-execution-report-v1.0.md`
- Regression hunt: `prompts/qa/regression-hunt-v1.0.md`

### Support / Feedback
- Feedback/complaint intake → tickets: `prompts/support/feedback-intake-v1.0.md`
- Issue triage → tickets or “need more info”: `prompts/support/issue-triage-v1.0.md`
- QA findings → tickets: `prompts/triage/qa-findings-to-tickets-v1.0.md`

### Security / Privacy
- Threat model: `prompts/security/threat-model-v1.0.md`
- Privacy review (kid + camera): `prompts/security/privacy-review-v1.0.md`
- Dependency audit: `prompts/security/dependency-audit-v1.0.md`

### Release / Ops
- Release readiness: `prompts/release/release-readiness-v1.0.md`
- Post-merge validation (general): `prompts/release/post-merge-validation-general-v1.0.md`

### Deployment / Incident Response
- Deploy/runbook draft: `prompts/deployment/deploy-runbook-v1.0.md`
- Incident response + follow-ups: `prompts/deployment/incident-response-v1.0.md`

### Stakeholder Comms
- Stakeholder status update: `prompts/stakeholder/status-update-v1.0.md`

### Architecture / Tech Lead
- ADR draft: `prompts/architecture/adr-draft-v1.0.md`

### Curriculum / Content
- Learning module spec: `prompts/content/learning-module-spec-v1.0.md`

## Workflow / Tracking

- Worklog update helper: `prompts/workflow/worklog-v1.0.md`
- Handoff note: `prompts/workflow/handoff-v1.0.md`
- Completion report (success/failure evidence): `prompts/workflow/completion-report-v1.0.md`
- Repo hygiene sweep (no stray files): `prompts/workflow/repo-hygiene-sweep-v1.0.md`
- Preservation-first upgrades (no parallel versions): `prompts/workflow/preservation-first-upgrade-v1.0.md`
- Ticket hygiene (avoid ID collisions): `prompts/workflow/ticket-hygiene-v1.0.md`
- Pre-merge clean room gate: `prompts/workflow/pre-merge-clean-room-check-v1.0.md`
- Canonical file finder (prove what’s used): `prompts/workflow/canonical-file-finder-v1.0.md`
- Docs index enforcer (no orphan docs): `prompts/workflow/docs-index-enforcer-v1.0.md`
- Deprecation policy (retire safely): `prompts/workflow/deprecation-policy-v1.0.md`
- Issues workflow policy (worklog is canonical): `docs/ISSUES_WORKFLOW.md`
- Issue sync (ticket ↔ issue): `prompts/workflow/issue-sync-v1.0.md`
- Worklog → Issues triage (batch): `prompts/workflow/worklog-to-issues-triage-v1.0.md`
- Issue → Worklog intake: `prompts/workflow/issue-to-ticket-intake-v1.0.md`
- Pre-flight check (anti-drift): `prompts/workflow/pre-flight-check-v1.0.md`
- Quick process reminder: `docs/process/PROCESS_REMINDER.md`
- Tech debt handling (no “preexisting” excuses): `prompts/workflow/tech-debt-handling-v1.0.md`
- Ownership policy: `docs/process/OWNERSHIP_POLICY.md`
- Prompt curation (external → repo-native): `prompts/workflow/prompt-library-curation-v1.0.md`
- Prompt quality gate (rubric + test cases): `prompts/workflow/prompt-quality-gate-v1.0.md`
- Prompt style guide: `docs/process/PROMPT_STYLE_GUIDE.md`
- Out-of-scope → next audit queue: `prompts/triage/out-of-scope-v1.0.md`
  - Appends to: `docs/AUDIT_BACKLOG.md`
- Generalized triage (local review, no PR): `prompts/triage/generalized-triage-v1.0.md`

## Project Context (Read Before Making Changes)

- Overview: `docs/PROJECT_OVERVIEW.md`
- Architecture: `docs/ARCHITECTURE.md`
- Security & privacy: `docs/security/SECURITY.md`
- Roadmap: `docs/features/ROADMAP.md`
