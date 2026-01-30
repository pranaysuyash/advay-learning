# Settings Parent Gate Implementation - Agent Handoff

**Status:** Reverted to clean state. Ready for new agent to implement parent gate.

---

## Current State (Clean)

### File: `src/frontend/src/pages/Settings.tsx`

**Existing State Variables:**
```typescript
const [cameraPermission, setCameraPermission] = useState<
  'granted' | 'denied' | 'prompt'
>('prompt');
const [showResetConfirm, setShowResetConfirm] = useState(false);
const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);
```

**Existing Functions:**
- `checkCameraPermission()` - Checks camera permissions on mount
- `handleCameraToggle()` - Toggles camera enable/disable
- `handleReset()` - Resets all settings

**Existing Stores:**
- `useSettingsStore()` - Settings state management
- `useProgressStore()` - Progress tracking (unlockAllBatches, resetProgress, getUnlockedBatches, getMasteredLettersCount)

---

## What Needs to Be Added (Parent Gate)

### Required State Variables:
```typescript
const [parentGatePassed, setParentGatePassed] = useState(false);
const [holdingGate, setHoldingGate] = useState(false);
const [holdDuration, setHoldDuration] = useState(0);
```

### Required Functions:
```typescript
// Handle parent gate hold duration (3 seconds)
useEffect(() => {
  let interval: number | undefined;
  if (holdingGate) {
    interval = setInterval(() => {
      setHoldDuration((prev) => {
        if (prev >= 3000) { // 3 seconds in ms
          clearInterval(interval);
          setHoldingGate(false);
          setParentGatePassed(true);
          return prev;
        }
        return prev + 100;
      });
    }, 100); // Update every 100ms
  }
  return () => {
    if (interval) clearInterval(interval);
  };
}, [holdingGate]);

const handleGateStart = () => {
  setHoldingGate(true);
  setHoldDuration(0);
};

const handleGateEnd = () => {
  setHoldingGate(false);
  setHoldDuration(0);
};

// Reset parent gate when navigating away
useEffect(() => {
  return () => {
    setParentGatePassed(false);
    setHoldingGate(false);
    setHoldDuration(0);
  };
}, []); // Run once on mount
```

---

## JSX Structure Requirements

### Parent Gate Overlay (Condition: `!parentGatePassed`)

This overlay should wrap around ALL Settings content when gate not passed. It should be a full-screen overlay that blocks access to Settings.

```jsx
{!parentGatePassed && (
  <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50'>
    <div className='bg-white rounded-2xl p-8 max-w-md text-center'>
      <h2 className='text-2xl font-bold mb-4'>Parent Gate</h2>
      <p className='text-gray-600 mb-6'>
        Hold button below for 3 seconds to access Settings.
        This prevents children from accidentally changing settings.
      </p>
      <button
        onMouseDown={handleGateStart}
        onMouseUp={handleGateEnd}
        onMouseLeave={handleGateEnd}
        onTouchStart={handleGateStart}
        onTouchEnd={handleGateEnd}
        className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition ${
          holdingGate
            ? 'bg-red-500 text-white'
            : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}
      >
        {holdingGate
          ? `Holding... ${(holdDuration / 1000).toFixed(1)}s`
          : '👆 Hold to Access Settings (3s)'}
      </button>
      <div className='mt-6 text-sm text-gray-500'>
        Press and hold the button to continue
      </div>
    </div>
  </div>
)}
```

### Settings Content (Unchanged, shown when `parentGatePassed` is true)

All existing Settings content should be wrapped by the parent gate conditional. NO other changes needed to existing Settings content.

**Important:** Do NOT wrap Settings content in JSX fragment `<>...</>`. The conditional should be:
- Gate overlay: `{!parentGatePassed && <overlay>}`
- Settings content: `{parentGatePassed && <existing-settings>}`

This creates two separate render branches that don't nest.

---

## Integration Points

### Where to Add Code:

1. **After line 18** (after `showUnlockConfirm` state):
   ```typescript
   const [parentGatePassed, setParentGatePassed] = useState(false);
   const [holdingGate, setHoldingGate] = useState(false);
   const [holdDuration, setHoldDuration] = useState(0);
   ```

2. **After line 42** (after `handleReset` function):
   ```typescript
   const handleGateStart = () => {
     setHoldingGate(true);
     setHoldDuration(0);
   };
   
   const handleGateEnd = () => {
     setHoldingGate(false);
     setHoldDuration(0);
   };
   
   useEffect(() => {
     let interval: number | undefined;
     if (holdingGate) {
       interval = setInterval(() => {
         setHoldDuration((prev) => {
           if (prev >= 3000) {
             clearInterval(interval);
             setHoldingGate(false);
             setParentGatePassed(true);
             return prev;
           }
           return prev + 100;
         });
       }, 100);
     }
     return () => {
       if (interval) clearInterval(interval);
     };
   }, [holdingGate]);
   
   useEffect(() => {
     return () => {
       setParentGatePassed(false);
       setHoldingGate(false);
       setHoldDuration(0);
     };
   }, []);
   ```

3. **In the return statement** (around line 75):
   - Wrap entire Settings content with the parent gate overlay
   - Existing Settings content remains unchanged

---

## Implementation Steps

### For Next Agent:

1. ✅ **Read clean Settings.tsx** (done - file is reverted)
2. ⬜ **Add parent gate state variables** (after line 18)
3. ⬜ **Add parent gate functions** (after line 42)
4. ⬜ **Update return statement** with parent gate overlay (around line 75)
5. ⬜ **Test TypeScript compilation**: `npm run type-check`
6. ⬜ **Test parent gate functionality**:
   - Hold button for 3 seconds → Settings opens
   - Navigate away → Gate resets
   - Hold less than 3s → Gate doesn't open
7. ⬜ **Update worklog**: Mark TCK-20260130-009 as DONE

---

## Requirements (from TCK-20260130-009)

- [x] Parent gate appears when clicking Settings (conditional overlay)
- [x] Gate prevents Settings access without verification
- [x] Gate is simple for parents (3-second hold)
- [x] Visual feedback during gate activation (red when holding, orange when not)
- [ ] Gate works on mobile and desktop (NEEDS TESTING)
- [ ] Child cannot bypass gate (NEEDS TESTING)
- [ ] TypeScript compilation passes (NEEDS CHECKING)
- [ ] Update worklog with evidence (NEEDS UPDATING)

---

## Notes for Next Agent

**Don't make the same mistake I made:**
- Do NOT wrap the entire Settings content in a conditional that creates nested JSX
- Use two separate conditionals: `{!parentGatePassed && <overlay>}` AND `{parentGatePassed && <settings>}`
- This creates two independent render branches that TypeScript can parse correctly

**Acceptance Criteria Checklist:**
- [ ] Parent gate overlay implemented
- [ ] 3-second hold logic works
- [ ] Visual feedback (progress indicator)
- [ ] Gate prevents Settings access
- [ ] Gate resets when navigating away
- [ ] TypeScript compiles without errors
- [ ] Tested on mobile and desktop
- [ ] Worklog updated to DONE with evidence

---

**Created:** 2026-01-30 13:00 IST
**Agent:** AI Assistant (handing off after JSX structure issues)
**Status:** ✅ Settings.tsx reverted to clean state
