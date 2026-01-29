# Prompt: Build AI Feature

**Version:** 1.0.0
**Purpose:** Guide implementation of new AI-native features
**When to Use:** When adding new AI capabilities to the app
**Estimated Time:** Varies by feature complexity

---

## Context

You are implementing a new AI feature for the Advay Vision Learning app. This prompt guides you through the implementation process ensuring consistency with the architecture.

## Pre-Implementation Checklist

Before starting, verify:
- [ ] Feature is documented in `docs/ai-native/FEATURE_SPECS.md`
- [ ] Architecture alignment checked against `docs/ai-native/ARCHITECTURE.md`
- [ ] Safety requirements reviewed in `docs/ai-native/SAFETY_GUIDELINES.md`
- [ ] Parent controls identified (if applicable)
- [ ] Privacy implications assessed

## Feature Categories

### Category A: LLM Integration
Examples: Pip responses, story generation, activity creation

### Category B: Voice Features
Examples: TTS for Pip, STT for child input, voice commands

### Category C: Vision Features
Examples: Object detection, AR overlays, show-and-tell

### Category D: Hybrid Features
Examples: Voice + LLM conversation, Camera + LLM description

---

## Implementation Template

### Step 1: Define the Service Interface

```typescript
// Location: src/frontend/src/services/ai/[feature]Service.ts

/**
 * [Feature Name] Service
 *
 * Purpose: [What this service does]
 * Provider: [local/cloud/hybrid]
 * Privacy: [What data is processed, what is stored]
 */

export interface [Feature]Service {
  // Core methods
  initialize(): Promise<void>;
  isAvailable(): boolean;

  // Feature-specific methods
  [methodName](params: [ParamType]): Promise<[ReturnType]>;

  // Cleanup
  dispose(): void;
}

export interface [Feature]Options {
  // Configuration options
  provider?: 'local' | 'cloud';
  fallbackEnabled?: boolean;
  timeout?: number;
}
```

### Step 2: Implement Provider Abstraction

```typescript
// Location: src/frontend/src/services/ai/providers/[provider]Provider.ts

import { [Feature]Service, [Feature]Options } from '../[feature]Service';

export class [Provider][Feature]Provider implements [Feature]Service {
  private options: [Feature]Options;

  constructor(options: [Feature]Options = {}) {
    this.options = {
      provider: 'local',
      fallbackEnabled: true,
      timeout: 5000,
      ...options,
    };
  }

  async initialize(): Promise<void> {
    // Provider-specific initialization
  }

  isAvailable(): boolean {
    // Check if provider is available
    return true;
  }

  async [methodName](params: [ParamType]): Promise<[ReturnType]> {
    // Implementation
  }

  dispose(): void {
    // Cleanup resources
  }
}
```

### Step 3: Add Safety Layer

```typescript
// Location: src/frontend/src/services/ai/safety/[feature]Safety.ts

export class [Feature]SafetyFilter {
  /**
   * Filter input before sending to AI service
   */
  filterInput(input: string): { safe: boolean; filtered: string; reason?: string } {
    // Input validation
    // Content filtering
    // Length limits
    return { safe: true, filtered: input };
  }

  /**
   * Filter output before showing to child
   */
  filterOutput(output: string): { safe: boolean; filtered: string; reason?: string } {
    // Age-appropriate check
    // Content filtering
    // Format validation
    return { safe: true, filtered: output };
  }
}
```

### Step 4: Create React Hook

```typescript
// Location: src/frontend/src/hooks/useAI[Feature].ts

import { useState, useEffect, useCallback } from 'react';
import { [Feature]Service } from '../services/ai/[feature]Service';
import { create[Feature]Service } from '../services/ai/[feature]Factory';

export function useAI[Feature](options?: [Feature]Options) {
  const [service, setService] = useState<[Feature]Service | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const svc = create[Feature]Service(options);
    svc.initialize()
      .then(() => {
        setService(svc);
        setIsReady(true);
      })
      .catch(setError);

    return () => svc.dispose();
  }, []);

  const [featureMethod] = useCallback(async (params: [ParamType]) => {
    if (!service || !isReady) {
      throw new Error('[Feature] not ready');
    }
    return service.[methodName](params);
  }, [service, isReady]);

  return {
    isReady,
    error,
    [featureMethod],
  };
}
```

### Step 5: Integrate with Pip Component

```typescript
// Location: src/frontend/src/components/Pip/PipAI[Feature].tsx

import { useAI[Feature] } from '../../hooks/useAI[Feature]';

interface PipAI[Feature]Props {
  onResponse?: (response: string) => void;
  onError?: (error: Error) => void;
}

export function PipAI[Feature]({ onResponse, onError }: PipAI[Feature]Props) {
  const { isReady, error, [featureMethod] } = useAI[Feature]();

  // Implementation

  return (
    // UI components
  );
}
```

### Step 6: Add Tests

