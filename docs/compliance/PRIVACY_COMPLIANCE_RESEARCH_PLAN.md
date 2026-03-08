# Privacy Compliance Research Plan

**Ticket:** TCK-20260307-CRIT-002  
**Stamp:** STAMP-20260307T160100Z-codex-privacy  
**Phase:** Research (Step 5 of 9)

---

## Research Questions

### DPDPA 2023 (India)

| Section | Question | Why It Matters | Evidence Source |
|---------|----------|----------------|-----------------|
| Section 9 | What constitutes "verifiable parental consent"? | Blocks launch if unclear | DPDPA text + legal interpretation |
| Section 10 | Is local camera processing "collection"? | Determines consent requirement | DPDPA definitions |
| Chapter IV | What data rights must we provide? | Implementation scope | DPDPA text |
| Penalties | What are fines for non-compliance? | Risk assessment | DPDPA penalties section |

### COPPA (US - if we have US users)

| Question | Answer Needed | Source |
|----------|---------------|--------|
| Can email verification = parental consent? | Yes/No + conditions | FTC COPPA FAQ |
| What data can be collected without consent? | Essential only list | COPPA safe harbor |
| Educational institution exception? | School vs. home use | FTC guidance |

### Current Data Flow Audit

**Observed Data Flows:**

```
Camera Stream → MediaPipe (local WASM) → Hand Landmarks (local)
                                    ↓
                              Game Logic (local)
                                    ↓
                              Score/Progress → Backend API

Video frames: NEVER leave device ✓
Landmarks: Processed locally ✓
Progress data: Sent to backend (needs consent)
Parent email: Collected at signup (needs consent)
```

**Research Task:**
- [ ] Document every data field collected
- [ ] Classify each as: Essential | Optional | Derived
- [ ] Map retention periods

---

## Competitor Analysis Checklist

### Khan Academy Kids
- [ ] Parental consent flow (screenshots)
- [ ] Privacy policy structure
- [ ] Camera permissions handling
- [ ] Data rights interface

### ABCmouse
- [ ] Consent mechanism
- [ ] Progress data collection disclosure
- [ ] Parent dashboard privacy controls

### Osmo
- [ ] Camera-based game privacy approach
- [ ] Physical-digital boundary handling

---

## Research Deliverables

### Deliverable 1: DPDPA Compliance Matrix
```markdown
| Requirement | Applies to Us | Implementation | Status |
|-------------|---------------|----------------|--------|
| Parental consent | Yes | [ ] Design [ ] Implement | TODO |
| Data rights | Yes | [ ] Access [ ] Delete | TODO |
| DPO | ? | Research needed | TODO |
```

### Deliverable 2: Consent Flow Design
```markdown
1. Parent signup → Email verification
2. Child profile creation → Consent checkbox
3. First camera use → Permission explainer
4. Dashboard → Privacy settings
5. Data export/deletion request flow
```

### Deliverable 3: Implementation Checklist
- [ ] Research complete
- [ ] Legal review (if possible)
- [ ] Consent UI designed
- [ ] Backend consent tracking
- [ ] Privacy policy updated
- [ ] In-app disclosures added

---

## Evidence Collection

### Document Sources
1. DPDPA 2023 full text
2. FTC COPPA guidance
3. Competitor privacy policies
4. Our current data flow diagrams

### Code Audit
```bash
# Find all data collection points
grep -r "localStorage.setItem\|fetch.*POST\|axios" src/frontend/src --include="*.ts" --include="*.tsx"

# Find all analytics tracking
grep -r "logEvent\|track" src/frontend/src --include="*.ts" --include="*.tsx"

# Find all camera usage
grep -r "getUserMedia\|webcam" src/frontend/src --include="*.ts" --include="*.tsx"
```

---

## Research Timeline

| Day | Task | Output |
|-----|------|--------|
| 1 | DPDPA Sections 9-10 analysis | Notes on children's data requirements |
| 2 | COPPA research | Safe harbor requirements |
| 3 | Competitor analysis | Screenshots + pattern notes |
| 4 | Data flow documentation | Complete data map |
| 5 | Compliance matrix draft | Requirements checklist |

---

## Next Actions

1. Download DPDPA 2023 PDF
2. Review FTC COPPA website
3. Sign up for Khan Academy Kids, document flow
4. Run data collection grep commands
5. Draft compliance matrix

---

**Evidence Label:** Inferred - Research plan based on known requirements
