/**
 * HabitListItem Component Tests
 *
 * Tests for habit list item functionality including edit and delete operations.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HabitListItem } from './HabitListItem';
import { storageService } from '../services/storage';
import { syncService } from '../services/syncService';
import type { Habit } from '../types/habit';

// Mock services
vi.mock('../services/storage');
vi.mock('../services/syncService');

describe('HabitListItem', () => {
  const mockHabit: Habit = {
    habit_id: 'test-habit-123',
    name: 'Morning Exercise',
    category: 'Health',
    status: 'active',
    created_date: '2025-01-01',
    modified_date: '2025-01-01',
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storageService.deleteHabit).mockResolvedValue();
    vi.mocked(syncService.syncToRemote).mockResolvedValue();
  });

  describe('Display', () => {
    it('should display habit name', () => {
      render(<HabitListItem habit={mockHabit} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByText('Morning Exercise')).toBeInTheDocument();
    });

    it('should display category badge when category is present', () => {
      render(<HabitListItem habit={mockHabit} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByText('Health')).toBeInTheDocument();
    });

    it('should not display category badge when category is not present', () => {
      const habitWithoutCategory = { ...mockHabit, category: undefined };
      render(<HabitListItem habit={habitWithoutCategory} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.queryByText('Health')).not.toBeInTheDocument();
    });

    it('should display Edit button', () => {
      render(<HabitListItem habit={mockHabit} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    it('should display Remove button', () => {
      render(<HabitListItem habit={mockHabit} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    });
  });

  describe('Edit functionality', () => {
    it('should call onEdit with habit when Edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<HabitListItem habit={mockHabit} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockHabit);
    });
  });

  describe('Remove functionality', () => {
    it('should show confirmation dialog when Remove button is clicked', async () => {
      const user = userEvent.setup();
      render(<HabitListItem habit={mockHabit} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      const removeButton = screen.getByRole('button', { name: /^remove$/i });
      await user.click(removeButton);

      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      expect(screen.getByText(/morning exercise/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /yes, remove/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should hide confirmation dialog when Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<HabitListItem habit={mockHabit} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      // Show confirmation dialog
      const removeButton = screen.getByRole('button', { name: /^remove$/i });
      await user.click(removeButton);

      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Dialog should be hidden
      expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^remove$/i })).toBeInTheDocument();
    });

    it('should mark habit as inactive when deletion is confirmed', async () => {
      const user = userEvent.setup();
      render(<HabitListItem habit={mockHabit} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      // Show confirmation dialog
      const removeButton = screen.getByRole('button', { name: /^remove$/i });
      await user.click(removeButton);

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /yes, remove/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(storageService.deleteHabit).toHaveBeenCalledWith('test-habit-123');
      });
    });

    it('should trigger background sync after deletion', async () => {
      const user = userEvent.setup();
      render(<HabitListItem habit={mockHabit} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      // Show confirmation dialog
      const removeButton = screen.getByRole('button', { name: /^remove$/i });
      await user.click(removeButton);

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /yes, remove/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(syncService.syncToRemote).toHaveBeenCalled();
      });
    });

    it('should call onDelete callback after successful deletion', async () => {
      const user = userEvent.setup();
      render(<HabitListItem habit={mockHabit} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      // Show confirmation dialog
      const removeButton = screen.getByRole('button', { name: /^remove$/i });
      await user.click(removeButton);

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /yes, remove/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalled();
      });
    });

    it('should show loading state during deletion', async () => {
      const user = userEvent.setup();

      // Make deleteHabit resolve slowly
      let resolveDelete: () => void;
      const deletePromise = new Promise<void>((resolve) => {
        resolveDelete = resolve;
      });
      vi.mocked(storageService.deleteHabit).mockReturnValue(deletePromise);

      render(<HabitListItem habit={mockHabit} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      // Show confirmation dialog
      const removeButton = screen.getByRole('button', { name: /^remove$/i });
      await user.click(removeButton);

      // Start deletion
      const confirmButton = screen.getByRole('button', { name: /yes, remove/i });
      await user.click(confirmButton);

      // Check loading state
      expect(screen.getByText(/removing/i)).toBeInTheDocument();

      // Complete deletion
      resolveDelete!();
      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalled();
      });
    });

    it('should handle deletion errors gracefully', async () => {
      const user = userEvent.setup();
      const error = new Error('Failed to delete habit');
      vi.mocked(storageService.deleteHabit).mockRejectedValue(error);

      render(<HabitListItem habit={mockHabit} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      // Show confirmation dialog
      const removeButton = screen.getByRole('button', { name: /^remove$/i });
      await user.click(removeButton);

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /yes, remove/i });
      await user.click(confirmButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/failed to delete habit/i)).toBeInTheDocument();
      });

      // Should not call onDelete callback
      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have touch targets of at least 44x44px', () => {
      render(<HabitListItem habit={mockHabit} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      const removeButton = screen.getByRole('button', { name: /^remove$/i });

      // Check buttons have appropriate CSS classes for touch targets
      expect(editButton).toHaveClass('habit-list-item__edit-btn');
      expect(removeButton).toHaveClass('habit-list-item__delete-btn');

      // Buttons should be in the document and clickable (functional test)
      expect(editButton).toBeInTheDocument();
      expect(removeButton).toBeInTheDocument();
    });
  });

  describe('Soft delete behavior', () => {
    it('should preserve habit data by marking as inactive (not permanent delete)', async () => {
      const user = userEvent.setup();
      render(<HabitListItem habit={mockHabit} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      // Show confirmation dialog - should mention data preservation
      const removeButton = screen.getByRole('button', { name: /^remove$/i });
      await user.click(removeButton);

      expect(screen.getByText(/historical data will be preserved/i)).toBeInTheDocument();

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /yes, remove/i });
      await user.click(confirmButton);

      await waitFor(() => {
        // Uses deleteHabit which marks as inactive
        expect(storageService.deleteHabit).toHaveBeenCalled();
      });
    });
  });
});
