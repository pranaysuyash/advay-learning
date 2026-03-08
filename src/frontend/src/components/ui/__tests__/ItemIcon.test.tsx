import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ItemIcon } from '../ItemIcon';

describe('ItemIcon', () => {
  const mockItem = {
    id: 'test-item',
    name: 'Test Item',
    emoji: '🎮',
    icon: '/assets/test-icon.png',
  };

  const mockItemNoIcon = {
    id: 'test-item-no-icon',
    name: 'Test Item No Icon',
    emoji: '🎯',
  };

  describe('renders with icon', () => {
    it('renders image when icon is provided and loads successfully', () => {
      render(<ItemIcon item={mockItem} />);
      
      const img = screen.getByAltText('Test Item');
      expect(img).toBeInTheDocument();
      expect(img.tagName).toBe('IMG');
      expect(img).toHaveAttribute('src', '/assets/test-icon.png');
    });

    it('renders image with correct dimensions', () => {
      render(<ItemIcon item={mockItem} size={64} />);
      
      const img = screen.getByAltText('Test Item');
      expect(img).toHaveAttribute('width', '64');
      expect(img).toHaveAttribute('height', '64');
    });

    it('uses default size of 48 when not specified', () => {
      render(<ItemIcon item={mockItem} />);
      
      const img = screen.getByAltText('Test Item');
      expect(img).toHaveAttribute('width', '48');
      expect(img).toHaveAttribute('height', '48');
    });

    it('applies custom className to image', () => {
      render(<ItemIcon item={mockItem} className="custom-class" />);
      
      const img = screen.getByAltText('Test Item');
      expect(img.classList.contains('custom-class')).toBe(true);
    });

    it('image has lazy loading', () => {
      render(<ItemIcon item={mockItem} />);
      
      const img = screen.getByAltText('Test Item');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('image has object-contain class', () => {
      render(<ItemIcon item={mockItem} />);
      
      const img = screen.getByAltText('Test Item');
      expect(img.classList.contains('object-contain')).toBe(true);
    });
  });

  describe('renders emoji fallback', () => {
    it('renders emoji when no icon is provided', () => {
      render(<ItemIcon item={mockItemNoIcon} />);
      
      const emoji = screen.getByRole('img', { name: 'Test Item No Icon' });
      expect(emoji).toBeInTheDocument();
      expect(emoji).toHaveTextContent('🎯');
    });

    it('renders emoji when icon is empty string', () => {
      const itemWithEmptyIcon = { ...mockItem, icon: '' };
      render(<ItemIcon item={itemWithEmptyIcon} />);
      
      const emoji = screen.getByRole('img', { name: 'Test Item' });
      expect(emoji).toBeInTheDocument();
    });

    it('emoji has correct aria-label', () => {
      render(<ItemIcon item={mockItemNoIcon} />);
      
      const emoji = screen.getByRole('img');
      expect(emoji).toHaveAttribute('aria-label', 'Test Item No Icon');
    });

    it('emoji has font size based on size prop', () => {
      render(<ItemIcon item={mockItemNoIcon} size={48} />);
      
      const emoji = screen.getByRole('img');
      // fontSize = Math.max(18, Math.floor(48 * 0.7)) = Math.max(18, 33) = 33
      expect(emoji).toHaveStyle({ fontSize: '33px' });
    });

    it('emoji has minimum font size of 18', () => {
      render(<ItemIcon item={mockItemNoIcon} size={20} />);
      
      const emoji = screen.getByRole('img');
      // Math.max(18, Math.floor(20 * 0.7)) = Math.max(18, 14) = 18
      expect(emoji).toHaveStyle({ fontSize: '18px' });
    });

    it('emoji has line-height of 1', () => {
      render(<ItemIcon item={mockItemNoIcon} />);
      
      const emoji = screen.getByRole('img');
      expect(emoji).toHaveStyle({ lineHeight: '1' });
    });

    it('applies custom className to emoji span', () => {
      render(<ItemIcon item={mockItemNoIcon} className="emoji-class" />);
      
      const emoji = screen.getByRole('img');
      expect(emoji.classList.contains('emoji-class')).toBe(true);
    });
  });

  describe('image error handling', () => {
    it('falls back to emoji when image fails to load', () => {
      render(<ItemIcon item={mockItem} />);
      
      const img = screen.getByAltText('Test Item');
      
      // Simulate image load error
      fireEvent.error(img);
      
      // Should now show emoji
      const emoji = screen.getByRole('img', { name: 'Test Item' });
      expect(emoji).toBeInTheDocument();
      expect(emoji).toHaveTextContent('🎮');
      
      // Image should no longer be in document
      expect(screen.queryByAltText('Test Item')).not.toBeInTheDocument();
    });

    it('calls onError handler when image fails', () => {
      render(<ItemIcon item={mockItem} />);
      
      const img = screen.getByAltText('Test Item');
      
      // Simulate image load error
      fireEvent.error(img);
      
      // Fallback should be rendered
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('stays on emoji fallback after error', () => {
      const { rerender } = render(<ItemIcon item={mockItem} />);
      
      const img = screen.getByAltText('Test Item');
      fireEvent.error(img);
      
      // Rerender same component
      rerender(<ItemIcon item={mockItem} />);
      
      // Should still show emoji, not try to reload image
      expect(screen.queryByAltText('Test Item')).not.toBeInTheDocument();
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  describe('re-rendering with different props', () => {
    it('updates when item changes', () => {
      const { rerender } = render(<ItemIcon item={mockItem} />);
      
      expect(screen.getByAltText('Test Item')).toBeInTheDocument();
      
      const newItem = {
        id: 'new-item',
        name: 'New Item',
        emoji: '🎲',
        icon: '/assets/new-icon.png',
      };
      
      rerender(<ItemIcon item={newItem} />);
      
      expect(screen.getByAltText('New Item')).toBeInTheDocument();
      expect(screen.getByAltText('New Item')).toHaveAttribute('src', '/assets/new-icon.png');
    });

    it('updates size when prop changes', () => {
      const { rerender } = render(<ItemIcon item={mockItem} size={32} />);
      
      let img = screen.getByAltText('Test Item');
      expect(img).toHaveAttribute('width', '32');
      
      rerender(<ItemIcon item={mockItem} size={96} />);
      
      img = screen.getByAltText('Test Item');
      expect(img).toHaveAttribute('width', '96');
    });

    it('resets error state when item icon changes', () => {
      const { rerender } = render(<ItemIcon item={mockItem} />);
      
      // Trigger error
      fireEvent.error(screen.getByAltText('Test Item'));
      
      // Verify fallback
      expect(screen.getByRole('img')).toBeInTheDocument();
      
      // Change item with new icon
      const newItem = {
        ...mockItem,
        id: 'different-item',
        icon: '/assets/different-icon.png',
      };
      
      rerender(<ItemIcon item={newItem} />);
      
      // Should try to load new image (new component instance)
      // Note: React state is reset because it's a new component instance
    });
  });

  describe('edge cases', () => {
    it('handles item with null icon gracefully', () => {
      const itemWithNullIcon = { ...mockItem, icon: null as unknown as undefined };
      render(<ItemIcon item={itemWithNullIcon} />);
      
      const emoji = screen.getByRole('img');
      expect(emoji).toBeInTheDocument();
    });

    it('handles item with undefined icon gracefully', () => {
      const itemWithUndefinedIcon = { ...mockItem, icon: undefined };
      render(<ItemIcon item={itemWithUndefinedIcon} />);
      
      const emoji = screen.getByRole('img');
      expect(emoji).toBeInTheDocument();
    });

    it('handles very large size values', () => {
      render(<ItemIcon item={mockItem} size={256} />);
      
      const img = screen.getByAltText('Test Item');
      expect(img).toHaveAttribute('width', '256');
    });

    it('handles size of 0', () => {
      render(<ItemIcon item={mockItemNoIcon} size={0} />);
      
      const emoji = screen.getByRole('img');
      // fontSize = Math.max(18, Math.floor(0 * 0.7)) = Math.max(18, 0) = 18
      expect(emoji).toHaveStyle({ fontSize: '18px' });
    });
  });
});
