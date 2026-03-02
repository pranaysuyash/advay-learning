# Settings & Parental Controls Audit Report

**Date**: 2026-03-02  
**Auditor**: AI Agent (Audit-Doc Work Planner)  
**Scope**: Settings page, Parent Gate, Data Privacy, COPPA Compliance  
**Workflow**: analysis → document → plan → research → document → implement → test → document  
**Ticket**: TCK-20260302-004

---

## 1) Architecture Snapshot

### Component Hierarchy

```
Settings Page (src/frontend/src/pages/Settings.tsx)
    │
    ├── Learning Preferences
    │   ├── Language selection
    │   ├── Difficulty levels
    │   └── Calm mode toggle
    │
    ├── Device & Camera
    │   ├── Camera permission toggle
    │   ├── Privacy indicator
    │   └── AI Processing Mode (GPU/CPU)
    │
    ├── Parent Controls
    │   ├── Daily time limit
    │   ├── Tracing hints toggle
    │   ├── Collectibles reward controls
    │   └── Progress reset actions
    │
    └── Account & Data
        ├── Authentication status
        ├── Export data (placeholder)
        └── Restore defaults

ParentGate Component (src/frontend/src/components/ui/ParentGate.tsx)
    └── Hold-to-unlock (3 seconds)
        └── Visual progress feedback
```

### Evidence Anchors

| Component | File Path | Key Functions | Purpose |
|-----------|-----------|---------------|---------|
| **Settings Page** | `src/frontend/src/pages/Settings.tsx` | Settings component | Main settings UI |
| **ParentGate** | `src/frontend/src/components/ui/ParentGate.tsx` | Hold-to-unlock | Parent verification |
| **Settings Store** | `src/frontend/src/store/settingsStore.ts` | useSettingsStore | State management |
| **Confirm Hook** | `src/frontend/src/components/ui/useConfirm.tsx` | confirm dialog | Destructive action confirmation |

---

## 2) Current Behavior (Observable)

### Parent Gate Mechanism
- **Trigger**: Settings page entry
- **Mechanism**: Hold button for 3 seconds
- **Feedback**: Visual progress bar, mascot state changes
- **Bypass**: None (no alternative unlock method)
- **State**: `parentGatePassed` local to Settings component only

### Privacy Controls
- **Camera toggle**: On/off with permission request
- **Privacy indicator**: Shows green dot when camera active
- **Data export**: Placeholder (shows toast "coming soon")
- **Reset options**: Confirm dialog for destructive actions

### COPPA-Related Features
- **Calm mode**: Softer colors, slower animations (accessibility)
- **Time limits**: 15/30/60 min or unlimited
- **Collectibles controls**: Mystery rewards opt-in (6-9 age)
- **Progress tracking**: Mastery display per language

---

## 3) Key Claims

### Observed Claims

| # | Claim | Evidence | Location |
|---|-------|----------|----------|
| 1 | Data export is placeholder | `showToast('Data export will be available in the next update.')` | Settings.tsx:491 |
| 2 | Parent gate uses only hold mechanic | No math challenge, no PIN, no biometric | ParentGate.tsx:15-22 |
| 3 | Camera permission uses browser alert | `alert('Camera permission denied...')` | Settings.tsx:66 |
| 4 | Time limit exists but not enforced | Setting stored, no visible timer/check | Settings.tsx:304-313 |
| 5 | Settings auto-save without confirmation | `onChange={(e) => settings.updateSettings(...)}` | Settings.tsx:129 |

### Inferred Claims

| # | Claim | Reasoning | Confidence |
|---|-------|-----------|------------|
| 1 | Parent gate state not shared across pages | `parentGatePassed` is local state | High |
| 2 | No COPPA compliance documentation | No privacy policy reference in code | Medium |
| 3 | Time limit requires WellnessTimer integration | Separate component, not wired to setting | Medium |
| 4 | Settings lack audit trail | No logging of changes | Medium |

---

## 4) Gap Analysis

### Critical Gaps (P0)

| Gap | Risk | Evidence |
|-----|------|----------|
| **Data export not implemented** | GDPR/COPPA violation risk | Placeholder toast only |
| **Parent gate single-factor** | Children may accidentally hold for 3s | Only time-based, no cognitive challenge |
| **No privacy policy link** | COPPA compliance gap | No reference in Settings |
| **Time limit not enforced** | Setting is UI-only | No integration with gameplay timer |

### Medium Gaps (P1)

