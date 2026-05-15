# WORKLOG ADDENDUM: Standardize UI Across Games

## Date: 2026-03-16
## Author: AI Agent

### Completed Actions
- Created Python script `tools/codemod_ui.py` to automate regex-based replacement of `motion.button` and `button` instances across games, injecting the exact standard `GameStartButton`.
- Applied `GameStartButton` to 22 games safely using the codemod script.
- Re-applied `GameHUD` and `GameStartButton` manual integrations for `FreeDraw.tsx`, `StorySequence.tsx`, `CircleDrawing.tsx`, and `PhonicsSounds.tsx`.
- Ran `type-check` to confirm syntax and types are solid.

### Next Steps / Reasoning
Continuing to apply standard `GameStartButton` and `GameHUD` to the remaining ~90 games manually or through iterative scripts based on edge cases found throughout the UI hierarchy of each file.
Prompt Trace: prompts/review/local-pre-commit-review-v1.0.md
