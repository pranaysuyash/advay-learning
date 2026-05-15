# Game Audit Phase 2 Plan

**Date:** 2026-04-01  
**Scope:** 33 games (Word Workshop: 22 + 3D World: 11)  
**Target:** Complete 23-section specs for all 33 games  
**Strategy:** Parallel sub-agent execution

---

## Phase 2 Scope

### Word Workshop (22 games)
Priority games for language learning foundation:
1. Word Search Adventure
2. Alphabet Tracing (✅ done)
3. Story Builder
4. Reading Along
5. Syllable Clap
6. Letter Match
7. Word Scramble
8. Sight Word Safari
9. Vowel Voyager
10. Consonant Quest
11. Spelling Bee
12. Word Ladder
13. Sentence Builder
14. Picture Word Match
15. Phonics Fun
16. Compound Words
17. Opposites Attract
18. Synonym Match
19. Antonym Hunt
20. Rhyme Time
21. Word Families
22. Magic E

### 3D World (11 games)
Technical priority for physics patterns:
1. Digital Jenga (✅ done)
2. Obstacle Course 3D
3. Feed the Monster 3D
4. Shape Safari 3D
5. Dress Up 3D
6. Virtual Bubbles
7. Build a Snowman 3D
8. Circuit Builder 3D
9. Marble Run 3D
10. Balance Scale 3D
11. Color Sort 3D

---

## Execution Strategy

### Wave 1: Word Workshop Core (8 games)
Launch 4 sub-agents × 2 games each:
- Agent A: Word Search + Story Builder
- Agent B: Reading Along + Syllable Clap
- Agent C: Letter Match + Word Scramble
- Agent D: Sight Word Safari + Vowel Voyager

### Wave 2: Word Workshop Extended (8 games)
- Agent E: Consonant Quest + Spelling Bee
- Agent F: Word Ladder + Sentence Builder
- Agent G: Picture Word Match + Phonics Fun
- Agent H: Compound Words + Opposites Attract

### Wave 3: Word Workshop Final (6 games)
- Agent I: Synonym Match + Antonym Hunt
- Agent J: Rhyme Time + Word Families
- Agent K: Magic E + [review/completion]

### Wave 4: 3D World (11 games)
- Agent L: Obstacle Course + Feed Monster
- Agent M: Shape Safari + Dress Up
- Agent N: Virtual Bubbles + Build Snowman
- Agent O: Circuit Builder + Marble Run
- Agent P: Balance Scale + Color Sort + [review]

---

## Parallel Agent Configuration

### Per-Agent Task Template
```
Create 23-section game specifications for:
1. [GAME_1_NAME] - [slug]
2. [GAME_2_NAME] - [slug]

For each game:
1. Read source from src/frontend/src/pages/[GameName].tsx
2. Read logic from src/frontend/src/games/[gameSlug]Logic.ts
3. Reference gameRegistry.ts for metadata
4. Reference SPEC_TEMPLATE.md for 23-section structure
5. Create docs/games/specs/[game-slug].md

Include:
- Current Implementation analysis
- Intended Experience description  
- Drift Analysis (alignment %)
- Recommendations
- Parallel Modes table
```

---

## Quality Gates

### Per-Spec Validation
- [ ] All 23 sections present
- [ ] Drift percentage calculated
- [ ] Code references (line numbers not required)
- [ ] Alignment with template standards

### Cross-Spec Validation
- [ ] Consistent terminology
- [ ] Shared patterns identified
- [ ] No duplicate content

---

## Timeline Estimate

| Wave | Games | Agents | Est. Time |
|------|-------|--------|-----------|
| Wave 1 | 8 | 4 | 45 min |
| Wave 2 | 8 | 4 | 45 min |
| Wave 3 | 6 | 3 | 35 min |
| Wave 4 | 11 | 5 | 60 min |
| **Total** | **33** | **16** | **~3 hrs** |

---

## Success Metrics

- [ ] 33 new spec files created
- [ ] All specs follow 23-section template
- [ ] Average alignment score documented
- [ ] Drift issues flagged
- [ ] 3D World patterns validated/extended

---

## Files to Reference

- `docs/games/SPEC_TEMPLATE.md` - 23-section template
- `docs/games/GAME_INDEX.md` - Game inventory with slugs
- `docs/games/SHARED_PATTERNS.md` - Pattern standards
- `docs/games/3D_WORLD_PATTERNS.md` - 3D technical guide
- `src/frontend/src/data/gameRegistry.ts` - Metadata source
- `src/frontend/src/pages/*.tsx` - Game implementations

---

**Ready to execute Wave 1.**
