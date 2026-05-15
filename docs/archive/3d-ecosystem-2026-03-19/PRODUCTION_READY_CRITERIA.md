# Production Ready Criteria - Three.js Games

**Date:** 2026-03-19  
**Version:** 1.0  
**Applies to:** All 3D games in the platform

---

## Definition

A Three.js game is considered **"Production Ready"** when it meets ALL of the following criteria:

---

## ✅ Required Criteria

### 1. Code Quality (100% Required)

- [ ] **TypeScript:** 0 compilation errors
- [ ] **Linting:** 0 ESLint errors (warnings OK)
- [ ] **Type Safety:** All functions have proper type annotations
- [ ] **No `any` types:** Unless absolutely necessary and documented

**Verification:**
```bash
npm run type-check  # Must show 0 errors
npm run lint        # Must show 0 errors
```

---

### 2. Runtime Functionality (100% Required)

- [ ] **Loads Successfully:** Game loads within 3 seconds
- [ ] **No Console Errors:** Zero errors in browser console (warnings OK)
- [ ] **Core Mechanics:** All game mechanics work as intended
- [ ] **Win/Lose States:** Game completion and failure states work
- [ ] **UI Elements:** All buttons, overlays, HUD elements functional

**Verification:**
- Manual browser testing
- Console monitoring
- Gameplay walkthrough

---

### 3. Hand Tracking Integration (100% Required)

- [ ] **Camera Permission:** Requests and handles camera permission
- [ ] **Cursor Display:** Cursor/hand avatar appears when tracking
- [ ] **Tracking Stability:** Cursor follows hand smoothly
- [ ] **Interaction:** Pinch/click detection works for game interactions
- [ ] **Fallback:** Graceful degradation if tracking lost

**Verification:**
- Test with webcam
- Test in various lighting conditions
- Test tracking loss recovery

---

### 4. Performance (Required for Production)

- [ ] **FPS:** Maintains 30+ FPS on target devices (iPad 2020+)
- [ ] **Memory:** No memory leaks (stable over 5 minutes)
- [ ] **Load Time:** Initial load < 3 seconds on broadband
- [ ] **Adaptive Quality:** Quality adjustment works if implemented

**Verification:**
```bash
# Use Chrome DevTools Performance tab
# Record 60 seconds of gameplay
# Check FPS and memory graphs
```

---

### 5. Accessibility (Required for Production)

- [ ] **Keyboard Fallback:** All interactions possible with keyboard/mouse
- [ ] **Screen Reader:** Basic screen reader support for UI
- [ ] **Color Contrast:** UI meets WCAG AA contrast requirements
- [ ] **Reduced Motion:** Respects `prefers-reduced-motion`

**Verification:**
- Test with keyboard only
- Test with screen reader
- Check contrast ratios

---

### 6. Audio (Required if Audio Used)

- [ ] **Mute Toggle:** Mute button works
- [ ] **Volume Control:** Respects system volume
- [ ] **Audio Loading:** All sounds load without errors
- [ ] **No Audio Glitches:** No popping, cutting out

**Verification:**
- Test all sound effects
- Test mute/unmute
- Test with headphones and speakers

---

### 7. Error Handling (Required for Production)

- [ ] **Graceful Degradation:** Game handles errors without crashing
- [ ] **Error Messages:** User-friendly error messages
- [ ] **Recovery:** Can recover from common errors (camera lost, etc.)
- [ ] **Logging:** Errors logged for debugging

**Verification:**
- Simulate camera disconnect
- Simulate low memory
- Check error messages

---

### 8. Documentation (Required for Production)

- [ ] **Game Registry:** Added to `threeDWorld.ts`
- [ ] **Routes:** Added to `App.tsx`
- [ ] **Lazy Loading:** Exported in `lazyPages.tsx`
- [ ] **README:** Game documented if complex

**Verification:**
- Check all registry files
- Verify routes work
- Check lazy loading

---

## 📊 Scoring

| Category | Weight | Required |
|----------|--------|----------|
| Code Quality | 20% | ✅ YES |
| Runtime Functionality | 25% | ✅ YES |
| Hand Tracking | 20% | ✅ YES |
| Performance | 15% | ✅ YES |
| Accessibility | 10% | ✅ YES |
| Audio | 5% | If applicable |
| Error Handling | 5% | ✅ YES |
| Documentation | 5% | ✅ YES |

**Minimum for Production:** 100% on Required categories, 80% overall

---

## ✅ Checklist for Each Game

### Bubble Pop 3D

- [ ] TypeScript: 0 errors
- [ ] Runtime: Loads, no console errors
- [ ] Hand Tracking: Works
- [ ] Performance: 30+ FPS
- [ ] Accessibility: Keyboard fallback
- [ ] Audio: Works, mute toggle
- [ ] Error Handling: Graceful
- [ ] Documentation: Complete

**Status:** ✅ PASS / ❌ FAIL  
**Date:** _________  
**Tested By:** _________

---

### Color Match Garden 3D

- [ ] TypeScript: 0 errors
- [ ] Runtime: Loads, no console errors
- [ ] Hand Tracking: Works
- [ ] Performance: 30+ FPS
- [ ] Accessibility: Keyboard fallback
- [ ] Audio: Works, mute toggle
- [ ] Error Handling: Graceful
- [ ] Documentation: Complete

**Status:** ✅ PASS / ❌ FAIL  
**Date:** _________  
**Tested By:** _________

---

### Shape Safari 3D

- [ ] TypeScript: 0 errors
- [ ] Runtime: Loads, no console errors
- [ ] Hand Tracking: Works
- [ ] Performance: 30+ FPS
- [ ] Accessibility: Keyboard fallback
- [ ] Audio: Works, mute toggle
- [ ] Error Handling: Graceful
- [ ] Documentation: Complete

**Status:** ✅ PASS / ❌ FAIL  
**Date:** _________  
**Tested By:** _________

---

## 📝 Notes

- This criteria applies to all NEW 3D game conversions
- Existing games should be retroactively validated
- Performance thresholds may be adjusted based on device testing
- Accessibility requirements may be phased in

---

**Version History:**
- v1.0 (2026-03-19): Initial criteria defined
