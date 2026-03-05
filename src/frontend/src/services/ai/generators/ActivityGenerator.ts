/**
 * ActivityGenerator stub implementation.
 * The real implementation will appear in Phase 3; for now callers can
 * instantiate this class and get a deterministic placeholder response.
 */

export interface ActivityParams {
  /** A subject or theme for the activity, e.g. "letters" or "shapes" */
  topic: string;
}

export interface ActivityResult {
  /** Description of the generated activity. */
  description: string;
}

export interface ActivityGenerator {
  generate(params: ActivityParams): Promise<ActivityResult>;
}

export class StubActivityGenerator implements ActivityGenerator {
  async generate(params: ActivityParams): Promise<ActivityResult> {
    return { description: `STUB: activity for '${params.topic}'` };
  }
}
