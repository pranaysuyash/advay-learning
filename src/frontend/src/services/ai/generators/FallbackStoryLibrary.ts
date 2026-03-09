/**
 * Fallback Story Library - Pre-written stories for offline/LLM-failure scenarios
 * 
 * Ensures the Voice Stories game always has content to display,
 * even when the LLM service is unavailable or costs need to be controlled.
 */

import { fallbackStories, type FallbackStory } from './fallbackStoriesData';

export interface StoryResult {
  text: string;
  fromFallback: true;
  title: string;
}

export class FallbackStoryLibrary {
  private stories: FallbackStory[];

  constructor() {
    this.stories = fallbackStories;
  }

  /**
   * Get a story matching the prompt and age, or a random story if no match
   */
  getStory(prompt: string, age?: number): StoryResult {
    // Normalize prompt for matching (extract keywords)
    const normalizedPrompt = prompt.toLowerCase().trim();
    
    // Try to match by keyword extraction
    let candidates = this.findStoriesByKeywords(normalizedPrompt);

    // If age provided, filter by age range
    if (age !== undefined && candidates.length > 0) {
      const ageMatched = candidates.filter(s => 
        age >= s.ageRange[0] && age <= s.ageRange[1]
      );
      // If we have age-appropriate stories, use them
      if (ageMatched.length > 0) {
        candidates = ageMatched;
      }
    }

    // If no theme matches, get random story appropriate for age
    if (candidates.length === 0) {
      if (age !== undefined) {
        candidates = this.stories.filter(s => 
          age >= s.ageRange[0] && age <= s.ageRange[1]
        );
      }
      // If still no matches (or no age), use all stories
      if (candidates.length === 0) {
        candidates = this.stories;
      }
    }

    // Select random story from candidates
    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    
    return {
      text: selected.text,
      fromFallback: true,
      title: selected.title,
    };
  }

  /**
   * Find stories matching keywords from prompt
   */
  private findStoriesByKeywords(prompt: string): FallbackStory[] {
    // Extract potential themes from prompt
    const keywords = prompt.split(/\s+/);
    
    // Score each story by keyword matches
    const scored = this.stories.map(story => {
      const storyWords = story.theme.toLowerCase().split(/\s+/);
      const textWords = story.text.toLowerCase().split(/\s+/);
      
      let score = 0;
      for (const keyword of keywords) {
        if (keyword.length < 3) continue; // Skip short words
        
        // Exact theme match = high score
        if (storyWords.some(w => w.includes(keyword) || keyword.includes(w))) {
          score += 10;
        }
        
        // Text mention = medium score
        if (textWords.some(w => w.includes(keyword))) {
          score += 2;
        }
      }
      
      return { story, score };
    });
    
    // Return stories with any match, sorted by score
    const matches = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score);
    
    // If we have good matches, return them
    if (matches.length > 0) {
      return matches.map(m => m.story);
    }
    
    return [];
  }

  /**
   * Get all available themes in the library
   */
  getAvailableThemes(): string[] {
    const themes = new Set(this.stories.map(s => s.theme));
    return Array.from(themes).sort();
  }

  /**
   * Get stories by specific theme
   */
  getStoriesByTheme(theme: string): FallbackStory[] {
    const normalizedTheme = theme.toLowerCase().trim();
    return this.stories.filter(s => 
      s.theme.toLowerCase() === normalizedTheme
    );
  }

  /**
   * Get stories appropriate for a specific age
   */
  getStoriesByAge(age: number): FallbackStory[] {
    return this.stories.filter(s => 
      age >= s.ageRange[0] && age <= s.ageRange[1]
    );
  }

  /**
   * Get total count of stories in library
   */
  getStoryCount(): number {
    return this.stories.length;
  }

  /**
   * Check if a theme exists in the library
   */
  hasTheme(theme: string): boolean {
    const normalizedTheme = theme.toLowerCase().trim();
    return this.stories.some(s => s.theme.toLowerCase() === normalizedTheme);
  }
}
