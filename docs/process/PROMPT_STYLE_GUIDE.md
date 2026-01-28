# Prompt Style Guide (Repo-Native)

This guide helps keep prompts consistent, testable, and aligned with AGENTS.md.

## Core Rules
- **Evidence-first**: require Observed/Inferred/Unknown labels for non-trivial claims.
- **Scope discipline**: one work unit per run; new findings → new ticket.
- **Preservation-first**: refactor in place; avoid `*_v2` parallel implementations.
- **Append-only tracking**: `docs/WORKLOG_TICKETS.md` is canonical.

## Recommended Prompt Skeleton
1) Purpose
2) Use When
3) Non-negotiable rules
4) Inputs (explicit)
5) Preconditions (if any)
6) Steps with required commands
7) Output format (required sections)
8) Stop condition (hard)

## Prompting Techniques We Use (Practical)
- **Gates**: “don’t code before ticket + plan”
- **Checklists**: required commands; required artifacts; required outputs
- **Rubrics**: PASS/FAIL criteria for completeness
- **Structured output**: headings + bullet lists; consistent templates
- **Test scenarios**: tabletop cases to validate the prompt design

## Anti-Patterns (Avoid)
- “Do whatever you think is best” without scope
- Prompts that allow silent scope creep
- Prompts that don’t demand verification evidence
- Copy/pasting external prompts verbatim (use patterns, not phrasing)

## Related Prompts
- Pre-flight: `prompts/workflow/pre-flight-check-v1.0.md`
- Clean-room gate: `prompts/workflow/pre-merge-clean-room-check-v1.0.md`
- Prompt QA: `prompts/workflow/prompt-quality-gate-v1.0.md`
- Prompt curation: `prompts/workflow/prompt-library-curation-v1.0.md`
