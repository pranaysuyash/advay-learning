# VoiceOver Accessibility Testing Guide

**Test Date**: 2026-01-31  
**Ticket**: TCK-20260131-131  
**Purpose**: Verify semantic HTML refactoring provides proper accessibility benefits

---

## Setup

1. **Start the development servers** (if not already running):
   ```bash
   # Terminal 1: Backend
   cd src/backend && uv run uvicorn app.main:app --reload --port 8001
   
   # Terminal 2: Frontend
   cd src/frontend && npm run dev
   ```

2. **Open Safari** (best VoiceOver support):
   ```
   http://localhost:6173
   ```

3. **Enable VoiceOver**:
   - Press: `Cmd + F5`
   - Or: System Settings → Accessibility → VoiceOver → Enable

4. **Open Web Rotor**:
   - Press: `VO + U` (where VO = Ctrl + Option)
   - Use arrow keys to navigate between: Landmarks, Headings, Form Controls, Links

---

## Test 1: Landmark Navigation (Layout.tsx)

**Goal**: Verify all main page regions are discoverable

### Steps:
1. Navigate to Home page
2. Press `VO + U` to open Web Rotor
3. Press Left/Right arrow to select "Landmarks" category
4. Press Up/Down arrow to navigate landmarks

### Expected Results:
- ✅ **Header** landmark (top navigation)
- ✅ **Navigation** landmark (menu)
- ✅ **Main** landmark (primary content)
- ✅ **Footer** landmark (bottom info)

### Record Results:
```
[ ] Header found
[ ] Navigation found
[ ] Main found
[ ] Footer found
```

---

## Test 2: Heading Hierarchy (All Pages)

**Goal**: Verify no heading levels skipped (H1→H2→H3, not H1→H3)

### Steps (repeat for each page):
1. Navigate to page: Home, Dashboard, Settings, AlphabetGame
2. Press `VO + U` → Select "Headings"
3. Navigate through headings with Up/Down arrows
4. Note the heading levels (H1, H2, H3, etc.)

### Expected Results:

**Home Page**:
- ✅ H1: "Welcome to Advay Vision Learning"
- ✅ H2: Section headings (no skipped levels)

**Dashboard**:
- ✅ H1: "Dashboard" or "Progress"
- ✅ H2: "Recent Activities" or similar
- ✅ H3: Individual activity cards (if present)

**Settings**:
- ✅ H1: "Settings"
- ✅ H2: Section headings (Profile, Game Settings, etc.)

**AlphabetGame**:
- ✅ H1: Game title
- ✅ H2: Instructions or sections

### Record Results:
```
Home: [ ] No skipped levels
Dashboard: [ ] No skipped levels
Settings: [ ] No skipped levels
AlphabetGame: [ ] No skipped levels
```

---

## Test 3: Section/Article Navigation (Home, Dashboard)

**Goal**: Verify sections and articles are navigable

### Steps:
1. Navigate to Home page
2. Press `VO + Cmd + J` to jump to next section
3. VoiceOver should announce "Section: [name]"

### Expected Results:
- ✅ Home: Multiple article sections for game categories
- ✅ Dashboard: Sections for activities, progress, achievements

### Record Results:
```
Home sections: [ ] Navigable with VO + Cmd + J
Dashboard sections: [ ] Navigable with VO + Cmd + J
```

---

## Test 4: Form Accessibility (Settings)

**Goal**: Verify form fields have labels and logical Tab order

### Steps:
1. Navigate to Settings page
2. Press `VO + U` → Select "Form Controls"
3. Navigate through form controls
4. For each control, verify VoiceOver announces the label

### Expected Results:
- ✅ Username field: Announces "Username, edit text"
- ✅ Email field: Announces "Email, edit text"
- ✅ Game Language dropdown: Announces "Game Language, pop-up button"
- ✅ Difficulty dropdown: Announces "Difficulty Level, pop-up button"
- ✅ Sound toggle: Announces "Sound Effects, checkbox" or similar

### Tab Order Test:
1. Click in first field
2. Press Tab repeatedly
3. Verify logical order (top to bottom, left to right)

### Record Results:
```
Form labels: [ ] All present and announced
Tab order: [ ] Logical progression
Required fields: [ ] Marked appropriately
```

---

## Test 5: Output Elements (AlphabetGame)

**Goal**: Verify score/progress values announced to screen reader

### Steps:
1. Navigate to AlphabetGame
2. Start the game
3. Use VoiceOver cursor (VO + arrows) to navigate to score display
4. VoiceOver should announce the current score value

### Expected Results:
- ✅ Score uses `<output>` element
- ✅ VoiceOver announces: "Score: [value]" or similar
- ✅ Updates are announced when score changes (if live region)

