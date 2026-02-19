# PRIVACY REVIEW PROMPT v1.0 (Kids + Camera)

**Goal**: Ensure the planned/implemented behavior matches privacy commitments (local-only, no video storage, parent controls).

---

## INPUTS

- Scope: `<feature/PR>`
- Target surfaces: `<routes/settings/export/delete/camera>`
- Repo access: `<YES/NO>`

---

## REQUIRED DISCOVERY (if repo access)

```bash
sed -n '1,240p' docs/security/SECURITY.md
rg -n "localStorage|IndexedDB|export|delete|camera|getUserMedia" -S src
```

---

## OUTPUT (REQUIRED)

### A) Privacy contract (Observed/Unknown)

- What is stored? where?
- What is not stored? (video/audio)
- What is transmitted over network?

### B) Controls checklist

- Camera indicator + stop control
- Parent gate for settings/export/delete
- Data export format and location
- Delete all data behavior

### C) Gaps (prioritized)

For each gap:

- Severity: HIGH/MED/LOW
- Claim type: Observed/Inferred/Unknown
- Suggested smallest fix
- Verification steps

### D) “No surprises” user messaging

- Recommended UI copy for permissions + data handling (short)

---

## STOP CONDITION

Stop after review + gaps list. Do not implement.
