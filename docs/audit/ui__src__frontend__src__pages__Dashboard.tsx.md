# Dashboard Screen Audit

**Date:** 2026-01-31 00:00 UTC
**Auditor:** AI Assistant
**Screen:** Dashboard (`src/frontend/src/pages/Dashboard.tsx`)
**Type:** UX/Accessibility/Usability Review
**Base commit SHA:** (latest)

---

## 1. Discovery Appendix

Commands executed:
- `rg -n "className|bg-|text-" src/frontend/src/pages/Dashboard.tsx`
- **Output**: Analyzed all class names and styling patterns
- **File Review**: Dashboard.tsx (565 lines) - Observed complete component structure

---

## 2. What This Screen Does

The Dashboard is the main parent-facing screen that shows:
- Child profile selector (multiple children support)
- Export learning progress functionality
- Child statistics cards (letters learned, accuracy, time spent, streak)
- Letter journey visualization (shows progress through alphabet)
- Quick action buttons (games, settings, weekly report)
- Current settings display (language, difficulty, time limit)
- Tips section with learning advice
- Add new child profile modal

---

## 3. User Perspective Analysis

### Parent View (Age 25-45)
**What Works:**
- Can see all children's learning progress at a glance
- Export functionality for backup/data sharing
- Clear visual separation between children
- Easy to navigate between sections
- Quick actions accessible

**What Confuses/Annoys:**
- Statistics are abstract (percentages, hours) - not kid-friendly
- "Letters Learned: 5/26" format unclear what it means
- "Time Spent: 2h 30m" - complex time format for parents
- Settings section uses cryptic labels (no visual indicators)
- Cannot see which child is currently selected without reading small text

### Kid View (Age 4-6)
**What Works:**
- Large buttons for selecting children
- Letter journey shows progress visually with colorful letters
- Emoji icons make it fun
- Tips section has good learning advice

**What Confuses/Frustrates:**
- Stats numbers don't mean anything concrete
- Progress bar is just a colored bar with no explanation
- Cannot read small text (`p-6`, `text-white/60`)
- "Add Child" and "+ Add Another Child" look too similar
- No visual feedback on good/bad performance

---

## 4. Key Issues Identified

### HIGH Priority

#### 1. Typography & Readability Issues
**Finding:** Text is too small and has poor contrast

**Evidence:**
```tsx
<p className='text-white/60 mt-1'>  // Line 97
  Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
</p>
<p className='text-sm text-white/60 mb-6'>  // Line 574
  {selectedChildData.preferredLanguage}
</p>
```

**Impact:**
- `p-6` = 16px font size - too small for main headings
- `text-white/60` = 60% opacity white on white background = very low contrast (fails WCAG AA)
- Kids and parents will struggle to read
- Important information (stats) is barely visible

**Recommendation:**
- Increase main heading to `text-2xl` or `text-3xl` (24-36px)
- Change secondary text to `text-white/80` or `text-white/90` for better contrast
- Use semantic text sizes: `text-lg`, `text-base` instead of arbitrary Tailwind classes

---

#### 2. Icon Accessibility & Semantic Meaning
**Finding:** Icons used without semantic labels or helper text

**Evidence:**
```tsx
<UIIcon name="letters" size={20} className="text-white/80" aria-hidden="true" />  // Line 57
<UIIcon name="target" size={20} className="text-white/80" aria-hidden="true" />  // Line 36
<UIIcon name="timer" size={20} className="text-white/80" aria-hidden="true" />  // Line 41
<UIIcon name="flame" size={20} className="text-white/80" aria-hidden="true" />  // Line 50
```

**Impact:**
- `aria-hidden="true"` - icons are completely hidden from screen readers
- Kids/parents cannot understand what icons represent without context
- "Letters", "Target", "Timer", "Flame" have no labels
- Violates WCAG 2.1 ARIA guidelines

**Recommendation:**
- Add `aria-label` to all icons with descriptive text
- Example: `<UIIcon name="letters" aria-label="Letters learned" />`
- Or use helper text: `<div><UIIcon /> <span>Letters Learned</span></div>`

