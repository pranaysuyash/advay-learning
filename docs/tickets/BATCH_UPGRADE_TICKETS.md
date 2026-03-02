# Game Upgrade Tickets - Batch Summary

**Created**: 2026-02-27  
**Batch**: B (Automated) + A (Manual)  
**Total Games**: 39  
**Completed**: 3 (manual) + 33 (batch) = 36/39 (92%)

---

## ✅ BATCH B COMPLETE - Automated Upgrades (33 games)

The batch script added basic infrastructure to 33 games:
- ✅ Memo wrapper
- ✅ Subscription check (basic)
- ✅ Import statements

**Games upgraded by script**:
1. OddOneOut.tsx
2. ShadowPuppetTheater.tsx
3. KaleidoscopeHands.tsx
4. DiscoveryLab.tsx
5. PhonicsTracing.tsx
6. BeginningSounds.tsx
7. BubblePop.tsx
8. YogaAnimals.tsx
9. PlatformerRunner.tsx
10. VirtualBubbles.tsx
11. FreeDraw.tsx
12. LetterHunt.tsx
13. RhymeTime.tsx
14. NumberTapTrail.tsx
15. MathMonsters.tsx
16. ShapePop.tsx
17. ShapeSequence.tsx
18. ShapeSafari.tsx
19. MemoryMatch.tsx
20. MusicPinchBeat.tsx
21. VirtualChemistryLab.tsx
22. EmojiMatch.tsx
23. StorySequence.tsx
24. SimonSays.tsx
25. PhonicsSounds.tsx
26. WordBuilder.tsx
27. ColorMatchGarden.tsx
28. ConnectTheDots.tsx
29. MirrorDraw.tsx
30. BubblePopSymphony.tsx
31. FreezeDance.tsx
32. SteadyHandLab.tsx
33. AirCanvas.tsx
34. DressForWeather.tsx
35. AlphabetGame.tsx

**Note**: FingerNumberShow.tsx not found (may be in `/games/` subfolder)

---

## 🔍 MANUAL REVIEW REQUIRED - Step A (36 games)

All batch-upgraded games need manual review to ensure:

### Critical (Must Fix Before Testing)
- [ ] Game ID matches registry entry
- [ ] Progress save is called on game complete
- [ ] Error handling in right places
- [ ] Component closes properly with memo

### Important (Must Fix Before Release)
- [ ] Reduce motion applied to ALL animations
- [ ] WellnessTimer is rendered
- [ ] GlobalErrorBoundary wraps content
- [ ] AccessDenied has correct game name/ID

### Nice to Have (Polish)
- [ ] Console.log statements removed
- [ ] Loading states are user-friendly
- [ ] Error messages are kid-friendly

---

## 📋 MANUAL UPGRADE TICKETS (Step A)

### TCK-20260227-010 :: Review Batch-Upgraded Games

**Type**: QUALITY_REVIEW  
**Priority**: P0  
**Scope**: Review all 33 batch-upgraded games  
**Effort**: ~4 hours (7-8 min per game)

**Checklist per game**:
1. Verify subscription check uses correct game ID
2. Verify progressQueue.add() is called on complete
3. Verify error handling in async operations
4. Verify reduce motion on animations
5. Verify WellnessTimer is present
6. Verify GlobalErrorBoundary wraps content
7. Test game loads and plays correctly

**Games to review**: See list above (33 games)

---

### TCK-20260227-011 :: Upgrade FingerNumberShow

**Type**: QUALITY_FIX  
**Priority**: P1  
**Scope**: FingerNumberShow.tsx not found by script

**Issue**: File may be in `src/frontend/src/games/FingerNumberShow.tsx` instead of `pages/`

**Action**:
1. Locate file
2. Manually upgrade with full pattern
3. Verify in registry

---

### TCK-20260227-012 :: Test All Upgraded Games

**Type**: TESTING  
**Priority**: P0  
**Scope**: End-to-end testing of all 36 upgraded games

**Test Plan**:
1. **Subscription Test**: Try to access game without subscription → should show AccessDenied
2. **Progress Test**: Complete game → verify progress saved in dashboard
3. **Error Test**: Simulate error → verify error UI shows (not blank screen)
4. **Accessibility Test**: Enable reduce motion → verify animations are minimal
5. **Wellness Test**: Play for 20+ minutes → verify wellness reminder appears

**Games to test**: All 36 upgraded games

---

## 📊 UPGRADE STATUS

| Category | Count | Status |
|----------|-------|--------|
| Manually upgraded (perfect) | 3 | ✅ Complete |
| Batch upgraded (needs review) | 33 | 🔍 Review needed |
| Not found / special cases | 1 | ⚠️ Locate & fix |
| Already good (AlphabetGame) | 1 | ✅ Minor tweaks only |
| **TOTAL** | **39** | **92% complete** |

---

## 🎯 NEXT ACTIONS (Step A - Manual Upgrades)

### Priority 1: Verify Batch Upgrades (Today)
1. Review 10 random batch-upgraded games
2. Fix any issues found
3. Update checklist

### Priority 2: Complete Manual Upgrades (Today)
1. Upgrade remaining P0 games manually (if any missed)
2. Fix FingerNumberShow location issue
3. Test subscription enforcement

### Priority 3: Full Testing (Tomorrow)
1. Run full test suite on all 36 games
2. Document any issues
3. Fix critical bugs

---

## 📝 BATCH UPGRADE LIMITATIONS

The batch script added basic structure but CANNOT:
- ❌ Know the correct game ID (needs manual verification)
- ❌ Know when to call progress save (game-specific logic)
- ❌ Add try/catch to async operations (code-specific)
- ❌ Add reduce motion to animations (UI-specific)
- ❌ Wrap buttons in motion components (design-specific)

**These all require manual review and fixes.**

---

**Status**: Batch complete, manual review begins now  
**Next**: Review first 10 batch-upgraded games
