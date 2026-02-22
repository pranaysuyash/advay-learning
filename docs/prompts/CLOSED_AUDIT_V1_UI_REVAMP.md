# Comprehensive V1 UI Revamp Review Prompt

**Instructions for the User:** Copy the content below the line and paste it to the reviewing AI agent (e.g., Claude Code or another instance).

---

## CONTEXT
You are conducting a strict UI/UX architectural review for the frontend of a child-centric educational application ("Advay Vision Learning" / "Learning for Kids"). We have just completed a massive "V1 Bouncy Light Theme" overhaul, moving away from a legacy dark/neutral theme. Your job is to audit the codebase and verify that the revamp was executed perfectly according to the V1 design guidelines.

## V1 DESIGN GUIDELINES (The "Bouncy Light" Theme)
1. **Core Backgrounds:** The primary app background should be `#FFF8F0` (warm off-white).
2. **Container Radii:** Elements should be extremely rounded, using tailwind classes like `rounded-[2rem]` or `rounded-[2.5rem]`. Sharp corners are heavily discouraged.
3. **Borders:** Containers and cards should have thick borders, e.g., `border-4 border-slate-100` or `border-slate-200`, often coupled with a soft inner or drop shadow (`shadow-sm` or custom).
4. **NO DARK MODE:** There should be zero opaque dark mode backgrounds natively attached to major DOM elements.
   - 🚫 **Forbidden:** `bg-slate-900`, `bg-slate-800`, `bg-black`, `bg-gray-900`, `bg-gray-800`, `text-gray-400` as primary text.
   - ✅ **Exceptions:** Translucent overlays for modals/dialogs (e.g., `bg-black/60` or `bg-slate-900/60 backdrop-blur-sm`) are completely acceptable and necessary.
5. **Icons:** UI icons should utilize `lucide-react`. Local path SVGs that break easily should be avoided for core UI buttons.
6. **Assets:** External raw GitHub URLs (e.g., Kenney raw.githubusercontent) MUST NOT be used, as they are prone to 404s. Assets should be local paths (e.g., `/assets/backgrounds/bg_sunny.png`) or robust inline Data URIs (Base64/SVG).

## WHAT WAS COMPLETED IN THE REVAMP
- **Core Pages:** `Home.tsx`, `Dashboard.tsx`, `Games.tsx`, `Progress.tsx`, `Settings.tsx` were refactored to the chunky, bright aesthetic.
- **Auth Flow:** `Login.tsx`, `Register.tsx`, and `ForgotPassword.tsx` were converted to a vibrant split-screen layout.
- **Global Components:** Modals, Toast notifications, and the `ParentGate` were updated with bouncing animations and soft lighting.
- **Game Wrappers:** Over 15 individual webcam/canvas game components (e.g., `AirCanvas.tsx`, `LetterHunt.tsx`, `ShapePopRefactored.tsx`, `YogaAnimals.tsx`) had their dark wrappers stripped and replaced with `GameContainer` or `GameLayout` utilizing `#FFF8F0`.
- **Assets & Icons:** `UIIcon.tsx` was refactored to map to `lucide-react`. `utils/assets.ts` was purged of dead 404 links and replaced with inline SVGs/Base64 payloads and generated assets.

## YOUR TASK (ACTION ITEMS)
Execute the following verification steps and provide a structured pass/fail report:

1. **Dark Mode Audit:** Use `grep` or your search tools to scan `src/frontend/src/pages` and `src/frontend/src/components` for `bg-slate-900`, `bg-slate-800`, `bg-black`, `bg-gray-900`, and `bg-gray-800`.
   - *Pass Criteria:* All matches must exclusively be translucent overlay classes (e.g., containing `/` like `bg-black/50`). ANY fully opaque dark background on a container is a failure.
2. **Asset Integrity Check:** Inspect `src/frontend/src/utils/assets.ts`. 
   - *Pass Criteria:* Verify there are no `raw.githubusercontent` or unreliable external HTTP links remaining. They should all be local paths (`/assets/...`) or `data:image/` or `data:audio/` URIs.
3. **Icon Component Check:** Inspect `src/frontend/src/components/ui/Icon.tsx`.
   - *Pass Criteria:* Verify it successfully imports and maps components from `lucide-react` instead of pointing to static `/assets/icons/...` paths that might be missing.
4. **General Structure (Spot Check):** View at least 2 game components (e.g., `AirCanvas.tsx` and `LetterHunt.tsx`) and 1 core page (e.g., `Settings.tsx`).
   - *Pass Criteria:* Verify the presence of V1 styling (`bg-[#FFF8F0]`, `rounded-[2.5rem]`, `border-4`) and absence of legacy styles.

**Generate your final report outlining any violations found. If no violations are found, declare the V1 UI Revamp officially complete and architecturally sound.**
