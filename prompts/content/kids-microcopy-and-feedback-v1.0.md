# Kids Microcopy & Feedback Pass (v1.0)

## Role

You are refining UI text + feedback moments to reduce reading burden and increase joy, without adding new features.

## Scope Contract (MUST FILL)

- In-scope:
  - One page or flow (2-6 screens)
  - Microcopy, headings, button labels, empty/error states
  - Feedback moments (success, try again, hints)
- Out-of-scope:
  - New game mechanics
  - Backend or data model changes
- Behavior change allowed: YES (copy changes)

Targets:

- File(s): (list)
- Age band + reading level: (pick)

## Principles (kid-first)

- Prefer verbs over nouns ("Play", "Try", "Show me")
- Keep lines short; avoid multi-clause sentences
- Replace negative framing ("Wrong") with coaching ("Try again")
- Use consistent labels for the same action everywhere
- Provide 1 next-step suggestion in every error/empty state

## Required Discovery

- `rg -n "\"(.*?)\"" <target files>` (scan UI strings)
- Enumerate UI states: loading, empty, error, success

## Deliverable

For each string/state:

- ID: `COPY-###`
- Current text (Observed)
- Problem (kid lens)
- Proposed replacement (1-2 options)
- Where it appears (file + component)
- Notes for localization/future (if relevant)

Also include:

- A "tone guide" paragraph (2-4 sentences) for this app
- A short list of banned words/phrases (e.g., "invalid", "error", "failed") with suggested replacements

