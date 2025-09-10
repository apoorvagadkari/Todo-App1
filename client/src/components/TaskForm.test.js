import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskForm from './TaskForm';

describe('TaskForm Component', () => {
  const mockOnAddTask = jest.fn();

  beforeEach(() => {
    mockOnAddTask.mockClear();
    mockOnAddTask.mockResolvedValue({});
  });

  test('should render all form elements correctly', () => {
    render(<TaskForm onAddTask={mockOnAddTask} />);

    // Check all form elements exist
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Task title...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Task description (optional)...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Category...')).toBeInTheDocument();
    expect(screen.getByDisplayValue('medium')).toBeInTheDocument(); // Priority select
    expect(screen.getByText('Add Task')).toBeInTheDocument();
  });

  test('should disable submit button when title is empty', () => {
    render(<TaskForm onAddTask={mockOnAddTask} />);

    const submitButton = screen.getByText('Add Task');
    expect(submitButton).toBeDisabled();
  });

  test('should enable submit button when title has content', () => {
    render(<TaskForm onAddTask={mockOnAddTask} />);

    const titleInput = screen.getByPlaceholderText('Task title...');
    const submitButton = screen.getByText('Add Task');

    // Type in the title
    fireEvent.change(titleInput, { target: { value: 'Test Task Title' } });
    
    expect(submitButton).not.toBeDisabled();
  });

  test('should call onAddTask with correct data when form is submitted', async () => {
    render(<TaskForm onAddTask={mockOnAddTask} />);

    const titleInput = screen.getByPlaceholderText('Task title...');
    const descriptionInput = screen.getByPlaceholderText('Task description (optional)...');
    const categoryInput = screen.getByPlaceholderText('Category...');
    const submitButton = screen.getByText('Add Task');

    // Fill form
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.change(categoryInput, { target: { value: 'work' } });

    // Submit form
    fireEvent.click(submitButton);

    // Verify onAddTask was called with correct data
    await waitFor(() => {
      expect(mockOnAddTask).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium',
        category: 'work',
        dueDate: ''
      });
    });
  });

  test('should reset form after successful submission', async () => {
    render(<TaskForm onAddTask={mockOnAddTask} />);

    const titleInput = screen.getByPlaceholderText('Task title...');
    const descriptionInput = screen.getByPlaceholderText('Task description (optional)...');
    const submitButton = screen.getByText('Add Task');

    // Fill and submit form
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.click(submitButton);

    // Wait for form reset
    await waitFor(() => {
      expect(titleInput.value).toBe('');
      expect(descriptionInput.value).toBe('');
    });
  });
});
