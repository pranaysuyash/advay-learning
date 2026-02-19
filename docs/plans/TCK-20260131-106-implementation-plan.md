# TCK-20260131-106 :: Camera game UX standardization — Implementation Plan

Type: REMEDIATION
Owner: AI Assistant
Created: 2026-01-31 06:02 UTC
Status: DRAFT

## Inputs (Observed)

- Audit: `docs/audit/ui__camera_game_screen_ux_audit_2026-01-30.md`
- Deep dive: `docs/audit/CAMERA_GAME_UX_DEEP_ANALYSIS_2026-01-30.md`
- Target screens:
  - `src/frontend/src/pages/AlphabetGame.tsx`
  - `src/frontend/src/pages/LetterHunt.tsx`
  - `src/frontend/src/games/FingerNumberShow.tsx`

## Scope contract

- In-scope:
  - Standardize “goal prompt” interaction and reduce HUD clutter during active play.
  - Remove technical leakage (“GPU/CPU mode”, “camera active” badges).
  - Remove persistent pulsing animations; keep only short celebrations.
- Out-of-scope:
  - New game mechanics or scoring changes
  - New screens/routes
- Behavior change allowed: YES (UX-only)

## UX standard (MVP)

### 1) Camera hero

- Camera occupies ≥70% of the active-play vertical space.

### 2) Two-stage goal prompt

- Stage A: Center prompt for ~1.8s (very large, kid-readable).
- Stage B: Side goal pill persists (small, glanceable).
- Optional: TTS auto + replay button.

### 3) Overlay budget (active play)

Persistent elements (≤3):

1) Goal pill (side)
2) One status pill (e.g., detected count, timer) — only if essential
3) One primary action (e.g., Stop / More)

Everything else moves to:

- “More” menu / pause screen
- non-playing screen (pre-start or post-success)

### 4) Motion rules

- No persistent `animate-pulse` or `animate-ping` on badges.
- Celebration effects can last ≤2s (burst only).

## Per-screen plan

### AlphabetGame

- Goal prompt: already 2-stage; ensure only the goal pill persists.
- Remove/avoid:
  - input-mode indicator (“Hand Tracking” vs “Mouse/Touch”) during play
  - streak badge during play (move to pause/summary)
  - persistent camera-active badge
- Keep:
  - Home/Stop behind a single icon group
  - Primary CTA(s): Start/Stop drawing + Clear

### FingerNumberShow

- Keep center prompt → side pill.
- Reduce left cluster:
  - Keep goal pill + detected count.
  - Move “Hands: 2”, “Level”, and streak into a “More” popover (or show only after pause).

### LetterHunt

- Keep camera hero.
- Keep: goal prompt + 5 options overlay.
- Remove extra HUD during play (score/time can be small or shown between rounds).

## Verification checklist

- Camera hero: visually confirm in browser (desktop + mobile widths).
- Overlay count: during play, count persistent UI elements ≤3.
- No persistent animations: search for `animate-pulse`/`animate-ping` on active HUD.
- Tests/build:
  - `cd src/frontend && npm test`
  - `cd src/frontend && npm run build`
