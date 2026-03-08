# Counting Collect-a-thon - Game Specification

## Overview

**Game ID**: `counting-collectathon`  
**Route**: `/games/counting-collectathon`  
**Status**: Implemented

## Game Summary

- **Core Fantasy**: "Help Pip collect the treasures!"
- **Target Age Band**: A (2-3), B (3-4)
- **Session Length**: 2-3 minutes (5 rounds)
- **One-sentence Objective**: Collect the correct number of shown items before time runs out

## Rules

| Rule | Detail |
|------|--------|
| Win condition | Complete all 5 rounds |
| Lose condition | Time runs out (35-45s per round) |
| Scoring | +10 per correct item + streak bonus |
| Lives | None (relaxed mode) |

## Controls

### CV Controls (MediaPipe Hand)
- Hand position maps to character X position
- Index finger tip controls horizontal movement
- Tracking loss shows overlay after 3 seconds

### Non-CV Fallback (Mandatory)
- Mouse: Drag horizontally
- Touch: Touch and drag
- Keyboard: Arrow keys (desktop testing)

## Difficulty Progression

| Round | Age A (2-3) | Age B (3-4) |
|-------|-------------|-------------|
| 1 | 2 ⭐ | 3 ⭐ |
| 2 | 3 ⭐ | 4 ⭐ |
| 3 | 3 (2 types) | 5 (3 types) |
| 4 | 4 | 6 |
| 5 | 4 | 8 |

## Assets Used

- Kenney Platformer Pack: `characters`, `collectibles` (star, coin, gem)

## Files

- Game logic: `src/games/countingCollectathonLogic.ts`
- Game page: `src/pages/CountingCollectathon.tsx`
- Tests: `src/games/__tests__/countingCollectathonLogic.test.ts`
- Registry: `src/data/gameRegistry.ts`

## Game Drops

- `shape-star` (25% chance)
- `shape-circle` (20% chance)
- `shape-triangle` (15% chance)

## Easter Eggs

- **Treasure Master**: Complete all 5 rounds without mistakes → `element-au`
