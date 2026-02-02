# Prompt & Persona Registry

Purpose: provide a living reference of the canonical prompts, personas/axes, and required outputs so every agent can quickly understand which combiners are allowed and how they should be documented.

## How to use
- Always cite the prompt file name, persona(s), and audit axis you used (per `AGENTS.md`). Link back to this registry when you chain multiple prompts so downstream agents can trace the reasoning path.
- When a new prompt or persona is introduced, add it to this registry before wide use.
- Use the “Evidence discipline” column as a reminder to label Observed/Inferred/Unknown in downstream deliverables.

## Prompt catalog

| Prompt file | Persona / Axis | Focus & best use | Required outputs | Notes |
| --- | --- | --- | --- | --- |
| `prompts/support/external-feedback-verification-integration-v1.0.md` | Working Agent (external feedback verifier) / Evidence discipline | Validate hypotheses from reviewers/teammates before any code change; suitable for UI, UX, or process feedback. | Sectioned report covering summary, plan, evidence log, findings matrix, decision, backlog specs. | Use when you need to confirm or rebut a claim before reacting. |
| `prompts/qa/randomized-exploratory-testing-pack-v1.0.md` | QA persona mix (parents, kids, researchers) / UI axis | Combine structured checks (lint/tests) with persona-driven exploratory walks on camera/gesture features. | SINGLE RUN OUTPUT FORMAT with structured logs per persona session plus consolidated issues. | Requires 3+ sessions, timers, random action menu, and axis-specific findings. |
| `prompts/planning/planning-first-product-engineering-agent-v1.0.md` | Planning Agent / Strategy axis | Capture the Phase 0–7 planning pipeline before any implementation: Understand product, system, reality, research, plan, tickets, playbook. | Plan cycle scope, Product Core Brief, System Map, Reality Check Log, Research Notes (if used), Plan Doc, Ticket Pack, Implementation Playbook. | Always include prompt/persona table (see new instructions) and note assumptions. |
| `prompts/audit/audit-v1.5.1.md` | Forensic systems auditor / Technical axis | Detailed single-file audit focusing on architecture, performance, dependencies, security. | Audit report with findings, severity, evidence, and recommended remediation tickets. | Use for targeted code reviews with a single file scope. |
| `prompts/ui/child-centered-ux-audit-v1.0.md` | Child learning expert / UX axis | Evaluate learning experience for different age bands, emotional safety, readability. | Report with personas (2–3, 4–6, 7–9), observations, and UI recommendations. | Always link to code/screens mentioned. |
| `prompts/ui/mediapipe-kids-app-ux-qa-audit-pack-v1.0.md` | UX researcher + QA auditor / Camera UX axis | Review camera permissions, gesture guidance, tracking recovery, and parent controls. | Persona sessions (parents, teachers, kids), camera stress log, evidence table. | Ideal for MediaPipe or camera features; requires reproducible steps. |
| `prompts/support/feedback-intake-v1.0.md` | Intake operator / Support axis | Capture incoming feedback or bug reports into tickets with minimal analysis. | Structured ticket draft referencing worklog, severity, requested outcome. | Good for raw user complaints that need triage. |
| `prompts/workflow/pre-flight-check-v1.0.md` | Workflow guardian / Process axis | Ensure environment, hooks, and preconditions are validated before starting work. | Checklist confirming git status, env, prompts used, scope contract. | Run before every new activity to catch drift. |
| `prompts/planning/implementation-planning-v1.0.md` | Implementation planner / Execution axis | Create implementation plan after plan approval, mapping tasks to prompts/workflow. | Implementation plan with scope, acceptance criteria, dependencies. | Use when moving from planning to coding. |

## Weekly cadence reminder
- Run `./scripts/audit_review.sh` at least once per week (per AGENTS instructions) and capture the output (command, results, blocked findings) in the evidence log or worklog entry.
- If the script surfaces new findings, create TCK tickets before starting implementation and reference the prompt/persona table entry created for this run.
