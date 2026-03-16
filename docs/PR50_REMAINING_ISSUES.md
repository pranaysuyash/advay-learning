# PR #50 Remaining Issues - Action Plan

**Generated:** 2026-03-15 23:15  
**PR:** https://github.com/pranaysuyash/advay-learning/pull/50  
**Status:** 29 issues fixed, ~58 remaining (if PR not merged)

---

## Summary

- **Total issues identified:** 145
- **Files affected:** 71
- **Fixed in this PR:** 29 issues
- **Remaining:** ~116 issues (some duplicates/overlapping)

---

## Priority Breakdown

### P0/Critical (4 issues) - Block functionality

| File | Line | Issue |
|------|------|-------|
| `src/frontend/src/pages/MidlineViolator.tsx` | 29 | No webcam mounted - pose tracking never produces landmarks |
| `src/frontend/src/pages/MidlineViolator.tsx` | 82 | Normalized coords not converted before canvas comparison |
| `src/frontend/src/pages/shadow-portal/ShadowPortal.tsx` | 132 | `isPlaying` never set - loop/hand tracking never run |
| `tools/cv_gap_analysis.py` | 143 | Indentation error - script fails with `IndentationError` |

### P1/High (40 issues) - Break features

| File | Line | Issue |
|------|------|-------|
| `src/frontend/src/pages/NumberBubblePop.tsx` | 121, 141, 149, 150 | Normalized coords treated as pixels, hit test broken |
| `src/frontend/src/pages/NumberTracing.tsx` | 74, 82, 109 | Pinch release doesn't trigger completion, coords wrong |
| `src/frontend/src/pages/PopTheNumber.tsx` | 154, 160 | Normalized coords vs pixel bounds, pinch fires every frame |
| `src/frontend/src/pages/BubblePop.tsx` | 373, 432 | Hook never starts, never stops on menu |
| `src/frontend/src/pages/BubblePopSymphony.tsx` | 364 | Hook never starts, no webcam wired |
| `src/frontend/src/pages/ColorMixing.tsx` | 36, 322 | `hoveredButtonId` never set, duplicate hover IDs |
| `src/frontend/src/pages/ColorPotions.tsx` | 638 | Hook never started |
| `src/frontend/src/pages/ColorSplash.tsx` | 107 | Stale state on completion score |
| `src/frontend/src/pages/EarthTimeMachine.tsx` | 91 | Hand tracking never starts |
| `src/frontend/src/pages/MoneyMatch.tsx` | 165 | Hand tracking never started |
| `src/frontend/src/pages/OddOneOut.tsx` | 83, 86 | Hook never started |
| `src/frontend/src/pages/SizeSorting.tsx` | 83, 185 | Hook never started, coords wrong |
| `src/frontend/src/pages/RhythmTap.tsx` | 142, 161 | Hook never started |
| `src/frontend/src/pages/PatternPlay.tsx` | 122, 283 | Hook never started, button resubmits |
| `src/frontend/src/pages/WordBuilder.tsx` | 509 | Auto-start fires after timeout |
| `src/frontend/src/pages/SimpleAddition.tsx` | 196 | Auto-start skips menu |
| `src/frontend/src/pages/SpellPainter.tsx` | 78 | Normalized coords not converted to canvas pixels |
| `src/frontend/src/games/wordBuilderLogic.ts` | 244 | Grid size ignores 120px diameter - overlaps on mobile |
| `src/frontend/src/services/ai/llm/LLMService.ts` | 152 | Drops beta rollout guard |
| `find_missing_previews.py` | 16, 49 | Regex can't parse manifests, wrong indentation |
| `osv-scanner.toml` | 1, 10 | Config in wrong place, wrong table name |
| `src/frontend/debug-mirrormaze.js` | 1 | ESM syntax error |
| `src/frontend/debug-mirrormaze.ts` | 4 | Flags in wrong place |
| `.github/workflows/merge-readiness-gate.yml` | 113 | Ignores bot threads |

### P2/Major (50 issues) - Degrade UX

| File | Line | Issue |
|------|------|-------|
| `src/frontend/src/pages/BubbleCount.tsx` | 93, 317 | Hook never starts, coords wrong |
| `src/frontend/src/pages/ColorByNumber.tsx` | 98, 118, 247 | Hook never starts, coords wrong |
| `src/frontend/src/pages/BalloonPopFitness.tsx` | 722 | Hook never started/bound |
| `src/frontend/src/pages/BeatBounce.tsx` | 217 | Hook never started |
| `src/frontend/src/pages/RainbowBridge.tsx` | 196 | Hook never started |
| `src/frontend/src/pages/ReadingAlong.tsx` | 276, 335 | Hook never started, readiness check prevents start |
| `src/frontend/src/pages/SoundGarden.tsx` | 59 | WebcamRef not bound |
| `src/frontend/src/pages/TasteMatch.tsx` | 64 | WebcamRef not mounted |
| `src/frontend/src/pages/TemperatureSort.tsx` | 219 | Hook never started/bound |
| `src/frontend/src/pages/TextureExplorer.tsx` | 64 | WebcamRef not bound |
| `src/frontend/src/pages/ShapeStacker.tsx` | 78, 295, 127 | Hook never starts, coords wrong, state not reset |
| `src/frontend/src/pages/MidlineViolator.tsx` | 69, 167, 164 | Stale closure, camera unspecified, background color |
| `src/frontend/src/pages/shadow-portal/ShadowPortal.tsx` | 68, 102, 133, 197 | Canvas not drawn, color/type mismatch, isPlaying not reset, particle removal |
| `src/frontend/src/pages/PackLunchbox.tsx` | 294 | Webcam mounted unconditionally |
| `src/frontend/src/pages/SpellingRun.tsx` | 144, 197 | RAF loop runs when idle, incomplete fallback |
| `src/frontend/src/pages/CountingObjects.tsx` | 178 | Scroll container removal causes clipping |
| `src/frontend/src/data/gameRegistries/*.ts` | Various | CV tag misclassifications (Earth Time Machine, Pack Lunchbox, colorSplash, wordWorkshop, labOfWonders drops) |
| `docs/*.md` | Various | Documentation issues (evidence labels, contradictions, worklog structure) |
| `scripts/*.sh` | Various | Script gate issues (sidecar guard, phrasing gate, SKIP_FEATURE_CHECK) |
| `tools/*.py` | Various | Tool issues (eval security, path normalization, header row skip) |

