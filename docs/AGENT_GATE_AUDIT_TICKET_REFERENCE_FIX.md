# Agent Gate Issue: Audit Document Missing Ticket Reference

**Date**: 2026-01-30  
**Issue Type**: Agent Gate Workflow Failure  
**Severity**: LOW (process documentation issue, not code issue)

---

## Problem

The agent-gate hook rejected commits because:

```
agent-gate: audit artifact docs/audit/ui__camera_game_screen_ux_audit_2026-01-30.md must reference a ticket id (TCK-YYYYMMDD-###).
```

The audit document `ui__camera_game_screen_ux_audit_2026-01-30.md` was created without a ticket ID reference in its header.

---

## Root Cause

### Gap in Audit Workflow

When creating audit documents, the workflow doesn't clearly require adding a ticket ID reference in the audit document header. This causes:

1. **Ambiguity**: Agents don't know if they should add ticket references immediately or wait until findings are ticketed
2. **Inconsistent Practice**: Some audit docs have ticket references, others don't
3. **Gate False Positives**: Agent gate rejects valid audit documents that simply haven't been linked to tickets yet

### Current Audit Workflow (from AGENTS.md)

The AGENTS.md "Audit-to-Ticket Workflow" section says:

1. **Immediate Action**: Check if worklog ticket exists, CREATE IT IF NOT FOUND
2. **Ticket Creation**: Always create tickets FIRST, even if status is OPEN
3. **Audit Discovery**: When reading audit docs and finding actionable issues, IMMEDIATELY create worklog tickets

BUT it doesn't explicitly say "add ticket reference to audit document header".

---

## Audit Documents Without Ticket References

### Current State (Not Exhaustive)

| Audit File | Has Ticket Reference | Status |
|------------|---------------------|--------|
| `docs/audit/ui__camera_game_screen_ux_audit_2026-01-30.md` | ❌ NO | JUST FIXED |
| `docs/audit/text_contrast_audit.md` | ❌ NO | Unknown |
| `docs/audit/child_usability_audit.md` | ❌ NO | Unknown |
| `docs/audit/ui_design_audit.md` | ❌ NO | Unknown |

**Observation**: Many audit documents are created as standalone artifacts without explicit ticket linkage.

---

## Solution Implemented

### 1. Added Ticket Reference to Audit Document

**Fixed**: Added ticket ID to audit header

```markdown
Date: 2026-01-30
Ticket: TCK-20260130-045
```

**File Modified**: `docs/audit/ui__camera_game_screen_ux_audit_2026-01-30.md`

**Result**: Agent gate now passes on this file ✅

### 2. Created Worklog Ticket

**Created**: TCK-20260130-045 :: Simplify Camera Game Screen UX - Make Camera Hero Focus

**Priority**: P1  
**Status**: OPEN  
**Scope**:

- Reduce overlays to single top bar
- Remove technical state messages
- Consolidate action buttons
- Simplify progress/score hierarchy
- Remove status banners
- Replace technical states with user-meaningful indicators

---

## Recommendations for Agent Gate Hook

### Option A: Update AGENTS.md

Add explicit requirement:

```markdown
### Audit-to-Ticket Workflow

When creating audit documents:
- [ ] Add ticket ID reference to document header
- [ ] Link ticket to audit document (bidirectional)
- [ ] Create worklog ticket for audit findings immediately
```

### Option B: Relax Agent Gate Requirement

Modify agent-gate to be more lenient:

```bash
# Only require ticket reference for AUDIT ARTIFACTS that have been COMPLETED
# Don't block on new audit artifacts that haven't been ticketed yet
```

### Option C: Add Audit-to-Ticket Prompt

Create a dedicated prompt for audit review and ticket creation:

```
prompts/audit/audit-ticketing-v1.0.md

## Audit Ticketing Workflow

### When Creating Audit Documents

1. **Header Format**:
   ```markdown
   # [Title]
   
   Date: YYYY-MM-DD
   Ticket: TCK-YYYYMMDD-NNN (CREATE THIS FIRST)
   Scope: [Description]
   Method: [Audit method]
   ```

1. **Ticket Creation**:
   - Create worklog ticket IMMEDIATELY with detailed scope
   - Add ticket ID to audit document header
   - Link audit findings to specific worklog ticket sections

2. **Bidirectional Linking**:
   - Audit document: "See TCK-YYYYMMDD-NNN for implementation"
   - Worklog ticket: "Source: Audit file `docs/audit/[name].md`"

```

### When Processing Audit Findings

1. Check if ticket exists in worklog
2. If not, CREATE IT FIRST (even if OPEN status)
3. Use proper ticket format with priority
```

---

## Agent Gate Hook Behavior Analysis

### Current Behavior

The agent-gate hook enforces ticket references for audit artifacts but:

- ❌ Blocks creation of new audit artifacts without ticket ID
- ❌ Inconsistent with current practice (many audits don't have references)
- ✅ Validates audit artifacts that DO have ticket references

### Expected Behavior

Audit artifacts are typically:

- **Created DURING audit phase** → No ticket exists yet
- **Linked AFTER ticketing phase** → Ticket reference added

### Problem with Current Hook

The hook doesn't account for the temporal nature of audit work:

- Phase 1: Create audit (no ticket yet)
- Phase 2: Create ticket (now audit exists)
- Phase 3: Update audit with ticket reference

**Agent gate blocks at Phase 2**, creating a catch-22.

---

## Decision Matrix

| Aspect | Current | Option A | Option B | Option C |
|---------|-----------|-----------|-----------|-----------|
| Prevents false negatives | ❌ Blocks at wrong time | ✅ More lenient | ✅ Better guidance |
| Clear workflow | ⚠️ Ambiguous | ⚠️ Ambiguous | ✅ Explicit prompt |
| Follows existing practice | ❌ Changes rules | ✅ Keeps rules | ✅ Adds new prompt |

---

## Recommended Action

**IMMEDIATE**: Implement Option C (Add Audit Ticketing Prompt)

This provides:

1. Clear workflow for audit artifact creation and ticketing
2. Doesn't break existing workflow
3. Can be adopted incrementally
4. Reduces future agent gate failures

---

## Lessons Learned

### 1. Audit Documents Are First-Class Artifacts

Audit documents are important independent artifacts that shouldn't be blocked by ticketing process. The workflow should be:

```
Phase 1: Create audit document (optional: no ticket needed)
Phase 2: Create worklog ticket (MANDATORY)
Phase 3: Link audit to ticket (optional, for traceability)
```

### 2. Agent Gate Should Validate, Not Block

The gate should:

1. **Warn**: "Audit artifact lacks ticket reference - proceed anyway or create one?"
2. **Offer options**: "Create ticket now", "Skip ticketing", "Mark as technical doc"
3. **Non-blocking**: Only block for ACTUAL violations (secrets, destructive code, etc.)

### 3. Documentation Beats Enforcement

Instead of strict gate rules, create:

- Clear prompts with examples
- Workflow documentation
- Automated tooling support

---

## Status

**Issue**: ✅ FIXED  
**Fixes Applied**:

1. Added ticket ID to audit document header: `TCK-20260130-045`
2. Created worklog ticket for camera UX issues
3. Created this analysis document

**Next Steps**:

1. Implement Option C (Create Audit Ticketing Prompt)
2. Document the fix in AGENTS.md if needed
3. Test agent gate with updated workflow

---

**Evidence**:

- **Commit**: Shows fix was applied to audit document
- **Worklog**: Shows ticket TCK-20260130-045 was created
- **Gate**: No more agent-gate errors after fix
