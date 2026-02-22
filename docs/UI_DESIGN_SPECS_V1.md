# Advay Vision: V1 UI Design Specifications

**Date:** 2026-02-21
**Purpose:** Standardizing the UI design for all standard V1 application pages (Dashboard, Settings, Auth, Profiles) using the styling tokens defined in `BRAND_KIT.md` and `BRAND_MESSAGING_STRATEGY.md`.

---

## 1. Global UI Principles (V1)
*   **Background:** All standard pages use the `Discovery Cream` (#FFF8F0) background to feel warm and inviting, not stark white.
*   **Interactivity:** Every button and card uses `framer-motion` for a subtle `whileHover={{ scale: 1.02, y: -2 }}`. 
*   **Borders & Depth:** Heavy 3px/4px solid borders with hard, offset drop shadows (e.g., `shadow-[0_6px_0_0_#D4561C]`). This establishes the tactile, "toy-like" feel.
*   **Mascot Guidance:** Pip appears on *every* standard page in the bottom-right corner, offering contextual audio-visual hints (e.g., "Ready to pick a game?" on the Dashboard).

---

## 2. Page-by-Page Specifications

### A. Authentication (Login / Register / Recover)
*   **Layout:** Split screen. Left side is a vibrant, solid `Pip Orange` (#E85D04) background featuring a large, happy Pip illustration and the tagline "Learn with your whole body." Right side is the clean `Discovery Cream` form area.
*   **Form Elements:** Inputs have full rounded borders (`rounded-full`), `md` shadow, and focus states that glow `Vision Blue` (#3B82F6).
*   **Primary CTA:** Large, chunky `Pip Orange` button. 
*   **Copy:** Welcoming, parent-focused. "Start your child's journey."

### B. Child Profile Creation
*   **Vibe:** Magical and personalized.
*   **Avatars:** Instead of uploading photos (privacy concern), parents select an animal avatar from a pre-made Kenney.nl or custom CC0 SVG grid (Lion, Monkey, Panda, Toucan). 
*   **Animations:** When an avatar is selected, it pulses and a success chime plays.
*   **Form:** Large, friendly text inputs. "What's the explorer's name?"

### C. The Dashboard (The "Playground Hub")
*   **Hero Section:** Personalized greeting: "Hi [Child Name]! Ready for an adventure?" Header background is a soft gradient.
*   **Progress/Currency:** Top right corner displays the child's "Stars" (earned currency) with a glowing, rotating star icon.
*   **Game Selection (The Core UI):**
    *   A massive, horizontally scrolling or masonry grid of `GameCards`.
    *   **GameCard Spec:** White background, 24px border radius, 4px colored border mapping to the game subject (Math = Blue, Science = Green, Art = Orange). 
    *   Thumbnail image dominates the card. Large, bold, non-serif fonts for the title.
    *   **Tag:** Small pill in the corner: "Full Body" or "Hands Only" or "Face Tracking".
*   **Parent Zone Gate:** A small, disguised button in the header (e.g., "Settings ⚙️"). Tapping it triggers a Math Check (e.g., "Enter 4 × 7 to continue") to prevent the child from accessing subscription/settings.

### D. Parent Settings & Subscriptions (The "Advay Zone")
*   **Vibe:** Serious, clean, professional. Shifts heavily to the `Advay Slate` (#2D3748) palette.
*   **Background:** Solid Slate. Text is white/light gray.
*   **Data Vis:** Simple, elegant `Chart.js` graphs showing "Active Minutes" and "New Skills Discovered".
*   **Billing/Subscription:** Clean cards detailing the trial status or INR/USD subscription tiers.
*   **Privacy Toggles:** Clear switches for local data clearing and session time limits.

### E. Post-Game Success/Failure Flow
*   **The "Rubber Banding" Safety Net:** There is no "Game Over/Failure" screen. If a game is aborted early due to fatigue or exiting, the screen transitions to Pip saying: "Wow, we played hard! Let's take a quick breather!" 
*   **Success Screen:** Confetti explodes (using `canvas-confetti`). The screen tallies up the "Stars" earned. A giant, bouncy "Back to Playground" button appears.

---

## 3. Implementation Check
We will build all of these V1 pages inside `src/frontend/src/pages/` using standard pure React + Tailwind CSS + Framer Motion. This guarantees stability, rapid iteration, and immediate usability for early beta testing.
