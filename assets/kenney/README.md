# Kenney Assets - Local Source Guide

**Status:** Canonical local source documented  
**Primary Source:** `/Users/pranay/Projects/adhoc_resources/Kenney Game Assets All-in-1 3.4.0`  
**Local Bundle Snapshot Added:** 2026-03-03  
**Tracked Pack Payload Timestamps (runtime-synced packs):**  
- `2D assets/New Platformer Pack`: 2025-12-03  
**Runtime Source of Truth:** `src/frontend/public/assets/kenney/`  
**License:** CC0 (Public Domain)

---

## Purpose

This folder is documentation-only. It is not the runtime source of truth for the frontend.

For this project:

1. Check whether the needed Kenney asset already exists under `src/frontend/public/assets/kenney/`.
2. If it already exists, reuse that runtime path in code.
3. If it does not exist, source it from the local purchased Kenney bundle:
   - `/Users/pranay/Projects/adhoc_resources/Kenney Game Assets All-in-1 3.4.0`

Do not re-download Kenney packs if the purchased local bundle already contains the needed files.

Use the dates above as the freshness marker:

- `Local Bundle Snapshot Added` tells us when this purchased bundle was placed in the shared local resource folder for this workspace.
- `Tracked Pack Payload Timestamps` list pack-level snapshots currently backed by explicit sync/import workflows.

If Kenney releases newer packs later, update these dates when the local bundle is refreshed so agents can quickly tell whether the repo is using the latest downloaded snapshot.

---

## Preferred Workflow

### Existing runtime asset

If the file already exists in the repo:

```bash
find src/frontend/public/assets/kenney -type f | rg "<asset-name>"
```

Use the existing runtime path directly in code, for example:

```tsx
<img src="/assets/kenney/platformer/collectibles/coin_gold.png" alt="Coin" />
```

### Import from purchased local bundle

If the file is not already in the repo, use the purchased bundle under:

```bash
/Users/pranay/Projects/adhoc_resources/Kenney Game Assets All-in-1 3.4.0
```

For assets previously categorized under "New Platformer Pack," use the all-in-one bundle path directly. Avoid using the `tools/sync_kenney_platformer_assets.sh` script, as it is now deprecated.

For non-platformer packs from the all-in-one bundle:

1. Copy only required files into `src/frontend/public/assets/kenney/<pack-or-domain>/`
2. Avoid creating duplicate runtime roots
3. Document imported pack/file paths in this README

---

## Current Canonical Runtime Paths

- `src/frontend/public/assets/kenney/collectibles`
- `src/frontend/public/assets/kenney/characters`
- `src/frontend/public/assets/kenney/enemies`
- `src/frontend/public/assets/kenney/tiles`
- `src/frontend/public/assets/kenney/backgrounds`
- `src/frontend/public/assets/kenney/sounds`
- `src/frontend/public/assets/kenney/hud`

Keep frontend asset URLs pointed at these runtime paths. Do not introduce alternate duplicate runtime directories unless the project explicitly adopts a new canonical path.

---

## Notes For Agents

- Check the project asset tree first before importing anything new.
- Reuse tracked runtime files whenever possible.
- Use the purchased Kenney bundle as the local source when a new asset is needed.
- If you add new tooling around Kenney assets, document it in `tools/README.md` and `docs/SETUP.md`.

---

**Last Updated:** 2026-03-03  
**Document Version:** 2.0
