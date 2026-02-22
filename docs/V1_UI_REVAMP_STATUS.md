# V1 UI Revamp Status

**Last Updated:** February 2026
**Theme:** "Child-Centric Light Theme" (Bubbly, glassy, high-contrast, `#FFF8F0` backgrounds, slate typography, thick borders, pronounced drop-shadows `shadow-[0_4px_0_0_#000000]`, vibrant `#3B82F6` | `#10B981` | `#F59E0B` | `#E85D04` color palettes).

This document serves as the source of truth for the ongoing massive UI refactor moving from the legacy "Dark Mode/Glassmorphism" to the new "V1 Child-Centric Bouncy Light Theme". 

Any AI Agent working on this project must consult this list before making UI/UX changes to ensure they match the correct V1 aesthetic.

---

## ✅ Phase 1: Core Pages & Global Routing Structure (COMPLETED)
These files represent the gold standard of the new V1 implementation. Study these files for design patterns, border styles, text sizing, and color ramp usage.

*   `src/frontend/src/pages/Home.tsx`
*   `src/frontend/src/pages/Dashboard.tsx`
*   `src/frontend/src/pages/Games.tsx` (Library)
*   `src/frontend/src/pages/Progress.tsx` (Complete rewrite from dark to light)
*   `src/frontend/src/pages/ForgotPassword.tsx` (Standardized Split-Screen Auth pattern)
*   `src/frontend/src/pages/ResetPassword.tsx`

---

## ✅ Phase 2: Global UI Components (COMPLETED)
These components wrap or form the foundational layout of the new system. They have been ported over entirely.

*   `src/frontend/src/components/ui/Layout.tsx` (New sticky header, light footers, demo banners)
*   `src/frontend/src/components/OnboardingFlow.tsx` (Moved from dark overlays to bubbly white modals)
*   `src/frontend/src/components/GameContainer.tsx` (Thick borders around the game view)
*   `src/frontend/src/components/GameHeader.tsx` (High-contrast bubbly score pills and black borders)
*   `src/frontend/src/components/ui/Button.tsx` (Bouncy, thick bordered, shadow-dropping base buttons)
*   **Progress Dashboard Sub-Components**:
    *   `src/frontend/src/components/progress/MetricsCard.tsx`
    *   `src/frontend/src/components/progress/RecommendationCard.tsx`
    *   `src/frontend/src/components/progress/PlantVisualization.tsx`

---

## 🏗️ Phase 3: Individual Game Structures (IN PROGRESS)
All individual games automatically inherit the new `GameContainer` and `GameHeader`. However, their *internal renders* (canvas overlays, custom buttons, instructions, backgrounds) must be manually updated to rip out `bg-slate-900`/dark overlays and replace them with the V1 bright theme.

**Completed Implementations:**
Study these two games for examples on how to refactor internal game logic to match V1.
*   ✅ `src/frontend/src/pages/MirrorDraw.tsx`
*   ✅ `src/frontend/src/pages/ConnectTheDots.tsx`

**Pending Rewrite Queue:**
Agents tackling UI tasks for these files should aggressively overhaul them.



















---

## ⏳ Phase 4: Remaining Application Views (PENDING)
These views need to be spot-checked and aligned to the new standards defined in Phase 1 & 2.

*   [ ] `src/frontend/src/pages/Login.tsx` (Ensure perfect mapping to `ForgotPassword.tsx` split-screen)
*   [ ] `src/frontend/src/pages/Register.tsx` (Ensure perfect mapping to `ForgotPassword.tsx` split-screen)
*   [ ] `src/frontend/src/pages/Settings.tsx` (Needs chunky preference cards and massive toggles)

---

## 🚀 Phase 5: Next-Level Extra Polish (BACKLOG)
To push this into an elite, world-class app experience, agents should implement these final visual flairs:

1.  **Explosive Celebration Overlay**: The `CelebrationOverlay.tsx` needs massive, bouncy 3D typography, dense particle physics (confetti), and Mascot animation integration.
2.  **Standardize Option Dialogs**: `OptionChips.tsx` and all pause/difficulty popups within games need to adopt the heavy button standard (`shadow-[0_6px_0_0_#000000]`).
3.  **Haptic Audio Hooking**: Wrap `useSoundEffects` into the base logic of every V1 clickable element so the app sounds as squishy/bouncy as it looks.
4.  **Library Micro-Animations**: In `Games.tsx`, hovering over a game card should trigger tilt effects, glowing borders, or floating particle states for extreme user delight.
5.  **Reactive Mascot Logic**: The Mascot should have glowing backdrops and physics-based "breathing/bouncing" logic so it feels deeply rooted in the scene.
