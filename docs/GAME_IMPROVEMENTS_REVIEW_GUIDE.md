# Game Improvements Review Guide

**Date**: 2026-03-03  
**Total Games Improved**: 25 games  
**Status**: ✅ READY FOR REVIEW

---

## Summary

All 25 games have been enhanced with the standardized improvement package:
- ✅ **Combo/Streak Scoring** - Base points + streak bonus (max 15)
- ✅ **Kenney Heart HUD** - generally 5 hearts at i×2 threshold (Air Guitar Hero was updated to follow this pattern)

- ✅ **Haptic Feedback** - success/error/celebration vibrations
- ✅ **Score Popups** - +X points with animation (700ms)
- ✅ **Streak Milestones** - Celebration every 5 correct answers

---

## Games Improved (25 Total)

### Batch 1 (10 games) - Core Games
| # | Game | File | Logic File | Status |
|---|------|------|------------|--------|
| 1 | **Bubble Pop** | `BubblePop.tsx` | `bubblePopLogic.ts` | ✅ Complete |
| 2 | **Memory Match** | `MemoryMatch.tsx` | `memoryMatchLogic.ts` | ✅ Complete |
| 3 | **Shape Pop** | `ShapePop.tsx` | `shapePopLogic.ts` | ✅ Complete |
| 4 | **Color Match Garden** | `ColorMatchGarden.tsx` | - | ✅ Complete |
| 5 | **Air Guitar Hero** | `AirGuitarHero.tsx` | - | ✅ Complete |
| 6 | **Color Sort** | `ColorSortGame.tsx` | - | ✅ Complete |
| 7 | **Weather Match** | `WeatherMatch.tsx` | - | ✅ Complete |
| 8 | **Animal Sounds** | `AnimalSounds.tsx` | - | ✅ Complete |
| 9 | **Body Parts** | `BodyParts.tsx` | - | ✅ Complete |
| 10 | **Money Match** | `MoneyMatch.tsx` | - | ✅ Complete |

### Batch 2 (5 games) - Math & Logic
| # | Game | File | Logic File | Status |
|---|------|------|------------|--------|
| 11 | **Size Sorting** | `SizeSorting.tsx` | - | ✅ Complete |
| 12 | **Odd One Out** | `OddOneOut.tsx` | - | ✅ Complete |
| 13 | **Counting Objects** | `CountingObjects.tsx` | - | ✅ Complete |
| 14 | **Number Sequence** | `NumberSequence.tsx` | - | ✅ Complete |
| 15 | **More Or Less** | `MoreOrLess.tsx` | - | ✅ Complete |

### Batch 3 (5 games) - Advanced Features
| # | Game | File | Logic File | Status |
|---|------|------|------------|--------|
| 16 | **Number Bubble Pop** | `NumberBubblePop.tsx` | - | ✅ Complete |
| 17 | **Pop The Number** | `PopTheNumber.tsx` | - | ✅ Complete |
| 18 | **Beginning Sounds** | `BeginningSounds.tsx` | `beginningSoundsLogic.ts` | ✅ Complete |
| 19 | **Fraction Pizza** | `FractionPizza.tsx` | `fractionPizzaLogic.ts` | ✅ Complete |
| 20 | **Math Monsters** | `MathMonsters.tsx` | `mathMonstersLogic.ts` | ✅ Complete |

### Batch 4 (5 games) - Additional Games
| # | Game | File | Logic File | Status |
|---|------|------|------------|--------|
| 21 | **Emoji Match** | `EmojiMatch.tsx` | `emojiMatchLogic.ts` | ✅ Complete |
| 22 | **Letter Hunt** | `LetterHunt.tsx` | - | ✅ Complete |
| 23 | **Pattern Play** | `PatternPlay.tsx` | `patternPlayLogic.ts` | ✅ Complete |
| 24 | **Simon Says** | `SimonSays.tsx` | - | ✅ Complete |
| 25 | **Shape Safari** | `ShapeSafari.tsx` | `shapeSafariLogic.ts` | ✅ Complete |

---

## Implementation Details

### Scoring Formula
```typescript
// Typical scoring formula; individual games may adjust base points or multipliers
const basePoints = 10-15; // Game dependent (some use 10, others 15, a few vary further)
const streakBonus = Math.min(streak * 3, 15); // Most games use ×3 per streak, Air Guitar Hero uses ×2
const totalPoints = basePoints + streakBonus; // further multiplied by difficulty where applicable

```

### Heart HUD Threshold
```typescript
// 5 hearts, each fills at 2-streak intervals (Air Guitar Hero is the exception: hearts fill at 5,10,15...)
const filled = streak >= (heartIndex + 1) * 2;
// Heart 1: streak ≥ 2
// Heart 2: streak ≥ 4
// Heart 3: streak ≥ 6
// Heart 4: streak ≥ 8
// Heart 5: streak ≥ 10
// (Air Guitar Hero uses: streak >= (heartIndex+1) * 5)

```

