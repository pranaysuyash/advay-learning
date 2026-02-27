# IMPLEMENTATION PLAN: TCK-20260227-011

## Scope
- Feature/scope: Collectibles system correction plan for ages 2-9 with no regressions, proof-driven execution, and CC0/Kenney asset alignment.
- Target files (expected):
  - `src/frontend/src/data/collectibles.ts`
  - `src/frontend/src/data/gameRegistry.ts`
  - `src/frontend/src/data/easterEggs.ts`
  - `src/frontend/src/store/inventoryStore.ts`
  - `src/frontend/src/hooks/useGameDrops.ts`
  - `src/frontend/src/components/inventory/ItemDropToast.tsx`
  - `src/frontend/src/pages/Inventory.tsx`
  - `src/frontend/src/store/profileStore.ts` (or profile settings usage layer)
- Constraints:
  - Preserve existing behavior where not explicitly changed.
  - Additive migration preferred; no destructive removals without explicit replacement and proof.
  - Use existing workflow gates (`agent_gate`, feature regression check, regression checks).
  - CC0-first assets, primarily Kenney.

## Discovery Summary

### Observed
- RNG core is active in drop pipeline.
  - File: `src/frontend/src/data/collectibles.ts`
  - Evidence:
    - `rollDropsFromTable()` uses `Math.random() < entry.chance`.
    - `DropEntry` includes `minScore?: number`.
- Reward processing currently allows empty outcomes.
  - File: `src/frontend/src/store/inventoryStore.ts`
  - Evidence:
    - `processGameCompletion()` returns `[]` immediately when `droppedIds.length === 0`.
- Registry contains many minScore-gated drops.
  - File: `src/frontend/src/data/gameRegistry.ts`
  - Evidence:
    - Drop entries counted: `121`
    - Drop entries with `minScore`: `23`
- Integration coverage is incomplete and score passing is sparse.
  - Evidence command: analysis script over pages/games hooks and callsites
  - Output:
    - `hook_instances 30`
    - `no_call_games 3`:
      - `free-draw`
      - `bubble-pop-symphony`
      - `air-canvas`
    - `with_arg_calls 3`:
      - `color-by-number` (`outcome.state.score`)
      - `platformer-runner` (`score`)
      - `number-tracing` (`nextValue`)
    - `no_arg_calls 24`
- Legacy easter egg file exists alongside registry-driven easter eggs.
  - Files:
    - `src/frontend/src/data/easterEggs.ts` (exports `EASTER_EGGS`, `EASTER_EGGS_BY_GAME`)
    - `src/frontend/src/data/gameRegistry.ts` (inlined per-game `easterEggs` and helper lookups)
  - Usage proof:
    - runtime store/hooks import registry helpers, not legacy arrays.
- Reward UI is text-forward and rarity-labeled.
  - File: `src/frontend/src/components/inventory/ItemDropToast.tsx`
  - Evidence:
    - Toast duration `4000ms`
    - Labels include `New Discovery`, item names, and rarity text (`Common`, `Rare`, etc.)
    - Visual icon uses emoji only.
- Profile model has numeric `age` but no implemented age-band adaptation in reward UI.
  - File: `src/frontend/src/store/profileStore.ts`
  - Evidence:
    - `Profile` includes `age?: number`
    - No `ageBand` field; no reward UI branching by age.
- Local CC0 asset reality:
  - Observed directories:
    - Existing in repo: `src/frontend/public/assets/kenney/platformer/...`
    - Downloaded pack (local, outside repo): `<workspace>/adhoc_resources/kenney_new-platformer-pack-1.1`
  - Observed content in downloaded pack: platformer tiles/characters/enemies/sounds; no dedicated food/item icon set.

### Inferred
- The highest-risk regressions are caused by inconsistent completion signaling (3 games with drop hooks but no completion call) and by empty drop outcomes.
- If minScore remains with current score propagation (3 of 27 callsites pass score), reward behavior stays inconsistent and hard to reason about.
- A deterministic core reward model can be introduced with minimal regressions by keeping existing rarity/category metadata and switching reward selection strategy in one central place.

### Unknown
- True gameplay-level completion semantics for all 30+ games (some may intentionally avoid drops in certain modes).
- Parent expectations for optional surprise mechanics in ages 6-9.
- Exact item icon coverage available from current local CC0 inventory beyond platformer collectibles.

## Options Considered

| Option | Approach | Pros | Cons | Risk |
|---|---|---|---|---|
| A | Keep RNG, patch integration + UX only | Lowest code churn initially | Core fairness issue remains; empty outcomes persist | MED |
| B | Deterministic core reward for all, optional bonus surprise for older ages | Fair baseline, preserves exploration, supports age layering | Needs new reward selector + profile-based branch | LOW-MED |
| C | Fully deterministic only (no bonus RNG) | Simplest compliance posture, easiest to test | Less surprise for older kids unless compensated with progression hooks | LOW |