### Record Results:
```
Score output: [ ] Announced correctly
Updates: [ ] Dynamic changes announced (if applicable)
```

---

## Test 6: Progress Elements (Dashboard)

**Goal**: Verify progress bars announce value and max

### Steps:
1. Navigate to Dashboard
2. Use VoiceOver to navigate to progress bars
3. VoiceOver should announce: "Progress, [value] of [max]"

### Expected Results:
- ✅ Progress uses `<progress>` element
- ✅ VoiceOver announces current value and maximum
- ✅ Percentage or fraction is clear

### Record Results:
```
Progress bars: [ ] Value and max announced
Context: [ ] Clear what progress represents
```

---

## Test 7: Dialog Accessibility (Modals)

**Goal**: Verify dialogs trap focus and close with ESC

### Steps:
1. Trigger a modal/dialog (e.g., Settings confirmation, delete action)
2. Press Tab - focus should stay within dialog
3. Press ESC - dialog should close
4. Verify focus returns to triggering element

### Expected Results:
- ✅ Focus trapped within dialog
- ✅ ESC closes dialog
- ✅ Focus returns to trigger element
- ✅ Dialog announced with proper role

### Record Results:
```
Focus trap: [ ] Works correctly
ESC to close: [ ] Works correctly
Focus return: [ ] Returns to trigger
Role announcement: [ ] Dialog role announced
```

---

## Test 8: Keyboard Navigation (General)

**Goal**: Verify all interactive elements reachable via keyboard

### Steps:
1. Navigate entire app using only keyboard:
   - Tab: Next interactive element
   - Shift+Tab: Previous interactive element
   - Enter/Space: Activate buttons/links
   - Arrow keys: Navigate menus/dropdowns
2. Verify no "keyboard traps" (can't escape an element)

### Expected Results:
- ✅ All buttons/links reachable with Tab
- ✅ No keyboard traps
- ✅ Visual focus indicator visible
- ✅ Skip to content link (optional but recommended)

### Record Results:
```
All interactive elements: [ ] Reachable
No keyboard traps: [ ] Confirmed
Focus indicators: [ ] Visible
```

---

## Summary Template

After completing all tests, fill out this summary:

```markdown
## VoiceOver Accessibility Test Results

**Date**: 2026-01-31  
**Tester**: [Your Name]  
**Browser**: Safari [version]  
**VoiceOver**: macOS [version]  
**Ticket**: TCK-20260131-131

### Test Results Summary

| Test Area | Status | Notes |
|-----------|--------|-------|
| Landmarks | ✅ / ❌ | |
| Heading Hierarchy | ✅ / ❌ | |
| Sections/Articles | ✅ / ❌ | |
| Form Accessibility | ✅ / ❌ | |
| Output Elements | ✅ / ❌ | |
| Progress Elements | ✅ / ❌ | |
| Dialog Accessibility | ✅ / ❌ | |
| Keyboard Navigation | ✅ / ❌ | |

### Critical Issues Found
- [List any blocking accessibility issues]

### Minor Issues Found
- [List any non-blocking issues]

### Recommendations
- [Any suggested improvements]

### Overall Assessment
[ ] PASS - All semantic HTML elements provide accessibility benefits
[ ] PARTIAL - Some issues need fixing
[ ] FAIL - Significant accessibility problems detected

### Next Steps
- [What needs to be fixed or documented]
```

---

## VoiceOver Commands Reference

| Command | Action |
|---------|--------|
| `Cmd + F5` | Toggle VoiceOver on/off |
| `VO + U` | Open Web Rotor |
| `VO + Right/Left` | Move to next/previous item |
| `VO + Cmd + H` | Next heading |
| `VO + Cmd + J` | Next section |
| `VO + Cmd + L` | Next link |
| `VO + Cmd + G` | Next graphic |
| `Tab` | Next focusable element |
| `Shift + Tab` | Previous focusable element |

*Note: VO = Ctrl + Option*

---

## Troubleshooting

**VoiceOver not announcing changes**:
- Check if element has proper ARIA live region
- Verify dynamic content uses `aria-live="polite"` or `aria-live="assertive"`

**Can't find landmarks**:
- Verify elements use semantic HTML (`<header>`, `<nav>`, `<main>`, `<footer>`)
- Check for ARIA landmark roles if needed (`role="banner"`, `role="navigation"`, etc.)

**Form labels not announced**:
- Verify `<label>` elements have `htmlFor` matching input `id`
- Check if labels are visually hidden but screen reader accessible

**Focus issues**:
- Verify `tabIndex` values (0 = natural order, -1 = programmatically focusable)
- Check CSS doesn't hide focus outlines

---

**Good luck with testing! Report results in TCK-20260131-131 worklog.**
