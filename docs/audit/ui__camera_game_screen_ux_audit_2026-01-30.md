# Camera Game Screen UX Audit (Hero Camera Focus)

Date: 2026-01-30
Ticket: TCK-20260130-045
Scope: Camera-driven game screens (AlphabetGame, LetterHunt, FingerNumberShow) with emphasis on making the camera area the primary visual focus.
Method: Repo-aware UI audit + targeted deep dives of camera screens. External research on comparable camera/tangible play apps.

## Evidence labels
- **Observed**: Directly verified in repo files or command output
- **Inferred**: Logical conclusion from Observed evidence
- **Unknown**: Not verifiable with available evidence

---

## Sources (Observed)
### Repo files reviewed
- `src/frontend/src/pages/AlphabetGame.tsx`
- `src/frontend/src/pages/LetterHunt.tsx`
- `src/frontend/src/games/FingerNumberShow.tsx`
- `src/frontend/src/components/ui/Layout.tsx`
- `src/frontend/src/index.css`
- `src/frontend/tailwind.config.js`

### External research (selected)
- UX Design for Children (Eleken) - "Virtual helpers/characters make navigation smoother"
- Kids App Design (AppDeveloper Magazine) - "Brain has immediate vs delayed gratification systems"
- Designing Apps for Young Kids (UX Collective) - "Feedback should always be positive, never negative"
- Non-Addictive Learning Apps (Smart Tales) - "Avoid flashy distractions or instant gratification"
- Design Patterns for Learning Games (ResearchGate) - "Match game patterns with learning functions"

---

## Summary (Observed + Inferred)
- **Observed**: Camera screens currently present multiple simultaneous UI clusters (header + score/streak + pending + side letter panel + overlay controls + feedback banners). This dilutes the camera feed as the primary visual focus.
- **Inferred**: Cognitive overload likely increases for kids due to frequent HUD elements and technical status labels that do not directly map to game actions or goals.

---

## Cross‑screen findings (Camera hero priority)

### 1) Camera is not visually dominant (HIGH)
**Observed**: In `AlphabetGame.tsx`, the letter panel can float in the corner while a dense control strip overlays the camera feed; additional banners above and below compete for attention.
**Impact**: The main “hero” input surface (camera view) is visually crowded. Kids’ attention is pulled away from their hand or letter target.
**Recommendation**: Reduce overlays to a single top bar and single bottom action strip. Everything else should be context-sensitive or collapsed.

### 2) Technical system states visible to kids (HIGH)
**Observed**: Text like “Hand tracking active (GPU mode)” appears in the camera experience.
**Impact**: This is developer‑level information, not user‑level value. It adds noise with no educational or game benefit.
**Recommendation**: Replace with user‑meaningful status: “Camera On” / “Touch Mode” or hide completely unless the camera fails.

### 3) Too many simultaneous actions (MEDIUM)
**Observed**: AlphabetGame shows Home, Start/Stop Drawing, Clear, Stop, language toggle, camera status, streak indicator, and batch stats at once.
**Impact**: Increases decision load; kids may not know which action to prioritize.
**Recommendation**: Keep only two primary actions during active play (Start/Stop Drawing, Clear). Move Home/Stop to a single “More” menu or small icon group.

### 4) Status banners compete with the hero surface (MEDIUM)
**Observed**: Feedback banners, accuracy banner, and warnings appear above camera feed with full‑width ribbons.
**Impact**: Frequent reflow distracts from gesture tasks.
**Recommendation**: Use small, ephemeral toast in a corner instead of full‑width banners during active camera play.

### 5) Progress/score hierarchy is inconsistent (MEDIUM)
**Observed**: Score is top-right; streak and batch appear in a small text line; “Trace: A” appears on the overlay left.
**Impact**: No single hierarchy for goals. Kids don’t know the “primary goal” (trace the letter) versus “nice-to-have” metrics.
**Recommendation**: Display only the letter goal + a simple success metric; move streak and batch to pause screen.

---

## Deep dive: AlphabetGame (camera + tracing)
**Observed**
- The game uses a camera feed with overlays and a floating letter panel.
- Multiple controls are present simultaneously (Home, Start/Stop Drawing, Clear, Stop, language toggle, camera active indicator).

**Issues**
1) Hero area competing with overlays (HIGH)
2) Technical messaging in feedback area (HIGH)
3) Excessive action buttons (MEDIUM)
4) Attention split between floating panel + overlay goals (MEDIUM)

**Fix options**
- Option A (Minimal): Replace multi-button bar with two core actions + overflow menu. Replace technical banner with “Camera On”.
- Option B (Hero-first): Use single top bar (Goal + Score). Everything else becomes contextual popover.

---

## Deep dive: LetterHunt (camera + target selection)
**Observed**
- Camera view is the core interaction.
- Multiple overlays: target letter card, score/time/level HUD, option grid.

**Issues**
1) Multiple text blocks on camera feed (MEDIUM)
2) Option grid competes with camera (MEDIUM)

**Fix options**
- Option A: Collapse HUD into one compact top bar; add “Focus Ring” around target instead of text blocks.
- Option B: Move options grid below camera; keep camera clean.

---

## Deep dive: FingerNumberShow (camera + gestures)
**Observed**
- Camera is full-width but overlays include multiple badges and prompts.
- Center prompt is large and then moves to a side HUD.

**Issues**
1) Large prompt is helpful, but persistent multi‑badge overlay is heavy (LOW–MEDIUM).

**Fix options**
- Option A: Keep large prompt + single status badge; remove extra badges during active play.

---

## Research takeaways (external)

### Osmo (tangible play + camera)
**Observed**: Osmo setup emphasizes simple physical interaction; the digital UI guides the child while the physical action is primary (camera sees pieces). The flow is “place device + reflector + play with physical pieces.”
**Inferred**: Osmo’s success relies on **low on‑screen cognitive load** and **clear single‑goal prompts**.

### Osmo Masterpiece (drawing overlay)
**Observed**: The app turns any pen into a pointer and uses the screen as guidance while the child draws on paper. The article notes an initial learning curve but emphasizes the idea that the interface becomes the “world as canvas.”
**Inferred**: The interface succeeds when the **primary canvas is clear** and guidance is minimal and direct.

---

## Recommendations (prioritized)

1) **Make camera the hero**
   - Remove non-essential overlays; keep a single compact HUD.
2) **Remove technical states from kid-facing UI**
   - Replace with “Camera On” / “Touch Mode”, shown only on failure or start.
3) **Consolidate actions**
   - During play: only Start/Stop Drawing + Clear.
4) **Simplify hierarchy**
   - Primary goal: letter to trace (large), secondary: simple score.

---

## Verification checklist
- [ ] Camera feed occupies >70% of vertical space in active play.
- [ ] No technical terms shown during play.
- [ ] Max 2 primary buttons visible during play.
- [ ] Goal + feedback visible without scrolling or multiple banners.

---

Prepared by: GitHub Copilot