Recommendation: **Option B**, with strict guardrails:
- Core reward always deterministic and guaranteed.
- Optional bonus is additive only, never replacing core reward.
- Bonus enabled only for older profiles and default-off until validated.

Decision status: **Selected for implementation on 2026-02-27** (core deterministic + bonus path default OFF).

## Detailed Plan (Chosen Option B)

### Phase 1: Stabilize Pipeline and Source of Truth
1. Add a reward event instrumentation layer in the inventory pipeline (`processGameCompletion`) with event types:
   - `REWARD_GRANTED_CORE`
   - `REWARD_GRANTED_BONUS`
   - `REWARD_BLOCKED`
   - `REWARD_DUPLICATE_CONVERTED`
2. Enforce completion coverage:
   - Wire `onGameComplete` calls for:
     - `src/frontend/src/pages/FreeDraw.tsx`
     - `src/frontend/src/pages/BubblePopSymphony.tsx`
     - `src/frontend/src/pages/AirCanvas.tsx`
3. Freeze legacy easter egg drift:
   - Add deprecation header + no-import policy for `src/frontend/src/data/easterEggs.ts`.
   - Route all runtime lookups through `gameRegistry` only.
4. Add temporary diagnostic report script under `tools/`:
   - checks `registry game IDs` vs `useGameDrops IDs` vs `onGameComplete` invocation presence.

### Phase 2: Deterministic Core Rewards
1. Add deterministic selector in collectibles pipeline:
   - Introduce `getCoreReward(gameId, completionIndex, optionalScore)` replacing core use of `rollDropsFromTable` for normal completion.
2. Guarantee non-empty outcomes:
   - `processGameCompletion` must always emit at least one core item for successful completion.
3. Preserve existing item ecosystem:
   - Keep categories, rarities, and recipes intact; only acquisition path changes.
4. Keep `rollDropsFromTable` as fallback utility during migration behind feature flag for rollback.

### Phase 3: Age-Layered Reward Presentation
1. Define age-layer derivation (without schema break):
   - derive `ageBand` from numeric profile age:
     - `2-5`: pre-reader-first
     - `6-9`: mixed literacy
2. Update `ItemDropToast`:
   - universal: larger icon, visual celebration, audio cue, longer visibility window
   - `2-5`: visual/audio-first; no rarity words required
   - `6-9`: optional text layer (item name, rarity label, fun-fact cue)
3. Update Inventory details with progressive disclosure:
   - Keep full detail panel available for older profiles/parents.
   - Show age-appropriate minimal mode for younger profiles.

### Phase 4: CC0/Kenney Asset Migration
1. Canonical item icon path strategy:
   - Add `icon?: string` to `CollectibleItem`.
   - Keep emoji fallback.
2. Establish manifest-backed icon mapping:
   - `src/frontend/public/assets/items/manifest.json` (`itemId -> icon path`).
3. Use available local assets first:
   - Existing platformer collectibles and symbols map to subset of items.
4. For uncovered items (food/elements/etc.):
   - stay on emoji fallback until corresponding CC0 icons are imported.
   - do not block core reward redesign on full icon completion.
5. Remove duplicate folder ambiguity over time:
   - standardize on one path (`assets/kenney/...` or `assets/kenney-platformer/...`) with compatibility redirects during migration.

### Phase 5: Easter Egg Discoverability
1. Add hint stages with profile sensitivity:
   - stage 1 visual cue
   - stage 2 mascot cue
   - stage 3 text clue (older band)
2. Add collection silhouettes/progress affordance in inventory/sticker view.
3. Add guard metric: undiscovered long-tail eggs by game/session count.

## Testing Strategy

### Unit Tests
- Reward selector tests:
  - deterministic core output by `gameId` + completion index
  - duplicate conversion behavior
  - optional bonus branch only for eligible age band
- Store tests:
  - `processGameCompletion` never returns empty when completion is valid
  - instrumentation events emitted with expected payloads
- UI tests:
  - `ItemDropToast` renders age-layer variants correctly
  - fallback emoji appears when icon unavailable

### Integration Tests
- Game completion wiring test for 30 registry games:
  - every game with `useGameDrops` has completion path coverage.
- End-to-end inventory update:
  - completion event increments inventory and shows toast.
- Easter egg source-of-truth test:
  - no runtime dependency on legacy `easterEggs.ts`.

### Regression and Gate Checks
- `./scripts/agent_gate.sh --staged`
- `./scripts/feature_regression_check.sh --staged`
- `./scripts/regression_check.sh --staged`
- Additional LOC/churn + complexity evidence:
  - include lizard metrics for modified large files in verifier notes.

