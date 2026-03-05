# ADR-007: Feature Flag System

**Status**: Implemented  
**Date**: 2026-03-02  
**Author**: Execution Planner Agent  
**Ticket**: ISSUE-006  

## Context

The GAME_INPUT_AGE_AUDIT_2026-02-28 identified multiple high-risk changes (fallback controls, tracking-loss recovery, deterministic rewards) that need safe rollout. The codebase lacked a feature flag system, forcing all-or-nothing deployments.

## Decision

Implement a hierarchical, type-safe feature flag system with three levels:

1. **Environment variables** (highest priority): `VITE_FEATURE_CONTROLS_FALLBACKV1=true`
2. **User overrides** (middle): Stored in settingsStore, editable via UI for some flags
3. **Default values** (lowest): Hardcoded safe defaults

## Structure

```
src/frontend/src/config/features.ts    # Flag definitions + evaluation
src/frontend/src/hooks/useFeatureFlag.ts  # React hook re-export
```

## Flags Defined

| Flag | Default | Editable | Purpose |
|------|---------|----------|---------|
| `controls.fallbackV1` | `false` | Yes | Tap/dwell/snap fallback controls |
| `safety.pauseOnTrackingLoss` | `true` | Yes | Tracking-loss pause/recovery |
| `rewards.deterministicV1` | `false` | No | Deterministic reward policy |
| `controls.voiceFallbackV1` | `false` | Yes | Voice game tap fallbacks |

## Consequences

**Positive**:
- Safe rollout of risky changes
- Instant rollback capability
- A/B testing foundation
- User-controlled accessibility features

**Negative**:
- Additional complexity in conditional rendering
- Test matrix expansion (flag on/off states)
- Potential for "flag debt" if not cleaned up

## Migration Plan

1. **Phase 1** (PR-1): Foundation + `safety.pauseOnTrackingLoss` (default on)
2. **Phase 2** (PR-3): `controls.fallbackV1` for pilot games (default off)
   - pilot integration added to LetterHunt page (AlphabetGame already has manual mouse mode)
   - UI toggles added under Settings for editable flags
   - additional fallback support added to BeginningSounds for voice flag
3. **Phase 3** (PR-5): `rewards.deterministicV1` (policy-driven, no UI)
   - gating wired into inventory reward pipeline
4. **Phase 4** (PR-6): `controls.voiceFallbackV1`
   - flag exposed in Settings; voice-fallback implementation used for BeginningSounds tap fallback pilot

## Cleanup Criteria

Flags should be removed when:
- Feature is 100% rolled out for 30+ days
- No rollback scenarios identified
- All users benefit from feature (no negative cases)
