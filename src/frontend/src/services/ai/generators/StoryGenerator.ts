/**
 * StoryGenerator stub implementation.
 * Real behaviour will be added in Phase 3 when the service is fully designed.
 * For now the class returns a simple placeholder string so that callers and
 * unit tests can compile and exercise the interface without pulling in the
 * LLM stack.
 */

export interface StoryParams {
  /** A short description of the requested story, e.g. "a rabbit learns to count" */
  prompt: string;
}

export interface StoryResult {
  /** Generated story text. */
  text: string;
}

export interface StoryGenerator {
  generate(params: StoryParams): Promise<StoryResult>;
}

export class StubStoryGenerator implements StoryGenerator {
  async generate(params: StoryParams): Promise<StoryResult> {
    // placeholder behaviour; real logic will call LLMService later
    return { text: `STUB: story for '${params.prompt}'` };
  }
}
