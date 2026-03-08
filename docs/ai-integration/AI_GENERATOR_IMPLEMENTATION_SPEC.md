# AI Generator Implementation Specification

**Ticket:** TCK-20260307-CRIT-001  
**Stamp:** STAMP-20260307T160000Z-codex-aiint  
**Phase:** Implementation (Step 6-7 of 9)

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Voice Stories │────▶│  StoryGenerator  │────▶│   LLMService    │
│     (Game)      │     │   (Interface)    │     │  (AI Backend)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Cache Layer     │
                        │  (localStorage)  │
                        └──────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Fallback Library│
                        │  (50 pre-written)│
                        └──────────────────┘
```

---

## Implementation Units

### Unit 1: LLMService Integration (P0)

**File:** `src/frontend/src/services/ai/generators/LLMStoryGenerator.ts`

**Interface:**
```typescript
import { LLMService } from '../llm/LLMService';
import type { StoryGenerator, StoryParams, StoryResult } from './StoryGenerator';

const CHILD_SAFE_SYSTEM_PROMPT = `You are a children's story writer for ages 3-8.
Rules:
- No scary content, violence, or adult themes
- Simple vocabulary appropriate for the age
- Positive, educational messages
- Indian cultural context when appropriate
- Maximum 300 words`;

export class LLMStoryGenerator implements StoryGenerator {
  private llmService: LLMService;
  private cache: StoryCache;
  private fallbackLibrary: FallbackStoryLibrary;

  constructor() {
    this.llmService = new LLMService();
    this.cache = new StoryCache();
    this.fallbackLibrary = new FallbackStoryLibrary();
  }

  async generate(params: StoryParams): Promise<StoryResult> {
    // 1. Check cache
    const cacheKey = this.generateCacheKey(params);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return { text: cached, fromCache: true };
    }

    // 2. Try LLM generation
    try {
      const prompt = this.buildPrompt(params);
      const response = await this.llmService.generate({
        prompt,
        systemPrompt: CHILD_SAFE_SYSTEM_PROMPT,
        maxTokens: 500,
        temperature: 0.8,
      });

      // 3. Cache successful response
      this.cache.set(cacheKey, response.text);

      return { text: response.text, fromCache: false };
    } catch (error) {
      // 4. Fallback to pre-written library
      console.warn('LLM generation failed, using fallback:', error);
      return this.fallbackLibrary.getStory(params.theme);
    }
  }

  private buildPrompt(params: StoryParams): string {
    return `Write a short story for a ${params.age}-year-old child about ${params.theme}.
    ${params.character ? `Include a ${params.character} as the main character.` : ''}
    Make it fun and educational.`;
  }

  private generateCacheKey(params: StoryParams): string {
    // Hash of theme + age + character
    return `story_${params.theme}_${params.age}_${params.character || 'any'}`;
  }
}
```

---

### Unit 2: Caching Layer (P1)

**File:** `src/frontend/src/services/ai/generators/StoryCache.ts`

```typescript
const CACHE_KEY_PREFIX = 'advay_story_cache_';
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_CACHE_ENTRIES = 100;

interface CacheEntry {
  text: string;
  timestamp: number;
}

export class StoryCache {
  get(key: string): string | null {
    try {
      const stored = localStorage.getItem(CACHE_KEY_PREFIX + key);
      if (!stored) return null;

      const entry: CacheEntry = JSON.parse(stored);
      
      // Check TTL
      if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        localStorage.removeItem(CACHE_KEY_PREFIX + key);
        return null;
      }

      return entry.text;
    } catch {
      return null;
    }
  }

  set(key: string, text: string): void {
    try {
      // Check cache size
      this.enforceCacheLimit();

      const entry: CacheEntry = {
        text,
        timestamp: Date.now(),
      };

      localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to cache story:', error);
    }
  }

  private enforceCacheLimit(): void {
    const keys = Object.keys(localStorage)
      .filter(k => k.startsWith(CACHE_KEY_PREFIX))
      .sort((a, b) => {
        const entryA = JSON.parse(localStorage.getItem(a) || '{}');
        const entryB = JSON.parse(localStorage.getItem(b) || '{}');
        return entryA.timestamp - entryB.timestamp;
      });

    // Remove oldest entries if over limit
    while (keys.length >= MAX_CACHE_ENTRIES) {
      localStorage.removeItem(keys.shift()!);
    }
  }
}
```

---

### Unit 3: Fallback Library (P1)

**File:** `src/frontend/src/services/ai/generators/FallbackStoryLibrary.ts`

```typescript
import storiesData from './fallback-stories.json';

export interface FallbackStory {
  id: string;
  theme: string;
  ageRange: [number, number];
  title: string;
  text: string;
}

export class FallbackStoryLibrary {
  private stories: FallbackStory[];