| Gap | Risk | Evidence |
|-----|------|----------|
| Settings changes not logged | No audit trail | Direct store updates |
| Browser alerts for errors | Poor UX | `alert()` calls in Settings.tsx |
| Parent gate state not persistent | Must re-auth on refresh | Local state only |
| No backup/restore for progress | Data loss risk | Only reset option available |

### Low Gaps (P2)

| Gap | Risk | Evidence |
|-----|------|----------|
| No keyboard shortcuts | Accessibility | Mouse/touch only |
| Settings not searchable | UX friction | Static layout |
| No settings presets | Repetitive configuration | Manual toggles only |

---

## 5) Audit Cards

### Settings Page (src/frontend/src/pages/Settings.tsx)

1. **Summary**: 527 lines, main settings interface with 4 sections
2. **Controls Spec**: Touch/mouse only, no keyboard navigation
3. **Age-Fit**: Parent controls section for adult use only
4. **UX Clarity**: Clear section headers, toggle states visible
5. **Issues**:
   - Data export placeholder (UIF-040)
   - Browser alert for camera permission (UIF-039)
   - No loading states for async ops (UIF-041)
6. **Failure Mode**: Destructive actions have confirmation dialogs

### ParentGate Component (src/frontend/src/components/ui/ParentGate.tsx)

1. **Summary**: 203 lines, hold-to-unlock mechanism
2. **Controls Spec**: Touch/mouse hold for 3 seconds
3. **Age-Fit**: Designed to prevent child access (time > cognition)
4. **UX Clarity**: Visual progress, mascot feedback
5. **Issues**:
   - Single unlock mechanism
   - No alternative for accessibility
   - Console.log statements in production
6. **Security**: Hold duration configurable (default 3000ms)

---

## 6) Prioritized Backlog

| ID | Title | Category | Severity | Effort | Priority | Acceptance Criteria |
|----|-------|----------|----------|--------|----------|---------------------|
| **SET-001** | Implement data export feature | Compliance | Critical | M | **P0** | User can download all personal data as JSON/PDF |
| **SET-002** | Add COPPA privacy policy link | Compliance | Critical | S | **P0** | Privacy policy link visible in Data section |
| **SET-003** | Enforce time limits with WellnessTimer | Functionality | High | M | **P1** | Timer setting actually limits gameplay |
| **SET-004** | Replace browser alerts with UI | UX | Medium | S | **P1** | All alerts use custom dialogs |
| **SET-005** | Add cognitive parent gate option | Security | Medium | M | **P2** | Math challenge as alternative to hold |
| **SET-006** | Settings change audit log | Governance | Low | M | **P2** | Log all setting changes with timestamp |
| **SET-007** | Persist parent gate session | UX | Low | S | **P2** | Gate state survives page refresh (time-limited) |

---

## 7) Implementation-Unit Plan

### Unit-1 (Compliance Baseline): SET-001 + SET-002
- Implement data export API + UI
- Add privacy policy link
- **Risk**: Legal compliance

### Unit-2 (Time Limit Enforcement): SET-003
- Integrate time limit setting with WellnessTimer
- Add session tracking
- **Dependency**: WellnessTimer component

### Unit-3 (UX Polish): SET-004 + SET-007
- Replace browser alerts
- Add session persistence for parent gate
- **Risk**: Low

### Unit-4 (Security Enhancement): SET-005 + SET-006
- Add cognitive challenge option
- Implement audit logging
- **Risk**: Medium

---

## 8) "Close the Loop" Mentions Update

| Location | Current State | Update Action |
|----------|---------------|---------------|
| `src/frontend/src/pages/Settings.tsx` | Data export placeholder | Add TODO comment linking to SET-001 |
| `src/frontend/src/components/ui/ParentGate.tsx` | Console.log present | Remove or guard with IS_DEV |
| `docs/COPPA_COMPLIANCE.md` | Does not exist | Create compliance documentation |
| `docs/PRIVACY_POLICY.md` | Does not exist | Create or link to external policy |

---

## 9) Quick Wins

1. **SET-002**: Add privacy policy link (5 min)
2. **SET-004**: Replace camera alert with toast (15 min)
3. **Remove console.log** from ParentGate (5 min)

## Risky Changes

1. **SET-001**: Data export requires backend API
2. **SET-003**: Time limit enforcement affects all games

---

## Appendix: Evidence Commands

```bash
# Verify findings
grep -n "alert\|console.log" src/frontend/src/pages/Settings.tsx
grep -n "Data export" src/frontend/src/pages/Settings.tsx
grep -n "privacy\|coppa\|gdpr" src/frontend/src/pages/Settings.tsx -i
```

---

**Status**: Audit Complete  
**Next Action**: Create tickets SET-001 through SET-007, prioritize P0 items
