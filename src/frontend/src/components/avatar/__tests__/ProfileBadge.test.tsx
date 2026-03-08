import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileBadge, CompactProfileBadge } from '../ProfileBadge';
import type { Profile } from '../../../store';

// Mock the KenneyAvatar component
vi.mock('../KenneyAvatar', () => ({
  AvatarWithBadge: ({ fallbackName, age, size, showAnimation }: { 
    fallbackName: string; 
    age?: number; 
    size: string;
    showAnimation?: boolean;
  }) => (
    <div data-testid="avatar-with-badge" data-size={size} data-animation={showAnimation}>
      {fallbackName} {age && `- Age: ${age}`}
    </div>
  ),
}));

// Mock confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: mockConfirm,
});

describe('ProfileBadge', () => {
  const mockProfile: Profile = {
    id: 'test-profile-1',
    name: 'Test Child',
    age: 5,
    preferred_language: 'en',
    settings: {
      avatar_config: {
        skinTone: 'light',
        hairStyle: 'short',
        hairColor: 'brown',
        outfit: 'casual',
        accessory: 'none',
      },
    },
  };

  const mockProfileNoAvatar: Profile = {
    id: 'test-profile-2',
    name: 'No Avatar',
    age: 7,
    preferred_language: 'hi',
    settings: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('renders profile name', () => {
      render(<ProfileBadge profile={mockProfile} />);
      
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('renders avatar with badge component', () => {
      render(<ProfileBadge profile={mockProfile} />);
      
      expect(screen.getByTestId('avatar-with-badge')).toBeInTheDocument();
    });

    it('passes profile name to avatar', () => {
      render(<ProfileBadge profile={mockProfile} />);
      
      expect(screen.getByTestId('avatar-with-badge')).toHaveTextContent('Test Child');
    });

    it('passes age to avatar when showAge is true', () => {
      render(<ProfileBadge profile={mockProfile} showAge={true} />);
      
      expect(screen.getByTestId('avatar-with-badge')).toHaveTextContent('Age: 5');
    });

    it('does not show age when showAge is false', () => {
      render(<ProfileBadge profile={mockProfile} showAge={false} />);
      
      expect(screen.getByTestId('avatar-with-badge')).not.toHaveTextContent('Age:');
    });

    it('shows language indicator', () => {
      render(<ProfileBadge profile={mockProfile} />);
      
      // Check for the language text (component uses uppercase class)
      const languageEl = screen.getByText('en');
      expect(languageEl).toBeInTheDocument();
      expect(languageEl.classList.contains('uppercase')).toBe(true);
    });

    it('shows language in uppercase', () => {
      render(<ProfileBadge profile={mockProfileNoAvatar} />);
      
      const languageEl = screen.getByText('hi');
      expect(languageEl).toBeInTheDocument();
      expect(languageEl.classList.contains('uppercase')).toBe(true);
    });

    it('handles profile without avatar config', () => {
      render(<ProfileBadge profile={mockProfileNoAvatar} />);
      
      expect(screen.getByText('No Avatar')).toBeInTheDocument();
      expect(screen.getByTestId('avatar-with-badge')).toBeInTheDocument();
    });
  });

  describe('size variations', () => {
    it('renders with small size', () => {
      render(<ProfileBadge profile={mockProfile} size="sm" />);
      
      const avatar = screen.getByTestId('avatar-with-badge');
      expect(avatar).toHaveAttribute('data-size', 'sm');
    });

    it('renders with medium size (default)', () => {
      render(<ProfileBadge profile={mockProfile} size="md" />);
      
      const avatar = screen.getByTestId('avatar-with-badge');
      expect(avatar).toHaveAttribute('data-size', 'md');
    });

    it('renders with large size', () => {
      render(<ProfileBadge profile={mockProfile} size="lg" />);
      
      const avatar = screen.getByTestId('avatar-with-badge');
      expect(avatar).toHaveAttribute('data-size', 'lg');
    });

    it('applies small text classes for sm size', () => {
      render(<ProfileBadge profile={mockProfile} size="sm" />);
      
      const name = screen.getByText('Test Child');
      expect(name.classList.contains('text-xs')).toBe(true);
    });

    it('applies medium text classes for md size', () => {
      render(<ProfileBadge profile={mockProfile} size="md" />);
      
      const name = screen.getByText('Test Child');
      expect(name.classList.contains('text-sm')).toBe(true);
    });

    it('applies large text classes for lg size', () => {
      render(<ProfileBadge profile={mockProfile} size="lg" />);
      
      const name = screen.getByText('Test Child');
      expect(name.classList.contains('text-base')).toBe(true);
    });
  });

  describe('selection state', () => {
    it('shows selected styling when isSelected is true', () => {
      render(<ProfileBadge profile={mockProfile} isSelected={true} />);
      
      const button = screen.getByRole('button');
      expect(button.classList.contains('bg-blue-100')).toBe(true);
      expect(button.classList.contains('ring-2')).toBe(true);
      expect(button.classList.contains('ring-blue-500')).toBe(true);
    });

    it('shows unselected styling when isSelected is false', () => {
      render(<ProfileBadge profile={mockProfile} isSelected={false} />);
      
      const button = screen.getByRole('button');
      expect(button.classList.contains('bg-white')).toBe(true);
    });

    it('shows selection indicator when selected', () => {
      render(<ProfileBadge profile={mockProfile} isSelected={true} />);
      
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('does not show selection indicator when not selected', () => {
      render(<ProfileBadge profile={mockProfile} isSelected={false} />);
      
      expect(screen.queryByText('✓')).not.toBeInTheDocument();
    });
  });

  describe('click interactions', () => {
    it('calls onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<ProfileBadge profile={mockProfile} onClick={handleClick} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not throw if onClick not provided', () => {
      render(<ProfileBadge profile={mockProfile} />);
      
      expect(() => {
        fireEvent.click(screen.getByRole('button'));
      }).not.toThrow();
    });
  });

  describe('edit menu', () => {
    it('shows edit menu on context menu', () => {
      render(<ProfileBadge profile={mockProfile} showEditMenu={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.contextMenu(button);
      
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('does not show edit menu when showEditMenu is false', () => {
      render(<ProfileBadge profile={mockProfile} showEditMenu={false} />);
      
      const button = screen.getByRole('button');
      fireEvent.contextMenu(button);
      
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });

    it('closes menu when backdrop is clicked', async () => {
      render(<ProfileBadge profile={mockProfile} showEditMenu={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.contextMenu(button);
      
      // Wait for menu to appear
      await waitFor(() => {
        expect(screen.getByText('Delete')).toBeInTheDocument();
      });
      
      // Click backdrop
      const backdrop = document.querySelector('.fixed.inset-0');
      if (backdrop) {
        fireEvent.click(backdrop);
      }
      
      // Check that Delete is gone (Edit might still appear elsewhere)
      await waitFor(() => {
        expect(screen.queryByText('Delete')).not.toBeInTheDocument();
      });
    });

    it('calls onEdit when edit button clicked', () => {
      const handleEdit = vi.fn();
      render(<ProfileBadge profile={mockProfile} onEdit={handleEdit} showEditMenu={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.contextMenu(button);
      
      // Use getAllByText and find the one in the menu
      const editButtons = screen.getAllByText('Edit');
      const menuEditButton = editButtons.find(el => el.closest('button')?.querySelector('svg'));
      expect(menuEditButton).toBeDefined();
      if (menuEditButton) {
        fireEvent.click(menuEditButton);
      }
      
      expect(handleEdit).toHaveBeenCalledTimes(1);
    });

    it('closes menu after edit', async () => {
      const handleEdit = vi.fn();
      render(<ProfileBadge profile={mockProfile} onEdit={handleEdit} showEditMenu={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.contextMenu(button);
      
      // Wait for menu to appear
      await waitFor(() => {
        expect(screen.getByText('Delete')).toBeInTheDocument();
      });
      
      // Use getAllByText and find the one in the menu
      const editButtons = screen.getAllByText('Edit');
      const menuEditButton = editButtons.find(el => el.closest('button')?.classList.contains('hover:bg-slate-50'));
      expect(menuEditButton).toBeDefined();
      if (menuEditButton) {
        fireEvent.click(menuEditButton);
      }
      
      // After closing, the menu Delete button should be gone
      await waitFor(() => {
        expect(screen.queryByText('Delete')).not.toBeInTheDocument();
      });
    });

    it('confirms before delete', () => {
      mockConfirm.mockReturnValue(true);
      const handleDelete = vi.fn();
      render(<ProfileBadge profile={mockProfile} onDelete={handleDelete} showEditMenu={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.contextMenu(button);
      
      // Find the delete button in the menu (it has the Trash2 icon)
      const deleteButtons = screen.getAllByText('Delete');
      const menuDeleteButton = deleteButtons.find(el => el.closest('button')?.querySelector('svg'));
      expect(menuDeleteButton).toBeDefined();
      if (menuDeleteButton) {
        fireEvent.click(menuDeleteButton);
      }
      
      expect(mockConfirm).toHaveBeenCalledWith("Are you sure you want to delete Test Child's profile?");
    });

    it('calls onDelete when delete confirmed', () => {
      mockConfirm.mockReturnValue(true);
      const handleDelete = vi.fn();
      render(<ProfileBadge profile={mockProfile} onDelete={handleDelete} showEditMenu={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.contextMenu(button);
      
      // Find the delete button in the menu
      const deleteButtons = screen.getAllByText('Delete');
      const menuDeleteButton = deleteButtons.find(el => el.closest('button')?.querySelector('svg'));
      expect(menuDeleteButton).toBeDefined();
      if (menuDeleteButton) {
        fireEvent.click(menuDeleteButton);
      }
      
      expect(handleDelete).toHaveBeenCalledTimes(1);
    });

    it('does not call onDelete when delete cancelled', () => {
      mockConfirm.mockReturnValue(false);
      const handleDelete = vi.fn();
      render(<ProfileBadge profile={mockProfile} onDelete={handleDelete} showEditMenu={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.contextMenu(button);
      
      // Find the delete button in the menu
      const deleteButtons = screen.getAllByText('Delete');
      const menuDeleteButton = deleteButtons.find(el => el.closest('button')?.querySelector('svg'));
      expect(menuDeleteButton).toBeDefined();
      if (menuDeleteButton) {
        fireEvent.click(menuDeleteButton);
      }
      
      expect(handleDelete).not.toHaveBeenCalled();
    });

    it('delete button has red styling', () => {
      render(<ProfileBadge profile={mockProfile} showEditMenu={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.contextMenu(button);
      
      // Find the delete button in the menu
      const deleteButtons = screen.getAllByText('Delete');
      const menuDeleteButton = deleteButtons.find(el => el.closest('button')?.querySelector('svg'));
      expect(menuDeleteButton).toBeDefined();
      
      const deleteButton = menuDeleteButton?.closest('button');
      expect(deleteButton?.classList.contains('text-red-600')).toBe(true);
    });
  });

  describe('animation', () => {
    it('passes showAnimation to avatar when selected', () => {
      render(<ProfileBadge profile={mockProfile} isSelected={true} />);
      
      const avatar = screen.getByTestId('avatar-with-badge');
      expect(avatar).toHaveAttribute('data-animation', 'true');
    });

    it('does not pass showAnimation to avatar when not selected', () => {
      render(<ProfileBadge profile={mockProfile} isSelected={false} />);
      
      const avatar = screen.getByTestId('avatar-with-badge');
      expect(avatar).toHaveAttribute('data-animation', 'false');
    });
  });

  describe('layout structure', () => {
    it('has flex column layout', () => {
      render(<ProfileBadge profile={mockProfile} />);
      
      const button = screen.getByRole('button');
      expect(button.classList.contains('flex')).toBe(true);
      expect(button.classList.contains('flex-col')).toBe(true);
      expect(button.classList.contains('items-center')).toBe(true);
    });

    it('has rounded corners', () => {
      render(<ProfileBadge profile={mockProfile} />);
      
      const button = screen.getByRole('button');
      expect(button.classList.contains('rounded-xl')).toBe(true);
    });

    it('name has truncate and max-width', () => {
      render(<ProfileBadge profile={mockProfile} />);
      
      const name = screen.getByText('Test Child');
      expect(name.classList.contains('truncate')).toBe(true);
      expect(name.classList.contains('max-w-[80px]')).toBe(true);
    });
  });
});

describe('CompactProfileBadge', () => {
  const mockProfile: Profile = {
    id: 'compact-profile',
    name: 'Compact Child',
    age: 4,
    preferred_language: 'en',
    settings: {},
  };

  describe('basic rendering', () => {
    it('renders profile name', () => {
      render(<CompactProfileBadge profile={mockProfile} />);
      
      expect(screen.getByText('Compact Child')).toBeInTheDocument();
    });

    it('renders avatar with badge', () => {
      render(<CompactProfileBadge profile={mockProfile} />);
      
      expect(screen.getByTestId('avatar-with-badge')).toBeInTheDocument();
    });

    it('always shows age on compact badge', () => {
      render(<CompactProfileBadge profile={mockProfile} />);
      
      expect(screen.getByTestId('avatar-with-badge')).toHaveTextContent('Age: 4');
    });
  });

  describe('size', () => {
    it('uses small size for avatar', () => {
      render(<CompactProfileBadge profile={mockProfile} />);
      
      const avatar = screen.getByTestId('avatar-with-badge');
      expect(avatar).toHaveAttribute('data-size', 'sm');
    });
  });

  describe('selection state', () => {
    it('shows selected styling when isSelected is true', () => {
      render(<CompactProfileBadge profile={mockProfile} isSelected={true} />);
      
      const button = screen.getByRole('button');
      expect(button.classList.contains('bg-blue-500')).toBe(true);
      expect(button.classList.contains('text-white')).toBe(true);
    });

    it('shows unselected styling when isSelected is false', () => {
      render(<CompactProfileBadge profile={mockProfile} isSelected={false} />);
      
      const button = screen.getByRole('button');
      expect(button.classList.contains('bg-white')).toBe(true);
      expect(button.classList.contains('text-slate-600')).toBe(true);
    });
  });

  describe('click interactions', () => {
    it('calls onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<CompactProfileBadge profile={mockProfile} onClick={handleClick} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('layout structure', () => {
    it('has inline-flex layout', () => {
      render(<CompactProfileBadge profile={mockProfile} />);
      
      const button = screen.getByRole('button');
      expect(button.classList.contains('inline-flex')).toBe(true);
    });

    it('has rounded-full shape', () => {
      render(<CompactProfileBadge profile={mockProfile} />);
      
      const button = screen.getByRole('button');
      expect(button.classList.contains('rounded-full')).toBe(true);
    });

    it('name has truncate and max-width', () => {
      render(<CompactProfileBadge profile={mockProfile} />);
      
      const name = screen.getByText('Compact Child');
      expect(name.classList.contains('truncate')).toBe(true);
      expect(name.classList.contains('max-w-[80px]')).toBe(true);
    });
  });
});
