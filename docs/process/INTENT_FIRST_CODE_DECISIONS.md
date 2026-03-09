# Intent-First Code Decisions: A Playbook

**When you find unused/deprecated/broken code, how do you decide: implement, fix, or delete?**

> *"Don't just delete unused code. Understand why it exists, see if it can make the app better, and implement functionality rather than delete."* — AGENTS.md

---

## The Trap: Evidence-Only Decision Making

### What NOT to Do

```
❌ "No consumers found with grep → Delete"
❌ "Marked @deprecated → Remove"
❌ "Tests failing → Comment out / Skip"
❌ "Out-of-scope per worklog → Delete"
```

**Why this fails:** You miss the original intent. The code was written for a reason. Deleting it loses that investment.

---

## The Framework: Three Layers of Evidence

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: INTENT (Highest Priority)                         │
│  What was this code MEANT to do?                           │
│  • Design docs, architecture decisions                       │
│  • Function/variable names (they reveal intent)              │
│  • Partial implementations (started but not finished)        │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: CONTRACT (Check Before Changing)                  │
│  What dependencies exist?                                    │
│  • Exported from public APIs                                 │
│  • Used by other modules (even if test-only)                 │
│  • Referenced in configs, types, or documentation            │
├─────────────────────────────────────────────────────────────┤
│  LAYER 1: STATE (Lowest Priority - Confirmation Only)       │
│  What's the current observable behavior?                     │
│  • Grep results for consumers                                │
│  • Test coverage status                                      │
│  • Lint/type errors                                          │
└─────────────────────────────────────────────────────────────┘
```

**Rule:** Start from Layer 3 (Intent), validate with Layer 1 (State). Never decide from Layer 1 alone.

---

## Case Study: Voice Selection Feature

### Initial Discovery

```typescript
// useVoicePrompt.ts - What I found
interface UseVoicePromptReturn {
  // ...
  /** @deprecated No longer needed — ttsService manages voice selection */
  availableVoices: never[];
  /** @deprecated No longer needed — ttsService manages voice selection */
  setPreferredVoice: (voice: unknown) => void;
}
```

**Layer 1 (State) Evidence:**
- ✅ No consumers with grep
- ✅ Marked `@deprecated`
- ✅ Worklog says "voice selection UX is out-of-scope"

**Evidence-Only Conclusion:** DELETE

---

### Intent-First Investigation

**Layer 2 (Contract) Evidence:**
```typescript
// TTSService.ts - What I found
interface TTSOptions {
  /** Preferred voice name (browser-specific) */
  voiceName?: string;  // ← Option exists but...
}

getVoices(): TTSVoiceInfo[] {  // ← ...getter exists
  return this.voices.map(v => ({...}));
}

// But in webSpeechSpeak():
const voice = this.findVoiceForLanguage(lang);  // ← voiceName NOT used!
```

**Layer 3 (Intent) Evidence:**
- Function `getVoices()` — meant to expose voice list
- Option `voiceName` — meant to allow selection
- Incomplete wiring — started but not finished
- `@deprecated` comment — rationalization for unfinished work

**Intent-First Conclusion:** IMPLEMENT (wire up the intended feature)

---

## The Decision Matrix

| Evidence Pattern | Likely Intent | Decision | Example |
|-----------------|---------------|----------|---------|
| **Partial wiring** — types/APIs exist, logic missing | Started, interrupted | **Implement** | Voice selection option unused |
| **Stubs with TODOs** — "implement later" comments | Planned, scheduled | **Preserve + Ticket** | Placeholder auth check |
| **@deprecated with no replacement** | Abandoned OR rationalization | **Investigate deeper** | "No longer needed" but no alternative |
| **No consumers + no contract** | Truly dead | **Delete** | Unused internal helper |
| **No consumers + public export** | API for external use | **Preserve** | Library public API |
| **Broken tests + recent commits** | Regression | **Fix** | Type error after refactor |

---

## The Checklist: Before You Delete Anything

```markdown
- [ ] **Check naming** — Does the name describe useful functionality?
- [ ] **Check types** — Are there types/interfaces for this feature?
- [ ] **Check partial wiring** — Are there getters/setters that go unused?
- [ ] **Check documentation** — Are there design docs mentioning this?
- [ ] **Check worklog carefully** — "Out-of-scope" ≠ "Cancelled"
- [ ] **Check git history** — Was this recently worked on?
- [ ] **Check symmetry** — Is there similar code elsewhere that's used?
- [ ] **Check accessibility/edge cases** — Does this help special needs?
```

**If 3+ checks suggest intent → Implement, don't delete.**

---

## Implementation Strategy

When you decide to implement instead of delete:

### Step 1: Minimal Wiring (15 min)
Connect existing pieces without new abstractions.

### Step 2: Add Observability (15 min)
Add error telemetry so you know if it's working.

### Step 3: Document in Code (5 min)
```typescript
// DECISION-2026-03-08: Implemented voice selection
// RATIONALE: Infrastructure existed but was unwired (intent-first decision)
// TESTING: Manual verification + error telemetry
// REVISIT: Add settings UI when voice selection becomes in-scope
```

---

## Anti-Patterns to Avoid

### 1. The "It's Just Cleanup" Trap
```bash
# DON'T: Delete because "it's not used"
rm src/features/voiceSelection.ts

# DO: Verify intent first
git log --oneline src/features/voiceSelection.ts  # Recent work?
grep -r "voiceName" src/  # Partial wiring exists?
```

### 2. The "Test is Failing" Panic
```typescript
// DON'T: Skip or delete the test
describe.skip('voice selection', () => { ... });

// DO: Understand why it's failing
type-check src/services/tts/  # Missing wiring?
grep -r "voiceName" src/services/tts/*.ts  # Incomplete implementation?
```

### 3. The "Worklog Says No" Misread
```markdown
<!-- DON'T: Read "out-of-scope" as "delete" -->
"New settings UX for voice selection" is out-of-scope
→ Delete voice selection capability

<!-- DO: Distinguish capability from UX -->
"New settings UX for voice selection" is out-of-scope
→ Settings UI delayed, but capability can still work
→ Wire up the feature, add UI later
```

---

## Quick Reference: Intent Signals

| Signal | Meaning | Action |
|--------|---------|--------|
| `/** @deprecated */` + no alternative | Rationalization, not deprecation | Investigate |
| `TODO: implement` | Known incomplete | Implement or ticket |
| `FIXME: broken` | Regression | Fix |
| Unused but `export`ed | Public API | Preserve |
| Unused, `private`/`internal` | Maybe dead | Grep deeper |
| Option exists in type, unused in code | Partial implementation | Wire up |
| Getter with no setter (or vice versa) | Incomplete pair | Complete it |

---

## Remember

> **"Every line of code was written by someone who thought it was necessary. Before you delete their work, understand their reasoning."**

When in doubt:
1. Assume positive intent
2. Look for infrastructure that suggests a feature
3. Prefer minimal implementation over deletion
4. Add observability so you know if it works

---

**Version:** 1.0  
**Last Updated:** 2026-03-09  
**Author:** Pranay (learning from voice selection case study)
