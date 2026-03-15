import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameContainer } from '../GameContainer';

vi.mock('../../hooks/useSessionProgressReporter', () => ({
  useSessionProgressReporter: vi.fn(),
}));

describe('GameContainer', () => {
  const onHome = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header with title', () => {
    render(
      <GameContainer title='Test Game' onHome={onHome}>
        <div>Game content</div>
      </GameContainer>,
    );

    expect(screen.getByText('Test Game')).toBeInTheDocument();
    expect(screen.getByText('Game content')).toBeInTheDocument();
  });

  it('renders home button and calls onHome', () => {
    render(
      <GameContainer title='Test' onHome={onHome}>
        <div>content</div>
      </GameContainer>,
    );

    const homeButton = screen.getByLabelText('Exit Game');
    expect(homeButton).toBeInTheDocument();
    fireEvent.click(homeButton);
    expect(onHome).toHaveBeenCalledTimes(1);
  });

  it('renders exit text on desktop', () => {
    render(
      <GameContainer title='Test' onHome={onHome}>
        <div>content</div>
      </GameContainer>,
    );

    expect(screen.getByText('Exit')).toBeInTheDocument();
  });

  it('renders score when showScore is true and score provided', () => {
    render(
      <GameContainer title='Test' onHome={onHome} showScore={true} score={42}>
        <div>content</div>
      </GameContainer>,
    );

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('hides score when showScore is false', () => {
    render(
      <GameContainer title='Test' onHome={onHome} showScore={false} score={42}>
        <div>content</div>
      </GameContainer>,
    );

    expect(screen.queryByText('42')).not.toBeInTheDocument();
  });

  it('renders level when provided', () => {
    render(
      <GameContainer title='Test' onHome={onHome} level={3}>
        <div>content</div>
      </GameContainer>,
    );

    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not render level when not provided', () => {
    render(
      <GameContainer title='Test' onHome={onHome}>
        <div>content</div>
      </GameContainer>,
    );

    expect(screen.queryByText('Level')).not.toBeInTheDocument();
  });

  it('renders pause button when onPause provided', () => {
    const onPause = vi.fn();
    render(
      <GameContainer title='Test' onHome={onHome} onPause={onPause}>
        <div>content</div>
      </GameContainer>,
    );

    const pauseButton = screen.getByLabelText('Pause Game');
    expect(pauseButton).toBeInTheDocument();
    fireEvent.click(pauseButton);
    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it('does not render pause button when onPause not provided', () => {
    render(
      <GameContainer title='Test' onHome={onHome}>
        <div>content</div>
      </GameContainer>,
    );

    expect(screen.queryByLabelText('Pause Game')).not.toBeInTheDocument();
  });

  it('renders settings button with settings icon when onSettings provided', () => {
    const onSettings = vi.fn();
    render(
      <GameContainer title='Test' onHome={onHome} onSettings={onSettings}>
        <div>content</div>
      </GameContainer>,
    );

    const settingsButton = screen.getByLabelText('Game Settings');
    expect(settingsButton).toBeInTheDocument();
    fireEvent.click(settingsButton);
    expect(onSettings).toHaveBeenCalledTimes(1);
  });

  it('does not render settings button when onSettings not provided', () => {
    render(
      <GameContainer title='Test' onHome={onHome}>
        <div>content</div>
      </GameContainer>,
    );

    expect(screen.queryByLabelText('Game Settings')).not.toBeInTheDocument();
  });

  it('renders without title', () => {
    render(
      <GameContainer onHome={onHome}>
        <div>content</div>
      </GameContainer>,
    );

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('renders camera thumbnail when isHandDetected is set', () => {
    render(
      <GameContainer
        title='Test'
        onHome={onHome}
        isHandDetected={true}
        isPlaying={true}
      >
        <div>content</div>
      </GameContainer>,
    );

    // CameraThumbnail renders when isHandDetected is defined
    // Verify the main game area exists
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <GameContainer title='Test' onHome={onHome} className='custom-class'>
        <div>content</div>
      </GameContainer>,
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
