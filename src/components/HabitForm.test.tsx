/**
 * HabitForm Component Tests
 *
 * Tests for habit form functionality including validation, adding, and editing.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HabitForm } from './HabitForm';
import { storageService } from '../services/storage';
import { syncService } from '../services/syncService';
import { demoModeService } from '../services/demoMode';
import type { Habit } from '../types/habit';

// Mock services
vi.mock('../services/storage');
vi.mock('../services/syncService');
vi.mock('../services/demoMode', () => ({
  demoModeService: {
    isDemoMode: vi.fn(),
  },
}));
vi.mock('../utils/uuid', () => ({
  generateUUID: () => 'test-uuid-123',
}));

describe('HabitForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock storage to return no existing habits (for duplicate check)
    vi.mocked(storageService.getHabits).mockResolvedValue([]);
    vi.mocked(storageService.saveHabit).mockResolvedValue();
    vi.mocked(syncService.syncToRemote).mockResolvedValue();
    // Default: user is authenticated (NOT in demo mode)
    vi.mocked(demoModeService.isDemoMode).mockReturnValue(false);
  });

  describe('Adding a new habit', () => {
    it('should render form fields', () => {
      render(<HabitForm />);

      expect(screen.getByLabelText(/habit name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add habit/i })).toBeInTheDocument();
    });

    it('should show character counter for habit name', () => {
      render(<HabitForm />);

      const counter = screen.getByText('0/100');
      expect(counter).toBeInTheDocument();
    });

    it('should update character counter as user types', async () => {
      const user = userEvent.setup();
      render(<HabitForm />);

      const nameInput = screen.getByLabelText(/habit name/i);
      await user.type(nameInput, 'Morning Exercise');

      expect(screen.getByText('16/100')).toBeInTheDocument();
    });

    it('should disable submit button when name is empty', () => {
      render(<HabitForm />);

      const submitButton = screen.getByRole('button', { name: /add habit/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when name is entered', async () => {
      const user = userEvent.setup();
      render(<HabitForm />);

      const nameInput = screen.getByLabelText(/habit name/i);
      await user.type(nameInput, 'Morning Exercise');

      const submitButton = screen.getByRole('button', { name: /add habit/i });
      expect(submitButton).toBeEnabled();
    });

    it('should add a new habit when form is submitted', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      render(<HabitForm onSuccess={onSuccess} />);

      // Fill in form
      const nameInput = screen.getByLabelText(/habit name/i);
      const categoryInput = screen.getByLabelText(/category/i);
      await user.type(nameInput, 'Morning Exercise');
      await user.type(categoryInput, 'Health');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /add habit/i });
      await user.click(submitButton);

      // Wait for async operations
      await waitFor(() => {
        expect(storageService.saveHabit).toHaveBeenCalledWith(
          expect.objectContaining({
            habit_id: 'test-uuid-123',
            name: 'Morning Exercise',
            category: 'Health',
            status: 'active',
          })
        );
      });

      expect(syncService.syncToRemote).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });

    it('should trim whitespace from inputs', async () => {
      const user = userEvent.setup();
      render(<HabitForm />);

      const nameInput = screen.getByLabelText(/habit name/i);
      await user.type(nameInput, '  Morning Exercise  ');

      const submitButton = screen.getByRole('button', { name: /add habit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(storageService.saveHabit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Morning Exercise',
          })
        );
      });
    });

    it('should clear form after successful submission', async () => {
      const user = userEvent.setup();
      render(<HabitForm />);

      const nameInput = screen.getByLabelText(/habit name/i) as HTMLInputElement;
      const categoryInput = screen.getByLabelText(/category/i) as HTMLInputElement;

      await user.type(nameInput, 'Morning Exercise');
      await user.type(categoryInput, 'Health');

      const submitButton = screen.getByRole('button', { name: /add habit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(nameInput.value).toBe('');
        expect(categoryInput.value).toBe('');
      });
    });
  });

  describe('Validation', () => {
    it('should disable submit button for empty habit name', async () => {
      const user = userEvent.setup();
      render(<HabitForm />);

      const nameInput = screen.getByLabelText(/habit name/i);
      await user.type(nameInput, '   ');

      const submitButton = screen.getByRole('button', { name: /add habit/i });
      // Button should be disabled when name is only whitespace
      expect(submitButton).toBeDisabled();
    });

    it('should prevent typing more than 100 characters in habit name', async () => {
      const user = userEvent.setup();
      render(<HabitForm />);

      const nameInput = screen.getByLabelText(/habit name/i) as HTMLInputElement;
      const longName = 'a'.repeat(101);
      await user.type(nameInput, longName);

      // Input should stop at 100 characters due to maxLength attribute
      expect(nameInput.value).toHaveLength(100);
      expect(screen.getByText('100/100')).toBeInTheDocument();
    });

    it('should show error for duplicate habit name (case-insensitive)', async () => {
      const user = userEvent.setup();

      // Mock existing habit
      const existingHabit: Habit = {
        habit_id: 'existing-id',
        name: 'Morning Exercise',
        status: 'active',
        created_date: '2025-01-01',
        modified_date: '2025-01-01',
      };
      vi.mocked(storageService.getHabits).mockResolvedValue([existingHabit]);

      render(<HabitForm />);

      const nameInput = screen.getByLabelText(/habit name/i);
      await user.type(nameInput, 'morning exercise'); // Different case

      const submitButton = screen.getByRole('button', { name: /add habit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/habit with this name already exists/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should prevent typing more than 50 characters in category', async () => {
      const user = userEvent.setup();
      render(<HabitForm />);

      const categoryInput = screen.getByLabelText(/category/i) as HTMLInputElement;
      const longCategory = 'a'.repeat(51);
      await user.type(categoryInput, longCategory);

      // Input should stop at 50 characters due to maxLength attribute
      expect(categoryInput.value).toHaveLength(50);
    });

    it('should clear validation errors when user starts typing', async () => {
      const user = userEvent.setup();
      // Mock existing habit to trigger duplicate error
      const existingHabit: Habit = {
        habit_id: 'existing-id',
        name: 'Exercise',
        status: 'active',
        created_date: '2025-01-01',
        modified_date: '2025-01-01',
      };
      vi.mocked(storageService.getHabits).mockResolvedValue([existingHabit]);

      render(<HabitForm />);

      const nameInput = screen.getByLabelText(/habit name/i);

      // Trigger duplicate validation error
      await user.type(nameInput, 'Exercise');
      const submitButton = screen.getByRole('button', { name: /add habit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/habit with this name already exists/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Start typing again - error should clear
      await user.clear(nameInput);
      await user.type(nameInput, 'New');

      await waitFor(() => {
        expect(screen.queryByText(/habit with this name already exists/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Editing a habit', () => {
    const existingHabit: Habit = {
      habit_id: 'existing-id',
      name: 'Morning Exercise',
      category: 'Health',
      status: 'active',
      created_date: '2025-01-01',
      modified_date: '2025-01-01',
    };

    it('should populate form with existing habit data', () => {
      render(<HabitForm editingHabit={existingHabit} />);

      const nameInput = screen.getByLabelText(/habit name/i) as HTMLInputElement;
      const categoryInput = screen.getByLabelText(/category/i) as HTMLInputElement;

      expect(nameInput.value).toBe('Morning Exercise');
      expect(categoryInput.value).toBe('Health');
    });

    it('should show "Update Habit" button when editing', () => {
      render(<HabitForm editingHabit={existingHabit} />);

      expect(screen.getByRole('button', { name: /update habit/i })).toBeInTheDocument();
    });

    it('should show cancel button when editing', () => {
      render(<HabitForm editingHabit={existingHabit} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should update habit when form is submitted', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      render(<HabitForm editingHabit={existingHabit} onSuccess={onSuccess} />);

      const nameInput = screen.getByLabelText(/habit name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Evening Exercise');

      const submitButton = screen.getByRole('button', { name: /update habit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(storageService.saveHabit).toHaveBeenCalledWith(
          expect.objectContaining({
            habit_id: 'existing-id',
            name: 'Evening Exercise',
            category: 'Health',
            created_date: '2025-01-01', // Should preserve original date
          })
        );
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      render(<HabitForm editingHabit={existingHabit} onCancel={onCancel} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalled();
    });

    it('should allow editing to same name (exclude self from duplicate check)', async () => {
      const user = userEvent.setup();
      vi.mocked(storageService.getHabits).mockResolvedValue([existingHabit]);

      render(<HabitForm editingHabit={existingHabit} />);

      // Don't change the name
      const submitButton = screen.getByRole('button', { name: /update habit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(storageService.saveHabit).toHaveBeenCalled();
      });

      // Should not show duplicate error
      expect(screen.queryByText(/habit with this name already exists/i)).not.toBeInTheDocument();
    });
  });

  describe('ISO 8601 date format', () => {
    it('should set created_date and modified_date in ISO 8601 format (YYYY-MM-DD)', async () => {
      const user = userEvent.setup();
      render(<HabitForm />);

      const nameInput = screen.getByLabelText(/habit name/i);
      await user.type(nameInput, 'Test Habit');

      const submitButton = screen.getByRole('button', { name: /add habit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(storageService.saveHabit).toHaveBeenCalledWith(
          expect.objectContaining({
            created_date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
            modified_date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          })
        );
      });
    });
  });
});
