export interface EndingWord {
  word: string;
  emoji: string;
  endingLetter: string;
}

export interface EndingSoundsRound {
  target: EndingWord;
  options: string[];
}

const WORD_BANK: EndingWord[] = [
  { word: 'Cat', emoji: '🐱', endingLetter: 'T' },
  { word: 'Dog', emoji: '🐶', endingLetter: 'G' },
  { word: 'Sun', emoji: '☀️', endingLetter: 'N' },
  { word: 'Bus', emoji: '🚌', endingLetter: 'S' },
  { word: 'Fish', emoji: '🐟', endingLetter: 'H' },
  { word: 'Book', emoji: '📘', endingLetter: 'K' },
  { word: 'Bell', emoji: '🔔', endingLetter: 'L' },
  { word: 'Cake', emoji: '🍰', endingLetter: 'E' },
  { word: 'Moon', emoji: '🌙', endingLetter: 'N' },
  { word: 'Lamp', emoji: '💡', endingLetter: 'P' },
];

function shuffle<T>(items: T[], rng: () => number): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function createEndingSoundsRound(
  usedWords: string[] = [],
  rng: () => number = Math.random,
): EndingSoundsRound {
  const unusedWords = WORD_BANK.filter((entry) => !usedWords.includes(entry.word));
  const source = unusedWords.length > 0 ? unusedWords : WORD_BANK;
  const target = source[Math.floor(rng() * source.length)];

  const distractors = shuffle(
    Array.from(
      new Set(
        WORD_BANK.map((entry) => entry.endingLetter).filter(
          (letter) => letter !== target.endingLetter,
        ),
      ),
    ),
    rng,
  ).slice(0, 3);

  const options = shuffle([target.endingLetter, ...distractors], rng);
  return { target, options };
}

export function isEndingSoundCorrect(
  round: EndingSoundsRound,
  selectedLetter: string,
): boolean {
  return round.target.endingLetter === selectedLetter;
}
