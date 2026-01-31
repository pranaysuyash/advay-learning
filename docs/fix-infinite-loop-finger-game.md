# Fix for Infinite Loop in Finger Number Show Game

## Problem
The Finger Number Show game was experiencing an infinite loop that caused the application to freeze when the game was loaded. This was happening due to improper dependency management in React hooks, specifically with useCallback and useEffect hooks.

## Root Cause
The issue was in the `setNextTarget` function which was defined with `useCallback` but had incomplete dependencies in its dependency array. The function was using several variables that weren't included in the dependency array, causing the function to be recreated on every render. This led to an infinite loop when the function was used as a dependency in other hooks.

Specifically, the `setNextTarget` function was using:
- `refillTargetBag`
- `refillLetterBag` 
- `speak`
- `ttsEnabled`
- `gameMode`
- `letters`
- `NUMBER_NAMES`
- `DIFFICULTY_LEVELS`

But these weren't all included in the useCallback dependency array.

Additionally, useEffect hooks that depended on `setNextTarget` were also contributing to the loop when they included `setNextTarget` in their dependency arrays.

## Solution
1. Updated the `setNextTarget` useCallback to include all necessary dependencies in its dependency array
2. Removed `setNextTarget` from the dependency arrays of useEffect hooks where it was unnecessary, since the function is now properly memoized
3. Updated the detectAndDraw useCallback to include all necessary dependencies

## Files Modified
- `/src/frontend/src/games/FingerNumberShow.tsx`

## Changes Made
1. Fixed the `setNextTarget` useCallback hook with complete dependency array
2. Updated useEffect hook that calls `setNextTarget` to only depend on `isPlaying` and `difficulty`
3. Updated detectAndDraw useCallback with proper dependencies

## Verification
- TypeScript compilation succeeds without errors
- The infinite loop issue is resolved
- Game functions normally without freezing
- All existing functionality remains intact

## Result
The Finger Number Show game now loads and runs properly without any infinite loops or freezing issues. The performance is stable and the game responds correctly to user interactions.