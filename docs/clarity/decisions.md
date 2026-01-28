# Architecture & Design Decisions

**Purpose**: Log of significant technical and UX decisions with rationale.

Format based on [Architecture Decision Records (ADRs)](https://adr.github.io/).

---

## ADR-001: Drawing Control Modes Architecture
**Status**: Accepted  
**Date**: 2026-01-28  
**Deciders**: Development team

### Context
Need multiple ways for kids to control drawing (button, pinch, dwell, etc.)

### Decision
Implement all modes in Game.tsx with unified state management. Use `isDrawing` state that can be controlled by any input method.

### Consequences
- **Positive**: Easy to add new control modes
- **Positive**: Modes can work simultaneously (button + pinch)
- **Negative**: Game.tsx grows larger
- **Mitigation**: May extract to custom hook later

### Related
- TCK-20260128-009 through TCK-20260128-015

---

## ADR-002: Letter Smoothing Algorithm
**Status**: Accepted  
**Date**: 2026-01-28  
**Deciders**: Development team

### Context
Shaky hand tracking creates jagged lines that don't look good.

### Decision
Use 3-point moving average smoothing applied at render time. Original points stored, smoothed for display only.

### Consequences
- **Positive**: Visual quality improved
- **Positive**: Original data preserved for accuracy calculation
- **Negative**: Slight computational overhead
- **Mitigation**: Negligible with frame skipping

### Related
- Batch update 2026-01-28

---

## ADR-003: Frame Skipping for Performance
**Status**: Accepted  
**Date**: 2026-01-28  
**Deciders**: Development team

### Context
60fps hand tracking causes lag on some devices.

### Decision
Process every 2nd frame (30fps effective) using frame counter modulo.

### Consequences
- **Positive**: Reduced CPU/GPU load
- **Positive**: Smoother overall experience
- **Negative**: Slightly less responsive tracking
- **Mitigation**: 30fps still very responsive for drawing

### Related
- Batch update 2026-01-28

---

## Template

```markdown
## ADR-###: [Title]
**Status**: Proposed | Accepted | Deprecated | Superseded by ADR-###  
**Date**: YYYY-MM-DD  
**Deciders**: [Names]

### Context
[What is the issue that we're seeing that is motivating this decision or change.]

### Decision
[What is the change that we're proposing or have agreed to implement.]

### Consequences
[What becomes easier or more difficult to do and any risks introduced by the change that will need to be mitigated.]

### Related
[Links to tickets, questions, etc.]
```

---

**Last Updated**: 2026-01-28

