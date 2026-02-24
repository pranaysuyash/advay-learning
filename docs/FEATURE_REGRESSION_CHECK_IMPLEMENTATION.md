# Feature Regression Check Implementation
## Post-Mortem: Dashboard.tsx "Add Child" Regression

**Date:** 2026-02-23  
**Status:** ✅ New pre-commit check implemented  
**Ticket Reference:** TCK-20260223-REGRESSION-CHECK

---

## The Problem

### What Happened
On **Feb 2, 2026** (commit `29900a6`), a "Comprehensive UI/UX improvements" refactor completely rewrote `Dashboard.tsx`:

- **Before:** 794 lines with full "Add Child" functionality
- **After:** 262 lines, "Add Child" feature **completely removed**
- **Impact:** Users can no longer add multiple children after registration

### The Regression

**Features that were working (Jan 30, 2026):**
- "+" button to add new child profiles from Dashboard
- `AddChildModal` with name, age, language fields
- `handleCreateProfile` function
- `handleOpenEditModal` and `handleUpdateProfile` for editing
- Full state management for modals

**After refactor (Feb 2, 2026):**
- ❌ All Add Child functionality removed
- ❌ Profile editing removed  
- ✅ Components still exist but are orphaned (not used)

### Why It Wasn't Caught

The existing pre-commit hooks checked:
1. ✅ Worklog updates (`agent_gate.sh`)
2. ✅ Secret scanning (`secret_scan.sh`)
3. ✅ Tests passing (`regression_check.sh`)
4. ✅ Export changes (`regression_check.sh`)

**What was missing:**
- ❌ No check for **feature removal** in large refactors
- ❌ No comparison of functionality between old/new versions
- ❌ No warning when >10% LOC changed in existing files

---

## The Solution

### New Script: `scripts/feature_regression_check.sh`

**Triggers when:**
- Any existing file has >10% LOC changed (configurable via `LOC_THRESHOLD`)

**Detects:**
- Removed functions/methods
- Removed exports
- Removed component props (for .tsx files)
- Removed hooks
- Removed state variables

**Behavior:**
- Warns/block commits that remove functionality
- Provides detailed list of what was removed
- Allows bypass with `--no-verify` or `SKIP_FEATURE_CHECK=1`

### How It Would Have Caught This

Running the check on commit `29900a6` would have output:

```
[feature-check] Dashboard.tsx: 67% LOC changed (exceeds 10% threshold)

⚠️  POTENTIAL REGRESSION DETECTED in src/frontend/src/pages/Dashboard.tsx
  Functions removed: 4
    - handleCreateProfile
    - handleOpenEditModal  
    - handleUpdateProfile
    - formatTimeKidFriendly
  State variables removed: 5
    - showAddModal
    - newChildName
    - newChildAge
    - newChildLanguage
    - isCreating
```

**Developer would have seen this and either:**
1. Restored the missing functionality before committing
2. Documented the intentional removal with justification
3. Used `--no-verify` with explicit team approval

---

## Implementation Details

### Files Created/Modified

| File | Action | Description |
|------|--------|-------------|
| `scripts/feature_regression_check.sh` | ✅ Created | New regression detection script |
| `.githooks/pre-commit` | ✅ Modified | Added call to new check |
| `AGENTS.md` | ✅ Modified | Updated documentation |

### Pre-Commit Hook Order

```bash
1. agent_gate.sh          # Worklog enforcement
2. secret_scan.sh         # Credential leak detection
3. feature_regression_check.sh  # ⭐ NEW: Feature removal detection
4. regression_check.sh    # Tests, exports, TypeScript
```

### Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `LOC_THRESHOLD` | 10 | Percentage change to trigger check |
| `SKIP_FEATURE_CHECK` | 0 | Set to 1 to skip this check |
| `SKIP_ALL` | N/A | Use `--no-verify` to skip all hooks |

---

## Usage

### Manual Run

```bash
# Check staged changes
./scripts/feature_regression_check.sh --staged

# Adjust threshold
LOC_THRESHOLD=20 ./scripts/feature_regression_check.sh --staged
```

### Skip (When Intentional)

```bash
# Skip just this check
SKIP_FEATURE_CHECK=1 git commit -m "..."

# Skip all hooks (not recommended)
git commit --no-verify -m "..."
```

---

## Recovery: Restoring Add Child Functionality

### Current State
- `AddChildModal.tsx` ✅ Component exists and works
- `EmptyState.tsx` ✅ Component exists with `onAddChild` callback
- `profileStore.ts` ✅ Has `createProfile` method
- `Dashboard.tsx` ❌ Missing integration (needs ~50 lines restored)

### Fix Required

Reference commit `dca9b38` (Jan 30, 2026) for the working implementation:

1. Add state variables to Dashboard:
   - `showAddModal`
   - `newChildName`, `newChildAge`, `newChildLanguage`
   - `isCreating`

2. Add handler functions:
   - `handleCreateProfile`

3. Add "+" button in profile selector area

4. Wire up `AddChildModal` component

**Estimated effort:** 30-60 minutes

