# Deployment Safety Guide

This document describes the safeguards in place to prevent production issues when making code or database changes.

## Overview

To prevent issues like:
- Missing database tables (models without migrations)
- Settings validation failures (env vars not defined in Settings class)
- Undeployable code being pushed

We have implemented multiple layers of safety checks.

---

## Safety Layers

### 1. Pre-Push Git Hook

**Location**: `.githooks/pre-push`

Runs automatically before `git push` to verify:
- All migrations are applied to the database
- Settings validation passes
- Database schema matches SQLAlchemy models
- No undefined environment variables in `.env`

**Installation**:
```bash
# Already configured via git config core.hooksPath .githooks
git config core.hooksPath .githooks
chmod +x .githooks/*
```

**Manual run**:
```bash
python scripts/pre_deploy_check.py
```

### 2. Startup Validation

**Location**: `src/backend/app/main.py` - `validate_database_schema()`

Runs when the backend starts to verify:
- All SQLAlchemy models have corresponding database tables
- No missing migrations that would cause runtime errors

If validation fails, the application refuses to start with a clear error message:
```
Database schema mismatch: Missing tables {'revoked_tokens'}. 
Run: alembic revision --autogenerate -m 'add missing tables' && alembic upgrade head
```

### 3. Settings Validation

**Location**: `src/backend/app/core/config.py`

The Settings class now accepts extra environment variables without crashing:
```python
# Additional API keys can be added without breaking existing code
GEMINI_API_KEY: Optional[str] = None
OPENAI_API_KEY: Optional[str] = None
```

This prevents issues where adding a new env var to `.env` breaks the backend because it's not defined in the Settings class.

### 4. Pre-Deployment Check Script

**Location**: `scripts/pre_deploy_check.py`

Comprehensive checks that can be run manually or in CI/CD:

```bash
# Run all checks
python scripts/pre_deploy_check.py
```

Checks performed:
1. **Migrations**: Verifies database is at latest migration (`alembic current`)
2. **Settings**: Validates all required settings are present
3. **Database Schema**: Compares SQLAlchemy models to actual database tables
4. **Environment**: Warns about env vars in `.env` not defined in Settings

---

## Common Scenarios & Solutions

### Adding a New Database Table

When you create a new SQLAlchemy model:

```bash
# 1. Create the model in app/db/models/
# 2. Generate migration
alembic revision --autogenerate -m "add new_table"

# 3. Review the generated migration
# 4. Apply migration
alembic upgrade head

# 5. Verify with pre-deploy check
python scripts/pre_deploy_check.py
```

### Adding a New Environment Variable

When you need a new env var:

```python
# In src/backend/app/core/config.py, add to Settings class:
NEW_SETTING: Optional[str] = None  # or with default: str = "default"
```

Then update `.env`:
```bash
NEW_SETTING=value
```

### Troubleshooting

#### Error: "Missing tables in database"
**Cause**: You created a SQLAlchemy model but no migration.
**Solution**:
```bash
alembic revision --autogenerate -m "add missing tables"
alembic upgrade head
```

#### Error: "Database is not at the latest migration"
**Cause**: There are pending migrations not applied.
**Solution**:
```bash
alembic upgrade head
```

#### Error: "Extra inputs are not permitted" (Settings)
**Cause**: An env var in `.env` is not defined in the Settings class.
**Solution**: Add the field to `config.py`:
```python
NEW_VAR: Optional[str] = None
```

---

## CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/deploy.yml
- name: Pre-deployment checks
  run: |
    python scripts/pre_deploy_check.py
```

---

## Best Practices

1. **Always run migrations locally first** before pushing
2. **Never commit directly to main** - use PRs so hooks run
3. **Review auto-generated migrations** - they may need adjustments
4. **Test with production-like data** when making schema changes
5. **Keep .env.example updated** with all required variables

---

## Emergency Bypass

If you absolutely need to push despite check failures (not recommended):

```bash
git push --no-verify  # Skips pre-push hook
```

**Note**: This should only be used in emergencies and the issues must be fixed immediately after.

---

## Related Files

- `scripts/pre_deploy_check.py` - Pre-deployment validation script
- `.githooks/pre-push` - Git pre-push hook
- `src/backend/app/main.py` - Startup validation
- `src/backend/app/core/config.py` - Settings configuration
