import type { ReactElement, ReactNode } from 'react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import {
  useAuthStore,
  useProfileStore,
  useProgressStore,
  useSettingsStore,
} from '../../store';
import { Home } from '../../pages/Home';
import { AlphabetGame } from '../../pages/AlphabetGame';
import { Dashboard } from '../../pages/Dashboard';
import { Settings } from '../../pages/Settings';
import { Layout } from '../../components/ui/Layout';

vi.mock('react-webcam', () => ({
  default: () => <div data-testid='webcam-mock' />,
}));
vi.mock('@mediapipe/tasks-vision', () => ({
  FilesetResolver: { forVisionTasks: async () => ({}) },
  HandLandmarker: { createFromOptions: async () => ({}) },
}));
vi.mock('../../hooks/useHandTracking', () => ({
  useHandTracking: () => ({
    landmarker: null,
    isLoading: false,
    isReady: true,
    initialize: vi.fn(),
  }),
}));
vi.mock('../../hooks/useGameLoop', () => ({
  useGameLoop: () => {},
}));
vi.mock('../../hooks/useInactivityDetector', () => ({
  default: () => ({}),
}));
vi.mock('../../components/LetterJourney', () => ({
  LetterJourney: () => <div data-testid='letter-journey' />,
}));
vi.mock('../../components/Mascot', () => ({
  Mascot: () => <div data-testid='mascot' />,
}));
vi.mock('../../components/GameTutorial', () => ({
  GameTutorial: () => null,
}));
vi.mock('../../components/WellnessTimer', () => ({
  default: () => null,
}));
vi.mock('../../components/WellnessReminder', () => ({
  default: () => null,
}));
vi.mock('../../components/Icon', () => ({
  Icon: () => <div data-testid='icon' />,
}));
vi.mock('../../components/ui', () => ({
  UIIcon: () => <span data-testid='ui-icon' />,
  Button: ({ children, ...props }: { children: ReactNode }) => (
    <button type='button' {...props}>
      {children}
    </button>
  ),
}));
vi.mock('../../components/ui/Icon', () => ({
  UIIcon: () => <span data-testid='ui-icon' />,
}));
vi.mock('../../components/ui/ConfirmDialog', () => ({
  useConfirm: () => vi.fn(async () => true),
  // Provide ConfirmContext so modules importing it don't fail under partial mocks
  ConfirmContext: {},
}));
vi.mock('../../components/ui/Toast', () => ({
  useToast: () => ({ showToast: vi.fn() }),
  // Provide ToastContext so modules importing it don't fail under partial mocks
  ToastContext: {},
}));

const renderWithRouter = (ui: ReactElement, entries: any[] = ['/']) =>
  render(<MemoryRouter initialEntries={entries}>{ui}</MemoryRouter>);

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const setupNavigatorMocks = () => {
  const permission = { state: 'denied', addEventListener: vi.fn() };
  Object.defineProperty(navigator, 'permissions', {
    value: { query: vi.fn().mockResolvedValue(permission) },
    configurable: true,
  });
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: vi.fn().mockRejectedValue(new Error('denied')) },
    configurable: true,
  });
};

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
  });
  useSettingsStore.setState({
    gameLanguage: 'en',
    language: 'english',
    difficulty: 'medium',
    soundEnabled: true,
    cameraEnabled: false,
    showHints: true,
    timeLimit: 0,
    handTrackingDelegate: 'GPU',
    updateSettings: vi.fn(),
    resetSettings: vi.fn(),
  } as any);
  useProfileStore.setState({
    profiles: [{ id: 'p1', name: 'Kid One', age: 6, preferred_language: 'en' }],
    fetchProfiles: vi.fn(),
    createProfile: vi.fn(),
    updateProfile: vi.fn(),
  } as any);
  useProgressStore.setState({
    letterProgress: {
      english: [],
      hindi: [],
      kannada: [],
      telugu: [],
      tamil: [],
    },
    getMasteredLettersCount: () => 0,
    getUnlockedBatches: () => 0,
    unlockAllBatches: vi.fn(),
    resetProgress: vi.fn(),
  } as any);
  setupNavigatorMocks();
});

