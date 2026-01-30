# Text & Contrast Audit (Frontend)

Date: 2026-01-30
Ticket: TCK-20260130-032
Scope: All text rendering in the React frontend (typography system, global CSS, page-level content, shared UI components, and in-game overlays).
Method: Code-level audit of Tailwind tokens, global CSS, and text-related utility classes in pages/components. No runtime color sampling was performed; contrast notes are based on defined colors and compositing assumptions.

## Executive summary
- **System tokens are strong**, with documented AA/AAA text colors (`text-primary`, `text-secondary`, `text-muted`) and curated font sizes in `tailwind.config.js` + `index.css`.
- **Implementation is inconsistent**: many screens still use `text-white/60`, `text-white/70`, `text-white/80` on **light backgrounds** (default `bg-primary`), producing low contrast and readability issues.
- **Dark-surface components** (e.g., ConfirmDialog) lack explicit text color overrides, causing dark text on dark backgrounds.
- **Game overlays** generally look readable but use semi-transparent colored text on tinted backgrounds; several combos are borderline without precise measurement.

## Typography system (source of truth)
**Files reviewed:**
- `src/frontend/tailwind.config.js`
- `src/frontend/src/index.css`

**Defined tokens**
- Font family: `Nunito` (global + Tailwind)
- Base body: `font-weight: 600`, `line-height: 1.6`
- Headings: `font-weight: 800`, `line-height: 1.2`
- Tailwind custom sizes: `display (6rem)`, `h1 (2rem)`, `h2 (1.5rem)`, `h3 (1.25rem)`, `body (1.125rem)`, `small (1rem)`
- Text colors (documented AA/AAA on light backgrounds):
  - `text-primary: #1F2937` (AAA)
  - `text-secondary: #4B5563` (AAA)
  - `text-muted: #6B7280` (AA)

**Observation:** The token system is solid, but many components bypass it with raw `text-white/*` utilities.

## Findings by area

### Global layout & navigation
**Files:** `src/frontend/src/components/ui/Layout.tsx`, `src/frontend/src/index.css`
- ✅ Uses `text-text-primary` and `text-text-secondary` appropriately in header/footer.
- ⚠️ Mixed usage across app means nav is readable, but adjacent pages often drop into low-contrast text colors.

### Authentication screens
**Files:** `Login.tsx`, `Register.tsx`
- ⚠️ Text uses `text-white/60`, `text-white/80`, `text-white/40` on `bg-white/10` panels inside a **light** page background, creating **low contrast** for labels, helper text, and body copy.
- ⚠️ Error state text `text-red-300` on `bg-red-500/20` can be **low contrast** when rendered on light background.
- ✅ CTA buttons are readable (white text on red gradients).

### Home page
**File:** `Home.tsx`
- ⚠️ Hero body text `text-white/80` on light background (`bg-primary`). Likely fails AA.
- ⚠️ Feature cards use `text-white/70` on `bg-white/10` (very low contrast).
- ✅ Gradient title is visually strong; confirm contrast vs light background if used in bright environments.

### Games listing
**File:** `Games.tsx`
- ⚠️ Section intro and descriptions use `text-white/60` / `text-white/70` on light background.
- ⚠️ Pills use `text-blue-300`, `text-green-300`, `text-purple-300`, `text-red-300` on translucent tinted backgrounds—**borderline** contrast on light surfaces.

### Dashboard
**File:** `Dashboard.tsx`
- ✅ Many areas use `text-text-primary/secondary` in light-themed cards.
- ⚠️ Some elements still use `text-white/60` (inconsistent with light theme).
- ✅ Card labels in `text-text-secondary` are good.

### Progress page
**File:** `Progress.tsx`
- ⚠️ Multiple `text-white/60` and `text-white/70` instances inside `bg-white/10` panels on light background.
- ⚠️ Status pills use tinted text (e.g., `text-text-warning`) on tinted backgrounds; verify AA in situ.

### Settings page
**File:** `Settings.tsx`
- ⚠️ Most labels and helper text use `text-white/80` / `text-white/60` on `bg-white/10` cards over a light background.
- ✅ Parent gate (modal) uses `text-gray-600` on white which is readable.

### Alphabet Tracing game
**File:** `AlphabetGame.tsx`
- ✅ Primary UI uses `text-text-primary/secondary` within light cards.
- ⚠️ Feedback banners use `text-green-400 / text-yellow-400 / text-red-400` on light tinted backgrounds; **contrast risk** on light UI.
- ✅ In-game overlays on dark video backgrounds use white text; likely acceptable.