### Manual Verification
1. Create two profiles (`age=4`, `age=8`) and complete the same game.
2. Verify both get guaranteed core item.
3. Verify younger profile sees visual/audio-first toast.
4. Verify older profile sees text layer (if enabled).
5. Verify `free-draw`, `bubble-pop-symphony`, and `air-canvas` now produce completion rewards.

## Verification Checklist
- [ ] All registry games wired to completion path or explicitly documented exceptions.
- [ ] Core completion always yields at least one reward.
- [ ] No runtime imports from legacy easter egg source.
- [ ] Age-layer reward UI works for `2-5` and `6-9`.
- [ ] Emoji fallback works when icon path missing.
- [ ] Pre-commit local checks pass without bypass flags.
- [ ] Worklog addendum and plan docs updated with evidence.

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Deterministic migration alters perceived drop pacing | MED | MED | Feature flag + side-by-side telemetry before full switch |
| Hidden completion paths missed in some games | MED | HIGH | Automated coverage script for hook-to-call validation |
| Asset path churn causes broken icons | MED | MED | Manifest mapping + fallback emoji + path smoke test |
| Age-layer logic introduces profile edge bugs | LOW | MED | Derive ageBand from existing age field; default safe mode |
| Legacy/registry easter egg divergence reappears | MED | MED | Add lint/check disallowing runtime imports from legacy file |

## Rollback Plan
- Keep `rollDropsFromTable` path behind feature flag during migration.
- If deterministic rollout causes issues:
  1. Disable deterministic flag to restore RNG path.
  2. Keep coverage/instrumentation and UI improvements active (safe additive wins).
  3. Re-run staged regression checks.
- Files most likely requiring rollback:
  - `src/frontend/src/store/inventoryStore.ts`
  - `src/frontend/src/data/collectibles.ts`
  - `src/frontend/src/components/inventory/ItemDropToast.tsx`

## Concrete Evidence Anchors (Commands + Outputs)
- `rg -n "rollDropsFromTable|Math\\.random\\(|minScore" src/frontend/src/data/collectibles.ts src/frontend/src/data/gameRegistry.ts`
  - Confirms RNG + minScore design in production code.
- Completion coverage audit script output:
  - `hook_instances 30`
  - `no_call_games 3` (`free-draw`, `bubble-pop-symphony`, `air-canvas`)
  - `with_arg_calls 3`
  - `no_arg_calls 24`
- `find <kenney_download_dir>/kenney_new-platformer-pack-1.1 -maxdepth 3 -type d`
  - Confirms downloaded pack scope (platformer assets, no food icon pack).

## Open Decisions for Product Owner
1. Should bonus surprise be enabled by default for ages 6-9, or shipped disabled behind parent toggle?
2. Should rarity labels remain visible in inventory for ages 6-9, or moved fully to visual tiering?
3. Should minScore be retained only for bonus rewards, or removed entirely from reward eligibility?
4. Which canonical asset path should be retained long-term: `assets/kenney/` vs `assets/kenney-platformer/`?
5. What is the target policy for undiscovered easter egg hint timing (session count threshold)?

## Execution Addendum (2026-02-27)

### Implemented in code
- Phase A: Item icon manifest + runtime preload + `ItemIcon` fallback integrated in toast and inventory.
- Phase B: Profile-level bonus controls added (`enableOlderBonus`, `showRarityTextForOlder`) with Settings toggles and default-safe behavior.
- Phase C: Egg hint persistence + stage progression API (`recordEggSession`, `getEggHints`, `advanceEggHint`) plus silhouette/progress rendering in Inventory.
- Phase D (partial): Added focused tests for manifest mapping and store-level bonus/hint behavior.

### Validation snapshot
- `Observed`: `./scripts/agent_gate.sh --staged` passes for collectibles-only staged set after addendum update.
- `Observed`: `./scripts/feature_regression_check.sh --staged` passes and reports no obvious regression; lizard LOC/complexity checks executed on all >10% touched files.
- `Observed`: `./scripts/regression_check.sh --staged` runs all frontend tests successfully for the staged set, then fails at global type-check due unrelated existing errors in:
  - `src/frontend/src/components/ui/AccessDenied.tsx`
  - `src/frontend/src/data/gameRegistry.ts`
  - `src/frontend/src/pages/KaleidoscopeHands.tsx`
  - `src/frontend/src/services/subscriptionApi.ts`

### Checklist status update
- [x] Core completion remains deterministic and non-empty in store flow.
- [x] Bonus requires explicit eligible settings path.
- [x] Emoji fallback preserved when icon path missing/broken.
- [x] LOC-based regression review executed for >10% changes.
- [ ] Full repo `regression_check` green (blocked by unrelated pre-existing TS errors listed above).
