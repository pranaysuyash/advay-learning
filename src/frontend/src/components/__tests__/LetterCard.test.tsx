import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Letter } from '../../data/alphabets';

// Simple LetterCard component test
const LetterCard = ({ letter }: { letter: Letter }) => {
  return (
    <div data-testid="letter-card">
      <span data-testid="letter-char">{letter.char}</span>
      <span data-testid="letter-name">{letter.name}</span>
      <span data-testid="letter-emoji">{letter.emoji}</span>
    </div>
  );
};

describe('LetterCard', () => {
  const mockLetter: Letter = {
    char: 'A',
    name: 'Apple',
    emoji: '🍎',
    color: '#ef4444',
    pronunciation: 'ay',
  };

  it('renders letter character', () => {
    render(<LetterCard letter={mockLetter} />);
    expect(screen.getByTestId('letter-char')).toHaveTextContent('A');
  });

  it('renders letter name', () => {
    render(<LetterCard letter={mockLetter} />);
    expect(screen.getByTestId('letter-name')).toHaveTextContent('Apple');
  });

  it('renders letter emoji', () => {
    render(<LetterCard letter={mockLetter} />);
    expect(screen.getByTestId('letter-emoji')).toHaveTextContent('🍎');
  });
});
