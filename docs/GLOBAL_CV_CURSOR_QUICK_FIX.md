# Global CV Cursor - Quick Fix for Button Control

**Problem:** Most games use regular HTML buttons that DON'T work with hand tracking  
**Solution:** GlobalCVCursor component - makes ALL buttons CV-accessible in 1 day

---

## What This Is

A **temporary, drop-in solution** that makes all existing buttons work with hand tracking WITHOUT migrating every button to VisionButton.

**Use this if:**
- You need CV button control NOW (1 day implementation)
- Can't wait for full migration (2-3 weeks)
- Want to test if CV navigation improves UX before investing in migration

**Don't use this if:**
- You have time for proper VisionButton migration
- Want the best possible UX (VisionButton is better)
- This is a long-term solution (migrate to VisionButton eventually)

---

## How It Works

```
Regular Button (no CV support):
┌─────────────────────────────────────────────────┐
│  <button onClick={handle}>Click</button>           │
│       │                                            │
│       ▼  ONLY responds to mouse/touch               │
│  onClick handler                                   │
└─────────────────────────────────────────────────┘

With GlobalCVCursor (CV support added):
┌─────────────────────────────────────────────────┐
│  <button onClick={handle}>Click</button>           │
│       │                                            │
│       │  Hand cursor positioned over button       │
│       │  + pinch gesture                         │
│       ▼                                            │
│  GlobalCVCursor detects element                    │
│       │                                            │
│       ▼  Simulates click event                    │
│  onClick handler fires                             │
│  Button responds to HAND!                          │
└─────────────────────────────────────────────────┘
```

---

## Installation (5 minutes)

### Step 1: Import the CSS

In `App.tsx` or your main entry file:

```tsx
import './styles/cv-cursor.css';
```

### Step 2: Add GlobalCVCursor Component

In `App.tsx`, wrap your app:

```tsx
import { GlobalCVCursor } from './components/game/GlobalCVCursor';

function App() {
  return (
    <SpatialInputProvider>
      <YourAppContent />
      
      {/* Add this line - it enables CV control everywhere */}
      <GlobalCVCursor enabled={true} />
    </SpatialInputProvider>
  );
}
```

### Step 3: Done!

All buttons now work with hand tracking:
- Point at button with index finger
- Pinch thumb + index to click
- Visual feedback shows which button is hovered

---

## Configuration

```tsx
<GlobalCVCursor
  enabled={true}           // Enable/disable
  color="yellow"           // Cursor color: yellow, green, blue, pink, orange
  size={64}                // Cursor size in pixels
  showTrail={true}         // Show motion trail
  clickDebounceMs={500}    // Time between clicks (prevent double-click)
/>
```

---

## What Gets CV Control

**Works automatically with:**
- `<button>` elements
- `<a href="...">` links
- `<input type="button">`
- `<input type="submit">`
- `<input type="checkbox">`
- `<input type="radio">`
- Elements with `cursor: pointer` CSS
- Elements with `onclick` attribute
- Elements with `role="button"`

**Visual feedback:**
- Yellow glow border on hover
- Scale up (110%) on hover
- Scale down (95%) on click
- Brightness increase on hover

---

## How It Works (Technical)

1. **Renders hand cursor** that follows user's index finger
2. **Uses `document.elementFromPoint()`** to find what's under cursor
3. **Checks if element is clickable** (button, link, cursor:pointer, etc.)
4. **Adds hover CSS class** for visual feedback
5. **Detects pinch gesture** (thumb + index close together)
6. **Simulates click event** on the element

---

## Limitations (Important!)

### vs VisionButton

| Feature | GlobalCVCursor | VisionButton |
|---------|----------------|--------------|
| Setup time | 5 minutes | 30 min per game |
| Works with existing buttons | ✓ Yes | ✓ Yes |
| Precise hit-testing | ○ OK | ✓ Better |
| Visual feedback | ○ Good | ✓ Great |
| Performance | ○ OK | ✓ Optimized |
| Edge cases | Some | Fewer |
| Long-term solution | ✗ No | ✓ Yes |

**Trade-offs:**
- GlobalCVCursor is "good enough" for most cases
- VisionButton provides better UX but requires migration effort
- Use GlobalCVCursor as stopgap, migrate to VisionButton gradually

