**Ticket**: TCK-20260319-016

Game CV Audit - 2026-03-18

- Air Canvas (gameId: air-canvas)
  - Manifest CV: cv: ['hand']
  - Game hook: useGameHandTracking present (AirCanvas.tsx) with onFrame detectHand
  - Route gate: App.tsx uses CameraSafeRoute for /games/air-canvas
  - Status: CV engaged in code; not just preview
  - Gaps: none identified; telemetry log added in code patch

- Alphabet Tracing (gameId: alphabet-tracing)
  - Manifest CV: cv: ['hand', 'face']
  - Game hook: AlphabetGame.tsx uses useGameHandTracking (hand)
  - Route gate: /games/alphabet-tracing guarded by CameraSafeRoute
  - Status: CV multi-mode specified in manifest, but code uses only hand tracking
  - Gap: manifest currently lists 'face' while runtime only uses hand tracking
  - Patch recommendation: reduce to cv: ['hand'] or implement face tracking path

- 3D Games (Dress For Weather 3D, Obstacle Course 3D, etc.)
  - Manifest CV: typically cv: []
  - Gate: cameraSafe may be present; not CV-dependent
  - Status: true CV-free; gating present where appropriate
  - Patch: none required unless intent is to utilize CV; consider narrowing cameraSafe gating to CV-enabled routes

- Other representative CV-enabled games (Word Workshop, Shape Garden, Creative Corner, etc.)
  - Most CV-enabled titles use cv: ['hand'] (or include 'voice') and wire useGameHandTracking
  - Gate: App.tsx cameraSafe wraps CV-enabled routes
  - Patch: ensure the manifest aligns with actual CV hooks; if multi-modal (hand + face/voice) are declared, ensure corresponding face/voice hooks exist

Overall recommendations
- Normalize CV in manifests to reflect actual runtime hooks per game
- Add per-game tests to verify that CV is engaged when camera is usable
- Extend audit to auto-flag mismatches (cv includes modes with no corresponding hook)
