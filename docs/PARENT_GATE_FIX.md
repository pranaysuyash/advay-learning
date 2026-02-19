
---

## BUG FIX: Parent Gate Button Not Responding

**Date:** 2026-02-02  
**Status:** ✅ FIXED  
**Priority:** P0 (Critical - can't access Settings)

### Problem

The Parent Gate "Hold to Unlock" button stopped responding to clicks/touches. Previously worked (user could press for 3 seconds to unlock), but now nothing happens when holding the button.

### Root Cause

The ParentGate component was rendered INSIDE a `<motion.div>` with animation properties:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
  {!parentGatePassed && (
    <ParentGate ... />  // ❌ Inside motion wrapper
  )}
</motion.div>
```

**Why this broke it:**

- Framer Motion's `motion.div` creates a new **stacking context**
- ParentGate uses `fixed inset-0 z-50` to overlay the screen
- But being inside the motion wrapper constrained its positioning
- The z-index wasn't working properly due to the new stacking context
- Button events weren't firing correctly

### Solution

Moved ParentGate OUTSIDE the motion wrapper:

```tsx
{/* Parent Gate - Render outside motion wrapper to avoid stacking context issues */}
{!parentGatePassed && (
  <ParentGate ... />  // ✅ Outside motion wrapper
)}

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
  {parentGatePassed && (
    // Settings content...
  )}
</motion.div>
```

### Changes Made

**File:** `src/frontend/src/pages/Settings.tsx`

**Before:**

```tsx
<section className='max-w-7xl mx-auto px-4 py-8'>
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    {!parentGatePassed && (
      <ParentGate ... />
    )}
    {parentGatePassed && (
      // Settings content
    )}
  </motion.div>
</section>
```

**After:**

```tsx
<section className='max-w-7xl mx-auto px-4 py-8'>
  {/* Parent Gate - Render outside motion wrapper */}
  {!parentGatePassed && (
    <ParentGate ... />
  )}
  
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    {parentGatePassed && (
      // Settings content
    )}
  </motion.div>
</section>
```

### Testing

- [x] Parent Gate modal appears when accessing Settings
- [x] "Hold to Unlock" button responds to mouse/touch
- [x] Progress bar fills while holding (0% → 100%)
- [x] Button turns orange while holding
- [x] Access granted after 3 seconds
- [x] Settings page appears after unlocking

### Technical Note

**Stacking Context Issue:**
CSS properties like `transform`, `opacity`, `filter`, and `perspective` create new stacking contexts. When ParentGate (with `position: fixed`) was inside a motion.div with `initial/animate` props, it was constrained by that context, preventing proper overlay behavior.

**Best Practice:**
Modals/overlays with `position: fixed` should be rendered at the root level or outside animated containers to avoid stacking context issues.

---
EOF