---

## Known Issues

### 1. Z-Index Issues
If buttons are under other elements, cursor might not detect them.

**Fix:** Ensure buttons have `position: relative` or higher z-index.

### 2. Small Buttons
Very small buttons are hard to hit with hand cursor.

**Fix:** Increase button size or use `hitboxMultiplier` when you migrate to VisionButton.

### 3. Fast Movement
Moving hand very fast might miss click detection.

**Fix:** This is a limitation of the approach. VisionButton handles this better.

### 4. Nested Clickables
Clickable elements inside other clickables might have issues.

**Fix:** GlobalCVCursor searches up to 3 parent levels. For complex nesting, use VisionButton.

---

## Testing Checklist

- [ ] Hand cursor visible on screen
- [ ] Cursor follows index finger smoothly
- [ ] Buttons highlight (yellow glow) on hover
- [ ] Pinch gesture clicks button
- [ ] Click animation plays (scale down)
- [ ] Touch fallback still works
- [ ] Mouse fallback still works
- [ ] Works on iPad
- [ ] Works on Android tablet
- [ ] FPS stays above 20
- [ ] No console errors

---

## Migration Path

**Phase 1 (Now):** Deploy GlobalCVCursor
- 1 day effort
- All buttons work with CV immediately
- Test with kids

**Phase 2 (Later):** Migrate to VisionButton
- Gradually replace GlobalCVCursor with proper VisionButton integration
- Top 10 games first
- Better UX, fewer edge cases

**Phase 3 (Eventually):** Remove GlobalCVCursor
- When all games use VisionButton
- Cleaner architecture
- Best performance

---

## When to Use Which

### Use GlobalCVCursor (This Quick Fix) When:
- ⏰ Need CV control TODAY
- 🐛 Can't wait 2-3 weeks for full migration
- 🧪 Want to test if CV navigation improves engagement
- 📝 Plan to migrate to VisionButton later (this is temporary)

### Use VisionButton (Proper Solution) When:
- 🎯 Building new games (use from start)
- 🔧 Have time to migrate existing games
- ⭐ Want best possible UX
- 📈 Need optimized performance

---

## Example: Before & After

### BEFORE (No CV Control)

```tsx
// Game.tsx
export function Game() {
  return (
    <div>
      <h1>My Game</h1>
      <button onClick={start}>Start</button>
      <button onClick={options}>Options</button>
    </div>
  );
}
```

**Result:** Buttons only work with mouse/touch. Hand tracking doesn't click them.

---

### AFTER (With GlobalCVCursor)

```tsx
// App.tsx
import { GlobalCVCursor } from './components/game/GlobalCVCursor';
import './styles/cv-cursor.css';

function App() {
  return (
    <SpatialInputProvider>
      <Game />
      <GlobalCVCursor enabled={true} />
    </SpatialInputProvider>
  );
}

// Game.tsx (NO CHANGES NEEDED!)
export function Game() {
  return (
    <div>
      <h1>My Game</h1>
      <button onClick={start}>Start</button>
      <button onClick={options}>Options</button>
    </div>
  );
}
```

**Result:** Same buttons, but NOW they work with hand tracking!

---

## Summary

**GlobalCVCursor = 1 day to make all buttons CV-accessible**

**Pros:**
- ⏰ Fast implementation (1 day)
- 🐛 No changes to existing games
- ✅ Works with all button types
- 🎯 Immediate UX improvement

**Cons:**
- ⚠️ Not as polished as VisionButton
- 📈 Some edge cases
- ⏳ Temporary solution (migrate eventually)

**Bottom line:** Use this to ship CV control NOW, then migrate to VisionButton when you have time.

---

## Files Created

- `src/components/game/GlobalCVCursor.tsx` - The component
- `src/styles/cv-cursor.css` - Hover/click styles
- `docs/GLOBAL_CV_CURSOR_QUICK_FIX.md` - This documentation

---

## Next Steps

1. ✅ Add `import './styles/cv-cursor.css'` to App.tsx
2. ✅ Add `<GlobalCVCursor enabled={true} />` to App.tsx
3. ✅ Test on iPad/Android
4. ✅ Deploy
5. 📝 Plan VisionButton migration for top 10 games
