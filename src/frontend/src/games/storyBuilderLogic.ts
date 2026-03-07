export interface StoryBuilderPrompt {
  id: string;
  prompt: string;
  orderedWords: string[];
}

export interface StoryBuilderRound {
  id: string;
  prompt: string;
  orderedWords: string[];
  options: string[];
}

const STORY_PROMPTS: StoryBuilderPrompt[] = [
  {
    id: 'bird-sings',
    prompt: 'Build the sentence about the bird.',
    orderedWords: ['The', 'bird', 'sings'],
  },
  {
    id: 'pip-jumps',
    prompt: 'Build the sentence about Pip.',
    orderedWords: ['Pip', 'jumps', 'high'],
  },
  {
    id: 'kids-read',
    prompt: 'Build the sentence about reading.',
    orderedWords: ['Kids', 'read', 'books'],
  },
  {
    id: 'stars-shine',
    prompt: 'Build the sentence about stars.',
    orderedWords: ['Stars', 'shine', 'bright'],
  },
  {
    id: 'we-share-toys',
    prompt: 'Build the sentence about sharing.',
    orderedWords: ['We', 'share', 'toys'],
  },
];

function shuffle<T>(items: T[], rng: () => number): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function createStoryBuilderRound(
  usedPromptIds: string[] = [],
  rng: () => number = Math.random,
): StoryBuilderRound {
  const unused = STORY_PROMPTS.filter((entry) => !usedPromptIds.includes(entry.id));
  const source = unused.length > 0 ? unused : STORY_PROMPTS;
  const chosen = source[Math.floor(rng() * source.length)];

  return {
    id: chosen.id,
    prompt: chosen.prompt,
    orderedWords: chosen.orderedWords,
    options: shuffle(chosen.orderedWords, rng),
  };
}

export function evaluateStoryWordPick(
  round: StoryBuilderRound,
  pickedWords: string[],
  pickedWord: string,
): { ok: boolean; completed: boolean } {
  if (pickedWords.includes(pickedWord)) {
    return { ok: false, completed: false };
  }

  const expected = round.orderedWords[pickedWords.length];
  if (pickedWord !== expected) {
    return { ok: false, completed: false };
  }

  const completed = pickedWords.length + 1 === round.orderedWords.length;
  return { ok: true, completed };
}
