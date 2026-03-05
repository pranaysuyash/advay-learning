import {
  StubStoryGenerator,
  StoryParams,
  StubActivityGenerator,
  ActivityParams,
} from './index';
import { describe, expect, it } from 'vitest';

describe('AI Generator stubs', () => {
  it('story stub returns placeholder text', async () => {
    const gen = new StubStoryGenerator();
    const params: StoryParams = { prompt: 'a friendly dragon' };
    const result = await gen.generate(params);
    expect(result.text).toBe(`STUB: story for '${params.prompt}'`);
  });

  it('activity stub returns placeholder description', async () => {
    const gen = new StubActivityGenerator();
    const params: ActivityParams = { topic: 'colors' };
    const result = await gen.generate(params);
    expect(result.description).toBe(`STUB: activity for '${params.topic}'`);
  });
});