### Letter Hunt
**File:** `LetterHunt.tsx`
- ⚠️ Header uses `text-white/60` for helper text while page background is light.
- ✅ In-camera overlays use white text on dark overlays, good.
- ⚠️ Status feedback uses `text-success` and `text-error` over translucent backgrounds; verify in situ.

### Connect the Dots
**File:** `ConnectTheDots.tsx`
- ⚠️ Many labels use `text-white/60` / `text-white/70` on light backgrounds.
- ✅ Game canvas overlays on black are readable.

### Finger Number Show
**File:** `FingerNumberShow.tsx`
- ✅ Most text uses `text-text-primary/secondary` for light cards.
- ⚠️ Some overlays use `bg-black/55` with white text and small sizes—likely OK, but ensure min 12–14px on mobile.

### Shared UI components
**Card / Button / Toast / Tooltip / ConfirmDialog**
- ✅ `Button` uses clear semantic tokens; white on brand colors likely meets AA.
- ⚠️ `Toast` uses tinted text (`text-green-400`, `text-red-400`, etc.) on translucent tinted backgrounds. On light pages, these can underperform.
- ⚠️ `Tooltip` and `ConfirmDialog` use **dark backgrounds** but **no explicit text color** on titles (inherits `text-primary`), causing **dark text on dark surface**.
- ✅ Layout uses `text-text-primary/secondary` properly.

## Contrast risk matrix (non-exhaustive)
**High risk (likely fails AA on light backgrounds):**
- `text-white/60`, `text-white/70`, `text-white/80` used on `bg-primary` or `bg-white/10` panels.
- `text-red-300`, `text-green-300`, `text-yellow-300` on light tinted backgrounds (e.g., red/green/yellow 20% overlays).

**Medium risk (depends on backdrop):**
- `text-blue-300`, `text-purple-300` on light background with `bg-* /20`.
- `text-amber-300/80` on `bg-amber-500/20`.

**Low risk (generally safe):**
- `text-text-primary`, `text-text-secondary`, `text-text-muted` on `bg-primary` / white.
- White text on solid brand colors (`bg-pip-orange`, `bg-success`, `bg-vision-blue`).

## Recommendations (prioritized)
1. **Normalize text colors on light backgrounds**
   - Replace `text-white/60`, `text-white/70`, `text-white/80` with `text-text-secondary` or `text-text-muted` on light pages.
2. **Standardize card backgrounds**
   - Replace `bg-white/10` on light pages with `bg-white` or `bg-bg-secondary` + `text-text-*`.
3. **Fix dark-surface components**
   - `ConfirmDialog`/`Tooltip`: explicitly set `text-white` or `text-white/80` for titles and body text.
4. **Audit status badges**
   - Replace tinted text colors with semantic `text-*` tokens on light surfaces; increase saturation if needed.
5. **Typography consistency**
   - Align base paragraph sizes to `text-base` or `text-lg` in key parent-facing screens.

## Suggested follow-up actions
- Run automated contrast checks (e.g., Storybook + Axe or Lighthouse) on Home, Login/Register, Games, Progress, Settings.
- Capture color samples in runtime (actual computed colors with alpha) to verify AA/AAA.
- Decide whether the app is intended to be **light-first**; if yes, remove dark-theme leftovers.

## Files reviewed (text/typography relevant)
- `src/frontend/src/index.css`
- `src/frontend/tailwind.config.js`
- `src/frontend/src/components/ui/Layout.tsx`
- `src/frontend/src/components/ui/Button.tsx`
- `src/frontend/src/components/ui/Card.tsx`
- `src/frontend/src/components/ui/Toast.tsx`
- `src/frontend/src/components/ui/Tooltip.tsx`
- `src/frontend/src/components/ui/ConfirmDialog.tsx`
- `src/frontend/src/pages/Home.tsx`
- `src/frontend/src/pages/Login.tsx`
- `src/frontend/src/pages/Register.tsx`
- `src/frontend/src/pages/Dashboard.tsx`
- `src/frontend/src/pages/Games.tsx`
- `src/frontend/src/pages/Progress.tsx`
- `src/frontend/src/pages/Settings.tsx`
- `src/frontend/src/pages/AlphabetGame.tsx`
- `src/frontend/src/pages/LetterHunt.tsx`
- `src/frontend/src/pages/ConnectTheDots.tsx`
- `src/frontend/src/games/FingerNumberShow.tsx`
- `src/frontend/src/components/LetterJourney.tsx`

---
Prepared by: GitHub Copilot