### Haptic Patterns
```typescript
// From src/utils/haptics.ts
const DEFAULT_PATTERNS = {
  success: [50, 30, 50],      // Short double tap
  error: [100, 50, 100],      // Longer pattern
  celebration: [100, 50, 100, 50, 200], // Extended celebration
};
```

### Animation Timings
- **Score Popup**: 700ms display time
- **Streak Milestone**: 1200ms display time
- **Heart Fill**: Instant on threshold reached

---

## Verification Checklist

### Per-Game Verification
```markdown
- [ ] Streak increments on correct answer
- [ ] Streak resets to 0 on wrong answer
- [ ] Hearts display correctly (filled/empty)
- [ ] Score popup appears with +X points
- [ ] Score popup disappears after 700ms
- [ ] Milestone banner appears at streak 5, 10, 15...
- [ ] Haptic triggers on correct (success pattern)
- [ ] Haptic triggers on wrong (error pattern)
- [ ] Haptic triggers on milestone (celebration pattern)
- [ ] Haptic triggers on game complete
- [ ] Streak resets when game restarts
```

### TypeScript Verification
All 25 games compile without errors:
```bash
cd src/frontend && npx tsc --noEmit --skipLibCheck
```

### Assets Verification
Kenney assets exist at expected paths:
- `/assets/kenney/platformer/hud/hud_heart.png`
- `/assets/kenney/platformer/hud/hud_heart_empty.png`

### Automation
A helper script `scripts/check_hud_streaks.sh` checks that each page uses
`streak >= i * 2` for hearts and imports `calculateScore`. Run it before review.

For visual evidence, `scripts/record_gameplay.cjs` will automatically load each
game, perform a few sample clicks, and save a short video (`./videos/<name>.webm`).
These recordings can be shared with other agents or used for automated UI audits.
Start the frontend server first, then execute from the repo root without needing
any additional parameters.

---

## Files Modified

### Component Files (25 pages)
- `src/frontend/src/pages/BubblePop.tsx`
- `src/frontend/src/pages/MemoryMatch.tsx`
- `src/frontend/src/pages/ShapePop.tsx`
- `src/frontend/src/pages/ColorMatchGarden.tsx`
- `src/frontend/src/pages/AirGuitarHero.tsx`
- `src/frontend/src/pages/ColorSortGame.tsx`
- `src/frontend/src/pages/WeatherMatch.tsx`
- `src/frontend/src/pages/AnimalSounds.tsx`
- `src/frontend/src/pages/BodyParts.tsx`
- `src/frontend/src/pages/MoneyMatch.tsx`
- `src/frontend/src/pages/SizeSorting.tsx`
- `src/frontend/src/pages/OddOneOut.tsx`
- `src/frontend/src/pages/CountingObjects.tsx`
- `src/frontend/src/pages/NumberSequence.tsx`
- `src/frontend/src/pages/MoreOrLess.tsx`
- `src/frontend/src/pages/NumberBubblePop.tsx`
- `src/frontend/src/pages/PopTheNumber.tsx`
- `src/frontend/src/pages/BeginningSounds.tsx`
- `src/frontend/src/pages/FractionPizza.tsx`
- `src/frontend/src/pages/MathMonsters.tsx`
- `src/frontend/src/pages/EmojiMatch.tsx`
- `src/frontend/src/pages/LetterHunt.tsx`
- `src/frontend/src/pages/PatternPlay.tsx`
- `src/frontend/src/pages/SimonSays.tsx`
- `src/frontend/src/pages/ShapeSafari.tsx`

### Shared Utilities (Unchanged)
- `src/frontend/src/utils/haptics.ts` - Haptic feedback utility

---

## Testing Recommendations

### Manual Testing Priority
1. **Emoji Match** - Complex gesture game
2. **Simon Says** - Pose detection game
3. **Shape Safari** - Canvas drawing game
4. **Letter Hunt** - Hand tracking game
5. **Memory Match** - Card flip game

### Automated Testing
```bash
# TypeScript compilation
cd src/frontend && npx tsc --noEmit --skipLibCheck

# Lint check
npm run lint

# Unit tests for game logic
npm test -- src/games/__tests__/*
```

---

## Known Limitations

1. **Haptics require mobile device** - Desktop browsers don't support vibration API
2. **Streak doesn't persist** - Resets when game restarts (by design)
3. **No global streak** - Each game tracks its own streak

---

## Future Enhancements (Out of Scope)

- [ ] Global streak across all games
- [ ] Persistent high scores with backend
- [ ] Difficulty-based heart thresholds
- [ ] Custom haptic patterns per game
- [ ] Sound effects for streak milestones

---

## Sign-Off

| Role | Status | Notes |
|------|--------|-------|
| Implementation | ✅ Complete | 25 games improved |
| TypeScript | ✅ Pass | No errors |
| Code Review | ⏳ Pending | Ready for review |
| QA Testing | ⏳ Pending | Manual testing recommended |

---

**Ready for Review**: All 25 games have been enhanced with consistent combo scoring, Kenney HUD, haptics, and score popups.
