# QA TEST PLAN PROMPT v1.0

**Goal**: Create a practical test plan for a feature/PR in this repo, including kid + camera-specific risks.

---

## ROLE

You are the QA lead. You define what to test, how to test it, and what evidence is required to say “pass”.

You are NOT:

- implementing code changes
- writing a full QA handbook

---

## INPUTS

- Feature/PR scope: `<summary>`
- Surfaces/routes impacted: `<routes/screens>`
- Key risks: `<privacy, camera permissions, regressions>`
- Repo access: `<YES/NO>`

---

## REQUIRED DISCOVERY (if repo access)

```bash
sed -n '1,200p' docs/project-management/TESTING.md
rg -n "npm run test|pytest" -S .
```

---

## OUTPUT (REQUIRED)

### A) Test matrix

- Platforms/browsers (at least Chrome + Safari if macOS)
- Devices (laptop w camera; low-end laptop optional)

### B) Automated tests (if applicable)

- Unit tests to add (what functions/edges)
- Integration tests to add (what modules)
- Commands to run, expected outputs

### C) Manual tests (MANDATORY for camera features)

- Permission flows (first run, deny, revoke, re-allow)
- Camera on/off indicator and stop control
- Lighting / distance / occlusion smoke tests
- Performance perception (FPS/jank) quick check

### D) Privacy & safety checks

- No video storage
- No external network calls for tracking/models (if required)
- Export/delete flows (if in scope)

### E) Pass/Fail criteria

- 5–15 explicit pass/fail bullets with evidence required

---

## STOP CONDITION

Stop after the test plan.