```typescript
// Location: src/frontend/src/services/ai/__tests__/[feature]Service.test.ts

import { describe, it, expect, vi } from 'vitest';
import { [Provider][Feature]Provider } from '../providers/[provider]Provider';

describe('[Feature]Service', () => {
  it('should initialize successfully', async () => {
    const service = new [Provider][Feature]Provider();
    await expect(service.initialize()).resolves.not.toThrow();
  });

  it('should handle provider unavailable', async () => {
    // Mock provider unavailable
    const service = new [Provider][Feature]Provider();
    expect(service.isAvailable()).toBe(false);
  });

  it('should filter unsafe content', async () => {
    // Test safety filter
  });

  it('should fall back gracefully', async () => {
    // Test fallback behavior
  });
});
```

### Step 7: Document Feature

```markdown
// Add to docs/ai-native/FEATURE_SPECS.md

## [Feature Name]

### Description
[What the feature does]

### User Story
As a [user type], I want to [action] so that [benefit].

### Technical Implementation
- Service: `src/frontend/src/services/ai/[feature]Service.ts`
- Hook: `src/frontend/src/hooks/useAI[Feature].ts`
- Component: `src/frontend/src/components/Pip/PipAI[Feature].tsx`

### Privacy Considerations
- Data processed: [list]
- Data stored: [list]
- Data sent to cloud: [list]

### Parent Controls
- [ ] Can disable feature
- [ ] Can view usage
- [ ] Can set limits

### Safety Measures
- Input filtering: [description]
- Output filtering: [description]
- Fallback behavior: [description]
```

---

## Feature-Specific Guides

### Building LLM Feature

```typescript
// Key considerations for LLM features

// 1. System prompt management
const SYSTEM_PROMPTS = {
  pip_response: `You are Pip, a friendly red panda...`,
  story_generation: `Generate a short story for a child...`,
};

// 2. Context building
interface LLMContext {
  childName: string;
  childAge: number;
  currentActivity: string;
  recentInteractions: string[];
}

// 3. Response post-processing
function postProcessResponse(response: string): string {
  // Remove markdown formatting
  // Limit length
  // Ensure age-appropriate
  return response;
}
```

### Building Voice Feature

```typescript
// Key considerations for voice features

// 1. Browser compatibility
const isTTSSupported = 'speechSynthesis' in window;
const isSTTSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

// 2. Voice selection
function selectVoice(type: 'pip' | 'narrator' | 'letter'): SpeechSynthesisVoice {
  const voices = speechSynthesis.getVoices();
  // Select appropriate voice
}

// 3. Child voice handling
const childVoiceConfig = {
  minConfidence: 0.6,  // Lower threshold for children
  maxSilence: 2000,    // Kids pause longer
};
```

### Building Vision Feature

```typescript
// Key considerations for vision features

// 1. Privacy-first processing
async function processFrame(frame: ImageData): Promise<DetectionResult> {
  const result = await detectObjects(frame);
  // IMPORTANT: Never store frame
  // Process and immediately discard
  return result;
}

// 2. Camera indicator
<CameraIndicator active={isCameraOn} />

// 3. Parent control check
if (!parentControls.cameraEnabled) {
  return <FeatureDisabled message="Camera features disabled by parent" />;
}
```

---

## Verification Checklist

Before marking feature complete:

### Code Quality
- [ ] TypeScript strict mode passes
- [ ] ESLint passes
- [ ] Tests written and passing
- [ ] Error handling complete

### Architecture
- [ ] Follows provider abstraction pattern
- [ ] Fallback implemented
- [ ] Privacy requirements met
- [ ] Performance budget met

### Safety
- [ ] Input filtering implemented
- [ ] Output filtering implemented
- [ ] Age-appropriate content verified
- [ ] Parent controls integrated

### Documentation
- [ ] Feature spec updated
- [ ] README updated (if applicable)
- [ ] Worklog ticket updated
- [ ] Change history documented

---

## Common Patterns

### Provider Factory Pattern
```typescript
export function createLLMService(options?: LLMOptions): LLMService {
  if (options?.provider === 'cloud') {
    return new ClaudeLLMProvider(options);
  }
  return new OllamaLLMProvider(options);
}
```

### Graceful Degradation Pattern
```typescript
async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  errorHandler?: (error: Error) => void
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    errorHandler?.(error as Error);
    return await fallback();
  }
}
```

### Child-Friendly Error Pattern
```typescript
const CHILD_ERRORS = {
  default: "Oops! Let's try again!",
  network: "Pip got lost in the clouds!",
  timeout: "Pip is thinking really hard...",
};

function getChildFriendlyError(error: Error): string {
  // Map technical errors to friendly messages
}
```

---

## Next Steps After Build

1. Run health check: `prompts/ai-native/ai-feature-check-v1.0.md`
2. Update worklog: `docs/WORKLOG_TICKETS.md`
3. Create PR with feature flag disabled
4. Enable feature flag after review
5. Monitor metrics post-deployment
