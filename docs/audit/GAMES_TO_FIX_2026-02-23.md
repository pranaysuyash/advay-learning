# Games Requiring Toddler-Friendly Enhancements

**Date:** 2026-02-23  
**Status:** Assessment Complete
**Ticket:** TCK-20260223-008

---

## GAMES ALREADY FIXED ✅

| Game | Cursor | Voice | Timing | Background |
|------|--------|-------|--------|------------|
| **Emoji Match** | ✅ 84px 👆 | ✅ 100% | ✅ 60s | ✅ Clean |
| **Bubble Pop Symphony** | ✅ 84px 👆 | ✅ 90% | ✅ Gentle | ✅ Clean |
| **Freeze Dance** | ✅ Body tracking | ✅ 100% | ✅ Slower | ✅ Clean |

---

## GAMES NEEDING FIXES

### 🔴 HIGH PRIORITY (Hand Tracking Games, Younger Ages)

#### 1. **ShapeSequence** 
**Age:** 4-8 | **CV:** Hand tracking

| Issue | Current | Should Be |
|-------|---------|-----------|
| Cursor size | 64px | 84px |
| Voice/TTS | ❌ NONE | ✅ Full coverage |
| Timer | 80s | 60s+ or untimed |
| Instructions | Text only | Voice + text |

**Quick Fix:**
- Change `size={64}` to `size={84}`
- Add `useTTS` hook
- Add `VoiceInstructions` component
- Add `speak()` calls for: game start, correct sequence, wrong shape, level complete

---

#### 2. **ColorMatchGarden**
**Age:** 3-7 | **CV:** Hand tracking

| Issue | Status |
|-------|--------|
| Cursor size | Check needed |
| Voice/TTS | Check needed |
| Target size | Check needed |

**Action:** Audit and apply same pattern

---

#### 3. **ConnectTheDots**
**Age:** 3-6 | **CV:** Hand tracking

| Issue | Status |
|-------|--------|
| Cursor size | Check needed |
| Voice/TTS | Check needed |
| Dot size | Check needed |

**Action:** Audit and apply same pattern

---

#### 4. **DressForWeather**
**Age:** 3-7 | **CV:** Hand tracking

| Issue | Current | Should Be |
|-------|---------|-----------|
| Cursor | Check needed | 84px 👆 |
| Voice | Has some | Enhance |
| Clothing items | Check size | Ensure large |

**Action:** Already partially enhanced - verify completeness

---

### 🟡 MEDIUM PRIORITY (Hand Tracking, Older Ages)

#### 5. **LetterHunt**
**Age:** 2-6 | **CV:** Hand tracking

| Issue | Status |
|-------|--------|
| Cursor | Check needed |
| Voice | Check needed |
| Target letters | Check size |

---

#### 6. **SteadyHandLab**
**Age:** 4-7 | **CV:** Hand tracking

| Issue | Status |
|-------|--------|
| Cursor | Check needed |
| Voice | Check needed |
| Path width | Check (critical for this game) |

---

#### 7. **ShapePop**
**Age:** 3-5 | **CV:** Hand tracking

| Issue | Status |
|-------|--------|
| Cursor | Check needed |
| Voice | Check needed |
| Shape targets | Check size |

---

#### 8. **WordBuilder**
**Age:** 3-7 | **CV:** Hand tracking

| Issue | Status |
|-------|--------|
| Cursor | Check needed |
| Voice | Check needed |
| Letter tiles | Check size |

---

### 🟢 LOWER PRIORITY (Pose/Other Tracking)

#### 9. **YogaAnimals**
**Age:** 3-8 | **CV:** Pose tracking

Uses body pose, not hand cursor. May need voice enhancements.

---

#### 10. **SimonSays**
**Age:** 3-8 | **CV:** Pose tracking

Uses body pose. Voice likely already present (Simon Says nature).

---

#### 11. **AirCanvas**
**Age:** 2-6 | **CV:** Hand tracking

Drawing game - cursor critical. Check size.

---

## SUMMARY TABLE

| Priority | Game | Age | Main Issues | Est. Time |
|----------|------|-----|-------------|-----------|
| 🔴 HIGH | ShapeSequence | 4-8 | No voice, small cursor | 15 min |
| 🔴 HIGH | ColorMatchGarden | 3-7 | Audit needed | 20 min |
| 🔴 HIGH | ConnectTheDots | 3-6 | Audit needed | 20 min |
| 🔴 HIGH | DressForWeather | 3-7 | Verify/enhance | 15 min |
| 🟡 MED | LetterHunt | 2-6 | Audit needed | 20 min |
| 🟡 MED | SteadyHandLab | 4-7 | Audit needed | 20 min |
| 🟡 MED | ShapePop | 3-5 | Audit needed | 20 min |
| 🟡 MED | WordBuilder | 3-7 | Audit needed | 20 min |
| 🟢 LOW | YogaAnimals | 3-8 | Pose (different) | 30 min |
| 🟢 LOW | SimonSays | 3-8 | Pose (different) | 30 min |
| 🟢 LOW | AirCanvas | 2-6 | Cursor check | 15 min |

---

## RECOMMENDED ORDER

### Phase 1: High Priority (This Week)
1. **ShapeSequence** - Highest impact, no voice currently
2. **DressForWeather** - Already partially done, finish it
3. **ColorMatchGarden** - Popular with younger kids
4. **ConnectTheDots** - Simple fix

### Phase 2: Medium Priority (Next Week)
5. **LetterHunt** (age 2-6, important for early learners)
6. **ShapePop** (age 3-5, simple concept)
7. **SteadyHandLab**
8. **WordBuilder**

### Phase 3: Lower Priority (Future)
9. **AirCanvas**
10. **YogaAnimals**
11. **SimonSays**

---

## ESTIMATED TOTAL TIME

| Phase | Games | Time per Game | Total Time |
|-------|-------|---------------|------------|
| Phase 1 | 4 | 15-20 min | ~75 min (1.25 hours) |
| Phase 2 | 4 | 20 min | ~80 min (1.3 hours) |
| Phase 3 | 3 | 20-30 min | ~75 min (1.25 hours) |
| **TOTAL** | **11** | | **~4 hours** |

---

## WHICH GAME TO FIX NEXT?

**My recommendation: ShapeSequence**

**Reasons:**
1. 🔴 No voice coverage at all (biggest gap)
2. 🔴 Small cursor (64px vs 84px standard)
3. 🟡 80s timer (should be relaxed)
4. ✅ Uses CursorEmbodiment (easy to fix)
5. ✅ Simple game logic (straightforward)

**Fix time:** 15 minutes

---

## READY TO FIX ShapeSequence?

The fixes needed:
1. Change cursor size: 64px → 84px
2. Add `useTTS` hook
3. Add `VoiceInstructions` component to start screen
4. Add voice prompts:
   - Game start: "Pinch the shapes in order!"
   - Correct shape: "Great! Next shape!"
   - Wrong shape: "Try a different shape!"
   - Level complete: "Level complete! Amazing!"
   - Game complete: "You finished all levels! Shape expert!"
5. Change timer: 80s → 60s+ or add "Take your time"

**Shall I proceed with ShapeSequence?**
