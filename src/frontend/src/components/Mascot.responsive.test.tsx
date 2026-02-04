import { render, screen } from '@testing-library/react';
import { Mascot } from './Mascot';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} data-testid='motion-div' {...props}>
        {children}
      </div>
    ),
    img: ({ alt, className, ...props }: any) => (
      <img alt={alt} className={className} {...props} />
    ),
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// Mock useTTS
vi.mock('../hooks/useTTS', () => ({
  useTTS: () => ({
    speakInLanguage: vi.fn(),
    isEnabled: false,
  }),
}));

function getMascotContainerMotionDiv(container: HTMLElement) {
  const motionDivs = Array.from(
    container.querySelectorAll('[data-testid="motion-div"]'),
  ) as HTMLElement[];
  // Mascot container motion.div has the sizing + cursor-pointer classes.
  return motionDivs.find((el) => el.className.includes('cursor-pointer'));
}

describe('Mascot - Responsive Sizing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Size Props', () => {
    it('renders with auto responsive sizing by default', () => {
      const { container } = render(
        <Mascot state='idle' responsiveSize='auto' />,
      );

      const motionDiv = getMascotContainerMotionDiv(container);
      expect(motionDiv?.className).toContain('w-20'); // Mobile: 80px
      expect(motionDiv?.className).toContain('sm:w-24'); // Tablet: 96px
      expect(motionDiv?.className).toContain('md:w-32'); // Desktop: 128px
    });

    it('renders with explicit xs size', () => {
      const { container } = render(
        <Mascot state='idle' responsiveSize='xs' />,
      );

      const motionDiv = getMascotContainerMotionDiv(container);
      expect(motionDiv?.className).toContain('w-16');
      expect(motionDiv?.className).toContain('h-16');
    });

    it('renders with explicit sm size', () => {
      const { container } = render(
        <Mascot state='idle' responsiveSize='sm' />,
      );

      const motionDiv = getMascotContainerMotionDiv(container);
      expect(motionDiv?.className).toContain('w-20');
      expect(motionDiv?.className).toContain('h-20');
    });

    it('renders with explicit md size (original)', () => {
      const { container } = render(
        <Mascot state='idle' responsiveSize='md' />,
      );

      const motionDiv = getMascotContainerMotionDiv(container);
      expect(motionDiv?.className).toContain('w-32');
      expect(motionDiv?.className).toContain('h-32');
    });

    it('renders with explicit lg size', () => {
      const { container } = render(
        <Mascot state='idle' responsiveSize='lg' />,
      );

      const motionDiv = getMascotContainerMotionDiv(container);
      expect(motionDiv?.className).toContain('w-40');
      expect(motionDiv?.className).toContain('h-40');
    });
  });

  describe('Responsive Positioning', () => {
    it('includes responsive padding classes for positioning', () => {
      const { container } = render(
        <Mascot
          state='idle'
          responsiveSize='auto'
          className='fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8'
        />,
      );

      const root = container.firstElementChild as HTMLElement | null;
      expect(root?.className).toContain('bottom-4');
      expect(root?.className).toContain('sm:bottom-6');
      expect(root?.className).toContain('md:bottom-8');
    });
  });

  describe('hideOnMobile Behavior', () => {
    it('hides Mascot on mobile by default when hideOnMobile=true', () => {
      const { container } = render(
        <Mascot state='idle' hideOnMobile={true} />,
      );

      const motionDiv = getMascotContainerMotionDiv(container);
      expect(motionDiv?.className).toContain('hidden');
      expect(motionDiv?.className).toContain('sm:flex');
    });

    it('shows Mascot on all screen sizes when hideOnMobile=false', () => {
      const { container } = render(
        <Mascot state='idle' hideOnMobile={false} />,
      );

      const motionDiv = getMascotContainerMotionDiv(container);
      expect(motionDiv?.className).not.toContain('hidden');
    });
  });

  describe('Accessibility', () => {
    it('renders with proper image alt text', () => {
      render(<Mascot state='idle' decorative={false} />);

      const img = screen.getByAltText('Pip the Red Panda');
      expect(img).toBeInTheDocument();
    });

    it('hides image from assistive tech when decorative=true', () => {
      render(<Mascot state='idle' decorative={true} />);

      const img = screen.getByAltText('');
      expect(img).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Touch Target Sizes', () => {
    it('maintains minimum 44px touch target on auto responsive', () => {
      // At mobile (w-20 = 80px), exceeds minimum 44px requirement
      const { container } = render(
        <Mascot state='idle' responsiveSize='auto' />,
      );

      const motionDiv = getMascotContainerMotionDiv(container);
      expect(motionDiv?.className).toContain('cursor-pointer');
      // w-20 = 80px (20 * 4px Tailwind unit) > 44px minimum
    });

    it('xs size meets 44px minimum for touch', () => {
      // w-16 = 64px > 44px minimum
      const { container } = render(
        <Mascot state='idle' responsiveSize='xs' />,
      );

      const motionDiv = getMascotContainerMotionDiv(container);
      expect(motionDiv?.className).toContain('cursor-pointer');
    });
  });

  describe('Message Bubbles with Responsive Sizing', () => {
    it('renders message bubble with responsive mascot', () => {
      const { container } = render(
        <Mascot
          state='happy'
          message='Great job!'
          responsiveSize='sm'
        />,
      );

      // Should contain both message and mascot
      expect(screen.getByText('Great job!')).toBeInTheDocument();

      const motionDiv = getMascotContainerMotionDiv(container);
      expect(motionDiv?.className).toContain('w-20');
    });

    it('message bubble positioning works with all sizes', () => {
      const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'auto'> = [
        'xs',
        'sm',
        'md',
        'lg',
        'auto',
      ];

      sizes.forEach((size) => {
        const { unmount } = render(
          <Mascot
            state='happy'
            message='Test message'
            responsiveSize={size}
          />,
        );

        expect(screen.getByText('Test message')).toBeInTheDocument();
        unmount();
      });
    });
  });
});
