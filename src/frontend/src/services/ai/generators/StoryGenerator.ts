/**
 * Story generator services.
 *
 * Includes:
 * - StoryGeneratorService: template-first generator with optional LLM polish
 * - StubStoryGenerator: compatibility stub for legacy callers/tests
 */

import { llmService } from '../llm';

export interface StoryParams {
  /** A short description of the requested story, e.g. "a rabbit learns to count" */
  prompt: string;
  /** Optional child name to personalize the story */
  childName?: string;
  /** Optional target age (used for tone/sentence length) */
  age?: number;
  /** Optional language code (defaults to English) */
  languageCode?: string;
}

export interface StoryResult {
  /** Generated story text. */
  text: string;
  /** Story title for card/list display */
  title?: string;
  /** A short moral or learning takeaway */
  moral?: string;
  /** Whether LLM was used to enhance the story */
  usedLLM?: boolean;
}

export interface StoryGenerator {
  generate(params: StoryParams): Promise<StoryResult>;
}

const clampAge = (age?: number): number => {
  if (!age || Number.isNaN(age)) return 6;
  return Math.max(3, Math.min(10, Math.floor(age)));
};

const buildTemplateStory = (params: StoryParams): StoryResult => {
  const topic = params.prompt.trim() || 'a brave little learner';
  const name = params.childName?.trim() || 'our little friend';
  const age = clampAge(params.age);

  const title = `${name}'s ${topic.replace(/^a\s+/i, '').replace(/^the\s+/i, '')} adventure`;
  const text = [
    `One sunny day, ${name} discovered ${topic}.`,
    `At ${age} years old, ${name} took a deep breath and tried one small step at a time.`,
    `Soon, the hard part felt easier, and ${name} smiled with confidence.`,
    `By bedtime, ${name} had learned that practice, kindness, and courage can solve big problems.`,
  ].join(' ');

  return {
    title,
    text,
    moral: 'Take small steps and keep trying—you can grow every day.',
    usedLLM: false,
  };
};

export class StoryGeneratorService implements StoryGenerator {
  constructor(private readonly opts: { preferLLM?: boolean } = {}) {}

  async generate(params: StoryParams): Promise<StoryResult> {
    const template = buildTemplateStory(params);

    if (!this.opts.preferLLM || !llmService.isEnabled()) {
      return template;
    }

    try {
      const prompt = [
        'Create a short, child-safe story (4-6 sentences).',
        `Topic: ${params.prompt}`,
        `Child name: ${params.childName ?? 'Learner'}`,
        `Age: ${clampAge(params.age)}`,
        `Language: ${params.languageCode ?? 'en-US'}`,
        'Avoid fear, violence, and scary themes. End with a positive learning takeaway.',
      ].join('\n');

      const llm = await llmService.generateText({
        prompt,
        languageCode: params.languageCode,
        maxTokens: 220,
      });

      return {
        ...template,
        text: llm.text.trim() || template.text,
        usedLLM: true,
      };
    } catch {
      return template;
    }
  }
}

export class StubStoryGenerator implements StoryGenerator {
  async generate(params: StoryParams): Promise<StoryResult> {
    // placeholder behaviour; real logic will call LLMService later
    return { text: `STUB: story for '${params.prompt}'` };
  }
}
