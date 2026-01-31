# Code Preservation & Reactivation Guidelines

**Version**: 1.0  
**Last Updated**: 2026-02-01  
**Applies To**: All AI agents working on code cleanup, refactoring, or issue remediation

---

## Philosophy: Implementation Over Deletion

> "Don't just delete unused code. Understand why it exists, see if it can make the app better, and implement functionality rather than delete."

This guideline establishes a **preservation-first, implementation-preferred** approach to handling unused, dead, or seemingly obsolete code.

---

## The Problem with "Cleanup"

Traditional cleanup approaches often:
- Delete code that was intended for a feature
- Lose institutional knowledge embedded in existing code
- Miss opportunities to complete partially-implemented features
- Create false confidence through line-count reduction

**Example:** A component appears unused. Deletion removes 200 lines. But those 200 lines were a nearly-complete "Parent Dashboard" feature that just needed wiring. Deletion = lost value.

---

## Core Principles

### 1. Investigation Before Action

**When you find unused code, ask:**

1. **What was this supposed to do?**
   - Check commit history: `git log --all -- <file>`
   - Check related tickets/worklog entries
   - Look for TODO comments or feature flags

2. **Why was it abandoned?**
   - Was it deprioritized?
   - Was there a technical blocker?
   - Was it waiting for another feature?

3. **Is it complete or partial?**
   - Complete but unintegrated = high value to activate
   - Partial but functional core = medium value to complete
   - Stub/placeholder = evaluate effort vs. value

4. **Would it add value if activated?**
   - Check product roadmap
   - Consider user value
   - Evaluate technical debt impact

### 2. The Decision Matrix

| Condition | State | Recommended Action |
|-----------|-------|-------------------|
| Complete code, clear purpose, adds value | **Dormant Feature** | **ACTIVATE** - Wire it up, add tests, ship it |
| 70%+ complete, clear value, feasible completion | **Partial Implementation** | **COMPLETE** - Finish and integrate |
| Has tests, well-structured, unclear integration | **Orphaned Code** | **INVESTIGATE** - Find original intent, decide activate/archive |
| Broken/incomplete, no clear purpose, low value | **Technical Debt** | **ARCHIVE** - Move to archive/, document why |
| Obsolete (replaced by better implementation) | **Superseded** | **DELETE** - With explicit approval and documentation |
| Duplicate of existing functionality | **Redundant** | **MERGE** - Combine best aspects, then delete duplicate |

### 3. The Implementation-Deletion Spectrum

```
IMPLEMENTATION (Preferred)              DELETION (Last Resort)
        ↓                                       ↓
   [Activate] → [Complete] → [Merge] → [Archive] → [Delete]
   Dormant      Partial      Combine   Preserve    Remove
   features     features     features  history     forever
```

**Default position: Move left on the spectrum.**

---

## Practical Workflow

### Step 1: Discovery

You find code that appears unused:

```bash
# Example: This component is not imported anywhere
src/frontend/src/components/ParentDashboard.tsx
```

### Step 2: Investigation (REQUIRED)

```bash
# 1. Git history - who created it and why?
git log --all --oneline -- src/frontend/src/components/ParentDashboard.tsx
git show <commit-hash> --stat

# 2. Search for references (even in comments)
rg -i "parent.*dashboard" docs/WORKLOG_TICKETS.md
grep -r "ParentDashboard" docs/

# 3. Check for feature flags
rg -i "parentDashboard|parent_dashboard" src/ --type ts --type tsx

# 4. Look at the code itself
cat src/frontend/src/components/ParentDashboard.tsx | head -50
```

### Step 3: Decision Documentation

Create a brief analysis document:

```markdown
## Code Investigation: ParentDashboard.tsx

**File**: src/frontend/src/components/ParentDashboard.tsx  
**Lines**: 200  
**Status**: Appears unused (no imports found)

### Investigation Findings

**Git History:**
- Created: 2026-01-15 by dev-X
- Last modified: 2026-01-20
- Commit message: "WIP: Parent dashboard with progress charts"

**Worklog References:**
- TCK-20260115-042: "Create parent progress view"
- Status: Blocked on "child profile API"

**Code State:**
- UI: Complete (charts, navigation, styling)
- Logic: Partial (static data, no API integration)
- Tests: None

### Decision

**RECOMMENDATION: COMPLETE**

Rationale:
- UI is production-ready
- Feature aligns with Q1 roadmap (parent engagement)
- Missing piece: API integration (~2 days work)
- Value: High (frequently requested feature)

**Action:** Create ticket TCK-20260201-XXX to complete integration
**Alternative:** Archive if deprioritized
```

### Step 4: Implementation Path

If decision is ACTIVATE or COMPLETE:

1. **Create/Update Ticket**
   ```markdown
   ### TCK-20260201-XXX :: Complete Parent Dashboard Integration
   
   Type: FEATURE
   Status: OPEN
   
   Background:
   ParentDashboard component exists (200 lines, UI complete) but lacks API integration.
   Created in TCK-20260115-042, blocked on API which is now complete.
   
   Scope:
   - Wire up to child progress API
   - Add loading states
   - Write tests
   - Add navigation link
   
   Acceptance Criteria:
   - [ ] Dashboard displays real child progress
   - [ ] Tests pass
   - [ ] Navigation works from main menu
   ```

