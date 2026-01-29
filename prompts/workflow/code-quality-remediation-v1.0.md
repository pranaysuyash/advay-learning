# Code Quality Remediation Prompt v1.0

**Purpose**: Systematically fix code quality, linting, and accessibility issues identified by static analysis tools (ESLint, markdownlint, etc.) while maintaining functionality and following AGENTS.md evidence-first principles.

**Use When**:

- VS Code problems tab shows linting errors
- Static analysis tools report issues
- Code quality needs improvement before commits
- Accessibility or UX issues are flagged

---

## Non-Negotiable Rules

1. **Evidence-first**: Every fix must be based on Observed evidence from linting tools
2. **Preservation-first**: Don't break existing functionality - verify fixes don't change behavior
3. **Scope discipline**: Fix issues within clear scope boundaries
4. **Test verification**: Run relevant tests after fixes to ensure no regressions
5. **Append-only tracking**: Update worklog without rewriting history

---

## Step 0 — Scope Contract (Mandatory)

Write a clear scope contract:

- **In-scope**: [Specific types of issues to fix, e.g., "Frontend accessibility issues in React components"]
- **Out-of-scope**: [What not to touch, e.g., "Backend code, documentation"]
- **Behavior change allowed**: [YES/NO - usually NO for quality fixes]
- **Success criteria**: [How to verify fixes work]

---

## Step 1 — Issue Discovery & Classification

Run comprehensive error checking:

```bash
# Get all VS Code problems
get_errors(filePaths=[])

# Run specific linters if available
cd src/frontend && npm run lint 2>&1 || true
cd src/backend && python -m ruff check . 2>&1 || true
cd src/backend && python -m mypy . 2>&1 || true
```

Classify each issue:

- **Type**: ACCESSIBILITY | LINTING | FORMATTING | PERFORMANCE | SECURITY
- **Severity**: P0 (blocks functionality) | P1 (accessibility/critical) | P2 (code quality) | P3 (style)
- **File**: Path to affected file
- **Evidence**: Direct output from linting tool

---

## Step 2 — Prioritization & Planning

Sort issues by:

1. **P0/P1 first**: Accessibility, security, functionality blockers
2. **Batch similar fixes**: Group issues of same type across files
3. **Safe fixes first**: Start with low-risk formatting changes

For each issue type, plan:

- **Fix strategy**: How to resolve (add labels, move styles, format code)
- **Verification**: How to confirm fix works
- **Risk assessment**: LOW/MED/HIGH impact on functionality

---

## Step 3 — Fix Implementation

For each issue:

### A) Accessibility Fixes (P0/P1 Priority)

**Missing form labels:**

```typescript
// BEFORE
<input type="email" />

// AFTER
<label htmlFor="email">Email Address</label>
<input id="email" type="email" />
```

**Missing button text:**

```typescript
// BEFORE
<button onClick={handleSave} />

// AFTER
<button onClick={handleSave}>Save Changes</button>
```

**Missing select labels:**

```typescript
// BEFORE
<select value={language} onChange={handleChange}>

// AFTER
<label htmlFor="language-select">Preferred Language</label>
<select id="language-select" value={language} onChange={handleChange}>
```

### B) CSS Inline Style Fixes (P2 Priority)

**Move inline styles to Tailwind classes:**

```typescript
// BEFORE
<div style={{ color: currentLetter.color }}>

// AFTER
<div className="text-blue-500"> // or use dynamic classes
```

### C) Markdown Formatting Fixes (P2 Priority)

**Add blank lines around headings:**

```markdown
# Title

Content -> # Title

Content
```

**Add language to code blocks:**

```markdown

```

code
`->`bash
code

```

```

---

## Step 4 — Verification & Testing

After each fix batch:

```bash
# Re-run linting to verify fixes
get_errors(filePaths=["affected_files"])

# Run relevant tests
cd src/frontend && npm test -- --testPathPattern="affected_component" || true
cd src/backend && python -m pytest tests/ -k "affected_functionality" || true

# Type check if applicable
cd src/backend && python -m mypy affected_file.py || true
```

Record verification results in worklog.

---

## Step 5 — Worklog Documentation

For each completed fix batch:

```
## TCK-YYYYMMDD-### :: Code Quality Fixes - [Issue Type]
Type: CODE_QUALITY
Owner: [Agent Name]
Status: DONE ✅
Completed: [timestamp]

Issues Fixed:
- [P1] Fixed missing form labels in Dashboard.tsx (3 instances)
- [P2] Moved inline styles to Tailwind classes in Game.tsx (2 instances)

Verification:
- ✅ Linting errors reduced from X to Y
- ✅ All tests passing
- ✅ No functionality regressions
```

---

## Common Fix Patterns

### React Accessibility

- Add `htmlFor` + `id` for labels
- Add `aria-label` for icon-only buttons
- Ensure form elements have associated labels

### CSS Best Practices

- Prefer Tailwind utility classes over inline styles
- Use CSS variables for dynamic values
- Avoid `!important` unless necessary

### Markdown Standards

- Blank lines around headings (MD022)
- Blank lines around code blocks (MD031)
- Language specifiers on code blocks (MD040)
- No trailing spaces (MD009)

---

## Risk Mitigation

- **Test after each change**: Prevents accumulating breaking changes
- **Small batches**: Fix 3-5 similar issues, then verify
- **Revert ready**: Keep git status clean between batches
- **Documentation first**: Record what you're changing and why

---

## Success Criteria

- ✅ All targeted linting errors resolved
- ✅ No new errors introduced
- ✅ Tests still pass
- ✅ Functionality preserved
- ✅ Worklog updated with evidence</content>
  <parameter name="filePath">/Users/pranay/Projects/learning_for_kids/prompts/workflow/code-quality-remediation-v1.0.md
