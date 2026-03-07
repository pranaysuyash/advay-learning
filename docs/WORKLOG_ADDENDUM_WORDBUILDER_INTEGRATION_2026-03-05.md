## TCK-20260305-001 :: WordBuilder Unified Analytics Integration
Ticket Stamp: STAMP-20260305T234500Z-codex-wb-int

Type: FEATURE
Owner: Pranay  
Created: 2026-03-05 23:45 IST  
Status: **IN_PROGRESS**

Scope contract:

- In-scope:
  - Migrate WordBuilder.tsx from old analyticsStore.ts to unified analytics SDK
  - Import from '@/analytics' instead of '@/games/wordBuilderLogic' for analytics
  - Initialize session with unified SDK + WordBuilder extension
  - Record touches and word completions via unified extension
  - Populate universal metrics before ending session
  - Update insights panel to use unified data (backward compatible)
  - Preserve all existing functionality
  
- Out-of-scope:
  - Modifying game logic or UI
  - Backend sync (just local storage for now)
  - Parent dashboard (next step after this)
  - Removing old analyticsStore.ts (keep for compatibility)
  
- Behavior change allowed: NO (must preserve existing UX exactly)

Targets:

- Repo: learning_for_kids
- File: src/frontend/src/pages/WordBuilder.tsx
- Branch/PR: `codex/wip-wordbuilder-unified` → `main`

Acceptance criteria:

- [ ] WordBuilder uses unified analytics SDK
- [ ] Sessions include universal metrics (itemsCompleted, accuracyPct, difficultyTag, struggleSignals)
- [ ] Extension data preserved (wordsCompleted, confusionPairs, etc.)
- [ ] Insights panel displays unified data correctly
- [ ] Export/reset functionality works with unified store
- [ ] All WordBuilder tests pass
- [ ] No regression in gameplay

Execution log:

- [23:45] Created worklog ticket | Evidence: docs/WORKLOG_ADDENDUM_WORDBUILDER_INTEGRATION_2026-03-05.md
- [23:46] Analyzed current WordBuilder analytics usage | Evidence: 5 API calls identified

Next actions:

1. Update imports to use unified analytics SDK
2. Replace analytics API calls with unified equivalents
3. Add universal metrics population
4. Test and verify

Risks/notes:

- Risk: Must preserve exact same analytics display in insights panel
- Mitigation: Keep data transformation layer if needed
