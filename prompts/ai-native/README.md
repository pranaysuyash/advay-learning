# AI-Native Feature Prompts

**Version:** 1.0.0
**Last Updated:** 2026-01-29

---

## Overview

This directory contains workflow prompts for developing, testing, and maintaining AI-native features in the Advay Vision Learning app.

---

## Prompt Index

| Prompt | Purpose | When to Use |
|--------|---------|-------------|
| [ai-feature-check-v1.0.md](./ai-feature-check-v1.0.md) | Health check | After deployment, debugging |
| [ai-feature-build-v1.0.md](./ai-feature-build-v1.0.md) | Implementation guide | Building new features |
| [ai-feature-verify-v1.0.md](./ai-feature-verify-v1.0.md) | Verification checklist | Before PR merge |
| [ai-feature-explore-v1.0.md](./ai-feature-explore-v1.0.md) | Research & ideation | Planning, brainstorming |
| [ai-feature-research-v1.0.md](./ai-feature-research-v1.0.md) | Deep-dive research | Evaluating providers/tech |
| [ai-feature-update-v1.0.md](./ai-feature-update-v1.0.md) | Update existing features | Provider changes, bug fixes |

---

## Workflow Decision Tree

```
┌─────────────────────────────────────────────────────────────────────┐
│                     What do you need to do?                         │
└─────────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Plan/Research │    │     Build     │    │    Maintain   │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   EXPLORE     │    │    BUILD      │    │    CHECK      │
│ New features? │    │ Implementation│    │ Health check? │
│ Brainstorming │    │    guide      │    │               │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   RESEARCH    │    │    VERIFY     │    │    UPDATE     │
│ Deep dive on  │    │ Before merge  │    │ Fix/Upgrade   │
│ specific tech │    │ verification  │    │ existing      │
└───────────────┘    └───────────────┘    └───────────────┘
```

---

## Quick Reference

### Starting a New Feature

1. **Explore** possibilities → `ai-feature-explore-v1.0.md`
2. **Research** specific tech → `ai-feature-research-v1.0.md`
3. **Build** the feature → `ai-feature-build-v1.0.md`
4. **Verify** before merge → `ai-feature-verify-v1.0.md`

### Maintaining a Feature

1. **Check** current health → `ai-feature-check-v1.0.md`
2. **Update** if needed → `ai-feature-update-v1.0.md`
3. **Verify** after changes → `ai-feature-verify-v1.0.md`

### Debugging an Issue

1. **Check** what's working → `ai-feature-check-v1.0.md`
2. **Update** to fix → `ai-feature-update-v1.0.md`
3. **Verify** the fix → `ai-feature-verify-v1.0.md`

---

## Common Scenarios

### "We want to add a new AI feature"
```
1. ai-feature-explore-v1.0.md  (brainstorm possibilities)
2. ai-feature-research-v1.0.md (evaluate options)
3. ai-feature-build-v1.0.md    (implement)
4. ai-feature-verify-v1.0.md   (test thoroughly)
```

### "We want to switch LLM providers"
```
1. ai-feature-research-v1.0.md (compare providers)
2. ai-feature-update-v1.0.md   (migrate)
3. ai-feature-verify-v1.0.md   (validate)
```

### "Something is broken in production"
```
1. ai-feature-check-v1.0.md    (diagnose)
2. ai-feature-update-v1.0.md   (fix)
3. ai-feature-verify-v1.0.md   (confirm fix)
```

### "We need to improve performance"
```
1. ai-feature-check-v1.0.md    (measure baseline)
2. ai-feature-research-v1.0.md (research options)
3. ai-feature-update-v1.0.md   (optimize)
4. ai-feature-verify-v1.0.md   (measure improvement)
```

---

## Prompt Maintenance

### Updating Prompts

When updating a prompt:
1. Increment version number (e.g., v1.0 → v1.1)
2. Add changelog entry
3. Update README if scope changes
4. Test with a real use case

### Creating New Prompts

New prompts should include:
- Version number and date
- Clear purpose statement
- When to use / When not to use
- Step-by-step instructions
- Templates and checklists
- Related prompts section

---

## Related Documentation

- [AI Architecture](../../docs/ai-native/ARCHITECTURE.md)
- [Feature Specs](../../docs/ai-native/FEATURE_SPECS.md)
- [Safety Guidelines](../../docs/ai-native/SAFETY_GUIDELINES.md)
- [Roadmap](../../docs/ai-native/ROADMAP.md)
