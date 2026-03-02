import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GamePage, GamePageContext } from '../GamePage';
import { progressQueue } from '../../services/progressQueue';
import { useSubscription } from '../../hooks/useSubscription';
import { useProgressStore } from '../../store';
import { vi } from 'vitest';

// mock navigation so we can verify home-button behaviour
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual<any>('react-router-dom');
  return {
    ...mod,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../hooks/useSubscription', () => ({
  useSubscription: vi.fn(),
}));

// for convenience in tests
const mockUseSubscription = useSubscription as unknown as vi.Mock;

// helper component that exposes context values for assertions
function InspectContext() {
  const ctx = React.useContext(GamePageContext);
  return (
    <div>
      <span data-testid='score'>{ctx.score}</span>
      <button onClick={() => ctx.setScore((s) => s + 1)}>inc</button>
    </div>
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  // give store a fake profile so handleFinish doesn't throw
  useProgressStore.setState({ currentProfile: { id: 'profile-1' } });
});

describe('GamePage', () => {
  it('shows spinner while loading subscription', () => {
    mockUseSubscription.mockReturnValue({
      canAccessGame: () => false,
      isLoading: true,
    });
    const { container } = render(
      <MemoryRouter>
        <GamePage title='Foo' gameId='foo'>
          {() => <div>child</div>}
        </GamePage>
      </MemoryRouter>,
    );
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    // also ensure we added role for accessibility
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders AccessDenied when user cannot access', () => {
    mockUseSubscription.mockReturnValue({
      canAccessGame: () => false,
      isLoading: false,
    });
    render(
      <MemoryRouter>
        <GamePage title='Foo' gameId='foo'>
          {() => <div>child</div>}
        </GamePage>
      </MemoryRouter>,
    );
    expect(screen.getByText(/locked/i)).toBeInTheDocument();
  });

  it('allows children to update score via context', () => {
    mockUseSubscription.mockReturnValue({
      canAccessGame: () => true,
      isLoading: false,
    });
    render(
      <MemoryRouter>
        <GamePage title='Foo' gameId='foo'>
          {() => <InspectContext />}
        </GamePage>
      </MemoryRouter>,
    );
    const scoreEl = screen.getByTestId('score');
    expect(scoreEl.textContent).toBe('0');
    fireEvent.click(screen.getByRole('button', { name: /inc/i }));
    expect(scoreEl.textContent).toBe('1');
  });

  it('handleFinish persists the most recent score when state is updated right before finish', async () => {
    mockUseSubscription.mockReturnValue({
      canAccessGame: () => true,
      isLoading: false,
    });
    const spy = vi
      .spyOn(progressQueue, 'add')
      .mockResolvedValue(undefined as any);
    let doFinish: () => Promise<void>;

    function Child() {
      const ctx = React.useContext(GamePageContext)!;
      doFinish = ctx.handleFinish;
      return (
        <button onClick={() => ctx.setScore(42)} data-testid='b'>
          bump
        </button>
      );
    }

    render(
      <MemoryRouter>
        <GamePage title='Foo' gameId='foo'>
          {() => <Child />}
        </GamePage>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId('b'));
    // call finish immediately after; should see updated value via ref
    await doFinish();

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ score: 42 }));
  });

  it('catches errors thrown by children and displays fallback', async () => {
    mockUseSubscription.mockReturnValue({
      canAccessGame: () => true,
      isLoading: false,
    });
    const Bomb = () => {
      throw new Error('boom');
    };
    const { container } = render(
      <MemoryRouter>
        <GamePage title='Foo' gameId='foo'>
          {() => <Bomb />}
        </GamePage>
      </MemoryRouter>,
    );
    // wait for boundary and error state to settle
    expect(await screen.findByText(/oops!/i)).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: /reload/i }),
    ).toBeInTheDocument();
    // new home button should be present as well
    expect(
      await screen.findByRole('button', { name: /home/i }),
    ).toBeInTheDocument();

    // ensure we did not accidentally nest a second GameContainer (see feedback)
    const containers = container.querySelectorAll('div.fixed.inset-0');
    expect(containers.length).toBe(1);
  });

  it('clicking home on the error fallback uses navigate', async () => {
    mockUseSubscription.mockReturnValue({
      canAccessGame: () => true,
      isLoading: false,
    });
    const Bomb = () => {
      throw new Error('kaboom');
    };
    render(
      <MemoryRouter>
        <GamePage title='Foo' gameId='foo'>
          {() => <Bomb />}
        </GamePage>
      </MemoryRouter>,
    );
    expect(await screen.findByText(/oops!/i)).toBeInTheDocument();

    // click the explicit home button rendered by the error screen
    fireEvent.click(screen.getByRole('button', { name: /home/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/games');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it('save-error UI also includes a Home button', async () => {
    mockUseSubscription.mockReturnValue({
      canAccessGame: () => true,
      isLoading: false,
    });
    // force progressQueue to throw so error state is shown
    vi.spyOn(progressQueue, 'add').mockRejectedValue(new Error('fail'));
    let doFinish: () => Promise<void>;
    function Child() {
      const ctx = React.useContext(GamePageContext)!;
      doFinish = ctx.handleFinish;
      return <button onClick={() => ctx.setScore(5)}>bump</button>;
    }
    render(
      <MemoryRouter>
        <GamePage title='Foo' gameId='foo'>
          {() => <Child />}
        </GamePage>
      </MemoryRouter>,
    );
    // perform update+finish inside act to avoid React warnings
    await act(async () => {
      await doFinish();
    });

    // error message rendered and home button present
    expect(await screen.findByText(/oops!/i)).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: /home/i }),
    ).toBeInTheDocument();
  });
});
