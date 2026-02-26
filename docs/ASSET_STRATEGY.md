# Asset Strategy: From Emoji to Production Art

**Date:** 2026-02-26  
**Status:** Active  
**Scope:** Replace emoji-based visuals across all 27+ games and 60+ collectible items with real art from CC0 sources and AI generation tools.

---

## Current State

| Layer | Current | Target |
|-------|---------|--------|
| **Collectible items** (60+) | Emoji glyphs (`emoji: '🔴'`) in `collectibles.ts` | PNG/SVG icons per item |
| **Game targets/objects** | Inline emoji (`text-6xl`) | Sprite sheets or SVG |
| **Inventory UI** | Emoji rendered at large sizes | Styled item cards with art |
| **Game backgrounds** | CSS gradients / `backdrop-blur` | Illustrated or tiled art |
| **Characters (Pip mascot)** | SVG avatar | Animated sprite sheet |
| **Sound effects** | Web Audio synthesis + a few OGGs | Full SFX library |
| **PlatformerRunner** | ✅ Already uses Kenney sprites | Keep as-is |

### What's Already Landed

- `assets/kenney/` — folder structure for 7 packs (mostly empty, README with download instructions)
- `src/frontend/public/assets/kenney-platformer/` — Kenney platformer sprites in use by PlatformerRunner
- `src/frontend/public/assets/backgrounds/` — 3 weather backgrounds (rainy, sunny, snowy)
- `src/frontend/public/assets/icons/` — ~100+ SVG icons (fruits, animals, objects)
- `src/frontend/public/assets/sounds/` — some audio files

---

## CC0 Source Catalog

### Tier 1: Immediate Use (High quality, well-organized, easy download)

