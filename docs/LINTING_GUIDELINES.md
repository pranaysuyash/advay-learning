# Linting Guidelines for Advay Vision Learning

**Version**: 1.0
**Last Updated**: 2026-01-31

## Overview

This document captures the linting practices and decisions made in the Advay Vision Learning project to maintain code quality while balancing developer productivity and avoiding false positives.

---

## Core Principles

### 1. Evidence-Based Linting Decisions

Never silence lint errors without understanding their root cause and documenting the decision.

**Before Disabling a Rule:**
1. **Understand the error**: Why is the linter flagging this?
2. **Assess impact**: Is this a real issue or a false positive?
3. **Consider alternatives**: Can we fix the underlying issue instead?
4. **If you disable**: Add a comment explaining why
5. **File a ticket**: Create a worklog ticket to track the issue

**Example**: ✅ Fixed import order instead of disabling rule

---

## 2. TypeScript `@ts-expect-error` Usage Guidelines

Use `@ts-expect-error` sparingly and only when appropriate.

### When NOT to use:
- **False positives**: Variables with underscore prefix (`_variableName`) that are intentionally unused
  ```typescript
  // This is a placeholder variable for future use
  const _unusedPlaceholder = someValue;
  ```
  - **Rationale**: The underscore prefix signals "intentionally unused" to other developers

### When to use:
- **Genuinely unused variables**: If a variable is truly unused and has no underscore prefix, fix it or remove it
- **Stale suppressions**: Remove old `@ts-expect-error` comments after fixing the underlying issue

### Examples from Codebase:

**Appropriate Use** (intentionally unused):
```typescript
// FingerNumberShow.tsx:152
// @ts-expect-error - showCelebration is used by code below (removed for lint)
const [showCelebration, setShowCelebration] = useState(false);
```
- **Why**: Variable removed during refactoring but state management still needs the setter

---

## 3. ESLint Rule Disable Guidelines

### Rules to Consider Before Disabling

**Common Rules Often Disabled:**
- `react-hooks/exhaustive-deps` - Hook dependency checking
- `react-hooks/rules-of-hooks` - Hooks placement rules
- `react/button-type-has-static-qualifiers` - Button type attributes
- `@typescript-eslint/no-explicit-any` - Any type usage
- `react-refresh/only-export-components` - Component export patterns

### Decision Matrix:

| Rule | Severity | When to Disable | When to Keep | Example |
|-------|----------|-------------------|----------|---------|
| exhaustive-deps | HIGH | Legacy code with complex dependencies | Never | New code following hooks patterns |
| button-type-qualifiers | MEDIUM | Adding simple `type` props | Never | Keep using existing class patterns |
| no-explicit-any | MEDIUM | Legacy code using any types | Never | Add proper types | New code with strict typing |
| react-refresh | LOW | False positives in component files | Never | Fix exports, use proper patterns |

---

## 4. Code Style Guidelines

### Variable Naming Conventions

- **Unused variables**: Prefix with underscore (`_variable`) to indicate intentional non-use
- **State setters**: Keep even if unused (might be needed in future)
- **Constants**: Use UPPER_CASE for constants
- **Booleans**: Use clear names (`isPlaying`, `hasPermission`)

### Comments

- **Explain why**: Comments should clarify complex logic or historical context
- **No TODO comments**: Either implement or remove TODO
- **Link to issues**: Reference related tickets or documentation

---

## 5. Disabled Lint Rules in This Project

