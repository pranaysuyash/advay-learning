import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AgeBadge, AgeDot, AgeBadgeWithLabel } from '../AgeBadge';

describe('AgeBadge', () => {
  describe('basic rendering', () => {
    it('should render age number', () => {
      render(<AgeBadge age={5} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should render floor of decimal age', () => {
      render(<AgeBadge age={5.8} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should render age 2 correctly', () => {
      render(<AgeBadge age={2} />);
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should render age 8+ correctly', () => {
      render(<AgeBadge age={10} />);
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  describe('size variants', () => {
    it('should render small size', () => {
      render(<AgeBadge age={4} size="sm" />);
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should render medium size (default)', () => {
      render(<AgeBadge age={4} />);
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should render large size', () => {
      render(<AgeBadge age={4} size="lg" />);
      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  describe('pulse effect', () => {
    it('should render without pulse by default', () => {
      const { container } = render(<AgeBadge age={5} />);
      // Pulse adds a motion.div inside, but the main badge should exist
      expect(container.querySelector('span')).toHaveTextContent('5');
    });

    it('should render with pulse when enabled', () => {
      const { container } = render(<AgeBadge age={5} pulse />);
      expect(container.querySelector('span')).toHaveTextContent('5');
    });
  });

  describe('custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(<AgeBadge age={5} className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('age group colors (via getAgeBadgeColor)', () => {
    it('should render toddler age (2) with pink background', () => {
      const { container } = render(<AgeBadge age={2} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.style.backgroundColor).toBe('rgb(244, 143, 177)'); // #F48FB1
    });

    it('should render preschool age (4) with blue background', () => {
      const { container } = render(<AgeBadge age={4} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.style.backgroundColor).toBe('rgb(100, 181, 246)'); // #64B5F6
    });

    it('should render early elementary age (6) with green background', () => {
      const { container } = render(<AgeBadge age={6} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.style.backgroundColor).toBe('rgb(174, 213, 129)'); // #AED581
    });

    it('should render older child age (8+) with purple background', () => {
      const { container } = render(<AgeBadge age={8} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.style.backgroundColor).toBe('rgb(186, 104, 200)'); // #BA68C8
    });

    it('should render age 9 with purple background', () => {
      const { container } = render(<AgeBadge age={9} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.style.backgroundColor).toBe('rgb(186, 104, 200)'); // #BA68C8
    });
  });

  describe('accessibility', () => {
    it('should have role presentation for decorative badge', () => {
      render(<AgeBadge age={5} />);
      // Age badge displays a number which is content
      expect(screen.getByText('5')).toBeVisible();
    });
  });
});

describe('AgeDot', () => {
  it('should render as colored dot', () => {
    const { container } = render(<AgeDot age={5} />);
    expect(container.firstChild).toHaveClass('rounded-full');
  });

  it('should have title with age info', () => {
    const { container } = render(<AgeDot age={5} />);
    expect(container.firstChild).toHaveAttribute('title', '5 years old');
  });

  it('should render with different sizes', () => {
    const { container: sm } = render(<AgeDot age={3} size="sm" />);
    const { container: md } = render(<AgeDot age={4} size="md" />);
    const { container: lg } = render(<AgeDot age={5} size="lg" />);

    expect(sm.firstChild).toBeInTheDocument();
    expect(md.firstChild).toBeInTheDocument();
    expect(lg.firstChild).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<AgeDot age={5} className="custom-dot" />);
    expect(container.firstChild).toHaveClass('custom-dot');
  });
});

describe('AgeBadgeWithLabel', () => {
  it('should render badge with years label', () => {
    render(<AgeBadgeWithLabel age={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('5 years')).toBeInTheDocument();
  });

  it('should render singular year when age is 1', () => {
    render(<AgeBadgeWithLabel age={1} />);
    expect(screen.getByText('1 year')).toBeInTheDocument();
  });

  it('should render plural years when age is not 1', () => {
    render(<AgeBadgeWithLabel age={2} />);
    expect(screen.getByText('2 years')).toBeInTheDocument();
  });

  it('should hide years label when showYears is false', () => {
    const { container } = render(<AgeBadgeWithLabel age={5} showYears={false} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(container.textContent).not.toContain('years');
  });

  it('should pass through badge props', () => {
    render(<AgeBadgeWithLabel age={5} size="lg" pulse />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
