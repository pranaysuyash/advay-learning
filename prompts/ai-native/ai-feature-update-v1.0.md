# Prompt: Update AI Feature

**Version:** 1.0.0
**Purpose:** Safely update existing AI features
**When to Use:** Provider upgrades, model changes, performance improvements, bug fixes
**Estimated Time:** Varies by scope

---

## Context

You are updating an existing AI feature in the Advay Vision Learning app. This prompt ensures updates maintain stability, safety, and functionality while improving the feature.

## Update Categories

### Category A: Provider/Model Update
Switching providers or upgrading model versions

### Category B: Performance Optimization
Improving latency, reducing costs, enhancing quality

### Category C: Safety Enhancement
Improving content filtering, adding safeguards

### Category D: Bug Fix
Resolving issues with existing functionality

### Category E: Feature Enhancement
Adding new capabilities to existing feature

---

## Pre-Update Checklist

### 1. Current State Documentation

Before any changes, document current state:

```markdown
## Current Feature State

### Feature: [Name]
### Version: [Current version]
### Last Updated: [Date]

### Current Configuration
- Provider: [Name]
- Model: [Name/Version]
- Key Settings:
  - [Setting 1]: [Value]
  - [Setting 2]: [Value]

### Current Performance
- Latency (p50): [Value]
- Latency (p95): [Value]
- Error Rate: [Value]
- User Satisfaction: [Metric if available]

### Known Issues
1. [Issue 1]
2. [Issue 2]

### Dependencies
- [Dependency 1]: [Version]
- [Dependency 2]: [Version]
```

### 2. Baseline Tests

Run and document baseline tests before changes:

```bash
# Run existing tests
cd src/frontend && npm test -- --grep "AI"

# Document results
# Test: [Name] - PASS/FAIL
# Test: [Name] - PASS/FAIL
```

### 3. Backup Current Configuration

```bash
# Save current config
cp src/frontend/src/services/ai/config.ts src/frontend/src/services/ai/config.backup.ts

# Document environment variables
env | grep AI_ > ai_config_backup.txt
```

---

## Category A: Provider/Model Update

### Step 1: Compatibility Assessment

```markdown
## Provider/Model Change Assessment

### From
- Provider: [Current]
- Model: [Current]
- API Version: [Current]

### To
- Provider: [New]
- Model: [New]
- API Version: [New]

### Breaking Changes
| Change | Impact | Mitigation |
|--------|--------|------------|
| | | |
| | | |

### New Features Available
- [Feature 1]
- [Feature 2]

### Deprecated Features
- [Feature 1]: [Alternative]
- [Feature 2]: [Alternative]
```

### Step 2: API Compatibility Check

```typescript
// Test new API compatibility
// Create test file: src/frontend/src/services/ai/__tests__/migration.test.ts

describe('Provider Migration', () => {
  it('should handle same input format', async () => {
    // Test input compatibility
  });

  it('should produce compatible output', async () => {
    // Test output format
  });

  it('should handle errors consistently', async () => {
    // Test error handling
  });
});
```

### Step 3: Parallel Testing

```typescript
// Run both providers in parallel during transition
async function testBothProviders(input: string) {
  const [oldResult, newResult] = await Promise.all([
    oldProvider.generate(input),
    newProvider.generate(input),
  ]);

  // Compare results
  console.log('Old:', oldResult);
  console.log('New:', newResult);

  // Log differences
  if (oldResult !== newResult) {
    logDifference(input, oldResult, newResult);
  }
}
```

### Step 4: Gradual Rollout

```typescript
// Feature flag for gradual rollout
const AI_PROVIDER_V2_PERCENTAGE = 10; // Start with 10%

function selectProvider(): AIProvider {
  const useNewProvider = Math.random() * 100 < AI_PROVIDER_V2_PERCENTAGE;
  return useNewProvider ? newProvider : oldProvider;
}
```

---

## Category B: Performance Optimization

### Step 1: Performance Profiling

```typescript
// Add performance logging
const startTime = performance.now();
const result = await aiService.generate(input);
const endTime = performance.now();

console.log(`AI Generation Time: ${endTime - startTime}ms`);
```

### Step 2: Identify Bottlenecks

| Stage | Current Time | Target Time | Gap |
|-------|--------------|-------------|-----|
| Input Processing | | | |
| API Call | | | |
| Response Processing | | | |
| TTS Generation | | | |

### Step 3: Optimization Strategies

#### Caching
```typescript
const responseCache = new Map<string, CachedResponse>();

async function generateWithCache(input: string): Promise<string> {
  const cacheKey = hashInput(input);

  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey)!.response;
  }

  const response = await aiService.generate(input);
  responseCache.set(cacheKey, { response, timestamp: Date.now() });
  return response;
}
```

#### Streaming
```typescript
async function* generateStreaming(input: string): AsyncGenerator<string> {
  const stream = await aiService.generateStream(input);
  for await (const chunk of stream) {
    yield chunk;
  }
}
```

#### Preloading
```typescript
// Preload likely responses
function preloadCommonResponses() {
  const commonInputs = ['hello', 'help', 'next letter'];
  commonInputs.forEach(input => generateWithCache(input));
}
```

### Step 4: Cost Optimization

```markdown
## Cost Analysis

### Current Costs
- Monthly API calls: [Number]
- Monthly cost: $[Amount]
- Cost per interaction: $[Amount]

### Optimization Opportunities
1. **Caching:** Reduce calls by [X]%
2. **Shorter prompts:** Reduce tokens by [X]%
3. **Local fallback:** Reduce cloud calls by [X]%
4. **Batching:** Reduce overhead by [X]%

### Projected Savings
- New monthly cost: $[Amount]
- Savings: $[Amount] ([X]%)
```

