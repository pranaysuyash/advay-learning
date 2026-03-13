# Reusable Components Audit

**Ticket**: TCK-20260312-004  
**Date**: 2026-03-12  
**Scope**: Identify reusable UI and game-related components across the codebase that can be extracted into a shared library for cross-game usage.  
**Method**: Manual inspection of component directories, review of existing audit files, and spot-checks of usage patterns.

## Executive Summary

The codebase already exhibits a degree of component reuse, particularly in generic UI primitives (Button, Card, Icon, Layout, Toast) and a fairly feature-rich GameCard component. However, many game-specific implementations duplicate similar patterns (progress bars, modals, badges, character skins) that could benefit from canonicalization.

This audit catalogs observed components, notes their current reusability, and proposes extraction candidates to reduce duplication and improve consistency across games.

## Findings

### Generic UI Primitives (Already Reusable)

| Component | Path | Props / Features | Reusability Status |
|-----------|------|------------------|-------------------|
| Button | `src/frontend/src/components/ui/Button.tsx` | Variants (primary, secondary, danger, success, ghost), sizes, icon support, loading state, fullWidth, ButtonLink variant | **High** – used across pages and games |
| Card | `src/frontend/src/components/ui/Card.tsx` | Base card with hover, padding, optional onClick; subcomponents: CardHeader, CardFooter, StatCard, FeatureCard | **High** – used in dashboards, modals, game cards |
| Icon | `src/frontend/src/components/ui/Icon.tsx` | IconName enum, size prop, wraps external icon library | **High** – used by Button, Card, Toast, etc. |
| Layout | `src/frontend/src/components/ui/Layout.tsx` | Global page chrome (header/footer), demo mode banner, navigation links | **Medium** – used by most routes; could be split into layout primitives |
| Toast | `src/frontend/src/components/ui/Toast.tsx` | ToastProvider (context), ToastContainer, auto-dismiss, type-based styling/sound | **High** – used app-wide for notifications |
| KenneyButton | `src/frontend/src/components/ui/KenneyButton.tsx` | Kenney UI Pack skin for buttons (colors, styles, sprite-based) | **Medium** – game-specific skin; could be abstracted as a skin layer |
| KenneyProgressBar | `src/frontend/src/components/ui/KenneyButton.tsx` (same file) | 9-slice progress bar using Kenney sprites | **Low** – tightly coupled to Kenney UI; potential for generic progress bar abstraction |

### Game-Specific Components with Reuse Potential

| Component | Path | Purpose | Observed Duplication / Similar Patterns |
|-----------|------|---------|----------------------------------------|
| GameCard | `src/frontend/src/components/GameCard.tsx` | Rich game tile (title, description, category, difficulty, progress, badges, preview image/icon, play button/link) | **High** – likely the canonical game tile; could be extracted to shared location |
| YogaProgressBars | `src/frontend/src/components/games/yogaAnimals/YogaProgressBars.tsx` | Dual progress bars (match & hold) with color-coded states | **Medium** – similar progress visualization needed in other games (e.g., learning streaks, level progress) |
| PoseInstructionCard | `src/frontend/src/components/games/yogaAnimals/PoseInstructionCard.tsx` | Card showing pose illustration + instructions | **Low** – game-specific; but pattern of "instruction card" appears elsewhere (e.g., tutorials) |
| MatchStatusBadge | `src/frontend/src/components/games/yogaAnimals/MatchStatusBadge.tsx` | Small badge indicating match quality | **Low** – badge pattern reused in GameCard (category/difficulty badges) |
| KenneyCharacter | `src/frontend/src/components/characters/KenneyCharacter.tsx` | Sprite-based animated character from Kenney assets | **Low** – Kenney-specific; but character avatar pattern appears in other games (e.g., custom avatars) |
| ConfirmDialog | `src/frontend/src/components/ui/ConfirmDialog.tsx` | Simple confirmation modal | **Medium** – dialog pattern appears in IssueReportFlowModal, CameraRecoveryModal, etc. |
| IssueReportFlowModal | `src/frontend/src/components/issue-reporting/IssueReportFlowModal.tsx` | Multi-step modal for issue reporting | **Low** – complex modal; but confirms need for reusable modal/dialog framework |
| LoadingState | `src/frontend/src/components/LoadingState.tsx` | Generic loading spinner + message | **High** – used in multiple places; already somewhat generic |
| WellnessTimer / WellnessReminder | Various | Timers/reminders for wellness features | **Low** – feature-specific; but timer pattern could be abstracted |

### Utility & Hooks (Not UI but Worth Noting)

| Hook / Util | Path | Purpose | Reusability |
|-------------|------|---------|-------------|
| useAudio | `src/frontend/src/utils/hooks/useAudio.ts` | Centralized sound effect playback (click, hover, success, error) | **High** – used by Button, Card, Toast, etc. |
| useSettingsStore | `src/frontend/src/store/settingsStore.ts` | Global settings (demo mode, calm mode, etc.) | **High** – used by Layout, various pages |
| useCalmModeContext | `src/frontend/src/hooks/useCalmMode.ts` | Calm mode theme colors toggle | **Medium** – used by Layout and components needing theme awareness |
| useGameHandTracking / useHandDetection | Various | Hand tracking logic for camera-based games | **Medium** – similar across games; could be abstracted into a shared hook with game-specific config |

## Extraction Opportunities

### 1. Canonical GameCard (High Impact)
- **Why**: GameCard already encapsulates a complete, reusable game tile pattern used likely in the games listing page and potentially elsewhere.
- **Proposed Location**: `src/frontend/src/components/shared/GameCard.tsx`
- **What to Extract**:
  - Move component to shared location.
  - Externalize CATEGORY_COLORS and DIFFICULTY_COLORS to a shared constants module (`src/frontend/src/constants/gameCardColors.ts`).
  - Keep API largely identical (title, description, path, icon, ageRange, category, difficulty, previewImage, progress, badges, onPlay vs Link, etc.).
