import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import {
  createShuffledDeck,
  areCardsMatch,
  markCardsMatched,
  hideCards,
  isBoardComplete,
  type MemoryCard,
} from '../games/memoryMatchLogic';

export function MemoryMatch() {
  const navigate = useNavigate();
  const [deck, setDeck] = useState<MemoryCard[]>(() => createShuffledDeck(8));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);

  const completed = useMemo(() => isBoardComplete(deck), [deck]);

  const onCardClick = (index: number) => {
    if (completed) return;
    const card = deck[index];
    if (!card || card.isMatched || card.isFlipped || flipped.length >= 2) return;

    const nextDeck = deck.map((c, i) => (i === index ? { ...c, isFlipped: true } : c));
    const nextFlipped = [...flipped, index];
    setDeck(nextDeck);
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      const [a, b] = nextFlipped;
      setMoves((m) => m + 1);
      if (areCardsMatch(nextDeck, nextDeck[a].id, nextDeck[b].id)) {
        setDeck(markCardsMatched(nextDeck, nextDeck[a].id, nextDeck[b].id));
        setScore((s) => s + 10);
        setFlipped([]);
      } else {
        window.setTimeout(() => {
          setDeck((prev) => hideCards(prev, prev[a].id, prev[b].id));
          setFlipped([]);
        }, 500);
      }
    }
  };

  const reset = () => {
    setDeck(createShuffledDeck(8));
    setFlipped([]);
    setMoves(0);
    setScore(0);
  };

  return (
    <GameContainer title='Memory Match' score={score} level={1} onHome={() => navigate('/games')}>
      <div className='p-4 max-w-5xl mx-auto'>
        <div className='mb-4 text-sm font-bold text-slate-700'>
          Moves: {moves} {completed ? '• Completed!' : ''}
        </div>
        <div className='grid grid-cols-4 gap-3'>
          {deck.map((card, index) => (
            <button
              key={card.id}
              type='button'
              onClick={() => onCardClick(index)}
              className='h-20 rounded-xl border-2 border-[#F2CC8F] bg-white text-2xl font-black'
            >
              {card.isFlipped || card.isMatched ? card.symbol : '?'}
            </button>
          ))}
        </div>
        <div className='mt-4'>
          <button
            type='button'
            onClick={reset}
            className='px-4 py-2 rounded-lg border-2 border-[#F2CC8F] bg-white font-bold'
          >
            Restart
          </button>
        </div>
      </div>
    </GameContainer>
  );
}

export default MemoryMatch;
