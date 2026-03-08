import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Tooltip, HelpTooltip } from '../Tooltip';

describe('Tooltip', () => {
  describe('basic rendering', () => {
    it('renders children without tooltip initially', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );
      
      expect(screen.getByText('Hover me')).toBeInTheDocument();
      expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
    });

    it('renders with custom content', () => {
      render(
        <Tooltip content="Custom tooltip content">
          <span>Target</span>
        </Tooltip>
      );
      
      expect(screen.getByText('Target')).toBeInTheDocument();
    });

    it('has relative positioning on container', () => {
      render(
        <Tooltip content="Test">
          <button>Button</button>
        </Tooltip>
      );
      
      const container = document.querySelector('.relative');
      expect(container).toBeInTheDocument();
    });

    it('uses inline-flex display', () => {
      render(
        <Tooltip content="Test">
          <button>Button</button>
        </Tooltip>
      );
      
      const container = document.querySelector('.inline-flex');
      expect(container).toBeInTheDocument();
    });
  });

  describe('mouse interactions', () => {
    it('shows tooltip after delay on mouse enter', async () => {
      render(
        <Tooltip content="Delayed tooltip" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      );
      
      const button = screen.getByText('Hover me');
      fireEvent.mouseEnter(button);
      
      // Wait for tooltip to appear
      await waitFor(() => {
        expect(screen.getByText('Delayed tooltip')).toBeInTheDocument();
      });
    });

    it('hides tooltip on mouse leave', async () => {
      render(
        <Tooltip content="Tooltip text" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      );
      
      const button = screen.getByText('Hover me');
      
      // Show tooltip
      fireEvent.mouseEnter(button);
      await waitFor(() => {
        expect(screen.getByText('Tooltip text')).toBeInTheDocument();
      });
      
      // Hide tooltip
      fireEvent.mouseLeave(button);
      
      await waitFor(() => {
        expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
      });
    });

    it('clears timeout on mouse leave before delay completes', async () => {
      render(
        <Tooltip content="Tooltip text" delay={1}>
          <button>Hover me</button>
        </Tooltip>
      );
      
      const button = screen.getByText('Hover me');
      fireEvent.mouseEnter(button);
      
      // Leave immediately before delay completes
      fireEvent.mouseLeave(button);
      
      // Wait a bit and verify tooltip doesn't appear
      await new Promise(r => setTimeout(r, 100));
      
      expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
    });
  });

  describe('keyboard/focus interactions', () => {
    it('shows tooltip on focus', async () => {
      render(
        <Tooltip content="Focus tooltip" delay={0}>
          <button>Focusable</button>
        </Tooltip>
      );
      
      const button = screen.getByText('Focusable');
      fireEvent.focus(button);
      
      await waitFor(() => {
        expect(screen.getByText('Focus tooltip')).toBeInTheDocument();
      });
    });

    it('hides tooltip on blur', async () => {
      render(
        <Tooltip content="Blur tooltip" delay={0}>
          <button>Focusable</button>
        </Tooltip>
      );
      
      const button = screen.getByText('Focusable');
      fireEvent.focus(button);
      await waitFor(() => {
        expect(screen.getByText('Blur tooltip')).toBeInTheDocument();
      });
      
      fireEvent.blur(button);
      
      await waitFor(() => {
        expect(screen.queryByText('Blur tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('position variations', () => {
    it('renders tooltip at top position', async () => {
      render(
        <Tooltip content="Top tooltip" position="top" delay={0}>
          <button>Button</button>
        </Tooltip>
      );

      const button = screen.getByText('Button');
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        expect(screen.getByText('Top tooltip')).toBeInTheDocument();
      });
    });

    it('renders tooltip at bottom position', async () => {
      render(
        <Tooltip content="Bottom tooltip" position="bottom" delay={0}>
          <button>Button</button>
        </Tooltip>
      );

      const button = screen.getByText('Button');
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        expect(screen.getByText('Bottom tooltip')).toBeInTheDocument();
      });
    });

    it('renders tooltip at left position', async () => {
      render(
        <Tooltip content="Left tooltip" position="left" delay={0}>
          <button>Button</button>
        </Tooltip>
      );

      const button = screen.getByText('Button');
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        expect(screen.getByText('Left tooltip')).toBeInTheDocument();
      });
    });

    it('renders tooltip at right position', async () => {
      render(
        <Tooltip content="Right tooltip" position="right" delay={0}>
          <button>Button</button>
        </Tooltip>
      );

      const button = screen.getByText('Button');
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        expect(screen.getByText('Right tooltip')).toBeInTheDocument();
      });
    });
  });

  describe('edge cases', () => {
    it('handles rapid mouse enter/leave', async () => {
      render(
        <Tooltip content="Rapid" delay={0}>
          <button>Button</button>
        </Tooltip>
      );

      const button = screen.getByText('Button');

      // Rapid interactions
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        expect(screen.getByText('Rapid')).toBeInTheDocument();
      });
    });
  });
});

describe('HelpTooltip', () => {
  it('renders question mark icon', () => {
    render(<HelpTooltip content="Help text" />);

    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('wraps icon in Tooltip', async () => {
    render(<HelpTooltip content="Help information" />);

    const icon = screen.getByText('?');
    fireEvent.mouseEnter(icon);

    await waitFor(() => {
      expect(screen.getByText('Help information')).toBeInTheDocument();
    });
  });

  it('has correct styling for help icon', () => {
    render(<HelpTooltip content="Help" />);

    const icon = screen.getByText('?');
    expect(icon.classList.contains('rounded-full')).toBe(true);
    expect(icon.classList.contains('bg-white/10')).toBe(true);
    expect(icon.classList.contains('text-white/60')).toBe(true);
  });

  it('has cursor-help class', () => {
    render(<HelpTooltip content="Help" />);

    const icon = screen.getByText('?');
    expect(icon.classList.contains('cursor-help')).toBe(true);
  });

  it('has hover styles', () => {
    render(<HelpTooltip content="Help" />);

    const icon = screen.getByText('?');
    expect(icon.classList.contains('hover:bg-white/20')).toBe(true);
    expect(icon.classList.contains('hover:text-white/80')).toBe(true);
  });
});
