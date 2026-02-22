# Open Audit: V1 "Bouncy Light" Theme — Full Codebase Sweep

## CONTEXT
You are conducting an **open-ended, exhaustive** UI/UX architectural review for a child-centric educational application ("Advay Vision Learning"). A "V1 Bouncy Light Theme" overhaul was performed. Your job is to discover ALL remaining issues yourself — you are NOT told which files to look at. You must find them.

## V1 DESIGN GUIDELINES

### Core Aesthetic
- **Primary background:** `#FFF8F0` (warm off-white) on page-level containers
- **Container radii:** `rounded-[2rem]` or `rounded-[2.5rem]` — sharp corners are discouraged
- **Borders:** Thick (`border-4 border-slate-100` or `border-slate-200`) with soft shadows
- **Typography:** Bold, playful, child-friendly

### Dark Mode Rules
- **Forbidden on page-level containers & game wrappers:** `bg-slate-900`, `bg-black`, `bg-gray-900`, `bg-gray-800` as opaque full backgrounds
- **ALLOWED — intentional dark accents:** Dark accent cards, feature callout sections, footers, and overlay dialogs that use `bg-slate-800` for contrast are **acceptable design choices** — do NOT flag these
- **ALLOWED — translucent overlays:** `bg-black/50`, `bg-slate-900/60 backdrop-blur-sm` etc. are fine for modals/dialogs
- **Use judgment:** A `bg-slate-800` on a full-page wrapper is a violation. A `bg-slate-800` on a small feature card inside a light page is intentional contrast

### Icons
- UI icons must use `lucide-react` (already installed), NOT broken local SVG file paths

### Assets
- No `raw.githubusercontent.com` URLs — they 404. Assets must be local paths or inline data URIs

## YOUR TASK

**Do NOT rely on a pre-defined file list.** Discover issues yourself by scanning the entire frontend source tree.

### Phase 1: Discovery Scan
```bash
# Find ALL .tsx and .ts files in the frontend
find src/frontend/src -name '*.tsx' -o -name '*.ts' | head -100

# Scan for opaque dark backgrounds
rg --glob '*.tsx' --glob '*.ts' -n 'bg-slate-900[^/]|bg-black[^/]|bg-gray-900[^/]|bg-gray-800[^/]' src/frontend/src/

# Scan for broken external asset URLs
rg --glob '*.ts' --glob '*.tsx' -n 'raw.githubusercontent' src/frontend/src/

# Scan for legacy local SVG icon paths
rg --glob '*.tsx' -n '/assets/icons/' src/frontend/src/

# Scan for sharp corners on major containers (missing rounded)
rg --glob '*.tsx' -n 'rounded-lg|rounded-md|rounded-sm' src/frontend/src/pages/
```

### Phase 2: Contextual Analysis
For every match found in Phase 1:
1. **View 10-20 lines of surrounding context** to determine if it's a violation or intentional
2. Apply the "dark accent vs dark page wrapper" distinction
3. Check if the element is a page-level container, game wrapper, or a small accent element

### Phase 3: Cross-Reference
- Check all page files in `src/frontend/src/pages/` for V1 compliance
- Check all component files in `src/frontend/src/components/` for V1 compliance
- Check `src/frontend/src/utils/assets.ts` for broken URLs
- Check `src/frontend/src/components/ui/Icon.tsx` for lucide-react usage

### Phase 4: Report
Generate a structured report with:

| Category | File | Line | Issue | Severity | Recommendation |
|----------|------|------|-------|----------|----------------|

Severity levels:
- 🔴 **Critical** — Opaque dark bg on page container, broken assets
- 🟡 **Warning** — Sharp corners on major elements, inconsistent styling
- 🟢 **Info** — Minor style inconsistencies, acceptable dark accents

**Include a final verdict: PASS / PASS WITH WARNINGS / FAIL**
