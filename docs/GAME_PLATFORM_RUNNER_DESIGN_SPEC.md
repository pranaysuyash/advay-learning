# Game Design Specification: Platform Runner

**Date**: 2026-02-24
**Category**: Gross Motor / Hand-Eye Coordination
**Age Target**: 3-8 years
**Status**: DESIGN

## 1. Concept Summary
"Platform Runner" is an endless side-scrolling runner game where the child uses their hand's vertical position to control the character's jumping and falling. The goal is to survive as long as possible while collecting stars, coins, and gems.

## 2. Core Mechanics
- **Auto-Scrolling:** The ground and background move from right to left, creating the illusion of forward movement.
- **Hand Tracking Control:** The child's hand (detected via MediaPipe) acts as a direct controller.
  - Raising hand → Character jumps/moves up.
  - Lowering hand → Character falls/moves down.
- **Obstacles:** Enemies (slimes, bees) spawn from the right and move left.
- **Collectibles:** Coins, gems, and stars spawn at various heights.

## 3. Assets (Kenney New Platformer Pack 1.1)

### Visuals
- **Character:** `character_green_*` series (idle, walk, jump, hit)
- **Enemies:** `slime_normal_*` (ground), `bee_*` (air)
- **Terrain:** `terrain_grass_*.png`
- **Background:** `spritesheet-backgrounds-default.png` (slice for sky/hills)
- **Collectibles:** `coin_gold.png`, `gem_blue.png`, `star.png`
- **HUD:** `hud_heart.png`, `hud_heart_empty.png`, `hud_coin.png`

### Audio
- **Jump:** `sfx_jump.ogg`
- **Coin/Star:** `sfx_coin.ogg`
- **Gem:** `sfx_gem.ogg`
- **Hurt:** `sfx_hurt.ogg`
- **Bump/Land:** `sfx_bump.ogg`

## 4. Gameplay Loop
1. **Start Screen:** Pip says "Raise your hand to jump!"
2. **Action:**
   - Character runs along the ground.
   - Child raises hand to dodge a slime or grab a floating coin.
   - If hit by an enemy: Play `sfx_hurt`, lose 1 Heart, character flashes, brief invulnerability.
3. **Progression:** Speed increases very slightly over time.
4. **Game Over:** Lose all 3 hearts. Shows final score and "Play Again" button.

## 5. Learning Objectives
- **Spatial Awareness:** Judging distance and height.
- **Action-Reaction:** Quick physical responses to visual stimuli.
- **Gross & Fine Motor Control:** Precise vertical arm movements.

## 6. Technical Implementation
- **Renderer:** Pure HTML5 Canvas (`requestAnimationFrame`).
- **Input:** `useGameHandTracking` hook (vertical `y` axis mapping).
- **Collision:** Simple AABB (Axis-Aligned Bounding Box) intersection between character rect and enemy/collectible rects.
- **Responsiveness:** Canvas scales to fit the container while maintaining aspect ratio.
