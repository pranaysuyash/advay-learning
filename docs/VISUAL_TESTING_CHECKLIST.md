# Visual Testing Checklist

**Date**: 2026-03-03  
**Server**: http://localhost:6173/  
**Games to Test**: 25 (sample of 5 recommended)

---

## Quick Test Route (5 Games - 15 minutes)

Test these 5 games to verify the pattern works across different game types:

### 1. Emoji Match (Gesture-based)
**URL**: http://localhost:6173/games/emoji-match

**Test Checklist**:
- [ ] Start game
- [ ] Get 1 correct → Streak shows "x1", 1 heart fills
- [ ] Get 2 correct → Streak shows "x2", 2 hearts fill
- [ ] Get 5 correct → **Milestone banner appears** "🔥 5 Streak! 🔥"
- [ ] Score popup shows "+X points" after each correct
- [ ] Get 1 wrong → Streak resets to 0, hearts empty
- [ ] Haptic feedback on mobile (vibration)

**Expected**: 
- Hearts fill at streaks 2, 4, 6, 8, 10
- Popup shows for 700ms
- Milestone at every 5

---

### 2. Memory Match (Card flip)
**URL**: http://localhost:6173/games/memory-match

**Test Checklist**:
- [ ] Start game on Easy
- [ ] Match 1 pair → Streak shows "x1", 1 heart
- [ ] Match 2 pairs → Streak shows "x2", 2 hearts
- [ ] Match 5 pairs → **Milestone banner appears**
- [ ] Score popup shows after each match
- [ ] Mismatch (wrong pair) → Streak resets to 0

**Expected**:
- Score popup appears at card position or center screen
- Hearts in top HUD area

---

### 3. Simon Says (Pose detection)
**URL**: http://localhost:6173/games/simon-says

**Test Checklist**:
- [ ] Start game
- [ ] Hold pose successfully → Streak increments
- [ ] Hearts visible in HUD
- [ ] Score popup after successful hold
- [ ] Release pose (fail) → Streak resets

**Expected**:
- Streak builds with consecutive successful holds
- Celebration at 5, 10, 15 streaks

---

### 4. Letter Hunt (Hand tracking)
**URL**: http://localhost:6173/games/letter-hunt

**Test Checklist**:
- [ ] Start game
- [ ] Select correct letter → Streak builds
- [ ] Hearts visible in top-right HUD
- [ ] Score popup appears
- [ ] Select wrong letter → Streak resets

**Expected**:
- Hearts fill correctly
- Score popup animation smooth

---

### 5. Shape Safari (Canvas tracing)
**URL**: http://localhost:6173/games/shape-safari

**Test Checklist**:
- [ ] Select a scene
- [ ] Trace and find 1 shape → Streak builds
- [ ] Hearts visible in header
- [ ] Score popup after each find
- [ ] Find all shapes → Game complete

**Expected**:
- Streak increments per shape found
- Milestone banner at 5 shapes

---

## Full Verification (All 25 Games)

If time permits, test each game for:

### Universal Checks (All Games)
| Feature | What to Look For |
|---------|-----------------|
| **Streak Counter** | Shows "x{N}" next to hearts |
| **Heart HUD** | 5 hearts, fill at 2,4,6,8,10 streak |
| **Score Popup** | "+X points" appears, fades after 700ms |
| **Milestone** | Banner at streak 5, 10, 15... |
| **Haptics** | Mobile vibration (if testing on phone) |
| **Reset** | Streak resets to 0 on wrong answer |

---

## Mobile Testing (Optional but Recommended)

Test on actual mobile device for haptics:

1. Connect phone to same WiFi
2. Get local IP: `ipconfig getifaddr en0` (Mac) or `ip addr` (Linux)
3. Access: `http://<IP>:6173/games/emoji-match`
4. Verify vibration works on correct/wrong/milestone

---

## Screenshots to Capture

For documentation, capture:

1. **Hearts filled** (streak 6-10)
2. **Score popup** ("+15 points")
3. **Milestone banner** ("🔥 5 Streak! 🔥")
4. **Game complete** with final score

---

## Common Issues to Watch For

| Issue | Cause | Fix |
|-------|-------|-----|
| Hearts not showing | CSS z-index issue | Check position:absolute |
| Popup not animating | Framer motion import missing | Add `import { motion }` |
| Streak not resetting | Missing setStreak(0) on wrong | Add reset logic |
| No haptics | Desktop browser (expected) | Test on mobile |

---

## Test Result Template

```markdown
### Game: [Name]
**Date**: [Date]
**Tester**: [Name]

| Feature | Status | Notes |
|---------|--------|-------|
| Streak builds | ✅/❌ | |
| Hearts fill | ✅/❌ | |
| Score popup | ✅/❌ | |
| Milestone banner | ✅/❌ | |
| Haptics (mobile) | ✅/❌/N/A | |
| Reset on wrong | ✅/❌ | |

**Overall**: PASS / NEEDS FIX
```

---

## Sign-Off

| Tester | Date | Result |
|--------|------|--------|
| | | |

**Recommended**: At minimum, test the 5 sample games. Full 25-game testing can be done over time.
