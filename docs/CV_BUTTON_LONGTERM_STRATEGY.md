# CV Button Control — Long-Term Strategy

**Date:** March 18, 2026
**Status:** Active — GlobalCVCursor deployed as interim solution
**Scope:** Evaluate long-term architecture for CV-driven button interaction

---

## Current State

| Layer | Component | Status |
|-------|-----------|--------|
| Interim global solution | `GlobalCVCursor` in App.tsx | ✅ Live — all buttons CV-accessible |
| Per-button CV component | `VisionButton` | ✅ Exists — used in 1 game (AnimalSounds) |
| Hand cursor visual | `KenneyHandCursor` | ✅ Working |
| Spatial input bus | `SpatialInputContext` | ✅ Working |

---

## Three Candidate Architectures

### Option A: Migrate all buttons to VisionButton (❌ Not Recommended)

The original audit suggested replacing all ~500 `<button>` elements with `<VisionButton>`.

**Why this is actually worse:**

1. **O(n) per-frame cost**: Each VisionButton runs its own `useEffect` on every cursor position change. With 20 buttons visible, that's 20 hit-test effects per frame. GlobalCVCursor does 1 `elementFromPoint` call.
2. **Massive migration surface**: ~500 button replacements across ~140 files. High risk of regressions, import errors, and prop mismatches.
3. **Tight coupling**: Every game becomes coupled to `VisionButton` + `SpatialInputContext`. Games can't work standalone.
4. **Maintenance burden**: New games must remember to use `VisionButton`. A single `<button>` anywhere breaks the contract.
5. **Limited hit-testing**: VisionButton uses circular radius hit-testing which doesn't match rectangular button shapes.

### Option B: Production-grade GlobalCVCursor (✅ Recommended)

Harden the current GlobalCVCursor into the permanent solution. One component, zero per-game changes.

**Improvements needed over current implementation:**

| Improvement | Why | Effort |
|-------------|-----|--------|
| Expanded hitbox rects | Small buttons are hard to hit with hand cursor — expand `getBoundingClientRect()` by a configurable margin before testing | Small |
| PointerEvent dispatch | Use `PointerEvent` instead of `MouseEvent` — works better with React's synthetic event system and modern CSS `:hover` | Small |
| Dwell-to-click | Alternative to pinch: hold cursor over button for ~800ms to auto-click — easier for young kids | Medium |
| Audio feedback | Play subtle sound on hover/click — critical for kids who can't see the glow | Small |
| Disabled element skip | Check `element.disabled` / `aria-disabled` before hover/click | Small |
| Scroll support | Detect scroll containers and enable hand-swipe to scroll | Medium |
| Performance: throttle elementFromPoint | Currently runs on every cursor position change — throttle to 15-20 checks/sec | Small |

**Architecture after hardening:**

```
SpatialInputProvider (context)
  └── App content (all games, unchanged)
  └── GlobalCVCursor (single instance)
        ├── KenneyHandCursor (visual)
        ├── elementFromPoint hit-testing (expanded rects)
        ├── PointerEvent dispatch
        ├── Dwell-to-click timer
        └── Audio feedback
```

**Why this is optimal:**
- Zero per-game changes, ever
- New games automatically get CV button support
- One place to improve hit-testing, feedback, accessibility
- O(1) DOM query per frame regardless of button count
- Works with any HTML — buttons, links, divs, canvas overlays

### Option C: Hybrid (VisionButton for special cases only)

Keep GlobalCVCursor as the universal layer. Use VisionButton only when a specific button needs custom behavior that the global layer can't provide:

- Oversized hit zones for tiny targets
- Game-specific gesture mappings (e.g., long-press for different action)
- Buttons that need to respond to drag, not just click

**When to use VisionButton:**
- Almost never. Only for genuinely special interaction patterns.
- If you find yourself wanting VisionButton, first ask: can GlobalCVCursor be enhanced to handle this case globally?

---

## Recommended Roadmap

### Phase 1: Harden GlobalCVCursor (Current Priority)

- [ ] Add expanded hitbox rects (pad element bounds by 12px)
- [ ] Switch from MouseEvent to PointerEvent dispatch
- [ ] Skip disabled/aria-disabled elements
- [ ] Throttle elementFromPoint to 20 checks/sec
- [ ] Add dwell-to-click as optional mode

### Phase 2: Polish UX

- [ ] Audio feedback on hover (soft tick) and click (soft pop)
- [ ] Haptic feedback on supported devices
- [ ] Cursor trail smoothing (1€ filter on position)
- [ ] Scroll container detection + hand-swipe scroll

### Phase 3: Cleanup

- [ ] Deprecate VisionButton (or reduce to thin wrapper over native button + data attribute)
- [ ] Remove VisionButton from AnimalSounds, let GlobalCVCursor handle it
- [ ] Delete audit/migration docs that reference per-game VisionButton migration

---

## Why NOT to Migrate to VisionButton

For the record, here's why the "proper" per-button approach is actually the worse architecture:

| Metric | GlobalCVCursor (1 instance) | VisionButton (N instances) |
|--------|----------------------------|---------------------------|
| Hit-tests per frame | 1 | N (one per button) |
| Files to modify | 0 (already done) | ~140 |
| New game effort | 0 (automatic) | Must remember VisionButton |
| Bug surface | 1 component | N components × M games |
| Consistency | Guaranteed | Depends on each game |

The web platform already solved this problem: `document.elementFromPoint()` is the browser's own spatial query. Building a parallel per-component hit-testing system is reinventing the wheel worse.

---

## Files

| File | Role |
|------|------|
| `src/frontend/src/components/game/GlobalCVCursor.tsx` | The global cursor (active) |
| `src/frontend/src/styles/cv-cursor.css` | Hover/click visual feedback |
| `src/frontend/src/components/ui/VisionButton.tsx` | Per-button CV (deprecated path) |
| `src/frontend/src/context/SpatialInputContext.tsx` | Spatial cursor state bus |
| `src/frontend/src/components/game/KenneyHandCursor.tsx` | Visual hand cursor sprite |