2. **Preserve Original Code**
   - Don't rewrite from scratch
   - Build on existing foundation
   - Credit original work in commit messages

3. **Complete Integration**
   - Add missing pieces
   - Write tests
   - Add to navigation/routing
   - Document in user-facing docs

### Step 5: If Deletion is Truly Required

Only delete if:
- Code is confirmed superseded by better implementation
- Code is broken and fixing is more expensive than rewriting
- Code has no clear purpose even after investigation
- User explicitly approves deletion

**Deletion Process:**
1. Move to `archive/<date>/` first
2. Document why in worklog
3. Get explicit approval
4. Delete after 30-day archive period

---

## Examples

### Example 1: Dormant Feature (ACTIVATE)

**Scenario:** `VoiceCommand` hook exists but never used.

**Investigation:**
- Git: Created for "voice-enabled games" feature
- Worklog: TCK-20260110-035, deprioritized due to "accuracy concerns"
- State: Complete, tested, just not wired to games

**Decision:** ACTIVATE
- Accuracy concerns can be addressed with confidence thresholds
- Feature differentiates app in market
- Integration effort: 1 day per game

**Action:** Create ticket to add voice commands to 3 existing games

---

### Example 2: Partial Implementation (COMPLETE)

**Scenario:** `OfflineMode` service has cache logic but no sync.

**Investigation:**
- Git: Created for "offline learning" feature
- State: Caching works, conflict resolution missing
- Blocked on: "Sync strategy decision" (now decided)

**Decision:** COMPLETE
- Core logic is solid
- Sync strategy now documented
- Value: High for Indian market (connectivity issues)

**Action:** Complete sync logic, add tests, enable feature

---

### Example 3: Orphaned Code (INVESTIGATE → ARCHIVE)

**Scenario:** `GestureRecognition` module with complex ML code, no imports.

**Investigation:**
- Git: Created by former team member
- No worklog references
- Code: Complex, no comments, uses deprecated API
- Tests: Fail

**Decision:** ARCHIVE
- Can't determine original intent
- Uses deprecated APIs (would need rewrite)
- No clear product value

**Action:** Move to `archive/2026-02-01/`, document in worklog

---

### Example 4: Redundant Code (MERGE)

**Scenario:** Two date formatting utilities: `formatDate()` and `formatLocalizedDate()`

**Investigation:**
- `formatDate()`: Used in 12 places, simple formatting
- `formatLocalizedDate()`: Used in 3 places, supports i18n

**Decision:** MERGE
- Keep `formatLocalizedDate()` (superset of functionality)
- Migrate `formatDate()` calls to use it
- Delete `formatDate()` after migration

**Action:** Refactoring ticket to consolidate

---

## Risk Mitigation

### When This Approach Can Go Wrong

1. **Completing the Wrong Feature**
   - Mitigation: Validate with product roadmap before investing

2. **Implementing Unmaintainable Code**
   - Mitigation: Code review + quality gates before shipping

3. **Wasting Time on Dead Ends**
   - Mitigation: Set investigation timebox (30 min max)

4. **Feature Bloat**
   - Mitigation: Evaluate against "minimum viable" criteria

### Quality Gates for Reactivation

Before completing dormant code:

- [ ] Does it align with current roadmap?
- [ ] Is the code quality acceptable (or refactorable)?
- [ ] Do we have capacity to maintain it?
- [ ] Has user value been validated?
- [ ] Are dependencies available?

---

## Integration with Existing Guidelines

This guideline **extends** the existing "Preservation First" principle in AGENTS.md:

> "Never discard contributor code unless clearly inferior"

**Addition:** "...and investigate whether seemingly unused code can be completed or activated to add value."

---

## Quick Reference Card

### When You Find Unused Code:

```
1. INVESTIGATE (15-30 min)
   ├── Git history
   ├── Worklog search
   ├── Code review
   └── Product alignment

2. DECIDE
   ├── COMPLETE → If 70%+ done, clear value
   ├── ACTIVATE → If done but unintegrated
   ├── MERGE → If redundant
   ├── ARCHIVE → If unclear/unmaintainable
   └── DELETE → Only if superseded/obvious

3. DOCUMENT
   ├── Worklog ticket
   ├── Investigation findings
   └── Decision rationale

4. EXECUTE
   └── Prefer implementation over deletion
```

---

## Success Metrics

Track these to validate the approach:

| Metric | Target | Why |
|--------|--------|-----|
| Features activated from dormant code | 1+ per month | Value recovery |
| Lines deleted without investigation | 0 | Prevent premature deletion |
| Investigation time per case | < 30 min | Sustainable process |
| User value added from reactivation | Measurable | Justify effort |

---

## Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-02-01 | Initial document | AI Assistant |

---

## Related Documents

- `AGENTS.md` - Core agent principles (Preservation First)
- `docs/process/PROMPT_STYLE_GUIDE.md` - Prompt conventions
- `docs/WORKLOG_TICKETS.md` - Work tracking
