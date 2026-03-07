/**
 * Activity generator services.
 *
 * Includes:
 * - ActivityGeneratorService: deterministic activity plan generator
 * - StubActivityGenerator: compatibility stub for legacy callers/tests
 */

export interface ActivityParams {
  /** A subject or theme for the activity, e.g. "letters" or "shapes" */
  topic: string;
  /** Optional target letter for literacy activities */
  letter?: string;
  /** Optional target age (used for difficulty) */
  age?: number;
}

export interface ActivityResult {
  /** Description of the generated activity. */
  description: string;
  /** Human-friendly title */
  title?: string;
  /** Step-by-step instructions */
  steps?: string[];
  /** Difficulty level label */
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface ActivityGenerator {
  generate(params: ActivityParams): Promise<ActivityResult>;
}

const levelFromAge = (age?: number): 'easy' | 'medium' | 'hard' => {
  if (!age || age <= 5) return 'easy';
  if (age <= 8) return 'medium';
  return 'hard';
};

export class ActivityGeneratorService implements ActivityGenerator {
  async generate(params: ActivityParams): Promise<ActivityResult> {
    const topic = params.topic.trim() || 'learning';
    const letter = params.letter?.trim().toUpperCase();
    const difficulty = levelFromAge(params.age);

    const title = letter
      ? `${letter} ${topic} challenge`
      : `${topic} mini challenge`;

    const steps: string[] = [
      `Look around and find 3 things related to ${topic}.`,
      letter
        ? `Say the letter ${letter} out loud and name one word that starts with it.`
        : `Say one new word related to ${topic}.`,
      difficulty === 'easy'
        ? 'Draw a simple picture of your favorite item.'
        : difficulty === 'medium'
          ? 'Make a short sentence about your favorite item.'
          : 'Tell a mini story using two items you found.',
    ];

    return {
      title,
      difficulty,
      steps,
      description: `Try this ${difficulty} ${topic} activity with ${steps.length} quick steps.`,
    };
  }
}

export class StubActivityGenerator implements ActivityGenerator {
  async generate(params: ActivityParams): Promise<ActivityResult> {
    return { description: `STUB: activity for '${params.topic}'` };
  }
}