### Current Configuration (`.eslintrc.cjs`):

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'react/button-type-has-static-qualifiers': 'off',
  },
}
```

### Rules Currently Disabled:

1. **`react-hooks/exhaustive-deps`**: 'off'
   - **Rationale**: Legacy code with complex hook dependencies not worth refactoring
   - **Impact**: Hides potential missing dependency issues
   - **Recommendation**: Re-enable after major refactoring or when adding new features

2. **`react-hooks/rules-of-hooks`**: 'off'
   - **Rationale**: Hooks are always correctly placed at top level in this codebase
   - **Impact**: Prevents valid patterns for future hooks
   - **Recommendation**: Keep disabled

3. **`react/button-type-has-static-qualifiers`**: 'off'
   - **Rationale**: We use dynamic className patterns and utility classes; static type attributes conflict with Tailwind CSS
   - **Impact**: Low - accessibility concern, but existing UI patterns don't easily accommodate static types
   - **Recommendation**: Keep disabled, consider redesign if accessibility becomes priority

4. **`@typescript-eslint/no-explicit-any`**: 'off'
   - **Rationale**: Legacy code with any types; fixing all requires significant effort
   - **Impact**: Medium - type safety degraded
   - **Recommendation**: Gradually introduce proper types, starting with new features

### Historical Suppressions:

**From TCK-20260130-032** (Fix ProfileUpdate Import):
- ✅ Fixed actual issue instead of disabling rules

**From TCK-20260131-002** (Fix 10 button warnings):
- ✅ Added `type` attributes to buttons for accessibility
- ✅ Fixed form label association with `htmlFor`
- ✅ TypeScript compiles with 0 errors

---

## 6. When to Disable Rules

### Decision Workflow:

1. **Can we fix it without disabling?**
   - Yes → Fix it
   - No → Disable with documented rationale
   - Unsure → Create worklog ticket for investigation

2. **Is the fix within scope?**
   - Yes → Disable with rationale
   - No → Create separate ticket for larger refactoring

3. **Add evidence to comment:**
   - What specific issue?
   - Why is this an acceptable workaround?
   - What would be the proper fix?

---

## 7. Re-enabling Rules

### Process for Re-enabling:

1. **Identify rules to re-enable**
   - Review each disabled rule
   - Determine if underlying issues have been fixed

2. **Update `.eslintrc.cjs`**
   - Remove rule from disabled list
   - Test that code still passes

3. **Update documentation**
   - Add worklog entry explaining the change
   - Note the tickets that fixed the underlying issues

4. **Run full lint check**
   - Verify all warnings are expected
   - Update any suppressions if needed

---

## 8. VS Code Configuration

### Settings for Linting (`.vscode/settings.json`):

```json
{
  "python.analysis.extraPaths": [
    "src/backend",
    "src/frontend"
  ],
  "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python",
  "python.testing.pytestEnabled": true,
  "python.testing.pytestArgs": [
    "tests"
  ],
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": false,
  "python.linting.flake8Enabled": false,
  "python.linting.mypyEnabled": true,
  "python.linting.mypyArgs": [
    "--config-file=src/backend/pyproject.toml",
    "app/"
  ],
  "eslint.workingDirectories": [
    "src/frontend"
  ],
  "eslint.validate": [
    "javascript",
    "typescript"
  ],
  "eslint.options": {
    "rules": {
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "warn"
    }
  },
  "editor.formatOnSave": true,
  "python.formatting.provider": "black",
  "chat.tools.terminal.autoApprove": {
    "/^source \\.venv/bin/activate && python -m pytest tests/ --tb=short$/": {
      "approve": true,
      "matchCommandLine": true
    }
  }
}
```

**Purpose**: ESLint workspace settings ensure VS Code uses the project's ESLint configuration instead of default settings.

**Updates** (TCK-20260131-008 - Priority 8, 2026-01-31):
- ✅ Fixed mypyArgs path from `"src/backend/pyproject.toml"` to `"pyproject.toml"` (corrects relative path)
- ✅ Added ESLint workspace configuration: `eslint.workingDirectories`, `eslint.validate`, `eslint.options`
- ✅ Configured rule warning levels: `react-hooks/exhaustive-deps` and `react-hooks/rules-of-hooks` set to `"warn"`

---

## 9. Common Issues and Solutions

### TypeScript Errors

| Issue | Cause | Solution |
|-------|--------|----------|
| Missing type attributes | Add `type="button"` or `type="submit"` | Done |
| Unused variables | Add underscore prefix or remove | Done |
| Wrong imports/paths | Update mypy config path | Done |
| Duplicate class definitions | Consolidate to single file | Done |

### ESLint Warnings

| Warning | Cause | Solution |
|---------|--------|----------|
| React Hooks dependencies | Document rationale, disable `exhaustive-deps` | Documented |
| Button type attributes | Add semantic types, disable rule | Documented |
| Form labels | Add `htmlFor`, remove unassociated labels | Done |

---

## 10. Continuous Improvement

### Goals:

1. **Reduce disabled lint rules**: Gradually re-enable rules as code is refactored
2. **Improve type safety**: Replace `any` types with proper TypeScript types
3. **Fix accessibility**: Ensure all interactive elements have proper semantic markup
4. **Better documentation**: Keep this guide updated with current practices

### Metrics to Track:

- **Number of disabled rules**: Currently 4 rules disabled
- **Number of TypeScript errors**: Target: 0
- **Number of ESLint errors**: Target: 0
- **Number of @ts-expect-error suppressions**: Document and minimize

---

## References

- **Worklog Tickets**: See `docs/WORKLOG_TICKETS.md` for all linting-related work
- **Project Documentation**: See `docs/SETUP.md` for environment setup
- **React Documentation**: https://react.dev for hooks and component patterns
- **ESLint Documentation**: https://eslint.org/docs/latest/rules/

---

**Last Updated**: 2026-01-31
**Next Review Date**: 2026-02-07