---

## Category C: Safety Enhancement

### Step 1: Safety Audit

```markdown
## Current Safety Assessment

### Input Filtering
- Filter exists: Yes/No
- Coverage: [Percentage]
- Known gaps: [List]

### Output Filtering
- Filter exists: Yes/No
- Coverage: [Percentage]
- Known gaps: [List]

### Recent Incidents
1. [Incident description]
2. [Incident description]
```

### Step 2: Enhanced Filtering

```typescript
// Enhanced safety filter
class EnhancedSafetyFilter {
  private blocklist: Set<string>;
  private patterns: RegExp[];

  filterInput(input: string): FilterResult {
    // Check blocklist
    // Check patterns
    // Check length
    // Check for injection attempts
    return { safe: true, filtered: input };
  }

  filterOutput(output: string): FilterResult {
    // Check age-appropriateness
    // Check for harmful content
    // Check for personal information requests
    return { safe: true, filtered: output };
  }
}
```

### Step 3: Testing Safety

```typescript
describe('Safety Filter', () => {
  const testCases = [
    { input: 'bad word', expected: 'filtered' },
    { input: 'ignore instructions', expected: 'blocked' },
    { input: 'normal question', expected: 'passed' },
  ];

  testCases.forEach(({ input, expected }) => {
    it(`should handle: ${input}`, () => {
      const result = safetyFilter.filterInput(input);
      expect(result.status).toBe(expected);
    });
  });
});
```

---

## Category D: Bug Fix

### Step 1: Bug Documentation

```markdown
## Bug Report

### Issue ID: [Ticket number]
### Severity: [Critical/High/Medium/Low]
### Affected Feature: [Name]

### Description
[Detailed description]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Root Cause Analysis
[Why it's happening]

### Affected Code
- File: [Path]
- Function: [Name]
- Line: [Number]
```

### Step 2: Fix Implementation

```typescript
// Document the fix
/**
 * Fix for [Issue ID]
 *
 * Problem: [Description]
 * Solution: [Description]
 * Testing: [How to verify]
 */
function fixedFunction() {
  // Implementation
}
```

### Step 3: Regression Testing

```typescript
describe('Bug Fix: [Issue ID]', () => {
  it('should not reproduce the original bug', async () => {
    // Reproduce original conditions
    // Verify bug is fixed
  });

  it('should not break existing functionality', async () => {
    // Run related tests
  });
});
```

---

## Category E: Feature Enhancement

### Step 1: Enhancement Specification

```markdown
## Enhancement Specification

### Feature: [Name]
### Enhancement: [Description]

### User Story
As a [user], I want [enhancement] so that [benefit].

### Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

### Backward Compatibility
- Existing behavior preserved: Yes/No
- Migration needed: Yes/No
- Feature flag: Yes/No
```

### Step 2: Implementation Plan

```markdown
## Implementation Steps

1. **Preparation**
   - [ ] Review existing code
   - [ ] Identify integration points
   - [ ] Plan data model changes

2. **Implementation**
   - [ ] Add new interfaces
   - [ ] Implement core logic
   - [ ] Add UI components

3. **Testing**
   - [ ] Unit tests
   - [ ] Integration tests
   - [ ] User acceptance tests

4. **Documentation**
   - [ ] Update feature spec
   - [ ] Update user docs
   - [ ] Update worklog
```

---

## Post-Update Verification

### 1. Automated Tests

```bash
# Run full test suite
cd src/frontend && npm test

# Run AI-specific tests
cd src/frontend && npm test -- --grep "AI"

# Run e2e tests
cd src/frontend && npm run test:e2e
```

### 2. Manual Verification

| Test Case | Steps | Expected | Actual | Status |
|-----------|-------|----------|--------|--------|
| Basic functionality | | | | PASS/FAIL |
| Error handling | | | | PASS/FAIL |
| Performance | | | | PASS/FAIL |
| Safety | | | | PASS/FAIL |

### 3. Rollback Plan

```markdown
## Rollback Instructions

### Trigger Conditions
- Error rate > [X]%
- Latency > [X]ms
- User complaints > [X]

### Rollback Steps
1. Revert feature flag: `AI_FEATURE_V2=false`
2. Restore backup: `cp config.backup.ts config.ts`
3. Restart services
4. Verify functionality
5. Notify stakeholders

### Post-Rollback
- Analyze failure
- Create fix plan
- Schedule re-deployment
```

---

## Update Report Template

```markdown
# AI Feature Update Report

## Summary
- **Feature:** [Name]
- **Update Type:** [A/B/C/D/E]
- **Date:** [Date]
- **Developer:** [Name]

## Changes Made
1. [Change 1]
2. [Change 2]
3. [Change 3]

## Testing Results
| Test Category | Passed | Failed | Skipped |
|---------------|--------|--------|---------|
| Unit Tests | | | |
| Integration | | | |
| Manual | | | |

## Performance Comparison
| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Latency (p50) | | | |
| Error Rate | | | |
| Cost | | | |

## Issues Encountered
1. [Issue and resolution]
2. [Issue and resolution]

## Follow-Up Items
- [ ] [Item 1]
- [ ] [Item 2]

## Sign-Off
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Rollback plan in place
- [ ] Stakeholders notified
```

---

## Related Prompts

- For verification: `ai-feature-verify-v1.0.md`
- For health check: `ai-feature-check-v1.0.md`
- For new features: `ai-feature-build-v1.0.md`