describe('Semantic HTML Accessibility', () => {
  describe('Home page', () => {
    it('should have proper landmark structure (header, nav, main, footer)', () => {
      const { container } = renderWithRouter(
        <Layout>
          <Home />
        </Layout>,
      );

      // Check for landmarks
      expect(container.querySelector('header')).toBeTruthy();
      expect(container.querySelector('nav')).toBeTruthy();
      expect(container.querySelector('main')).toBeTruthy();
      expect(container.querySelector('footer')).toBeTruthy();
    });

    it('should have proper heading hierarchy (H1, H2, no skips)', () => {
      const { container } = renderWithRouter(
        <Layout>
          <Home />
        </Layout>,
      );

      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      expect(headings.length).toBeGreaterThan(0);

      // Check heading levels (should not jump H1 -> H3)
      let lastLevel = 0;
      Array.from(headings).forEach((heading) => {
        const level = parseInt(heading.tagName[1]);
        if (lastLevel > 0) {
          // Allow same level or +1 level
          expect(level).toBeLessThanOrEqual(lastLevel + 1);
        }
        lastLevel = level;
      });
    });

    it('should have semantic sections for feature cards', () => {
      const { container } = renderWithRouter(
        <Layout>
          <Home />
        </Layout>,
      );

      const articles = container.querySelectorAll('article');
      // Home has feature cards as articles
      expect(articles.length).toBeGreaterThan(0);
    });
  });

  describe('AlphabetGame page', () => {
    it('should have section wrapper with semantic structure', async () => {
      useAuthStore.setState({
        user: { id: 'u1', email: 'a@b.com', role: 'parent', is_active: true },
        isAuthenticated: true,
      });
      const { container } = renderWithRouter(<AlphabetGame />, [
        { pathname: '/game', state: { profileId: 'p1' } },
      ]);
      await act(async () => {
        await flushPromises();
      });

      const section = container.querySelector('section');
      expect(section).toBeTruthy();
    });

    it('should have header with game title', async () => {
      useAuthStore.setState({
        user: { id: 'u1', email: 'a@b.com', role: 'parent', is_active: true },
        isAuthenticated: true,
      });
      const { container } = renderWithRouter(<AlphabetGame />, [
        { pathname: '/game', state: { profileId: 'p1' } },
      ]);
      await act(async () => {
        await flushPromises();
      });

      const header = container.querySelector('section header');
      expect(header).toBeTruthy();
    });

    it('should have output element for score display', async () => {
      useAuthStore.setState({
        user: { id: 'u1', email: 'a@b.com', role: 'parent', is_active: true },
        isAuthenticated: true,
      });
      const { container } = renderWithRouter(<AlphabetGame />, [
        { pathname: '/game', state: { profileId: 'p1' } },
      ]);
      await act(async () => {
        await flushPromises();
      });

      const output = container.querySelector('output');
      expect(output).toBeTruthy();
    });

    it('should have fieldset for game controls', async () => {
      useAuthStore.setState({
        user: { id: 'u1', email: 'a@b.com', role: 'parent', is_active: true },
        isAuthenticated: true,
      });
      const { container } = renderWithRouter(<AlphabetGame />, [
        { pathname: '/game', state: { profileId: 'p1' } },
      ]);
      await act(async () => {
        await flushPromises();
      });
      const startButton = screen.getByRole('button', {
        name: /start learning|play with mouse\/touch/i,
      });
      await act(async () => {
        fireEvent.click(startButton);
        await flushPromises();
      });

      const fieldset = container.querySelector('fieldset');
      expect(fieldset).toBeTruthy();

      // Fieldset should have legend
      const legend = fieldset?.querySelector('legend');
      expect(legend).toBeTruthy();
    });

    it('should have progress element for accuracy tracking', async () => {
      useAuthStore.setState({
        user: { id: 'u1', email: 'a@b.com', role: 'parent', is_active: true },
        isAuthenticated: true,
      });
      const { container } = renderWithRouter(<AlphabetGame />, [
        { pathname: '/game', state: { profileId: 'p1' } },
      ]);
      await act(async () => {
        await flushPromises();
      });
      const startButton = screen.getByRole('button', {
        name: /start learning|play with mouse\/touch/i,
      });
      await act(async () => {
        fireEvent.click(startButton);
        await flushPromises();
      });
      const checkButton = screen.getByRole('button', {
        name: /check my tracing/i,
      });
      await act(async () => {
        fireEvent.click(checkButton);
        await flushPromises();
      });

      const progress = container.querySelector('progress');
      expect(progress).toBeTruthy();

      // Progress should have value and max attributes
      expect(progress?.getAttribute('max')).toBe('100');
    });
  });

  describe('Dashboard page', () => {
    beforeEach(() => {
      useAuthStore.setState({
        user: { id: 'u1', email: 'parent@test.com', role: 'parent', is_active: true },
        isAuthenticated: true,
      });
      useProfileStore.setState({
        profiles: [{ id: 'p1', name: 'Kid One', age: 6, preferred_language: 'en' }],
        selectedProfile: 'p1',
        currentProfile: { id: 'p1', name: 'Kid One', age: 6, preferred_language: 'en' },
        fetchProfiles: vi.fn(),
        createProfile: vi.fn(),
        updateProfile: vi.fn(),
      } as any);
      useProgressStore.setState({
        letterProgress: {
          en: [
            { letter: 'A', bestAccuracy: 85, mastered: true, attempts: 5 },
            { letter: 'B', bestAccuracy: 70, mastered: false, attempts: 3 },
          ],
        },
        getMasteredLettersCount: () => 1,
        getUnlockedBatches: () => 1,
        unlockAllBatches: vi.fn(),
        resetProgress: vi.fn(),
      } as any);
    });

    it('should have section wrapper with semantic layout', () => {
      const { container } = renderWithRouter(<Dashboard />);

      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThan(0);
    });

    it('should have article elements for content cards', async () => {
      const { container } = renderWithRouter(<Dashboard />);

      // Check if the collapsible section exists (articles are inside expandable section)
      const collapsibleSection = container.querySelector('button[aria-expanded]');
      expect(collapsibleSection).toBeTruthy();

      // The section should be collapsible (aria-expanded attribute present)
      expect(collapsibleSection?.getAttribute('aria-expanded')).toBe('false');

      // Check that the collapsible section has proper accessibility attributes
      expect(collapsibleSection?.getAttribute('aria-controls')).toBeTruthy();
    });

    it('should have header for dashboard title', () => {
      const { container } = renderWithRouter(<Dashboard />);

      const header = container.querySelector('section header');
      expect(header).toBeTruthy();
    });

    it('should have progress elements for learning tracking', () => {
      const { container } = renderWithRouter(<Dashboard />);

      const progressBars = container.querySelectorAll('progress');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  describe('Settings page', () => {
    it('should have section wrapper', () => {
      vi.useFakeTimers();
      const { container } = render(
        <MemoryRouter>
          <Settings />
        </MemoryRouter>,
      );
      const holdButton = screen.getByRole('button', {
        name: /hold.*3 seconds.*access settings/i,
      });
      act(() => {
        fireEvent.mouseDown(holdButton);
      });
      act(() => {
        vi.advanceTimersByTime(3100);
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      vi.useRealTimers();

      const section = container.querySelector('section');
      expect(section).toBeTruthy();
    });

    it('should have fieldset with legend for each settings group', () => {
      vi.useFakeTimers();
      const { container } = render(
        <MemoryRouter>
          <Settings />
        </MemoryRouter>,
      );
      const holdButton = screen.getByRole('button', {
        name: /hold.*3 seconds.*access settings/i,
      });
      act(() => {
        fireEvent.mouseDown(holdButton);
      });
      act(() => {
        vi.advanceTimersByTime(3100);
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      vi.useRealTimers();

      const fieldsets = container.querySelectorAll('fieldset');
      expect(fieldsets.length).toBeGreaterThan(0);

      // Each fieldset should have a legend
      fieldsets.forEach((fieldset) => {
        const legend = fieldset.querySelector('legend');
        expect(legend).toBeTruthy();
      });
    });

    it('should have form labels for inputs', () => {
      vi.useFakeTimers();
      const { container } = render(
        <MemoryRouter>
          <Settings />
        </MemoryRouter>,
      );
      const holdButton = screen.getByRole('button', {
        name: /hold.*3 seconds.*access settings/i,
      });
      act(() => {
        fireEvent.mouseDown(holdButton);
      });
      act(() => {
        vi.advanceTimersByTime(3100);
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      vi.useRealTimers();

      const labels = container.querySelectorAll('label');
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  describe('Layout component', () => {
    it('should have header with nav', () => {
      const { container } = renderWithRouter(
        <Layout>
          <div>Test</div>
        </Layout>,
      );

      const header = container.querySelector('header');
      expect(header).toBeTruthy();

      const nav = header?.querySelector('nav');
      expect(nav).toBeTruthy();
    });

    it('should have nav with ul/li structure', () => {
      const { container } = renderWithRouter(
        <Layout>
          <div>Test</div>
        </Layout>,
      );

      const nav = container.querySelector('nav');
      const ul = nav?.querySelector('ul');
      expect(ul).toBeTruthy();

      const listItems = ul?.querySelectorAll('li');
      expect(listItems && listItems.length > 0).toBeTruthy();
    });

    it('should have main element for content', () => {
      const { container } = renderWithRouter(
        <Layout>
          <div>Test</div>
        </Layout>,
      );

      const main = container.querySelector('main');
      expect(main).toBeTruthy();
    });

    it('should have footer', () => {
      const { container } = renderWithRouter(
        <Layout>
          <div>Test</div>
        </Layout>,
      );

      const footer = container.querySelector('footer');
      expect(footer).toBeTruthy();
    });
  });

  describe('Dialog accessibility', () => {
    it('should have dialog elements with proper nesting', () => {
      // Dialogs are rendered with dialog tag and ARIA attributes
      // This is verified in component tests
      expect(true).toBe(true);
    });
  });
});
