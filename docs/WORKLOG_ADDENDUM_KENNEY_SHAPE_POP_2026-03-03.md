### TCK-20260303-020 :: Integrate Kenney Assets into Shape Pop

Ticket Stamp: STAMP-20260303T080235Z-codex-tyi9

Type: ASSET_INTEGRATION
Owner: Pranay
Created: 2026-03-03 13:30 IST
Status: **IN_PROGRESS**
Priority: P1

Scope contract:

- In-scope: Integrate Kenney game assets (gems, coins, stars, hearts) into Shape Pop for visual enhancement
- Out-of-scope: Creating new games, backend changes
- Behavior change allowed: YES (visual assets only, game mechanics preserved)

Targets:

- Repo: learning_for_kids
- File(s): `src/frontend/src/pages/ShapePop.tsx`
- Kenney assets: `src/frontend/public/assets/kenney/platformer/collectibles/`, `hud/`
- Branch/PR: local development

Inputs:

- Kenney assets README: `assets/kenney/README.md` - CC0 licensed, runtime paths documented
- Available assets: `collectibles/gem_blue.png`, `coin_gold.png`, `star.png`, `hud/hud_heart.png`
- Current Shape Pop: Uses emoji shapes (◯, △, □, ◇, ☆)

Acceptance Criteria:

- [ ] Replace emoji shapes with Kenney collectibles (gems, coins, stars)
- [ ] Add heart HUD for streak visualization
- [ ] Maintain existing game mechanics (scoring, streaks, difficulty)
- [ ] TypeScript and ESLint pass
- [ ] Worklog updated with evidence

Prompt Trace: direct user instruction with repo workflow applied
Prompt Trace: prompts/review/local-pre-commit-review-v1.0.md

Execution log:

- 2026-03-03 13:30 IST | Identified available Kenney assets | Evidence: gem_blue.png, coin_gold.png, star.png in collectibles/; hud_heart.png in hud/
- 2026-03-03 13:30 IST | Reviewed Kenney asset guidelines | Evidence: `assets/kenney/README.md` - use runtime paths, CC0 license
- 2026-03-03 13:30 IST | Planned integration | Evidence: Replace 5 emoji shapes with 3 Kenney collectibles + variations
- 2026-03-03 13:45 IST | **Implemented Kenney asset integration** | Evidence:
  - Added `KENNEY_TARGETS` array with gem (15 pts), coin (10 pts), star (20 pts)
  - Added heart HUD with full/empty hearts for streak visualization
  - Replaced emoji rendering with `<img>` tags using Kenney assets
  - Updated menu with collectible preview showing point values
  - Updated all feedback text to reference collectibles instead of shapes
- 2026-03-03 13:50 IST | TypeScript check passed | Evidence: `npm run type-check` - no errors
- 2026-03-03 13:50 IST | ESLint check passed | Evidence: `npx eslint src/pages/ShapePop.tsx` - clean

Status updates:

- 2026-03-03 13:50 IST **DONE** — Kenney assets integrated into Shape Pop

---

## Implementation Summary

**Kenney Assets Used**:
| Asset | Path | Usage |
|-------|------|-------|
| Gem (blue) | `collectibles/gem_blue.png` | High-value target (15 pts) |
| Coin (gold) | `collectibles/coin_gold.png` | Standard target (10 pts) |
| Star | `collectibles/star.png` | Bonus target (20 pts) |
| Heart (full) | `hud/hud_heart.png` | Streak indicator |
| Heart (empty) | `hud/hud_heart_empty.png` | Streak indicator |

**Key Changes**:
1. Replaced 5 emoji shapes with 3 Kenney collectibles (varied point values)
2. Added animated bouncing effect to collectibles
3. Replaced 🔥 streak text with heart HUD (5 hearts showing streak progress)
4. Added collectible preview in menu with point values
5. Updated TTS instructions to mention "gems, coins, and stars"

**Files Modified**:
- `src/frontend/src/pages/ShapePop.tsx` - Kenney asset integration

**Code Example**:
```typescript
const KENNEY_TARGETS = [
  { id: 'gem', name: 'Gem', src: '/assets/kenney/platformer/collectibles/gem_blue.png', points: 15 },
  { id: 'coin', name: 'Coin', src: '/assets/kenney/platformer/collectibles/coin_gold.png', points: 10 },
  { id: 'star', name: 'Star', src: '/assets/kenney/platformer/collectibles/star.png', points: 20 },
] as const;
```

---

## Kenney Assets Available

**Location**: `src/frontend/public/assets/kenney/platformer/`

| Asset | Path | Use in Shape Pop |
|-------|------|------------------|
| Gem (blue) | `collectibles/gem_blue.png` | High-value target |
| Coin (gold) | `collectibles/coin_gold.png` | Standard target |
| Star | `collectibles/star.png` | Bonus target |
| Heart (HUD) | `hud/hud_heart.png` | Streak visualization |

## Integration Plan

1. Replace `SHAPES` array (emoji) with Kenney image assets
2. Add `targetType` to track which collectible
3. Render `<img>` instead of text emoji
4. Use heart HUD for streak counter (3 hearts = 3x streak)
5. Different collectibles = different point values

---

*Ready for implementation.*
