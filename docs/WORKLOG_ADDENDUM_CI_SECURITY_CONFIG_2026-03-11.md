### TCK-20260311-007 :: CI Security Config Hardening (CodeQL + Trivy)

Ticket Stamp: STAMP-20260311T160100Z-codex-ci-security-config

Type: TOOLING
Owner: Pranay (execution: Codex)
Created: 2026-03-11
Status: **IN PROGRESS**
Priority: P1

Scope contract:

- In-scope: add explicit repository config for CodeQL and Trivy; update workflows to consume those configs; remove implicit runner-level defaults and deprecated CodeQL action versions.
- Out-of-scope: changing security policy thresholds, suppressing active vulnerabilities, or introducing gate overrides.
- Behavior change allowed: YES (CI behavior only; runtime app behavior unchanged).

Targets:

- Repo: learning_for_kids
- Files:
  - `.github/workflows/codeql.yml`
  - `.github/workflows/trivy.yml`
  - `.github/workflows/scorecards.yml`
  - `.github/codeql/codeql-config.yml`
  - `.github/trivy/trivy.yaml`

Acceptance Criteria:

- [ ] CodeQL workflow references explicit repo config file.
- [ ] Trivy workflow references explicit repo config file.
- [ ] CodeQL SARIF uploads use maintained action major version.
- [ ] No gate overrides used.
- [ ] Local staged gate passes.

Prompt Trace:

- prompts/review/local-pre-commit-review-v1.0.md

Execution log:

- [2026-03-11 16:01 IST] Reviewed active CI workflows and identified missing explicit CodeQL config plus legacy CodeQL action versions. | Evidence: `.github/workflows/codeql.yml`, `.github/workflows/trivy.yml`, `.github/workflows/scorecards.yml`
- [2026-03-11 16:03 IST] Added explicit CodeQL config file and wired workflow to `config-file`. | Evidence: `.github/codeql/codeql-config.yml`, `.github/workflows/codeql.yml`
- [2026-03-11 16:04 IST] Added explicit Trivy config file and wired workflow to `--config`, including `skip-policy-update` for stable policy/runtime compatibility. | Evidence: `.github/trivy/trivy.yaml`, `.github/workflows/trivy.yml`
- [2026-03-11 16:05 IST] Upgraded CodeQL action usage from `v3` to `v4` for init/autobuild/analyze and SARIF upload steps. | Evidence: `.github/workflows/codeql.yml`, `.github/workflows/trivy.yml`, `.github/workflows/scorecards.yml`

Status updates:

- [2026-03-11 16:05 IST] **IN PROGRESS** — Configuration changes applied; running staged gate and final verification next.
