/**
 * LLM Story Generator - Production-ready story generation with caching and fallback
 * 
 * Integrates with LLMService to generate unique stories while providing
 * robust fallback mechanisms for offline use and cost control.
 */

import { llmService } from '../llm';
import type { StoryGenerator, StoryParams, StoryResult } from './StoryGenerator';
import { StoryCache } from './StoryCache';
import { FallbackStoryLibrary } from './FallbackStoryLibrary';

/**
 * System prompt ensuring child-appropriate, culturally relevant content
 */
const CHILD_SAFE_SYSTEM_PROMPT = `You are a kind and creative children's storyteller for Indian children ages 3-8.

STORY GUIDELINES:
- Write stories that are warm, encouraging, and educational
- Keep vocabulary simple and age-appropriate
- Include Indian cultural elements when natural (festivals, animals, settings)
- Stories should teach a gentle lesson about kindness, bravery, curiosity, or friendship
- Maximum 350 words (about 2-3 minutes of reading time)
- No scary content, violence, or adult themes
- Positive endings that make children feel hopeful and happy

CHARACTERS:
- Children can be the heroes
- Animals are friends and helpers
- Adults are supportive and kind
- Problems are solvable with courage and friendship

RESPOND ONLY WITH THE STORY TEXT. No introductions, no explanations, just the story.`;

export interface LLMStoryResult extends StoryResult {
  fromCache?: boolean;
  fromFallback?: boolean;
  generationTimeMs?: number;
}

export class LLMStoryGenerator implements StoryGenerator {
  private cache: StoryCache;
  private fallbackLibrary: FallbackStoryLibrary;

  constructor() {
    this.cache = new StoryCache();
    this.fallbackLibrary = new FallbackStoryLibrary();
  }

  /**
   * Generate a story with caching and fallback
   * 
   * Flow:
   * 1. Check cache first (instant return)
   * 2. Try LLM generation (with timeout)
   * 3. Fallback to pre-written library if LLM fails
   */
  async generate(params: StoryParams): Promise<LLMStoryResult> {
    const startTime = performance.now();
    
    // 1. Check cache first
    const cacheKey = this.generateCacheKey(params);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return {
        text: cached,
        title: this.generateTitle(params),
        fromCache: true,
        fromFallback: false,
        generationTimeMs: Math.round(performance.now() - startTime),
      };
    }

    // 2. Try LLM generation with timeout
    try {
      // Build enhanced prompt with system instructions
      const enhancedPrompt = this.buildPrompt(params);
      
      // Generate with 10-second timeout
      const response = await Promise.race([
        llmService.generateText({
          prompt: enhancedPrompt,
          languageCode: params.languageCode ?? 'en-US',
          maxTokens: 600, // ~350 words + buffer
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('LLM generation timeout')), 10000)
        ),
      ]);

      // Validate response
      if (!response.text || response.text.length < 50) {
        throw new Error('LLM returned empty or too short response');
      }

      // Clean up response (remove quotes if present)
      const cleanedText = this.cleanStoryText(response.text);

      // 3. Cache successful response
      this.cache.set(cacheKey, cleanedText, {
        theme: params.prompt,
        age: params.age ?? 6,
      });

      return {
        text: cleanedText,
        title: this.generateTitle(params),
        fromCache: false,
        fromFallback: false,
        usedLLM: true,
        generationTimeMs: Math.round(performance.now() - startTime),
      };

    } catch (error) {
      console.warn('[LLMStoryGenerator] LLM generation failed, using fallback:', error);
      
      // 4. Fallback to pre-written library
      const fallback = this.fallbackLibrary.getStory(params.prompt, params.age);
      
      return {
        text: fallback.text,
        title: fallback.title,
        fromCache: false,
        fromFallback: true,
        usedLLM: false,
        generationTimeMs: Math.round(performance.now() - startTime),
      };
    }
  }

  /**
   * Generate multiple stories for a theme (for variety)
   */
  async generateMultiple(params: StoryParams, count: number): Promise<LLMStoryResult[]> {
    const results: LLMStoryResult[] = [];
    
    for (let i = 0; i < count; i++) {
      // Add variety by slightly modifying the prompt for each request
      const variedParams = {
        ...params,
        prompt: i === 0 ? params.prompt : `${params.prompt} (different version)`,
      };
      
      const result = await this.generate(variedParams);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Check if a story is available in cache
   */
  isCached(params: StoryParams): boolean {
    const cacheKey = this.generateCacheKey(params);
    return this.cache.get(cacheKey) !== null;
  }

  /**
   * Pre-generate and cache stories for common themes
   * Call this during app initialization for instant story access
   */
  async pregenerateCommonStories(age: number): Promise<void> {
    const commonThemes = ['tiger', 'elephant', 'bird', 'friendship', 'adventure'];
    
    for (const theme of commonThemes) {
      const cacheKey = this.generateCacheKey({ prompt: theme, age });
      if (!this.cache.get(cacheKey)) {
        try {
          await this.generate({ prompt: theme, age });
        } catch (error) {
          console.warn(`[LLMStoryGenerator] Failed to pregenerate story for ${theme}:`, error);
        }
      }
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): { totalEntries: number; oldestEntry: number | null; newestEntry: number | null } {
    return this.cache.getStats();
  }

  /**
   * Clear all cached stories
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Build optimized prompt for story generation
   */
  private buildPrompt(params: StoryParams): string {
    const parts: string[] = [];
    
    // Main request
    parts.push(`Write a short, heartwarming story for a ${params.age ?? 6}-year-old child.`);
    
    // Theme from prompt
    parts.push(`The story should be about ${params.prompt}.`);
    
    // Character name personalization
    if (params.childName) {
      parts.push(`The main character's name is ${params.childName}.`);
    }
    
    // Style guidance based on age
    const age = params.age ?? 6;
    if (age <= 4) {
      parts.push('Use very simple sentences and lots of repetition. Focus on sounds and fun words.');
    } else if (age <= 6) {
      parts.push('Use simple language with some new words to learn. Include dialogue.');
    } else {
      parts.push('Use rich vocabulary and more complex sentences. Include a clear problem and solution.');
    }
    
    // Add system prompt as prefix
    return `${CHILD_SAFE_SYSTEM_PROMPT}\n\n${parts.join(' ')}`;
  }

  /**
   * Generate a title based on params
   */
  private generateTitle(params: StoryParams): string {
    const topic = params.prompt.charAt(0).toUpperCase() + params.prompt.slice(1);
    if (params.childName) {
      return `${params.childName} and the ${topic}`;
    }
    return `The ${topic} Adventure`;
  }

  /**
   * Generate deterministic cache key
   */
  private generateCacheKey(params: StoryParams): string {
    // Normalize parameters for consistent caching
    const normalizedPrompt = params.prompt.toLowerCase().trim();
    const normalizedName = params.childName?.toLowerCase().trim() || 'any';
    
    // Create hash-like key
    return `${normalizedPrompt}_${params.age ?? 6}_${normalizedName}_${params.languageCode ?? 'en'}`;
  }

  /**
   * Clean up LLM response text
   */
  private cleanStoryText(text: string): string {
    return text
      .trim()
      // Remove surrounding quotes if present
      .replace(/^["']|["']$/g, '')
      // Fix multiple spaces
      .replace(/\s+/g, ' ')
      // Fix multiple newlines
      .replace(/\n{3,}/g, '\n\n');
  }
}
