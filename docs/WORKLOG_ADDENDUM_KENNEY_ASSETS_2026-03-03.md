### TCK-20260303-017 :: Align Kenney Asset Source To Purchased Bundle
Ticket Stamp: STAMP-20260303T064414Z-codex-v5xp

Type: IMPROVEMENT
Owner: Pranay (human owner, agent: Codex)
Created: 2026-03-03
Status: DONE
Priority: P2

Scope contract:

- In-scope: update Kenney asset source-of-truth docs and tooling to use the purchased all-in-one bundle, preserve existing runtime asset paths, and document agent workflow for asset reuse
- Out-of-scope: game-specific art direction changes, replacing non-Kenney assets, deleting unused assets
- Behavior change allowed: YES (asset refresh from the new canonical local source)

Targets:

- Repo: learning_for_kids
- File(s): `tools/sync_kenney_platformer_assets.sh`, `tools/README.md`, `assets/kenney/README.md`, `docs/SETUP.md`, `AGENTS.md`, Kenney planning docs, `src/frontend/public/assets/kenney/platformer`
- Branch/PR: `codex/wip-kenney-asset-source` -> `main`

Acceptance Criteria:

- [x] Sync tool defaults to the purchased all-in-one bundle's New Platformer Pack
- [x] Docs point agents to check in-project assets first, then the purchased bundle path
- [x] Existing runtime path `src/frontend/public/assets/kenney/platformer` remains the frontend source of truth
- [x] Runtime assets are refreshed from the purchased bundle without changing code URLs

Prompt Trace: direct user instruction with repo workflow applied

Execution log:

- [2026-03-03T06:44:14Z] Created ticket and captured scope. | Evidence: user provided purchased bundle path `/Users/pranay/Projects/adhoc_resources/Kenney Game Assets All-in-1 3.4.0`
- [2026-03-03T06:44:14Z] Verified the purchased bundle contains `2D assets/New Platformer Pack` with `Sprites`, `Sounds`, and `Spritesheets`. | Evidence: directory listing from shell
- [2026-03-03T06:44:14Z] Recorded bundle freshness markers for future updates. | Evidence: bundle root birth timestamp `2026-03-03`; `New Platformer Pack` payload timestamp `2025-12-03`
- [2026-03-03T06:44:14Z] Updated tool and doc references from the old standalone pack path to the purchased all-in-one bundle. | Evidence: repo diffs in target files
- [2026-03-03T06:44:14Z] **Command:** `tools/sync_kenney_platformer_assets.sh` | Output: `characters 45`, `enemies 60`, `tiles 314`, `backgrounds 14`, `sounds 10`
- [2026-03-03T06:44:14Z] Confirmed no non-worklog files still reference the old standalone pack path. | Evidence: `rg -n "/Users/pranay/Projects/adhoc_resources/kenney_new-platformer-pack-1.1|kenney_new-platformer-pack-1.1" --glob '!docs/WORKLOG*' --glob '!node_modules'` returned no matches

Status updates:

- [2026-03-03T06:44:14Z] DONE — Tooling, docs, and runtime asset sync now point to the purchased Kenney bundle while preserving the existing frontend runtime asset paths
