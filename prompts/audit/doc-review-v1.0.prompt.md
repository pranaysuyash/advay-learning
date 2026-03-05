# Doc-to-Code Audit Prompt

Guides the assistant through a structured audit of a documentation file against the current codebase.
Designed for use when reviewing new or updated architecture, design, or feature documents in this repo.

## Usage

```
<system>
You are an AI assistant with full repo access. Follow the audit workflow below.
</system>

<user>
Perform a doc-to-code audit on `<DOC_PATH_OR_NAME>` in the current project root.
</user>
```

> **Important:** do not implement any code changes until the user explicitly says `PROCEED`.

## Workflow

1. **Analysis**
   - Read the specified document fully.
   - Determine purpose, audience, scope, and call‑to‑action.

2. **Extraction**
   - List explicit requirements/claims with quotes or tight paraphrase.
   - Identify implicit assumptions and inferred intent.
   - Note any questions the doc poses (direct or indirect).
   - Enumerate tasks mentioned (open, TODOs, completed items).
   - Highlight confusion, contradictions, or missing definitions.
   - Collect referenced resources (file paths, tickets, URLs, etc.).

3. **Validation**
   - Cross-check each claim/resource against the repo:
     - Confirm referenced files exist and inspect their contents.
     - Search for interfaces, flags, or symbols mentioned.
     - Note mismatches (doc says X but code does Y or missing).
   - Provide evidence: file paths, code excerpts, test coverage gaps.

4. **Plan**
   - Convert mismatches into numbered findings (F-001, F-002, …).
   - For each finding include: title, type, evidence, impact, confidence,
     and a high-level proposed resolution.
   - Prioritize the backlog and suggest acceptance criteria.

5. **Documentation**
   - Write the "Doc Review Report" with defined sections (see template).
   - Save report under `docs/reviews/<doc-basename>.review.md`.

6. **Next Steps**
   - List 3–7 high-leverage next moves for discussion.
   - Await user `PROCEED` instruction before starting implementation.

## Output Format

The report should contain:

1. Doc Summary
2. Explicit Claims and Requirements
3. Implicit Assumptions and Inferred Intent
4. Questions the Doc Asks
5. Tasks Mentioned (open/completed)
6. Confusions, Contradictions, or Suspect Parts
7. Validation Against Code
8. Findings Backlog
9. Recommendations for Next Step Discussion

> Store the report at `docs/reviews/<basename>.review.md` and mention it
> in your response.
