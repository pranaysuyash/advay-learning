import {
  StubStoryGenerator,
  StoryParams,
  StubActivityGenerator,
  ActivityParams,
  StoryGeneratorService,
  ActivityGeneratorService,
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

  it('story service returns template-based child-safe story', async () => {
    const gen = new StoryGeneratorService();
    const result = await gen.generate({
      prompt: 'a shy rabbit learning letters',
      childName: 'Mia',
      age: 5,
    });

    expect(result.text.length).toBeGreaterThan(20);
    expect(result.title).toContain('Mia');
    expect(result.usedLLM).toBe(false);
  });

  it('activity service returns structured steps', async () => {
    const gen = new ActivityGeneratorService();
    const result = await gen.generate({
      topic: 'letters',
      letter: 'b',
      age: 7,
    });

    expect(result.description.length).toBeGreaterThan(10);
    expect(result.steps?.length).toBeGreaterThanOrEqual(3);
    expect(result.difficulty).toBe('medium');
  });
});