---

## Lessons Learned

### For Developers
1. **Large refactors need extra scrutiny** - When changing >10% of a file, verify all functionality is preserved
2. **Components are not enough** - Having built components doesn't help if they're not integrated
3. **Tests pass ≠ Features work** - Tests may pass even when features are removed

### For Code Review
1. **Look for red flags in large diffs** - High percentage changes in existing files need extra review
2. **Verify feature parity** - Ensure new version has all capabilities of old version
3. **Check for orphaned components** - Unused components after refactor = red flag

### For Automation
1. **Pre-commit hooks save time** - Catching issues before commit is cheaper than after
2. **Pattern matching works** - Simple regex can detect removed functions/state
3. **Configurable thresholds** - 10% may need adjustment based on team feedback

---

## Agent Instructions (REQUIRED)

When you (the AI agent) encounter this check during commit:

### DO NOT
- ❌ Immediately bypass with `--no-verify`
- ❌ Ignore the warning without investigation
- ❌ Assume the automated check is wrong
- ❌ Commit and hope for the best

### DO THIS INSTEAD

1. **STOP and examine the diff:**
   ```bash
   git diff HEAD -- <file>
   ```

2. **Evaluate if the change is IMPROVEMENT:**

   | What You See | Verdict | Action |
   |--------------|---------|--------|
   | **NEW** features/functions added | ✅ **PERFECT** | Commit it - this is additive |
   | **BETTER** code quality, same features | ✅ **GOOD** | Commit it - this is improvement |
   | **SPLIT** into multiple files | ⚠️ **VERIFY ALL** | Check comprehensiveness across all files |
   | **LESS** functionality than before | ❌ **REGRESSION** | Fix it before committing |

3. **For REFACTORS that split files (SPECIAL CASE):**
   
   When a file is refactored into multiple files (e.g., `Dashboard.tsx` → `Dashboard/Header.tsx`, `Dashboard/Content.tsx`, etc.):
   
   - **Check ALL files in the commit together** - don't evaluate in isolation
   - **Verify sum is comprehensive:** Is `Header.tsx + Content.tsx + ...` ≥ original `Dashboard.tsx`?
   - **Track moved functions:** If `handleCreateProfile` moved to `ProfileManager.ts`, is it imported and called?
   - **Check state comprehensiveness:** Is state properly managed across the new file boundary?
   - **Look for orphans:** Functions defined in new files but never called from anywhere?

4. **Manual verification checklist:**
   - "Does this change ADD value or just REMOVE code?"
   - "Can users still do everything they could before?"
   - "Are there orphaned components (built but not used)?"
   - "Were state variables deleted but not migrated?"
   - "Is this purely additive/improvement, or reductive?"

5. **Take action:**
   - **If improvement/additive:** ✅ Proceed with commit
   - **If regression (less functionality):** ❌ Restore the missing functionality
   - **If intentional refactor:** 📝 Document WHY and show functional equivalence
   - **If unsure:** ❓ Ask the user before committing

### Real Example (Dashboard Regression)

**What the check showed:**
```
Functions removed: 4
  - handleCreateProfile
  - handleOpenEditModal
  - handleUpdateProfile
State variables removed: 5
  - showAddModal
  - newChildName
```

**What you should have done:**
1. **Classified the change:** ❌ REGRESSION (removing functionality, not improving)
2. Checked if AddChildModal was still integrated (it wasn't)
3. Realized users couldn't add children after registration
4. **RESTORED** the handleCreateProfile and modal wiring
5. OR asked user: "Dashboard refactor would remove Add Child - should I preserve it or is there a replacement?"

**Key Insight:** The Feb 2 refactor claimed to be "Comprehensive UI/UX improvements" but was actually functionality-reductive. The new Dashboard looked better but did less. **The check correctly identified this as regression, not improvement.**

**Principle:** Additive changes (more features, better code) are encouraged. Reductive changes need explicit justification. When in doubt, verify comprehensiveness or ask.

---

## Next Steps

### Immediate (This Week)
- [ ] Restore Add Child functionality to Dashboard
- [ ] Verify fix with user who reported the issue
- [ ] Test the new pre-commit check on a few commits

### Short Term (This Month)
- [ ] Monitor for false positives from new check
- [ ] Adjust LOC_THRESHOLD if needed (currently 10%)
- [ ] Add similar check for backend Python files
- [ ] Document recovery process for future regressions

### Long Term
- [ ] Consider integration tests that verify critical user flows
- [ ] Add visual regression testing for UI components
- [ ] Implement feature flags for gradual rollouts

---

## References

- **Broken commit:** `29900a6` - "Comprehensive UI/UX improvements" (Feb 2, 2026)
- **Working commit:** `dca9b38` - "Improve 'Add Child' button placement" (Jan 30, 2026)
- **New script:** `scripts/feature_regression_check.sh`
- **Updated docs:** `AGENTS.md` - Local Enforcement section

---

**Prevention is cheaper than recovery.**

This check ensures large refactors don't silently remove functionality, saving hours of debugging and user frustration.
