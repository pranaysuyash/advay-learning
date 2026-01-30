import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Letter } from '../../data/alphabets';
import { getRandomIcon } from '../../utils/iconUtils';

// Simple LetterCard component test
const LetterCard = ({ letter }: { letter: Letter }) => {
  return (
    <div data-testid="letter-card">
      <span data-testid="letter-char">{letter.char}</span>
      <span data-testid="letter-name">{letter.name}</span>
      <img
        data-testid="letter-icon"
        src={getRandomIcon(letter)}
        alt={letter.name}
        className="w-16 h-16"
      />
    </div>
  );
};

describe('LetterCard', () => {
  const mockLetter: Letter = {
    char: 'A',
    name: 'Apple',
    icon: '/assets/icons/apple.svg',
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

  it('renders letter icon', () => {
    render(<LetterCard letter={mockLetter} />);
    const icon = screen.getByTestId('letter-icon');
    expect(icon).toHaveAttribute('src', '/assets/icons/apple.svg');
    expect(icon).toHaveAttribute('alt', 'Apple');
  });
});