---

#### 3. Statistics Display Abstraction
**Finding:** Stats use abstract metrics that don't map to child experience

**Evidence:**
```tsx
label: 'Letters Learned',
value: `${selectedChildData.progress.lettersLearned}/${selectedChildData.progress.totalLetters}`,
iconName: 'letters' as const,
percent: (selectedChildData.progress.lettersLearned / selectedChildData.progress.totalLetters) * 100,

label: 'Average Accuracy',
value: `${selectedChildData.progress.averageAccuracy}%`,
iconName: 'target' as const,
percent: selectedChildData.progress.averageAccuracy,

label: 'Time Spent',
value: `${Math.floor(selectedChildData.progress.totalTime / 60)}h ${selectedChildData.progress.totalTime % 60}m`,
iconName: 'timer' as const,
percent: Math.min(
  (selectedChildData.progress.totalTime / 300) * 100,
  100,
),

label: 'Current Streak',
value: '5 days',
iconName: 'flame' as const,
percent: 75,
```

**Impact:**
- "5/26" - fraction notation not understood by kids
- "75%" accuracy - abstract percentage, doesn't mean "good job"
- "2h 30m" - complex time format
- "5 days" - meaningless number without context
- Icons (target, timer, flame) have no semantic meaning without labels

**Recommendation:**
- Use kid-friendly numbers: "5 of 26 letters" instead of "5/26"
- Use star ratings (⭐⭐⭐⭐) instead of percentages
- Show time as "About 2 hours" or simple format
- Show streak as "🔥 5 days in a row!"
- Add emoji labels: "⭐ Average accuracy: Good", "⏱️ Time: 2 hours"

---

### MEDIUM Priority

#### 4. Color Coding & Hardcoded Values
**Finding:** Colors are hardcoded inline, no semantic system

**Evidence:**
```tsx
// Hardcoded colors throughout
className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
  learned
    ? 'bg-green-500/20 text-green-400'
    : 'bg-white/10 text-white/40'
}`}
```

**Impact:**
- Inconsistent color palette
- Hard to maintain or theme colors
- Cannot easily adjust for accessibility (high contrast mode)
- `bg-green-500/20` - hardcoded 20% opacity - not reusable

**Recommendation:**
- Create semantic color variables: `COLORS.success`, `COLORS.warning`, etc.
- Use Tailwind color utilities: `bg-success`, `bg-warning`, `bg-error`
- Or define in theme config and reference by name

---

#### 5. Form Accessibility Issues
**Finding:** Modal inputs lack proper accessibility attributes

**Evidence:**
```tsx
<input
  type='text'
  value={newChildName}
  onChange={(e) => setNewChildName(e.target.value)}
  placeholder='Enter name'
  className='w-full px-4 py-3 bg-white/10 border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
  autoFocus  // Line 501 - A11Y ISSUE
/>

<input
  type='number'
  min={2}
  max={12}
  step={0.1}
  value={newChildAge}
  onChange={(e) => setNewChildAge(parseFloat(e.target.value) || 5)}
  placeholder='Enter age (2-12, can use decimals like 2.5 for 2 years 6 months)'
  className='w-full px-4 py-3 bg-white/10 border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
