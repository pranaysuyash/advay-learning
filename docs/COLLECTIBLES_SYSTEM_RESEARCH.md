# Collectibles System — Research & Analysis

**Date:** 2026-02-27  
**Phase:** Analysis → Research → Document (pre-implementation)  
**Status:** Draft — awaiting review before further implementation  
**Prompt used:** Manual analysis + web research  

---

## Executive Summary

The current item drop system closely mirrors **adult gacha/loot-box mechanics** (RNG probability tables, rarity tiers, minScore gates). While technically functional, this design raises serious concerns for the target audience (ages 3–8):

1. **Regulatory risk** — The FTC fined Genshin Impact $20M in Jan 2025 for gacha mechanics targeted at minors. Our system uses the same core pattern (randomized rewards from probability tables).
2. **UX mismatch** — The toast/inventory UI is text-heavy and assumes literacy. A 3-year-old can't read "🆕 New Discovery! Hydrogen" or "Epic" rarity labels.
3. **Engagement model wrong for age** — Successful kids' apps (Khan Academy Kids, Sago Mini, Pok Pok) avoid random reward mechanics entirely. They use **deterministic exploration** and **immediate feedback**.
4. **Technical debt** — 27/30 games don't pass score, breaking minScore gates. Old `easterEggs.ts` co-exists with registry.

**Recommendation:** Shift from a gacha-style probability model to a **deterministic collection model** where kids always get *something* for playing, rarity is earned through effort (not luck), and all feedback is visual/audio rather than text.

### 2026-02-28 Backlog Linkage

This recommendation is now explicitly tracked as `APP-004` in `docs/audit/GAME_INPUT_AGE_AUDIT_2026-02-28.md` (`Prioritized Backlog`).

Milestones for migration tracking:
1. Define deterministic reward contract and remove chance-only progression gates.
2. Add acceptance checks: same-session reward guarantee and no “near miss” pressure copy.
3. Verify with UX artifacts that reward feedback is understandable for pre-literate users.

---

## 1. Competitive Analysis — What Kids' Apps Actually Do

### Tier 1: Gold Standard (Khan Academy Kids, Sago Mini, Pok Pok)

| App | Reward System | Key Insight |
|-----|--------------|-------------|
| **Khan Academy Kids** | Sticker rewards after completing activities. 100% deterministic — you always get a sticker. No randomness. Stickers fill a scene. | **Guaranteed rewards build confidence** |
| **Sago Mini World** | Open-ended play. No collection, no scoring, no winning/losing. Just exploration. | **Not every game needs a meta-game** |
| **Pok Pok** | No rewards, no levels, no progress tracking. Pure Montessori sandbox. Low-stimulation. | **Youngest kids (2-4) don't need extrinsic motivation** |
| **PBS Kids Games** | Badge/sticker rewards. Deterministic. Character-based celebration animations. | **Audio + animation > text for non-readers** |
| **Toca Boca World** | Collect items within the world. Items are found, not randomly dropped. Weekly gifts (guaranteed). | **Discovery feels earned, not random** |
| **ABCmouse** | Ticket system — complete activity → earn tickets → spend in virtual shop. Deterministic exchange. | **Effort-based economy, no gambling** |

### Tier 2: What NOT to Do

| Pattern | Problem | Our System? |
|---------|---------|------------|
| **RNG loot drops** | Creates frustration in kids too young to understand probability | ✅ Yes — `rollDropsFromTable()` uses `Math.random() < chance` |
| **Multi-tier virtual currency** | Obscures value, FTC enforcement target | ❌ No — we don't have currency |
| **Rarity scarcity** (legendary @ 0.01) | Creates FOMO, inappropriate for 3-year-olds | ✅ Yes — 5-tier rarity system |
| **minScore gates** | Punishes younger/less skilled players, breaks if score not passed | ✅ Yes — 15+ items have minScore gates |
| **Text-only feedback** | Excludes pre-literate users (our primary audience) | ✅ Yes — toast shows text labels |

