# Kenney Asset Catalog for Advay Vision

**Last Updated:** 2026-03-10  
**Source:** Kenney Game Assets All-in-1 3.4.0  
**License:** CC0 (Public Domain)

---

## Quick Reference Table

| Game to Rebuild | Primary Asset Kit | Secondary Kits | Est. Effort |
|-----------------|-------------------|----------------|-------------|
| **DigitalJenga** | Marble Kit | Building Kit | 3 days |
| **DressForWeather** | Blocky Characters | - | 4 days |
| **ObstacleCourse** | Platformer Kit | Animated Characters | 4 days |
| **FeedTheMonster** | Food Kit | Blocky Characters | 2 days |
| **CuttingPractice** | Food Kit | - | 2 days |
| **VirtualBubbles** | - | Custom shaders | 2 days |

---

## 3D Asset Kits

### 🎯 Marble Kit (For Jenga)
**Location:** `3D assets/Marble Kit/Models/GLB format/`  
**Count:** ~150 models  
**Use:** Track pieces that stack perfectly for physics games

**Key Models:**
```
straight.glb           - Basic block (use for Jenga!)
straight-half.glb      - Half-width block
bend.glb               - 90° curved block
bend-large.glb         - Wide curve
corner.glb             - 90° corner piece
cross.glb              - 4-way intersection
curve.glb              - Smooth curve
slope.glb              - Incline piece
slope-corner.glb       - Corner incline
start.glb              - Start line piece
end.glb                - Finish line piece
```

**Jenga Configuration:**
- Use `straight.glb` for standard blocks
- Scale: `[0.5, 0.5, 0.5]`
- Physics size: `[0.8, 0.2, 0.8]`

---

### 👤 Blocky Characters (For DressForWeather)
**Location:** `3D assets/Blocky Characters/Models/GLB format/`  
**Count:** 18 characters  
**Use:** Dress-up, character games, NPCs

**Available Characters:**
| File | Character | Best For |
|------|-----------|----------|
| `character-a.glb` | Robot | Sci-fi games |
| `character-b.glb` | Adventurer | Explorer/dress-up |
| `character-c.glb` | Pirate | Adventure games |
| `character-d.glb` | Knight | Fantasy games |
| `character-e.glb` | Astronaut | Space games |
| `character-f.glb` | Ninja | Action games |
| `character-g.glb` | Cowboy | Western games |
| `character-h.glb` | Soldier | Military games |
| `character-i.glb` | Santa | Holiday games |
| `character-j.glb` | Elf | Fantasy games |
| `character-k.glb` | Zombie | Halloween games |
| `character-l.glb` | Skeleton | Halloween games |
| `character-m.glb` | Mummy | Halloween games |
| `character-n.glb` | Superhero | Hero games |
| `character-o.glb` | Construction | Builder games |
| `character-p.glb` | Business | Dress-up |
| `character-q.glb` | Casual | Dress-up |
| `character-r.glb` | Sporty | Sports games |

**DressForWeather Recommendation:** Use `character-b.glb` (Adventurer) or `character-q.glb` (Casual)

---

### 🎮 Platformer Kit (For ObstacleCourse)
**Location:** `3D assets/Platformer Kit/Models/GLB format/`  
**Count:** ~100 models  
**Use:** Platformer games, obstacle courses, level building

**Terrain Blocks:**
```
block-grass-large.glb           - Large grass platform
block-grass-low.glb             - Low grass step
block-grass-corner.glb          - Corner piece
block-grass-edge.glb            - Edge piece
block-grass-slope.glb           - Incline
block-stone-*.glb               - Stone variants (same patterns)
block-dirt-*.glb                - Dirt variants
block-sand-*.glb                - Desert variants
block-snow-*.glb                - Snow variants
```

**Hazards & Obstacles:**
```
spike-block.glb                 - Floor spikes
spike-block-large.glb           - Larger spikes
platform-coin.glb               - Rotating coin platform
button.glb                      - Pressure plate
lever.glb                       - Interactive lever
fan.glb                         - Air current (jump boost)
```

**Collectibles:**
```
coin.glb                        - Gold coin (spinning)
gem.glb                         - Colored gem
flag.glb                        - Checkpoint flag
trophy.glb                      - Level completion
```

**Decorations:**
```
plant-pot.glb                   - Potted plant
barrel.glb                      - Wooden barrel
crate.glb                       - Wooden crate
bridge.glb                      - Wooden bridge
ladder.glb                      - Climbing ladder
fence.glb                       - Fence section
```

---

### 🍎 Food Kit (For FeedTheMonster, CuttingPractice)
**Location:** `3D assets/Food Kit/Models/GLB format/`  
**Count:** ~80 models  
**Use:** Food games, cooking, feeding monsters

**Categories:**

**Fruits:**
```
apple.glb, apple-half.glb       - Apple variations
banana.glb, banana-peel.glb     - Banana
orange.glb, orange-slice.glb    - Orange
watermelon.glb, watermelon-slice.glb
strawberry.glb, grapes.glb
pineapple.glb, coconut.glb
```

**Vegetables:**
```
carrot.glb, carrot-chopped.glb  - Carrot
tomato.glb, tomato-slice.glb    - Tomato
lettuce.glb, cucumber.glb
onion.glb, onion-slice.glb
potato.glb, corn.glb
```

**Meals:**
```
burger.glb, burger-cheese.glb   - Burgers
pizza.glb, pizza-slice.glb      - Pizza
taco.glb, burrito.glb           - Mexican
hotdog.glb, sandwich.glb        - Fast food
sushi.glb, sushi-roll.glb       - Japanese
```

