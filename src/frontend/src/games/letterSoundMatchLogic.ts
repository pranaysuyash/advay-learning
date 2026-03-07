export interface LetterSoundPair {
  letter: string;
  sound: string;
  example: string;
}

export interface LetterSoundMatchRound {
  target: LetterSoundPair;
  options: string[];
}

const LETTER_SOUND_PAIRS: LetterSoundPair[] = [
  { letter: 'A', sound: 'Ah', example: 'apple' },
  { letter: 'B', sound: 'Buh', example: 'ball' },
  { letter: 'C', sound: 'Kuh', example: 'cat' },
  { letter: 'D', sound: 'Duh', example: 'dog' },
  { letter: 'M', sound: 'Mmm', example: 'moon' },
  { letter: 'S', sound: 'Sss', example: 'sun' },
  { letter: 'T', sound: 'Tuh', example: 'tree' },
  { letter: 'P', sound: 'Puh', example: 'pig' },
];

function shuffle<T>(items: T[], rng: () => number): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function createLetterSoundMatchRound(
  usedLetters: string[] = [],
  rng: () => number = Math.random,
): LetterSoundMatchRound {
  const unused = LETTER_SOUND_PAIRS.filter(
    (entry) => !usedLetters.includes(entry.letter),
  );
  const source = unused.length > 0 ? unused : LETTER_SOUND_PAIRS;
  const target = source[Math.floor(rng() * source.length)];

  const distractors = shuffle(
    LETTER_SOUND_PAIRS.map((entry) => entry.sound).filter(
      (sound) => sound !== target.sound,
    ),
    rng,
  ).slice(0, 2);

  return {
    target,
    options: shuffle([target.sound, ...distractors], rng),
  };
}

export function isLetterSoundMatchCorrect(
  round: LetterSoundMatchRound,
  selectedSound: string,
): boolean {
  return round.target.sound === selectedSound;
}
