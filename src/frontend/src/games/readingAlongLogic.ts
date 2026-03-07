export interface ReadingAlongSentence {
  id: string;
  text: string;
  targetWord: string;
}

export interface ReadingAlongRound {
  sentence: ReadingAlongSentence;
  options: string[];
}

const SENTENCES: ReadingAlongSentence[] = [
  { id: 'cat-mat', text: 'The cat sits on the mat', targetWord: 'cat' },
  { id: 'sun-bright', text: 'The sun is bright today', targetWord: 'sun' },
  { id: 'pip-runs', text: 'Pip runs fast at school', targetWord: 'runs' },
  { id: 'bird-sings', text: 'A bird sings every morning', targetWord: 'sings' },
  { id: 'kids-read', text: 'Kids read books together', targetWord: 'read' },
  { id: 'stars-shine', text: 'Stars shine in the sky', targetWord: 'shine' },
];

function shuffle<T>(items: T[], rng: () => number): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function createReadingAlongRound(
  usedIds: string[] = [],
  rng: () => number = Math.random,
): ReadingAlongRound {
  const unused = SENTENCES.filter((entry) => !usedIds.includes(entry.id));
  const source = unused.length > 0 ? unused : SENTENCES;
  const sentence = source[Math.floor(rng() * source.length)];

  const distractors = shuffle(
    SENTENCES.map((entry) => entry.targetWord).filter(
      (word) => word !== sentence.targetWord,
    ),
    rng,
  ).slice(0, 2);

  return {
    sentence,
    options: shuffle([sentence.targetWord, ...distractors], rng),
  };
}

export function isReadingAlongAnswerCorrect(
  round: ReadingAlongRound,
  selectedWord: string,
): boolean {
  return round.sentence.targetWord === selectedWord;
}