  constructor() {
    this.stories = storiesData.stories;
  }

  getStory(theme: string, age?: number): { text: string; fromFallback: true } {
    // Filter by theme and age
    const candidates = this.stories.filter(s => {
      const themeMatch = s.theme.toLowerCase() === theme.toLowerCase();
      const ageMatch = age ? age >= s.ageRange[0] && age <= s.ageRange[1] : true;
      return themeMatch && ageMatch;
    });

    if (candidates.length === 0) {
      // Return random story if no match
      const random = this.stories[Math.floor(Math.random() * this.stories.length)];
      return { text: random.text, fromFallback: true };
    }

    // Return random matching story
    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    return { text: selected.text, fromFallback: true };
  }
}
```

**File:** `src/frontend/src/services/ai/generators/fallback-stories.json`
```json
{
  "stories": [
    {
      "id": "story_001",
      "theme": "tiger",
      "ageRange": [3, 5],
      "title": "The Brave Little Tiger",
      "text": "Once upon a time, in a lush green jungle in India, there lived a little tiger named Raju..."
    },
    {
      "id": "story_002",
      "theme": "tiger",
      "ageRange": [6, 8],
      "title": "Raju's Great Adventure",
      "text": "Deep in the Sundarbans mangrove forest, Raju the tiger was known for his curiosity..."
    }
  ]
}
```

---

## Feature Flag Integration

**File:** `src/frontend/src/config/features.ts`

```typescript
export const features = {
  // ... existing flags
  
  enableStoryGenerator: {
    enabled: true, // <-- CHANGE THIS TO ENABLE
    description: 'Enable LLM-powered story generation',
  },
  
  enableActivityGenerator: {
    enabled: true, // <-- CHANGE THIS TO ENABLE
    description: 'Enable AI activity recommendations',
  },
};
```

**Factory Pattern:**
```typescript
// src/frontend/src/services/ai/generators/index.ts
import { features } from '@/config/features';
import { LLMStoryGenerator } from './LLMStoryGenerator';
import { StubStoryGenerator } from './StoryGenerator';

export function createStoryGenerator(): StoryGenerator {
  if (features.enableStoryGenerator.enabled) {
    return new LLMStoryGenerator();
  }
  return new StubStoryGenerator();
}
```

---

## UI Integration

**Loading State:**
```tsx
// In VoiceStories game
const [isGenerating, setIsGenerating] = useState(false);
const [story, setStory] = useState<string | null>(null);

const handleRequestStory = async (theme: string) => {
  setIsGenerating(true);
  const generator = createStoryGenerator();
  const result = await generator.generate({ theme, age: childAge });
  setStory(result.text);
  setIsGenerating(false);
};

// Render
{isGenerating && (
  <div className="flex items-center gap-2 text-blue-500">
    <LoadingSpinner />
    <span>Creating your story...</span>
  </div>
)}
```

---

## Testing Strategy

### Unit Tests
```typescript
// StoryCache.test.ts
describe('StoryCache', () => {
  it('should store and retrieve stories', () => {
    const cache = new StoryCache();
    cache.set('key1', 'story text');
    expect(cache.get('key1')).toBe('story text');
  });

  it('should respect TTL', () => {
    // Mock time
  });
});

// FallbackStoryLibrary.test.ts
describe('FallbackStoryLibrary', () => {
  it('should return story matching theme', () => {
    const lib = new FallbackStoryLibrary();
    const result = lib.getStory('tiger', 4);
    expect(result.text).toContain('tiger');
    expect(result.fromFallback).toBe(true);
  });
});
```

### Integration Tests
```typescript
// LLMStoryGenerator.integration.test.ts
describe('LLMStoryGenerator', () => {
  it('should generate story via LLM', async () => {
    const generator = new LLMStoryGenerator();
    const result = await generator.generate({ theme: 'elephant', age: 5 });
    expect(result.text).toBeTruthy();
    expect(result.text.length).toBeGreaterThan(100);
  });

  it('should fallback when LLM fails', async () => {
    // Mock LLMService to throw error
  });
});
```

---

## Rollout Plan

| Phase | Action | Verification |
|-------|--------|--------------|
| 1 | Deploy with feature flag OFF | No user impact |
| 2 | Enable for 10% of users | Monitor error rates |
| 3 | Enable for 50% of users | Check cache hit rates |
| 4 | Full rollout | Monitor costs |

---

## Cost Monitoring

```typescript
// Add to analytics
interface StoryGenerationEvent {
  type: 'story_generated';
  fromCache: boolean;
  fromFallback: boolean;
  tokensUsed: number;
  generationTimeMs: number;
}

// Dashboard metrics:
// - Generation requests per day
// - Cache hit rate
// - Fallback rate
// - Average cost per story
```

---

**Implementation Status:** Ready for development