- **Migration Strategy**:
  1. Create shared GameCard.tsx.
  2. Update import in `src/frontend/src/components/GameCard.tsx` to re-export from shared location (deprecated shim) or replace entirely after verifying usage.
  3. Audit all pages/components that import GameCard and migrate to shared import.

### 2. Shared Progress Visualization Primitives (Medium Impact)
- **Why**: Progress bars appear in multiple forms (YogaProgressBars, HistoricalProgressChart, DailyTimeChart, PlantVisualization). A generic ProgressBar component would reduce duplication.
- **Proposed Location**: `src/frontend/src/components/shared/ProgressBar.tsx`
- **What to Extract**:
  - Simple bar accepting `progress (0-100)`, `color`, `label`, `size`, optional `striped`/`animated` variants.
  - Support for composition (e.g., ProgressGroup for multiple bars like YogaProgressBars).
- **Migration Strategy**:
  1. Create ProgressBar.tsx with basic API.
  2. Refactor YogaProgressBars to use ProgressBar (two instances: match progress, hold progress).
  3. Evaluate other chart components for potential replacement or composition.

### 3. Modal/Dialog Framework (Medium Impact)
- **Why**: Multiple modal implementations (ConfirmDialog, IssueReportFlowModal, CameraRecoveryModal, etc.) share backdrop, trapping, animation concerns.
- **Proposed Location**: `src/frontend/src/components/shared/Modal.tsx` (with optional ModalContext for programmatic control).
- **What to Extract**:
  - Base Modal with props: `isOpen`, `onClose`, `children`, `size`, `variant` (default, fullscreen, centered), `closeOnBackdropClick`, `closeOnEscape`, `transition`.
  - Provide AlertModal, ConfirmModal as thin wrappers if needed.
- **Migration Strategy**:
  1. Create Modal.tsx.
  2. Replace ConfirmDialog with Modal-based version.
  3. Gradually refactor other modals to use the shared Modal.

### 4. Skin Layer for Kenney Assets (Low-Medium Impact)
- **Why**: KenneyButton and KenneyCharacter provide a distinct visual style. If multiple games adopt Kenney assets, a canonical skin layer ensures consistency.
- **Proposed Location**: `src/frontend/src/components/skins/kenney/` with exports like KenneyButton, KenneyProgressBar, KenneyCharacter.
- **What to Extract**:
  - Keep existing KenneyButton.tsx and KenneyProgressBar under skins/kenney.
  - Create index barrel exporting them.
  - Ensure base UI primitives (Button, ProgressBar) remain generic; skins are opt-in overlays.
- **Migration Strategy**:
  1. Move KenneyButton.tsx and KenneyProgressBar to `src/frontend/src/components/skins/kenney/`.
  2. Update imports to use the skin path.
  3. Optionally create a higher-order component or prop (e.g., `skin="kenney"`) on base primitives if skin-switching is desired.

### 5. Shared Constants & Theme Tokens (Low Impact)
- **Why**: Color mappings (CATEGORY_COLORS, DIFFICULTY_COLORS) and other hardcoded values appear in multiple places.
- **Proposed Location**: `src/frontend/src/constants/` (e.g., `gameCardColors.ts`, `uiTokens.ts`).
- **What to Extract**:
  - Move color maps out of GameCard.tsx.
  - Consider extracting spacing, radius, shadow values into a theme token file for future theming.
- **Migration Strategy**:
  1. Create constants file.
  2. Import and use in GameCard and any other components that duplicate these maps.
  3. Verify no regression in visual appearance.

### 6. Reusable Loading & Skeleton States (Low Impact)
- **Why**: LoadingState and Skeleton components are already somewhat generic but could be centralized.
- **Proposed Location**: Keep under `src/frontend/src/components/ui/` (already suitable) or move to shared if desired.
- **What to Extract**:
  - Ensure LoadingState accepts customizable message, size, and indicator type.
  - Ensure Skeleton supports variant types (text, image, card).
- **Migration Strategy**:
  1. Audit current usage.
  2. Update props to be more flexible if needed.
  3. Ensure consistent usage across pages.

## Recommendations & Prioritization

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| High | Extract GameCard to shared location and externalize color maps | Low-Medium | High – reduces duplication in game listings and establishes a canonical tile pattern |
| Medium | Create ProgressBar primitive and refactor YogaProgressBars | Low-Medium | Medium – progress visualization is a common need across games |
| Medium | Introduce Modal/Dialog framework and migrate ConfirmDialog | Medium | Medium – standardizes dialog behavior and reduces boilerplate |
| Low | Formalize Kenney skin layer (move assets under skins/kenney) | Low | Low-Medium – prepares for potential multi-game Kenney usage |
| Low | Centralize constants/theme tokens | Low | Low – improves maintainability but limited immediate impact |
| Low | Audit and enhance LoadingState/Skeleton for broader reuse | Low | Low – ensures consistency in loading UX |

## Evidence

- Manual inspection of component files (see paths above).
- Existing audit files in `docs/audit/` (e.g., UI/UX audits, Kenney asset audit) confirm widespread use of primitives like Button, Card, Icon, Toast.
- No automated usage counting performed; assertions based on visual inspection and import patterns observed during audit.

## Next Steps

1. Create this audit document (completed).
2. Define worklog ticket for extraction effort (e.g., TCK-YYYYMMDD-NNN :: Extract reusable GameCard and progress primitives).
3. Prototype shared GameCard in a feature branch, verify with existing usage.
4. Iteratively implement remaining extraction candidates as scoped tasks.

---
*End of Audit*