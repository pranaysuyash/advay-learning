# 🔍 Alphabet Game — UX Audit Report

**Ticket:** TCK-20260223-001  
**Persona:** [Advay](file:///Users/pranay/Projects/learning_for_kids/docs/personas/ADVAY.md) (2yr 9mo) — reads alphabets, spells words, counts 150+, trilingual (Hindi ✅ Kannada 🔄 English basic)
**Game:** `AlphabetGame.tsx` (1,736 lines)
**Date:** 2026-02-23
**Auditor:** Antigravity Agent

---

## One-Paragraph Summary

The Alphabet Game has excellent *conceptual* foundations — multilingual letter tracing with hand tracking, 5 Indian languages, phonetic guides, and accuracy scoring. However, **the execution falls critically short of the project's own design standards.** The UI uses generic Tailwind styling instead of the Brand Kit's "toy-like" aesthetic (4px chunky borders, offset shadows, Discovery Cream). A full-screen webcam feed bleeds through the tracing canvas while a redundant CameraThumbnail sits atop it. Hindi mode renders raw SVG file paths as visible text. The phonetic guide ("a as in about") stays English-only regardless of selected language. From Advay's perspective: he can recognize "अ" and "ಅ" and would be excited to trace them, but the broken Hindi assets, developer-facing camera feed, and lack of voice-over narration would confuse him within 15 seconds.

---

## Screenshots

````carousel
![Setup Screen (English) — clean layout, language picker, Pip mascot present](/Users/pranay/.gemini/antigravity/brain/033b2424-14e6-48fa-9875-169ea99e3913/alphabet_game_setup_english_1771833748853.png)
<!-- slide -->
![Setup Screen (Hindi) — same layout with अ and अनार](/Users/pranay/.gemini/antigravity/brain/033b2424-14e6-48fa-9875-169ea99e3913/alphabet_game_setup_hindi_1771833765795.png)
<!-- slide -->
![Active Tracing (Hindi) — CRITICAL: Full-screen webcam + raw SVG paths + thumbnail](/Users/pranay/.gemini/antigravity/brain/033b2424-14e6-48fa-9875-169ea99e3913/alphabet_game_hindi_tracing_active_1771833813655.png)
````

---

## Issues Backlog (Prioritized)

### S1 — BLOCKERS

| ID | Category | Issue | Evidence | Advay Impact |
|:---|:---------|:------|:---------|:-------------|
| **AG-001** | Camera | **Double camera**: Full-screen webcam visible behind tracing canvas + CameraThumbnail overlay | Active tracing screenshot | Distracting — Advay sees his face covering the letter he needs to trace |
| **AG-002** | Assets | **Raw file paths rendered as text** in Hindi mode | `/assets/icons/muskmelon.svg/assets/icons/anjir.svg` visible in UI | Confusion — text content meaningless to child or parent |
| **AG-003** | i18n | **English-only phonetic guides** — "a as in about" shown for Hindi अ | Setup Hindi screenshot | Wrong language context — "a as in about" is irrelevant for अनार |
| **AG-004** | Voice | **No voice-over** for letter name, phonetics, or instructions | Tested in browser | Violates GAME_DESIGN_PRINCIPLES §3: "Zero text dependency for core gameplay" |
| **AG-005** | Stability | **Browser connection reset** when switching languages or exiting mid-game | Browser subagent crashed attempting exit + Kannada switch | Game becomes unresponsive — parent must force-reload |

### S2 — MAJOR

| ID | Category | Issue | Evidence | Advay Impact |
|:---|:---------|:------|:---------|:-------------|
| **AG-005** | Design | **Not following Brand Kit** — missing chunky 4px borders, offset shadows, Discovery Cream tokens | All screenshots | Looks like a dev prototype, not the "toy-like" feel specified in UI_DESIGN_SPECS_V1 |
| **AG-006** | Design | **Header inconsistencies** — pre-game shows "Learning Game / Score: 0 / STREAK 0 / BATCH 1/1", in-game shows "Hindi Alphabet / LEVEL 1 / ☆ 0" | Compare setup vs active screenshots | Two completely different headers for the same game |
| **AG-007** | i18n | **Instructions stay in English** — "Ready to Learn?", "Use your hand to trace letters!", "Trace the letter!" | All screenshots | Advay speaks Hindi conversationally — Hindi instructions would help him |
| **AG-008** | UX | **"TRACING ACCURACY 0%"** shown before tracing starts | Setup screenshot | Discouraging metric shown prematurely — means nothing to a child |
| **AG-009** | Code | **File is 1,736 lines** — single component with 105 code items | Code analysis | Unmaintainable; needs decomposition into ≤500-line sub-components |

### S3 — GAPS (Tech & Assets)

| ID | Category | Issue | Advay Impact |
|:---|:---------|:------|:-------------|
| **AG-010** | Assets | Icon images are tiny (≈40px) and generic emoji-style | Letter-word association needs child-friendly illustrated assets, not 🍎 emoji |
| **AG-011** | Tech | No Three.js/WebGL for letter rendering | Letters are flat CSS text — could be 3D extruded, animated, particle-based |
| **AG-012** | Tech | No WASM acceleration for hand tracking pipeline | MediaPipe runs in JS; WASM backend would reduce tracking latency |
| **AG-013** | Tech | Canvas tracing uses basic 2D context | Could use GPU-accelerated rendering for smoother brush strokes |
| **AG-014** | UX | No animated letter-writing tutorial | Advay needs to see HOW to trace अ stroke-by-stroke, not just a template |
| **AG-015** | Audio | No letter pronunciation audio | Advay would benefit from hearing "अ" spoken in Hindi when selecting Hindi |

---

## Design System Compliance Check

| UI_DESIGN_SPECS_V1 Requirement | Current State | Verdict |
|:-------------------------------|:-------------|:--------|
| Background: Discovery Cream `#FFF8F0` | Uses `bg-gradient-to-br from-blue-50 to-blue-100` (blue, not cream) | ❌ FAIL |
| Borders: 3-4px solid with offset shadows | Uses standard `border-4 border-slate-200` (no offset shadow) | ❌ FAIL |
| Interactivity: `framer-motion` hover `scale: 1.02, y: -2` | Some motion present, inconsistent | ⚠️ PARTIAL |
| Mascot: Pip on every page, contextual | Pip visible in bottom-left during play | ✅ PASS |
| Post-game: No "Game Over", use Pip encouragement | Not tested (didn't complete a full game cycle) | ❓ UNTESTED |

| GAME_DESIGN_PRINCIPLES Requirement | Current State | Verdict |
|:-----------------------------------|:-------------|:--------|
| Cursor 60-80px, bright, high contrast | Uses hand tracking cursor (CursorEmbodiment) | ⚠️ NEEDS VERIFY |
| Targets ≥15% screen width, 2x hitbox | Letter template is large; touch targets TBD | ⚠️ NEEDS VERIFY |
| Voice-over for ALL instructions | No voice-over implemented | ❌ FAIL |
| Success feedback < 100ms, 2-3s persist | Accuracy bar updates; success animation present | ⚠️ PARTIAL |
| No timers for ages 2-4 | No timer visible — good | ✅ PASS |
| Animated tutorial for gestures | HandTutorialOverlay exists but unclear if effective | ⚠️ NEEDS VERIFY |

---

## Advay-Specific Observations

### What Works FOR Advay ✅
- **Language picker** with 🇮🇳 Hindi and 🇮🇳 Kannada — perfect for his trilingual learning
- **Large letter display** — "अ" is rendered big and clear, he can recognize it
- **Pip mascot** — present and engaging with "Pip can see you! 📷"
- **No timer** — no pressure, lets him trace at his own pace
- **Mouse fallback** — if camera fails, touch/mouse mode available

### What BREAKS for Advay ❌
- **Full-screen camera behind the letter** — his own face covers the tracing template
- **Raw SVG paths** — gibberish text that looks broken to a parent
- **"a as in about"** — English phonetics useless when he's learning Hindi
- **No spoken "अ"** — he needs to HEAR the letter, not just see it
- **No stroke-order animation** — he doesn't know WHERE to start tracing अ
- **"TRACING ACCURACY 0%"** — meaningless anxiety-inducing metric for a toddler
- **All instructions in English** — he'd understand Hindi instructions much better

---

## Recommended Fix Priority

### Quick Wins (< 2hrs each)
1. **Hide full-screen webcam** — set `display: none` on the Webcam in GameLayout during tracing (CameraThumbnail handles visual feedback now)
2. **Fix Hindi asset rendering** — debug the raw path concatenation bug in letter data
3. **Remove accuracy bar pre-game** — only show after first tracing attempt
4. **Apply Discovery Cream background** — replace `from-blue-50 to-blue-100` with `bg-[#FFF8F0]`

### Medium Effort (2-8hrs each)
5. **Localize game instructions** — translate "Ready to Learn?", "Trace the letter!", etc. into Hindi/Kannada
6. **Add letter pronunciation TTS** — use `ttsService.speak(currentLetter.word, {lang: selectedLanguage})` on letter load
7. **Add stroke-order animation** — animate a finger tracing the letter path before the child starts
8. **Refactor to <500 lines** — split into AlphabetSetup, AlphabetTracing, AlphabetFeedback components

### Deep Work (multi-day)
9. **Apply full Brand Kit** — chunky borders, offset shadows, Discovery Cream throughout
10. **Three.js letter rendering** — 3D extruded letters with particle effects on successful trace
11. **WASM hand tracking** — switch MediaPipe to WASM backend for lower latency
12. **Illustrated word assets** — replace emoji/SVG icons with child-friendly illustrations per language
