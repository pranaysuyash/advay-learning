# V1 UI Revamp Status

**Last Updated:** February 2026
**Theme:** "Child-Centric Light Theme" (Bubbly, glassy, high-contrast, `#FFF8F0` backgrounds, slate typography, thick borders, pronounced drop-shadows `shadow-[0_6px_0_0_#000000]`, vibrant `#3B82F6` | `#10B981` | `#F59E0B` | `#E85D04` color palettes).

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
Agents tackling UI tasks for these files should rip out all `bg-slate-900`/dark overlays and replace them with V1 patterns (white card + warm scrim or `bg-[#FFF8F0]` backgrounds). Use `MirrorDraw.tsx` as the reference implementation.

> **Overlay pattern to replace:** `bg-slate-900/40|60|70 backdrop-blur-sm|md` → `bg-[#FFF8F0]/80 backdrop-blur-sm` (for inline game overlays) or a V1 white card modal (for fixed full-screen dialogs).

*Internal overlays (paused/result screens within the game canvas):*
*   ✅ `src/frontend/src/pages/MusicPinchBeat.tsx` (L271 — pause overlay)
*   ✅ `src/frontend/src/pages/ShapeSequence.tsx` (L453, L506 — pause + result overlays)
*   ✅ `src/frontend/src/pages/NumberTapTrail.tsx` (L392, L444 — pause + result overlays)
*   ✅ `src/frontend/src/pages/EmojiMatch.tsx` (L862 — in-game overlay)
*   ✅ `src/frontend/src/pages/FreezeDance.tsx` (L823 — result overlay)
*   ✅ `src/frontend/src/pages/FeedTheMonster.tsx` (L333 — in-game overlay)
*   ✅ `src/frontend/src/pages/SteadyHandLab.tsx` (L343 — pause overlay)
*   ✅ `src/frontend/src/pages/WordBuilder.tsx` (L695, L762, L868 — multiple overlays)
*   ✅ `src/frontend/src/pages/PhonicsSounds.tsx` (L568, L600 — pause + result overlays)
*   ✅ `src/frontend/src/pages/ShapePop.tsx` (L305 — pause overlay)

*Full-screen fixed modals (dialog panels):*
*   ✅ `src/frontend/src/pages/VirtualChemistryLab.tsx` (L633 — info modal)
*   ✅ `src/frontend/src/pages/DiscoveryLab.tsx` (L376 — detail modal)
*   ✅ `src/frontend/src/pages/AirCanvas.tsx` (L590 — settings modal)
*   ✅ `src/frontend/src/pages/SimonSays.tsx` (L883 — result modal)
*   ✅ `src/frontend/src/pages/YogaAnimals.tsx` (L799 — result modal)
*   ✅ `src/frontend/src/pages/Inventory.tsx` (L379 — item detail modal)

*Design system / dark-coded UI panels (need full internal retheme, not just overlay swap):*
*   ✅ `src/frontend/src/pages/PhysicsPlayground.tsx` (L515, L557, L601 — dark UI panels/buttons)
*   ✅ `src/frontend/src/pages/MazeRunner.tsx` (L222 — dark game grid container)
*   ✅ `src/frontend/src/pages/ObstacleCourse.tsx` (L598, L691 — dark CTA buttons)
*   ✅ `src/frontend/src/pages/ColorByNumber.tsx` (L322 — dark section panel)

*Shared components (fix here fixes all consumers):*
*   ✅ `src/frontend/src/components/game/GamePauseModal.tsx` (L35 — fixed 2026-03-06)
*   ✅ `src/frontend/src/components/StoryModal.tsx` (L28 — fixed 2026-03-06)
*   ✅ `src/frontend/src/components/OnboardingFlow.tsx` (L101 — fixed 2026-03-06)
*   ✅ `src/frontend/src/pages/Games.tsx` (L330 — fixed 2026-03-06)

---

## ⏳ Phase 4: Remaining Application Views (PENDING)
These views need to be spot-checked and aligned to the new standards defined in Phase 1 & 2.

*   ✅ `src/frontend/src/pages/Login.tsx` (Already matches `ForgotPassword.tsx` split-screen — `bg-[#FFF8F0]`, V1 shadows, correct palette — verified 2026-03-06)
*   ✅ `src/frontend/src/pages/Register.tsx` (Already matches `ForgotPassword.tsx` split-screen — verified 2026-03-06)
*   ✅ `src/frontend/src/pages/Settings.tsx` (Needs chunky preference cards and massive toggles - verified 2026-03-07)

---

## 🚀 Phase 5: Next-Level Extra Polish (BACKLOG)
To push this into an elite, world-class app experience, agents should implement these final visual flairs:

1.  **Explosive Celebration Overlay**: The `CelebrationOverlay.tsx` needs massive, bouncy 3D typography, dense particle physics (confetti), and Mascot animation integration.
2.  **Standardize Option Dialogs**: `OptionChips.tsx` and all pause/difficulty popups within games need to adopt the heavy button standard (`shadow-[0_6px_0_0_#000000]`).
3.  **Haptic Audio Hooking**: Wrap `useAudio` (the canonical UI audio hook, replacing the generative WebAudio API `useSoundEffects`) into the base logic of every V1 clickable element so the app sounds as squishy/bouncy as it looks.
4.  **Library Micro-Animations**: In `Games.tsx`, hovering over a game card should trigger tilt effects, glowing borders, or floating particle states for extreme user delight.
5.  **Reactive Mascot Logic**: The Mascot should have glowing backdrops and physics-based "breathing/bouncing" logic so it feels deeply rooted in the scene.

---

## 📝 Design System Notes (F-008, F-010)

1. **Audio Hooks**: `useAudio` is the canonical sound hook for UI interactions and should be preferred for the core application.
2. **Kenney Components**: `KenneyButton.tsx` and related components are parallel/alternative UI themes primarily for specific games (e.g., retro/pixel styling). They are NOT part of the core V1 generic design system (`Button.tsx`) and should not be used in global app views like the Dashboard, Onboarding, or Settings.
