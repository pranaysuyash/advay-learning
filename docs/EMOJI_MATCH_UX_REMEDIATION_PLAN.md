## Emoji Match UX Remediation Plan (TCK-20260220-004)

### Problem & Approach
Emoji Match audits (video UX + gameplay + tracking analysis) report critical toddler usability issues: hand-tracking cursor visibility, coordinate mapping mismatch due to object-cover cropping, start button not hand-tracked, overly strict timing, and confusing progress labels. I will remediate these in the Emoji Match game by updating cursor rendering, mapping hand coordinates to the displayed camera feed, enabling pinch-to-start, expanding hit tolerance/target sizing, and updating progress/timer copy. The remediation will follow `prompts/remediation/implementation-v1.6.1.md`, with required discovery commands, unit tests for mapping logic, and targeted frontend test execution.

### Todos
1) Run remediation discovery commands (git status/fetch/diffs + targeted rg for EmojiMatch). ✅
2) Add a reusable coordinate mapping helper + unit tests for object-cover alignment. ✅
3) Update EmojiMatch gameplay/UI: cursor size/contrast, pinch-to-start, progress/timer copy, tracking-loss overlay. ✅
4) Adjust Emoji Match target sizing and hit radius to toddler-friendly thresholds. ✅
5) Run relevant frontend tests (vitest for affected utils/games) and capture outputs. ✅

### Progress Summary
- Implemented cover-aware hand coordinate mapping helper + tests.
- Updated EmojiMatch cursor visibility, pinch-to-start alignment, tracking-loss overlay, progress copy, timing, target sizing, onboarding tutorial, voice prompts, adaptive difficulty, pacing transitions, and success animations.
- Ran vitest for coordinateTransform, emojiMatchLogic, and GamePages smoke tests (AirCanvas smoke still failing, unrelated).

### Next Steps
1) Optionally run broader frontend tests (smoke + game pages) and update verification artifacts.
2) Capture any UX validation artifacts if needed.

### Notes
- Scope source: `docs/audit/game__emoji_match__video_ux_audit_2026-02-20.md` + `docs/audit/emoji_match_detailed_qa_report_2026-02-20.md`.
- Behavior change: YES (gameplay pacing/interaction changes).
