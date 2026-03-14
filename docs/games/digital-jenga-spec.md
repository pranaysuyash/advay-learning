# Digital Jenga Game Specification

**Game ID:** `digital-jenga-3d`  
**World:** Physics  
**Vibe:** Active / thoughtful  
**Age Range:** 6-12 years  
**Camera:** Primary input with mouse fallback

---

## Overview

Digital Jenga is a 3D stacking game where children carefully pull blocks from a standard 54-block tower and place them back on top. The game teaches patience, number recognition, and simple mental math while keeping the interaction tactile and readable.

### Tagline
"Pull gently, stack high, and keep the tower steady."

## Shipped Game Modes

### 1. Classic
- Standard 54-block Jenga tower
- Any legal removable block can be pulled
- Focus: balance and careful movement

### 2. Single Dice
- Roll one die
- Pull a legal block with the matching number
- Focus: number matching

### 3. Double Dice
- Roll two dice
- Pull a legal block whose number matches the sum
- Focus: quick addition

### 4. Math
- Roll two dice
- Valid targets are generated from:
  - addition
  - subtraction
  - multiplication
  - exact division where valid
  - concatenation where valid
- Only block numbers `1..54` count
- Focus: flexible mental math

## Core Gameplay Loop

1. Start or resume the 54-block tower.
2. If in a dice mode, roll to generate valid target numbers.
3. Aim at a valid, removable block.
4. Grab by mouse press or hand pinch.
5. Pull the block away from the tower until extraction completes.
6. Player explicitly places extracted block on top via the placement action.
7. Wait for the tower to settle.
8. Continue until the tower collapses or the session ends.

## Input Model

### Hand Tracking
- Camera-first interaction path
- Cursor is based on the thumb-index midpoint
- Pinch starts the grab
- Holding pinch updates drag continuously
- Unpinch or hand-loss releases the block
- Tracking-loss overlay offers retry or mouse fallback

### Mouse / Touch Fallback
- `pointerdown` on a block starts the same grab lifecycle used by hand input
- Pointer movement updates drag continuously
- Pointer release cancels or commits the move via the same controller
- Dragging empty space rotates the camera

## Tower Rules

- Tower starts as 18 layers × 3 blocks = 54 blocks
- Layers alternate orientation every row
- The current top layer is not removable
- In dice/math modes, a block must be both:
  - legally removable
  - a current target number
- Extracted blocks transition to a `place` phase; player confirms placement on top

## Block Numbering

- Blocks are numbered bottom-to-top, left-to-right
- Number labels are visible on top and side faces
- Valid target blocks are highlighted in the scene and repeated in the HUD

## Physics Expectations

- Rapier physics
- Slow, deliberate drag feel
- Spring-assisted pull with bounded lateral wiggle (kid-friendly, less stiff extraction)
- Geometry-based extraction threshold tuned to tower footprint
- Deterministic tower reset with settle steps to avoid explosive restarts
- Stability shown in the HUD as a child-friendly balance meter

## UX Requirements

- Use the full game area cleanly on desktop and mobile
- Keep the HUD readable but compact
- Explain the current action in child-friendly language
- Show camera state clearly:
  - starting
  - hand visible
  - hand lost
  - error / permission issue
- Preserve mouse fallback at all times

## Success Criteria

- Children can complete a full grab/extract/place cycle with mouse
- Hand tracking can reliably aim, pinch-grab, drag, and release
- All four modes expose correct target logic
- Numbers are readable during play
- Reset and mode switching leave no stale grab or target state
