# TCK-20260131-115 :: Launch Hitlist v1 — Implementation Plan

Goal: Turn the Top-10 launch levers into a sequenced, verifiable execution plan (small PRs; no scope creep).

Related research:
- `docs/research/RESEARCH-015-LAUNCH-HITLIST.md`
- `docs/BRAND_KIT.md`
- `docs/audit/ui__camera_game_screen_ux_audit_2026-01-30.md`
- `docs/audit/ANALYTICS_TRACKING_AUDIT.md`
- Existing plans:
  - `docs/plans/TCK-20260131-105-implementation-plan.md` (analytics MVP)
  - `docs/plans/TCK-20260131-106-implementation-plan.md` (camera UX standard)

## Discovery Summary

**Observed**:
- Repo already contains brand tokens + usage guidance in `docs/BRAND_KIT.md`.
- Camera UX problems (overlay overload, technical leakage) are documented in `docs/audit/ui__camera_game_screen_ux_audit_2026-01-30.md`.
- A progress ingestion surface exists (see ticket `TCK-20260131-105`).

**Inferred**:
- The fastest path to “feels premium + works” is: (1) camera-first layouts + prompts, (2) brand token enforcement, (3) tracking correctness, (4) visible progress.

**Unknown**:
- Exact root causes for all “tracking not working” reports without reproductions and logs per device/browser.

## Options Considered

| Option | Approach | Pros | Cons | Risk |
|---|---|---|---|---|
| A | “Big bang” redesign + refactor | Fast aesthetic shift | High regression risk | HIGH |
| B | Tokenize + apply to priority surfaces first | Controlled change; measurable | Requires discipline; partial coverage initially | MED |
| C | Patch per-screen ad-hoc | Quick local wins | Inconsistent UI; hard to maintain | MED |

**Recommendation**: Option B — introduce/strengthen design tokens and apply them to (1) game shells and (2) top-flow pages first, while separately fixing tracking reliability.

## Execution Plan (Chosen Option)

### Phase 0: Hygiene + Freeze Rules (1 PR)
1. Add a worklog “Errata / collisions” note to stop further ticket-ID drift (append-only).
2. Define “no deletion” policy for artifacts in tickets (move to `docs/audit/archive/` only when needed; keep pointers).

### Phase 1: Look Premium (2–3 PRs)
1. **Brand token enforcement**
   - Replace gradient-heavy primary surfaces with brand palette + subtle elevation (no persistent animations).
   - Targets: game shells + entry pages (`Home`, `Games`, auth).
2. **Prompt legibility**
   - Standardize the “two-stage goal prompt” pattern + TTS replay affordance across camera games.

### Phase 2: Feel Reliable (2–4 PRs)
1. **Tracking QA harness**
   - Add a dev-only diagnostics overlay and a repeatable QA checklist (docs + optional debug UI).
2. **Connect-the-Dots camera-first repair**
   - Ensure end-to-end play works via camera (pinch/point) with stable success confirmation.
3. **Finger counting verification**
   - Validate 0/5/10 and 2-hand sum, add tests where feasible.

### Phase 3: Be Trustworthy + Sticky (2–3 PRs)
1. **Analytics/progress MVP**
   - Implement `TCK-20260131-105` slices; surface simple parent progress.
2. **Rewards pacing**
   - Rate-limit streak/score increments; keep “burst celebrations only.”
3. **Onboarding (first 30 seconds)**
   - Permission → camera ready → first success; minimal nav.

## Testing Strategy

- Unit:
  - Finger counting heuristics (existing tests should be expanded when new edge cases are found).
  - Hit-testing / selection logic for camera-driven UI.
- Integration:
  - Each game page: start → play loop → success → next prompt.
  - Progress events emitted and persisted via `/progress/batch` (when implementing analytics slices).
- Manual:
  - 5-minute kid-flow: open app → allow camera → complete 3 successes in 2 games.
  - Lighting/distance matrix: bright daylight, indoor warm light, low light; near/far hands.

## Verification Checklist

- [ ] Camera remains hero during play (≥70% height, ≤3 overlays)
- [ ] Prompts are kid-legible (big center + TTS replay)
- [ ] No “AI giveaway” gradients on primary surfaces
- [ ] Connect-the-Dots works end-to-end using camera mechanics
- [ ] Finger counting passes 0/5/10 + 2-hand sum in manual QA
- [ ] Analytics MVP emits privacy-safe events (no raw landmarks/media)
- [ ] Streak/score increments are rate-limited and feel earned

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Regressions from style changes | MED | MED | Limit PR scope; screenshot/QA checklist per PR |
| Tracking variability across devices | HIGH | HIGH | Add diagnostics + fallback UX; document constraints |
| Analytics meta_data privacy drift | MED | HIGH | Strict whitelist + server-side validation |

## Rollback Plan

- Revert per-PR; keep UI changes behind minimal CSS token layer where possible.
- For tracking experiments, gate behind a dev flag / setting.