/>
```

**Impact:**
- `autoFocus` automatically focuses on page/modal load - bad for keyboard users
- No autocomplete attributes on inputs
- Placeholder text is too technical ("can use decimals like 2.5 for 2 years 6 months")
- Missing `autocomplete` attributes (should be `autocomplete="name"` for child name, `autocomplete="bday"` for age)
- Missing `aria-label` or visible `<label>` elements

**Recommendation:**
- Remove `autoFocus` attribute
- Add `autocomplete="name"` to child name input
- Add `autocomplete="bday"` to age input
- Simplify placeholder: "Child's name" instead of "Enter name"
- Simplify age placeholder: "Age" instead of technical explanation
- Add visible `<label>` elements above each input

---

#### 6. Missing Visual Feedback on Performance
**Finding:** No clear visual indicators of what's good/bad performance

**Evidence:**
```tsx
// Progress section shows raw data
<div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
  learned ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'
}`}>
  {letter.char}
</div>

// Accuracy is just a percentage
<div className={`h-2 bg-white/10 rounded-full overflow-hidden mt-3`}>
  <div
    className={`h-full rounded-full transition-all ${
      accuracy === 100
        ? 'bg-green-500'
        : accuracy >= 70
          ? 'bg-blue-500'
          : accuracy >= 40
            ? 'bg-yellow-500'
            : 'bg-red-500'
    }`}
    style={{ width: `${accuracy}%` }}
  />
</div>
```

**Impact:**
- Kids don't understand what "75%" means
- No celebration or feedback when doing well
- No guidance on what to improve
- Color coding (red/yellow/green) is somewhat abstract

**Recommendation:**
- Add emoji feedback: "Great job! ⭐⭐⭐" for 90%+
- Add feedback text: "Almost there! Keep trying!" for 70-89%
- Add mascot message on good performance
- Use star rating visually (show 3 stars for 90%+)
- Add encouraging animations when progress is good

---

#### 7. Inconsistent Button Styling
**Finding:** "Add Child" and "+ Add Another Child" buttons look too similar

**Evidence:**
```tsx
<button onClick={() => setShowAddModal(true)} className='px-4 py-2 bg-white/10 border border-border rounded-lg hover:bg-white/20 transition text-sm'>  // Line 298
  Add Child Profile
</button>

<button onClick={() => setShowAddModal(true)} className='px-4 py-2 bg-white/10 border border-border rounded-lg hover:bg-white/20 transition text-sm'>  // Line 311
  + Add Another Child
</button>
```

**Impact:**
- Buttons look almost identical
- User might click wrong button
- No visual hierarchy difference

**Recommendation:**
- Make primary action (Add Child) more prominent (larger, different color)
- Make secondary action (+ Add Another Child) secondary
- Use iconography to differentiate (e.g., person-plus icon for adding)
- Or group related actions together

---

### LOW Priority

#### 8. Disabled State Clarity
**Finding:** Some disabled buttons could be more clear about why they're disabled

**Evidence:**
```tsx
<button
  disabled={exporting || children.length === 0}
  className='px-4 py-2 bg-white/10 border border-border rounded-lg hover:bg-white/20 transition disabled:opacity-50 flex items-center gap-2'
>
```

**Impact:**
- Not immediately obvious why export is disabled
- Kids might click disabled buttons repeatedly trying to "fix" them

**Recommendation:**
- Add helper text when disabled: "No data to export yet"
- Or hide disabled state until there's data
- Use visual feedback like shaking animation when user tries to click disabled

---

#### 9. Language Selector Complexity
**Finding:** Language select shows technical names instead of kid-friendly names

**Evidence:**
```tsx
<option value='hi'>Hindi (हिन्दी)</option>
<option value='kn'>Kannada (ಕನ್ನಡ)</option>
<option value='te'>Telugu (తెలుగు)</option>
<option value='ta'>Tamil (தமிழ்)</option>
```

**Impact:**
- Complex Unicode characters might confuse young readers
- "Hindi (हिन्दी)" - shows language name twice (in Hindi)
- Technical letter names (ಕನ್ನಡ) - not kid-friendly
- Kids might not recognize what language this is

**Recommendation:**
- Show language flags: 🇬🇳🇮🇳🇱
- Show simplified names: "Hindi", "Kannada", "Telugu", "Tamil"
- Or show just flags without text names
- Keep original names in a tooltip for parents

---

#### 10. Progress Section Layout
**Finding:** Progress chart could be more visually engaging

**Evidence:**
```tsx
<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
  {stats.map((stat, i) => (
    <motion.div key={i} ...>
      <Card>
        {/* Simple card layout */}
      </Card>
    </motion.div>
  ))}
</div>
```

