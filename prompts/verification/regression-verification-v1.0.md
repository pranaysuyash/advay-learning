# Regression Verification Prompt — v1.0

**Category:** Verification  
**Use when:** Any file with significant LOC changes (>10% LOC delta or CCN delta > 10) must be verified by this prompt before committing. Automated checks (TS, tests) are insufficient — this prompt ensures a human-quality agent comparison against the original committed code.

---

## MISSION

Verify that a refactored or LOC-changed file contains **zero regressions**. The standard is:

> **Only additions, improvements, or behavior-preserving refactors are acceptable. Any feature, handler, state variable, callback, or UI element present in the old code must be present in the new code — or have a documented justification for its removal.**

Automated checks (TypeScript, vitest) are necessary but not sufficient. This prompt requires a systematic feature-by-feature comparison between the original committed code and the new code.

---

## OPERATING RULES

- Do NOT modify any files.
- Do NOT use /tmp. All work is read-only analysis.
- Do NOT pass a file just because TS compiles and tests pass — those checks cannot detect silently dropped features.
- Do NOT limit git diff output with `| head -N` — read the full diff and full files.
- All evidence must cite file paths and line ranges.

---

## REQUIRED WORKFLOW

### STEP 1 — Read the OLD committed code in full

```bash
git show HEAD:<path/to/file>
```

For each file under review, read the **entire** original file from git. Do not abbreviate. Extract a complete inventory:

**OLD CODE INVENTORY:**

For each of these categories, list every item present in the old code:

| Category | Items |
|----------|-------|
| State variables (`useState`, `useRef`, `useReducer`) | name, type, purpose |
| Derived values / `useMemo` | name, dependency |
| Side effects (`useEffect`) | trigger deps, what it does |
| Event handlers | name, trigger, behavior |
| Game lifecycle callbacks | name, when called, behavior |
| UI overlays / conditional renders | condition, what is shown |
| Accessibility features | TTS, high-contrast, hand tracking, etc. |
| Constants / config values | name, value |
| Exports | names and types |
| Sub-components (inline) | name, props, purpose |
| Callbacks passed as props | name, direction |
| Persistence / session calls | what is stored/loaded |
| Animation / canvas logic | hooks, requestAnimationFrame loops |
| Error handling / fallback paths | what errors are handled |

### STEP 2 — Read the NEW code in full

Read the new file(s) on disk:

```bash
cat <path/to/file>
# For split files, read ALL sub-modules:
cat <path/to/sub-module-1>
cat <path/to/sub-module-2>
# ...etc
```

Build the same inventory for the new code, noting which file each item is now in.

### STEP 3 — Feature-by-feature comparison

For every item in the OLD CODE INVENTORY, determine:

| OLD item | Present in NEW? | Location in new code | Notes |
|----------|-----------------|----------------------|-------|
| stateVar `foo` | ✅ YES | AlphabetGame.tsx:45 | unchanged |
| handler `handlePop` | ✅ YES | BalloonGameArea.tsx:112 | extracted, behavior identical |
| overlay `streakMilestone` | ❌ MISSING | — | REGRESSION |
| effect `syncRefToState` | ⚠️ PARTIAL | WordBuilder.tsx:290 | combined with another effect — verify deps |

### STEP 4 — Verify change quality

For each item that WAS changed (not just preserved), verify:

- **Extractions to sub-components:** Are all props passed down? Is the callback chain complete? No prop dropped?
- **Consolidated effects:** Do the merged `useEffect`s cover ALL original dep arrays? No stale closure?
- **Extracted pure functions:** Is the logic byte-for-byte equivalent or demonstrably equivalent? No off-by-one, no missing branch?
- **Moved constants:** Are the values identical to the original? Is the import path correct in every consumer?
- **New exports from logic modules:** Do they match the original inline definitions exactly?

### STEP 5 — TypeScript spot-check

```bash
cd src/frontend && npx tsc --noEmit 2>&1 | grep -E "<FileName1>|<FileName2>"
```

Confirm no TS errors in the changed files. This is a quick sanity check, not a substitute for STEP 3.

### STEP 6 — Verdict

Return one of:

**✅ SAFE TO COMMIT** — All features present, all changes are additions/improvements/behavior-preserving refactors. Specific evidence provided.

**⚠️ SAFE WITH NOTES** — All features present but reviewer notes minor concerns (e.g., a useEffect dep array changed in a way that may alter timing). Document each note clearly so a human can decide.

**❌ REGRESSION FOUND** — One or more features from the old code are missing or broken in the new code. List each regression with: old file+line, what it did, where it should be in new code, why it is missing.

---

## REPORT FORMAT

Return a structured report with these sections:

```
## Regression Verification Report — <FileName> — <date>

### Old Code Inventory
[Complete table from STEP 1]

### New Code Inventory  
[Complete table from STEP 2, with locations]

### Feature-by-Feature Comparison
[Complete table from STEP 3]

### Change Quality Assessment
[STEP 4 findings per changed item]

### TypeScript Check
[Command run + output]

### Verdict
[SAFE TO COMMIT / SAFE WITH NOTES / REGRESSION FOUND]
[Evidence for verdict]
```

---

## ACCEPTANCE STANDARD

A file passes regression verification if and only if:

1. Every state variable, effect, handler, callback, overlay, and export from the old code is accounted for in the new code.
2. No behavior changed without a documented reason.
3. All extracted pure functions are provably equivalent to their original inline versions.
4. All moved constants have identical values.
5. All prop chains to sub-components are complete — no prop silently dropped.
6. TypeScript compiles clean for changed files.
7. The reviewer can state with confidence: **"This change is additive or behavior-preserving. No feature was removed."**

If any of (1)–(7) cannot be confirmed with evidence, the verdict is REGRESSION FOUND or SAFE WITH NOTES. Do not guess. Do not assume. Cite the evidence.

---

## WHEN TO USE THIS PROMPT

| Trigger | Action |
|---------|--------|
| File LOC delta > 10% | Required before commit |
| File CCN delta > 10 | Required before commit |
| File split into sub-modules | Required for each sub-module |
| Constants/logic moved to a separate module | Required for the source + destination |
| Multiple `useEffect`s consolidated | Required — stale closure risk |
| Sub-components extracted inline or to new files | Required — prop chain verification |

---

## RELATED PROMPTS

- `prompts/verification/verification-v1.2.md` — post-remediation verification (audit findings)
- `prompts/intent-first/development/intent-first-implementor-v1.0.md` — intent-first implementation (orphan wiring, salvage-before-remove)
- `prompts/review/local-pre-commit-review-v1.0.md` — local commit gate (findings-first)
- `prompts/review/pr-review-v1.6.1.md` — PR review

---

*Prompt version: v1.0 | Created: 2026-03-10 | Owner: Copilot agent coordination*
