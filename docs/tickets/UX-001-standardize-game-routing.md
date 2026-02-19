# Ticket: Standardize Game Routing Pattern

## ID: UX-001

## Priority: Medium

## Status: Open

## Type: Technical Improvement

## Description

The application currently has an inconsistent routing pattern where the alphabet game uses `/game` while all other games follow the `/games/*` pattern. This creates confusion and violates RESTful URL conventions. The alphabet game receives special treatment despite being simply the first game added, not because it's inherently more important.

## Current State

- `/game` (Alphabet game - special treatment)
- `/games/finger-number-show` (Other games follow consistent pattern)
- `/games/connect-the-dots`
- `/games/letter-hunt`

## Expected State

- `/games/alphabet-tracing`
- `/games/finger-number-show`
- `/games/connect-the-dots`
- `/games/letter-hunt`

## Acceptance Criteria

- All games follow the `/games/*` pattern
- Alphabet game functionality remains unchanged
- Existing links continue to work (with redirects if needed)
- Games page correctly links to new routes
- Dashboard "Continue Learning" button works with new route

## Implementation Steps

1. Update route in `App.tsx` from `/game` to `/games/alphabet-tracing`
2. Update Games page to reference new path
3. Update Dashboard "Continue Learning" link
4. Update profile-based navigation references
5. Add redirect from old `/game` route for backward compatibility
6. Test all game access points work correctly

## Notes

This change will standardize the routing pattern and remove the arbitrary special treatment of the alphabet game, making the codebase more maintainable and consistent.