### Key Takeaway

> "If an app looks like a Las Vegas slot machine, it's going to overstimulate your toddler's developing nervous system."  
> — Screenwise, 2026 guide to toddler apps

**Every successful kids' app in our competitive set uses deterministic rewards, not probability-based drops.**

---

## 2. Regulatory Analysis — COPPA & FTC Loot Box Enforcement

### The Genshin Impact Precedent (Jan 2025)

- **Fine:** $20M for gacha mechanics + COPPA violations
- **Key charges:** Randomized rewards obscured real costs; targeted minors
- **New rules:** Banned selling loot boxes to under-16 without parental consent; required transparent odds disclosure
- **FTC quote:** "Companies that deploy these dark-pattern tactics will be held accountable"

### How Our System Compares

| FTC Concern | Genshin Impact | Our System | Risk Level |
|------------|---------------|------------|------------|
| Randomized rewards | Gacha pulls | `rollDropsFromTable()` RNG | ⚠️ **Conceptually similar** |
| Real money involved | Yes (virtual currency) | No — all free | ✅ Low risk |
| Data collection from minors | Yes (COPPA violation) | localStorage only, no server | ✅ Low risk |
| Obscured odds | Multi-tier currency | Drop tables hidden in code | ⚠️ Low (no money) but poor UX |
| Targets children | Anime-style, marketed to teens | Explicitly ages 3-8 | ⚠️ **Higher scrutiny** |

### Assessment

Our system has **no monetary component**, so the FTC enforcement risk is minimal. However, the **design philosophy** is still problematic: we're using a gacha reward loop (randomized drops with rarity tiers) on a platform explicitly designed for 3-year-olds. Even without money, this conditions kids to expect and desire random rewards — a pattern child development experts and the FTC are increasingly concerned about.

**Recommendation:** Remove RNG from the core reward loop. Keep the item catalog and crafting system, but make drops **deterministic** (you always get something related to the game you just played).

---

## 3. UX Analysis — Pre-Literate Users

### Current Toast Feedback

```
┌─────────────────────────────────────────┐
│  [🔴] 🆕 New Discovery! Red            │
│        COMMON                     🎒    │
└─────────────────────────────────────────┘
```