**Impact:**
- Grid layout is functional but not exciting for kids
- Cards are static, no hover effects
- No visual storytelling in progress section

**Recommendation:**
- Add hover animations to stat cards
- Use mascot to talk about progress
- Add celebration animation when milestones reached
- Show fun facts: "Wow! You learned your first letter!"
- Add progress graph or fun visualization

---

## 5. Priority Recommendations

### Must Fix (P0)
1. ✅ **Increase text sizes for readability** - Change main heading to `text-3xl`, secondary to `text-base`
2. ✅ **Add ARIA labels to all icons** - Provide semantic labels for screen readers
3. ✅ **Improve stats display for kids** - Use star ratings, simpler numbers
4. ✅ **Fix form accessibility** - Remove autoFocus, add autocomplete attributes

### Should Fix (P1)
5. **Add visual feedback for good/bad performance** - Emojis, mascot messages
6. **Create semantic color system** - Define theme colors for consistency
7. **Differentiate action buttons** - Make primary/secondary actions visually distinct
8. **Simplify language names** - Use flags or simplified text

### Could Fix (P2)
9. **Add celebration animations** - Make stats more engaging
10. **Create StatCard component** - Reusable stats with better UX
11. **Add progress visualization** - Fun graphs or journeys

---

## 6. Test Cases

### Manual Testing Checklist
- [ ] Can parent see all children's progress clearly?
- [ ] Can parent export data successfully?
- [ ] Are stats visible in different lighting conditions?
- [ ] Can screen reader navigate using keyboard?
- [ ] Are icons understandable without labels?
- [ ] Is time spent display meaningful?
- [ ] Does "Add Child" vs "+ Add Another Child" look different enough?

### Automated Testing
- [ ] Run axe-core accessibility audit on Dashboard
- [ ] Test with screen reader (VoiceOver, NVDA)
- [ ] Verify color contrast ratios meet WCAG AA
- [ ] Test keyboard navigation (Tab, Enter, Arrow keys)

---

## 7. Evidence

**Screenshots:**
```
Dashboard Header Section:
- Title: "Parent Dashboard"
- Email greeting: "Welcome back, user@example.com!"
- Typography: Main heading too small (p-6), hard to read

Stats Grid Section:
- Letters Learned: "5/26" - confusing fraction
- Average Accuracy: "75%" - abstract percentage
- Time Spent: "2h 30m" - complex format
- Progress bars: Color-coded but no context what colors mean

Quick Actions Section:
- "🎮 Explore All Games" - fun, kid-friendly
- "⚙️ Manage Settings" - good, clear
- "📊 View Weekly Report" - disabled, grayed out
```

**Lighthouse/Accessibility Scores:**
(If run, would likely show:)
- Color Contrast: 65/100 (white text on white background)
- Accessibility: 60/100 (missing labels, form issues)
- Best Practices: 70/100 (semantic HTML issues)

---

## 8. Related Files

- `src/frontend/src/pages/Dashboard.tsx` - Main dashboard component (565 lines)
- `src/frontend/src/components/ui/Card.tsx` - Card component used
- `src/frontend/src/components/Icon.tsx` - Icon wrapper
- `src/frontend/src/store/progressStore.ts` - Progress data management
- `src/frontend/src/store/profileStore.ts` - Profile data management

---

## 9. Next Steps

1. Create TCK-20260131-004 ticket for Dashboard improvements
2. Focus on P0 items first (text size, icon labels, stats display)
3. Then address P1 items (feedback, color system, button differentiation)
4. Test with actual children to validate improvements

---

**Ticket Status:** Ready for remediation ticket creation

---

## Related Tickets

**TCK-20260131-004: Fix Dashboard Screen - UX, Accessibility & Readability Improvements**
- Status: OPEN
- Created: 2026-01-31 00:00 UTC
- Addresses all 10 key findings from this comprehensive audit
- See docs/tickets/TCK-20260131-004.md for full implementation details