### P3/Minor (22 issues) - Polish

| File | Line | Issue |
|------|------|-------|
| `src/frontend/src/pages/__tests__/Register.test.tsx` | 46 | Test depends on exactly one checkbox |
| `src/frontend/src/components/CelebrationOverlay.tsx` | 177 | Timeout doesn't match callers (2000ms vs 2500ms) |
| `src/frontend/src/components/GameCard.tsx` | 78 | `simpleMode` default hides metadata |
| `src/frontend/src/config/launch.ts` | 18 | Local-AI flag default changed |
| `src/frontend/src/hooks/useGameHandTracking.ts` | 173 | Default runtime changed from worker to main-thread |
| `src/frontend/src/hooks/useHandInteraction.ts` | 85 | `onPinchStart` can fire multiple times |
| `src/frontend/src/games/wordBuilderLogic.ts` | 251 | 1920px viewport assumption |
| `.agent/STEP1_ENV.sh` | 3 | Session env alignment |
| `.github/copilot-instructions.md` | 57 | Force-push exception wording |
| `.github/workflows/pr-failure-narrative-gate.yml` | 99 | Regex misses reversed phrasings |
| `AGENTS.md` | 978 | Hook table omits DB migration guard |
| `docs/WORKLOG_ADDENDUM_CV_GAPS_FIX_2026-03-15.md` | 3 | Worklog append vs prepend |
| `docs/tickets/TCK-*.md` | Various | Ticket structure issues |
| `docs/ux_audit/UX_AUDIT_COMPREHENSIVE_2026-03-15.md` | 382, 516 | Contradictions, score reintroduction |
| `osv-scanner.toml` | Various | Config issues |
| `prompts/content/game-design-prompt-v1.0.md` | 97, 125 | CV mode list, voice omission |

---

## Action Plan (If PR Not Merged)

### Phase 1: Fix P0/Critical (4 issues)
1. **MidlineViolator.tsx** - Add webcam element, fix normalized coords
2. **ShadowPortal.tsx** - Set `isPlaying` on game start
3. **cv_gap_analysis.py** - Fix indentation error

### Phase 2: Fix P1/High (40 issues)
- Group by file for efficiency
- Focus on games with multiple P1 issues first (NumberBubblePop, NumberTracing, PopTheNumber, BubblePop)
- Fix coordinate system issues systematically (normalized → viewport/canvas conversion)
- Fix hand tracking start/stop lifecycle across all games

### Phase 3: Fix P2/Major (50 issues)
- Registry CV tag corrections
- Documentation evidence labels
- Script gate fixes
- Tool improvements

### Phase 4: Fix P3/Minor (22 issues)
- Polish and refactors
- Test improvements
- Minor documentation fixes

---

## Files Requiring Most Attention

| File | P0 | P1 | P2 | P3 | Total |
|------|----|----|----|----|-------|
| `src/frontend/src/pages/MidlineViolator.tsx` | 2 | 1 | 2 | 0 | 5 |
| `src/frontend/src/pages/shadow-portal/ShadowPortal.tsx` | 1 | 2 | 3 | 0 | 6 |
| `src/frontend/src/pages/NumberBubblePop.tsx` | 0 | 4 | 0 | 0 | 4 |
| `src/frontend/src/pages/NumberTracing.tsx` | 0 | 3 | 1 | 0 | 4 |
| `src/frontend/src/pages/PopTheNumber.tsx` | 0 | 3 | 0 | 0 | 3 |
| `src/frontend/src/pages/BubblePop.tsx` | 0 | 2 | 2 | 0 | 4 |
| `src/frontend/src/pages/PatternPlay.tsx` | 0 | 2 | 4 | 0 | 6 |
| `src/frontend/src/pages/RhythmTap.tsx` | 0 | 2 | 2 | 0 | 4 |
| `tools/cv_gap_analysis.py` | 1 | 1 | 3 | 0 | 5 |

---

## Notes

- **Coordinate System Issues:** Many P1 issues stem from mixing normalized (0-1) coordinates with viewport/canvas pixels. The fix pattern is consistent: multiply by container dimensions.
- **Hand Tracking Lifecycle:** Many games declare `useGameHandTracking` but never call `startTracking()` or wire `webcamRef`.
- **Registry CV Tags:** Several games have `cv: ['hand']` but no implementation (Earth Time Machine now fixed, Pack Lunchbox fixed).
- **False Positives:** BubblePop.tsx unused import alerts are false - all imports ARE used.

---

**Next Steps:**
1. Wait for PR merge decision
2. If not merged, tackle Phase 1 (P0) immediately
3. Create focused follow-up PRs per phase to maintain scope discipline