**Problems for ages 3-5:**
- "New Discovery!" — Can't read
- "Red" — Can't read (they know the color, but the text is redundant)
- "COMMON" — Meaningless concept (3-year-olds don't understand rarity hierarchies)
- 4-second auto-dismiss — Too fast to process
- No sound — Silent notification

### What Pre-Literate Feedback Should Look Like

| Element | Current | Better |
|---------|---------|--------|
| **Visual** | Small emoji in box | Full-screen celebration animation (item bounces/sparkles into a backpack) |
| **Audio** | None | Distinctive chime + TTS voice saying "You found a [item name]!" |
| **Duration** | 4 seconds auto-dismiss | Stays until tapped (toddlers are slow) |
| **Rarity concept** | Text label (Common/Epic) | Visual only — sparkle intensity, glow color, animation speed |
| **Progress** | None shown | Show backpack "filling up" animation |
| **Context** | Generic toast | Mascot (Pip) reacts — "Ooh, look what you found!" |

### Easter Egg Discoverability

**Current state:** 17 easter eggs exist. Zero hint system. No progress UI. A child has no way to know they exist or how close they are to triggering one.

**What successful kids' games do:**
- **Soft hints:** "Try using all the colors!" spoken by mascot after 5 minutes of single-color use
- **Visual tease:** Faintly glowing objects that the child can interact with
- **Post-discovery celebration:** Full-screen party animation, not a small toast
- **Progress indicator:** Show silhouettes of undiscovered items (not text descriptions)

---

## 4. Collection System Design — Age Appropriateness

### Current Model Assessment

| Feature | Design Intent | Reality for 3-Year-Olds |
|---------|--------------|------------------------|
| 60+ collectible items | Pokédex-style "gotta catch 'em all" | Overwhelming. Can't remember/track this many |
| 5-tier rarity (common→legendary) | Aspiration hierarchy | Meaningless. Don't understand scarcity |
| 10 item categories | Organized catalog | Too many categories. Can't navigate |
| 25+ crafting recipes | Discovery/experimentation | Recipe chains too complex (e.g., need 4 specific items for Philosopher's Stone) |
| minScore gating | Skill-based rewards | Frustrating. "Why didn't I get anything?" (no feedback when gates block drops) |
| Per-game drop tables | Themed rewards | Disconnected from gameplay experience |

### Recommended Model: "Sticker Book" Pattern

Based on competitive analysis, the best model for ages 3-8 is a **sticker book** or **scene builder**:

1. **Every game completion gives exactly 1 item** — No RNG, no empty hands
2. **Items are themed to the game** — ShapePop gives shapes, ColorMatch gives colors
3. **Items fill a visual scene** — Not a grid inventory, but a picture/world that comes alive
4. **Crafting is simplified** — "Combine any 3 shapes" → surprise result (not specific recipes)
5. **Rarity is replaced by "newness"** — First time finding an item = celebration; repeat finds = still acknowledged but simpler
6. **Total catalog reduced** — 20-30 items max for initial set, expandable later

### Engagement Research Summary

| What Works (Ages 3-5) | What Works (Ages 6-8) | What Doesn't Work |
|----------------------|----------------------|-------------------|
| Immediate, guaranteed rewards | Streak-based bonuses | RNG/probability drops |
| Visual/audio celebrations | Simple collection progress bars | Text-heavy feedback |
| Mascot character reactions | "Complete the set" challenges | Rarity hierarchies |
| Filling up a visual space | Trading/crafting (simplified) | minScore punishment |
| Repetition is welcomed | Easter eggs with visual hints | Complex recipe chains |

---

## 5. Technical Gaps Inventory

### Critical (Must Fix Before More Features)

| # | Gap | Impact | Effort |
|---|-----|--------|--------|
| 1 | **27/30 games don't pass score** → minScore gates silently broken | Items with minScore never filter, making rare drops too easy to get | Medium — either wire scores or remove minScore |
| 2 | **Old `easterEggs.ts` not deprecated** | Confusion about source of truth | Tiny — delete or add deprecation notice |
| 3 | **BubblePopSymphony, FreeDraw** have dead `_onGameComplete` | Drops never process for these games | Tiny — decide: wire or remove |
| 4 | **Toast auto-dismisses in 4s, no sound** | Pre-literate users miss the notification entirely | Small — add sound, extend duration, add tap-to-dismiss |
| 5 | **`egg-golden-brush` (AirCanvas) not wired** | Requires circle detection not implemented | Large — skip or remove egg |

### Important (Should Fix)

| # | Gap | Impact |
|---|-----|--------|
| 6 | **No egg progress/hint UI** | Easter eggs are invisible to users |
| 7 | **Inventory page is text-heavy** | Inaccessible to target audience |
| 8 | **No sound effects for drops/discoveries** | Missing key feedback channel |
| 9 | **Recipe complexity** (Philosopher's Stone needs 4 specific items from a chain) | Unachievable for younger kids |
| 10 | **`icon` field not on CollectibleItem** (per ASSET_STRATEGY.md Phase 0) | Blocks emoji→art migration |

### Nice-to-Have

| # | Gap |
|---|-----|
| 11 | Per-world collection progress on gallery page |
| 12 | Mascot (Pip) reactions to drops |
| 13 | "Almost craftable" hints in Discovery Lab |
| 14 | Cross-game item effects (usesItems field in manifest — currently unused) |

---

## 6. Recommended Action Plan

### Phase A: Design Decisions (No Code)

Before writing more code, make these decisions:

1. **Keep RNG or go deterministic?**
   - Option A: Keep current RNG model but increase base chances significantly (0.5+ for common, 0.2+ for uncommon)
   - Option B: Switch to deterministic — every completion gives 1 themed item, rotating through the game's item list
   - **Recommendation: Option B** — aligns with best practices for age group

2. **Keep 5-tier rarity or simplify?**
   - Option A: Keep all 5 tiers
   - Option B: Reduce to 3 visual tiers (no labels): normal sparkle, golden sparkle, rainbow sparkle
   - **Recommendation: Option B** — communicate rarity visually, not with text

3. **Keep minScore or remove?**
   - Option A: Wire score into all 30 games
   - Option B: Remove minScore from drop tables entirely
   - **Recommendation: Option B** — minScore punishes younger/less skilled players and most games don't have a natural "score"

4. **Keep complex recipe chains or simplify?**
   - Option A: Keep as-is (multi-step chains to legendary)
   - Option B: Simplify to "combine any N items from category X" with surprise results
   - **Recommendation: Keep Option A for older kids (6-8), but add Option B as "simple crafting" mode**

### Phase B: Quick Fixes (Small Code Changes)

1. Delete or deprecate `easterEggs.ts`
2. Wire `onGameComplete()` in BubblePopSymphony and FreeDraw (or remove hook)
3. Add sound effect to `ItemDropToast` (chime on drop)
4. Extend toast duration from 4s → 8s, add tap-to-dismiss
5. Add `icon?: string` field to `CollectibleItem` interface (Phase 0 from ASSET_STRATEGY.md)

### Phase C: UX Improvements (Medium Code Changes)

1. Redesign `ItemDropToast` for pre-literate users (bigger emoji, animation, sound, no text)
2. Add egg hint system — mascot whispers hints after specific conditions
3. Add visual rarity indicators (sparkle effects) instead of text labels
4. Show collection progress on game completion screen (e.g., "3/6 shapes found!")

### Phase D: System Redesign (If Going Deterministic)

1. Replace `rollDropsFromTable()` with deterministic selection
2. Simplify recipe system for younger kids
3. Redesign Inventory page as visual "sticker book" rather than text grid
4. Add Pip mascot reactions to discoveries

---

## 7. Open Questions for User

1. **Which direction for drops?** Keep RNG (with higher rates) or go fully deterministic?
2. **Asset priority:** Should we start the emoji→art migration (ASSET_STRATEGY.md) before or after UX fixes?
3. **Age segmentation:** Should we have different reward UX for 3-5 vs 6-8 year olds?
4. **Scope of crafting simplification:** Keep complex recipes for older kids, or simplify everything?
5. **Pip mascot:** How much investment in mascot-driven feedback (voice lines, animations)?

---

## Appendix: Files Referenced

| File | Role |
|------|------|
| `src/frontend/src/data/gameRegistry.ts` | Game manifests, drop tables, easter eggs |
| `src/frontend/src/data/collectibles.ts` | Item catalog (60+ items), rarity system, `rollDropsFromTable()` |
| `src/frontend/src/data/easterEggs.ts` | **Legacy** — old easter egg definitions (should be deprecated) |
| `src/frontend/src/data/recipes.ts` | 25+ crafting recipes |
| `src/frontend/src/store/inventoryStore.ts` | Zustand store — item management, crafting, egg tracking |
| `src/frontend/src/hooks/useGameDrops.ts` | Hook connecting games to drop system |
| `src/frontend/src/components/inventory/ItemDropToast.tsx` | Drop notification UI |
| `src/frontend/src/pages/Inventory.tsx` | Collection browser |
| `src/frontend/src/pages/DiscoveryLab.tsx` | Crafting UI |
| `docs/DROPS_INTEGRATION_REPORT.md` | Integration status for all 30 games |
| `docs/ASSET_STRATEGY.md` | Plan for emoji → real art migration |