| Source | Best For | Format | Notes |
|--------|----------|--------|-------|
| [**kenney.nl**](https://kenney.nl) | UI, sprites, tiles, characters, SFX | PNG/SVG/OGG | 60K+ assets. Consistent art style. Already partially integrated. |
| [**opengameart.org**](https://opengameart.org) | Sprites, tilesets, music, SFX | PNG/SVG/WAV | Large community. Filter by CC0. Search by tag. |
| [**itch.io/game-assets/cc0**](https://itch.io/game-assets/assets-cc0) | 2D sprites, pixel art, UI packs | PNG/SVG | Curated CC0 section. Many kid-friendly packs. |
| [**mixkit.co**](https://mixkit.co/free-sound-effects/game/) | Sound effects, music | WAV/MP3 | High-quality game SFX. Free, no attribution needed. |
| [**craftpix.net**](https://craftpix.net) | 2D game assets, characters, backgrounds | PNG/PSD | Free section has solid 2D packs. Check license per pack. |

### Tier 2: Supplementary (Specialized or requires browsing)

| Source | Best For | Notes |
|--------|----------|-------|
| [**quaternius.com**](https://quaternius.com) | 3D models (future 3D games) | Low-poly CC0 characters, animals, environments |
| [**ambientcg.com**](https://ambientcg.com) | Textures, materials | PBR textures if we add 3D/WebGL |
| [**sketchfab CC0 collection**](https://sketchfab.com/nebulousflynn/collections/cc0) | 3D models | Curated CC0 collection by Mozilla |
| [**awesome-cc0 (GitHub)**](https://github.com/madjin/awesome-cc0) | Meta-list of CC0 sources | Comprehensive index. Good for discovery. |

### Tier 3: Reference / Discovery

| Source | Notes |
|--------|-------|
| [Reddit: 10K+ CC0 assets](https://www.reddit.com/r/gamedev/comments/xrsom4/) | Community-curated megalist |
| [Reddit: Ultimate free asset list](https://www.reddit.com/r/gamedev/comments/1m76pm4/) | 50+ sites indexed |
| [Pokitto forum list](https://talk.pokitto.com/t/1243) | Indie-focused, many kid-friendly |
| [CreativeBloq roundup](https://www.creativebloq.com/3d/video-game-design/) | Editorial picks |
| [Medium: 10 sites](https://medium.com/@johirbuet/) | Curated with previews |
| [hyperpad blog](https://www.hyperpad.com/blog/) | iPad-focused, good for mobile |
| [PlayCanvas forum](https://forum.playcanvas.com/t/19199) | WebGL-focused assets |
| [Valve wiki](https://developer.valvesoftware.com/wiki/Prop_Download_Sites) | Prop & model sites |
| [awesome-cc0 gist](https://gist.github.com/UkoeHB/9991c1a60e887e448800ed2f740a037a) | Extended CC0 list |

---

## AI Generation Tools

For custom assets that don't exist in CC0 libraries (unique characters, themed collectible icons, branded UI elements):

| Tool | Best For | How To Use |
|------|----------|------------|
| **Amp `painter` tool** | Item icons, collectible art, backgrounds | Prompt directly in Amp: `@painter "64x64 pixel art golden paintbrush icon, game item, transparent background"` |
| **Leonardo.ai** | Character sprites, game backgrounds | Free tier. Good for consistent style via model fine-tuning. |
| **Stable Diffusion** | Batch generation, sprite sheets | Local or via API. Use ControlNet for consistent poses. |
| **Midjourney** | High-quality concept art, backgrounds | Best visual quality. Use `--tile` for seamless textures. |
| **Pixlr / Photopea** | Post-processing AI-generated assets | Free browser editors for cleanup, transparency, resizing. |

### AI Generation Workflow

```
1. Define asset spec (size, style, purpose)
2. Generate candidates (3-5 per asset)
3. Select best, post-process (remove bg, resize, optimize)
4. Save to src/frontend/public/assets/<category>/
5. Update collectibles.ts: add `icon` field alongside `emoji`
6. Test in-game rendering
```

---

## Migration Plan

### Phase 0: Infrastructure (Do First)

Add an `icon` field to `CollectibleItem` so items can progressively migrate from emoji to art without breaking anything:

```typescript
// collectibles.ts — extend the interface
export interface CollectibleItem {
  id: string;
  name: string;
  emoji: string;        // keep as fallback
  icon?: string;        // new: path to PNG/SVG asset
  category: ItemCategory;
  rarity: Rarity;
  description: string;
  funFact?: string;
}
```

Create a rendering component that prefers `icon` over `emoji`:

```typescript
// components/ui/ItemIcon.tsx
export function ItemIcon({ item, size = 48 }: { item: CollectibleItem; size?: number }) {
  if (item.icon) {
    return <img src={item.icon} alt={item.name} width={size} height={size} />;
  }
  return <span style={{ fontSize: size * 0.75 }}>{item.emoji}</span>;
}
```

### Phase 1: Collectible Item Icons (Highest Visual Impact)

**Goal:** Replace 60+ emoji glyphs in the inventory with real art.

| Category | Count | Source Strategy |
|----------|-------|----------------|
| **Elements** (10) | H, O, C, N, Na, Cl, Fe, Au, He, S | Kenney sci-fi pack icons or AI-generate periodic table style icons |
| **Colors** (10) | Red, Blue, Yellow, etc. | AI-generate gem/crystal icons in each color |
| **Shapes** (6) | Circle, Triangle, Square, Star, Heart, Diamond | SVG — create programmatically or use Kenney UI pack shapes |
| **Creatures** (7) | Cat, Dog, Lion, Butterfly, Owl, Dragon, Unicorn | Kenney animal pack or AI-generate cartoon animal portraits |
| **Notes** (7) | Do, Re, Mi, Fa, Sol, La, Ti | AI-generate musical note icons with color coding |
| **Emotions** (7) | Happy, Sad, Angry, Surprised, Scared, Love, Calm | AI-generate expressive face icons (not emoji) |
| **Materials** (13) | Water, Salt, Rust, CO2, etc. | Mix: Kenney item sprites + AI for unique ones |
| **Tools** (5) | Paintbrush, Magnifier, Telescope, Microscope, Wand | Kenney RPG/adventure pack items |
| **Artifacts** (6) | First Word Scroll, Periodic Key, etc. | AI-generate unique legendary item art |
| **Food** (5) | Cookie, Apple, Pizza, Ice Cream, Cake | Kenney food pack |

**Priority downloads from CC0 sources:**

```bash
# Kenney packs to download immediately:
# 1. https://kenney.nl/assets/game-icons          → item icons (1000+)
# 2. https://kenney.nl/assets/animal-pack          → creature items
# 3. https://kenney.nl/assets/food-kit             → food items
# 4. https://kenney.nl/assets/ui-pack              → shapes, UI elements
# 5. https://kenney.nl/assets/rpg-items            → tools, artifacts

# OpenGameArt searches:
# https://opengameart.org/art-search?keys=potion+icon&license=CC0
# https://opengameart.org/art-search?keys=crystal+gem&license=CC0
# https://opengameart.org/art-search?keys=animal+portrait&license=CC0

# itch.io searches:
# https://itch.io/game-assets/assets-cc0/tag-icons
# https://itch.io/game-assets/assets-cc0/tag-items
```

### Phase 2: Game-Specific Art

| Game | Current Visuals | CC0 Source | AI Gen? |
|------|----------------|------------|---------|
| **EmojiMatch** | Emoji faces (😊😢😠) | — | ✅ Generate expressive face cards |
| **MathMonsters** | Emoji monsters (🦖🐊) | Kenney monster-kit | ✅ Custom monster designs |
| **WordBuilder** | Letter tiles (text) | Kenney UI pack (tiles) | — |
| **ShapePop** | CSS shapes + emoji | Kenney shapes or SVG | — |
| **ChemistryLab** | Emoji elements | — | ✅ Element flask/beaker icons |
| **YogaAnimals** | Text + emoji animals | Kenney animal pack | ✅ Pose silhouettes |
| **AirCanvas** | Canvas particles | — | — (keep as-is) |
| **MusicPinchBeat** | CSS lanes | — | ✅ Musical instrument sprites |
| **FreezeDance** | CSS + pose detection | — | ✅ Dance character sprites |
| **ConnectTheDots** | Canvas dots/lines | — | — (keep as-is) |
| **LetterHunt** | Letter cards | Kenney UI pack | — |
| **DressForWeather** | CSS clothing items | — | ✅ Clothing item sprites |
| **StorySequence** | Emoji scene cards | — | ✅ Story illustration cards |
| **PlatformerRunner** | ✅ Kenney sprites | ✅ Done | — |

### Phase 3: Sound Effects

| Need | Count | Source |
|------|-------|--------|
| **UI sounds** (click, hover, toggle) | ~5 | [Kenney UI Audio](https://kenney.nl/assets/ui-audio) |
| **Game feedback** (correct, wrong, celebrate) | ~10 | [Kenney Interface Sounds](https://kenney.nl/assets/interface-sounds) |
| **Item drop notification** | 1 | [mixkit.co](https://mixkit.co/free-sound-effects/game/) — search "reward" |
| **Easter egg discovery** | 1 | mixkit.co — search "achievement" |
| **Per-game ambient** | ~10 | OpenGameArt — search per theme |
| **Music loops** | 5-10 | OpenGameArt or [Kenney Music](https://kenney.nl/assets/music-jingles) |

**Immediate download:**
```bash
# Kenney audio packs (free):
# https://kenney.nl/assets/ui-audio              → 100+ UI sounds
# https://kenney.nl/assets/interface-sounds       → clicks, beeps
# https://kenney.nl/assets/music-jingles          → celebration jingles
# https://kenney.nl/assets/voiceover-pack         → "correct!", "try again"
#
# mixkit.co (direct download, no login):
# https://mixkit.co/free-sound-effects/game/      → game SFX
# https://mixkit.co/free-sound-effects/notification/ → drop/achievement sounds
```

### Phase 4: Backgrounds & World Art

Each "world" in the gallery should have a distinct visual identity:

| World | Current BG | Target | Source |
|-------|-----------|--------|--------|
| Letter Land | CSS gradient | Illustrated classroom | AI-generate or Kenney nature |
| Number Jungle | CSS gradient | Jungle scene with numbers | AI-generate |
| Lab of Wonders | CSS gradient | Lab/potion room | Kenney dungeon-kit adapted |
| Feeling Forest | CSS gradient | Enchanted forest | Kenney nature-kit |
| Shape Garden | CSS gradient | Geometric garden | AI-generate |
| Body Zone | CSS gradient | Gymnasium/outdoors | Kenney nature-kit |
| Sound Studio | CSS gradient | Music room | AI-generate |
| Art Atelier | CSS gradient | Artist's studio | AI-generate |

---

## File Organization

```
src/frontend/public/assets/
├── items/                    # Collectible item icons (Phase 1)
│   ├── elements/            # element-h.png, element-au.png, etc.
│   ├── colors/              # color-red.png, color-rainbow.png, etc.
│   ├── shapes/              # shape-circle.svg, shape-star.svg, etc.
│   ├── creatures/           # creature-cat.png, creature-dragon.png, etc.
│   ├── notes/               # note-do.png, note-re.png, etc.
│   ├── emotions/            # emotion-happy.png, emotion-sad.png, etc.
│   ├── materials/           # material-water.png, material-lava.png, etc.
│   ├── tools/               # tool-paintbrush.png, tool-wand.png, etc.
│   ├── artifacts/           # artifact-periodic-key.png, etc.
│   └── food/                # food-cookie.png, food-pizza.png, etc.
├── game/                     # Per-game art (Phase 2)
│   ├── emoji-match/         # emotion face cards
│   ├── math-monsters/       # monster sprites
│   └── ...
├── worlds/                   # World background art (Phase 4)
│   ├── letter-land.webp
│   ├── number-jungle.webp
│   └── ...
├── sounds/                   # Audio assets (Phase 3)
│   ├── ui/                  # click.ogg, hover.ogg, etc.
│   ├── feedback/            # correct.ogg, wrong.ogg, celebrate.ogg
│   ├── drops/               # item-drop.ogg, easter-egg.ogg
│   └── music/               # world-specific loops
├── kenney-platformer/        # ✅ Already in use
├── backgrounds/              # ✅ Weather backgrounds
└── icons/                    # ✅ Existing SVG icons
```

---

## Naming Convention

All asset files follow: `{category}-{id}.{ext}`

- `element-au.png` (Gold element icon)
- `creature-owl.png` (Owl spirit creature)
- `tool-wand.png` (Pip's Wand)
- `world-number-jungle.webp` (World background)

Format preferences:
- **Icons/sprites:** PNG (64×64 or 128×128) with transparency
- **Shapes:** SVG (scalable, small file size)
- **Backgrounds:** WebP (good compression, wide support)
- **Audio:** OGG (good compression) with WAV source in `assets/kenney/`

---

## Quick-Start Checklist

```markdown
- [ ] Download Kenney Game Icons pack → extract to assets/kenney/game-icons/
- [ ] Download Kenney UI Audio pack → extract to assets/kenney/ui-audio/
- [ ] Download Kenney Food Kit → extract to assets/kenney/food-kit/
- [ ] Download Kenney Animal Pack → extract to assets/kenney/animal-pack/
- [ ] Add `icon?: string` field to CollectibleItem interface
- [ ] Create ItemIcon component (icon > emoji fallback)
- [ ] Map first 10 items to Kenney icons (food + shapes)
- [ ] Replace emoji rendering in Inventory page with ItemIcon
- [ ] Generate 10 custom item icons via Amp painter tool
- [ ] Add UI sound effects (click, success, error) from Kenney
- [ ] Add item drop sound effect from mixkit.co
```

---

## AI Generation Prompts (for Amp `painter` tool)

When CC0 sources don't have what we need, generate with these prompt patterns:

```
# Collectible icon template:
"64x64 pixel art [ITEM NAME] icon, game item style, vibrant colors, 
transparent background, cute cartoon style suitable for children ages 3-8"

# Monster character:
"128x128 cartoon monster character, friendly and round, [COLOR] body, 
big eyes, small teeth, game sprite, white background, children's game style"

# World background:
"1920x1080 illustrated [WORLD THEME] background, soft pastel colors, 
children's educational game, whimsical style, no text"
```

---

**Next action:** Download Kenney Game Icons + Food Kit + Animal Pack, then start mapping items in Phase 1.