**Drinks:**
```
cup.glb, cup-straw.glb          - Drinks
bottle.glb, bottle-soda.glb     - Bottles
```

---

### 🌲 Nature Kit (For Environments)
**Location:** `3D assets/Nature Kit/Models/GLB format/`  
**Use:** Backgrounds, environments, decoration

**Trees:**
```
tree-pine.glb                   - Pine tree
tree-oak.glb                    - Oak tree
tree-palm.glb                   - Palm tree
tree-dead.glb                   - Dead/spooky tree
tree-birch.glb                  - Birch tree
```

**Terrain:**
```
grass.glb                       - Grass clump
bush.glb                        - Bush
rock.glb, rock-large.glb        - Rocks
mountain.glb                    - Background mountain
cloud.glb                       - Cloud decoration
```

**Details:**
```
flower-*.glb                    - Various flowers (12 types)
mushroom.glb                    - Mushroom
log.glb                         - Fallen log
```

---

### 🏗️ Additional Useful Kits

#### Building Kit
- Modular building pieces
- Roofs, walls, doors, windows
- Perfect for construction games

#### Castle Kit
- Castle walls, towers, gates
- Medieval theme

#### Space Kit
- Rockets, satellites, planets
- Space stations

#### Toy Car Kit
- 18 different toy vehicles
- Perfect for racing games

#### Coaster Kit
- Roller coaster track pieces
- For physics games

#### Survival Kit
- Camping gear, tents, tools
- Survival-themed games

---

## 2D Assets (Already Integrated)

### Platformer Pack (In Use)
**Location:** `src/frontend/public/assets/kenney/platformer/`  
**Status:** ✅ Already integrated in 31 games

**Contents:**
- 316 tile variations
- 62 enemy types
- 47 characters
- Backgrounds, HUD, collectibles

---

## Asset Size Reference

### GLB File Sizes (Average)
| Kit | File Count | Total Size | Avg Per File |
|-----|------------|------------|--------------|
| Marble Kit | 150 | 15 MB | 100 KB |
| Blocky Characters | 18 | 9 MB | 500 KB |
| Platformer Kit | 100 | 20 MB | 200 KB |
| Food Kit | 80 | 12 MB | 150 KB |
| Nature Kit | 60 | 8 MB | 130 KB |

### Recommended Loading Strategy
```typescript
// Preload critical assets
useGLTF.preload('/assets/kenney/3d/marble/straight.glb');

// Lazy load level-specific assets
const { scene } = useGLTF('/assets/kenney/3d/platformer/block-grass-large.glb', true);
```

---

## Asset Selection Guide by Game Type

### Physics Stacking Games
**Recommended:** Marble Kit  
**Why:** Perfect block shapes, consistent sizing

### Character Games
**Recommended:** Blocky Characters  
**Why:** Simple, recognizable, easy to texture

### Platformers
**Recommended:** Platformer Kit  
**Why:** Complete kit with everything needed

### Food Games
**Recommended:** Food Kit  
**Why:** Comprehensive food library

### Racing Games
**Recommended:** Toy Car Kit + Marble Kit (tracks)  
**Why:** Cars + track pieces that connect

### Environment/Background
**Recommended:** Nature Kit  
**Why:** Trees, rocks, terrain pieces

---

## Asset Conversion Notes

### From Kenney Bundle to Project

```bash
# Copy 3D assets to project
SOURCE="/Users/pranay/Projects/adhoc_resources/Kenney Game Assets All-in-1 3.4.0/3D assets"
DEST="src/frontend/public/assets/kenney/3d"

# Only copy GLB format (most efficient for web)
# FBX and OBJ not needed
```

### Texture Optimization

Kenney assets include textures in:
- `Models/Textures/` folder within each kit
- Use WebP conversion for smaller size:

```bash
# Convert textures to WebP
for file in Textures/*.png; do
  cwebp -q 80 "$file" -o "${file%.png}.webp"
done
```

---

## Color Palette Reference

Kenney uses consistent colors across kits:

| Color | Hex | Usage |
|-------|-----|-------|
| Grass Green | `#7CB342` | Terrain, nature |
| Dirt Brown | `#8D6E63` | Ground, dirt |
| Stone Gray | `#9E9E9E` | Rocks, platforms |
| Wood Brown | `#A1887F` | Props, crates |
| Sky Blue | `#64B5F6` | UI, backgrounds |
| Gold | `#FFD700` | Coins, collectibles |
| Red Alert | `#E53935` | Hazards, damage |

---

## Licensing Summary

✅ **CC0 - Public Domain**  
All Kenney assets can be:
- Used commercially
- Modified
- Distributed
- No attribution required (but appreciated)

**Required:**
- None! But link to kenney.nl in credits is nice

---

## Additional CC0 Sources

### 3D Models
| Source | Best For | URL |
|--------|----------|-----|
| Poly Haven | HDRIs, PBR textures | polyhaven.com |
| Quaternius | Animated characters | quaternius.com |
| KayKit | Complete game kits | kaylousberg.itch.io |
| OpenGameArt | Variety | opengameart.org |

### Audio
| Source | Best For | URL |
|--------|----------|-----|
| Kenney Audio | Game sounds | (in bundle) |
| Freesound.org | Various | freesound.org |

---

## Quick Start Checklist

For each 3D game rebuild:

- [ ] Identify required asset kits from this catalog
- [ ] Copy GLB files to `public/assets/kenney/3d/`
- [ ] Preload critical assets with `useGLTF.preload()`
- [ ] Test loading performance
- [ ] Compress if needed (Draco)
- [ ] Document any custom textures/materials

---

*Catalog maintained by: Development Team*  
*Last sync: 2026-03-10*
