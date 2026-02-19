# Vercel React Best Practices → Repo Prompt Curation (v1.0)

## Use When

You’re taking external React guidance (specifically Vercel’s “Introducing React best practices”) and turning it into **repo-native prompts** that match this project’s policies:

- Evidence-first claims (Observed/Inferred/Unknown)
- Scope discipline (one prompt = one job)
- Preservation-first changes

## Inputs

- External source: Vercel blog post (2026-01-14)
- Repo context: `src/frontend` stack, tests, linting, and conventions

## Output Artifacts (in-repo)

Create or update:

1) A prompt that agents can run directly against this repo:
   - `prompts/hardening/react-best-practices-v1.0.md`
2) `prompts/README.md` index entry so it’s discoverable
3) Worklog ticket appended to `docs/WORKLOG_TICKETS.md`

## Curation Rules

- Prefer checklists that map to concrete code actions in this repo.
- Prefer neutral language (“do X if evidence shows Y”) over dogma.
- Include required discovery commands and a verification section.
- Avoid framework-specific mandates unless the repo already uses that framework.

## Acceptance Criteria

- Prompt is usable without external browsing.
- Prompt enforces evidence labels and verification outputs.
- Prompt encourages the Vercel ordering (waterfalls → bundle → renders → micro).
