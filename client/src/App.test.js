import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import App from './App';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock API responses
const mockTasks = [
  {
    _id: '1',
    title: 'Test Task 1',
    description: 'Test Description 1',
    completed: false,
    priority: 'high',
    category: 'work',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '2', 
    title: 'Test Task 2',
    description: 'Test Description 2',
    completed: true,
    priority: 'medium',
    category: 'personal',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z'
  }
];

describe('App Component', () => {
  beforeEach(() => {
    // Mock axios.create to return an object with HTTP methods
    mockedAxios.create.mockReturnValue({
      get: mockedAxios.get,
      post: mockedAxios.post,
      patch: mockedAxios.patch,
      delete: mockedAxios.delete
    });
    
    // Default mock - empty tasks on initial load
    mockedAxios.get.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // FRONTEND TEST CASE 1: Add Task Functionality
  test('should add a new task when form is submitted', async () => {
    const newTask = {
      _id: '3',
      title: 'New Test Task',
      description: 'New Test Description',
      completed: false,
      priority: 'medium',
      category: 'general',
      createdAt: '2024-01-03T00:00:00.000Z',
      updatedAt: '2024-01-03T00:00:00.000Z'
    };

    // Mock successful task creation
    mockedAxios.post.mockResolvedValueOnce({ data: newTask });

    render(<App />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Add New Task')).toBeInTheDocument();
    });

    // Find and fill form elements
    const titleInput = screen.getByPlaceholderText('Task title...');
    const descriptionInput = screen.getByPlaceholderText('Task description (optional)...');
    const addButton = screen.getByText('Add Task');

    // Fill out the form
    fireEvent.change(titleInput, { target: { value: 'New Test Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Test Description' } });

    // Submit the form
    fireEvent.click(addButton);

    // Verify API was called correctly
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/tasks',
        expect.objectContaining({
          title: 'New Test Task',
          description: 'New Test Description'
        })
      );
    });

    // Verify form was reset (title should be empty)
    await waitFor(() => {
      expect(titleInput.value).toBe('');
    });
  }, 10000); // Increased timeout

  // FRONTEND TEST CASE 2: Task Status Update (Toggle Completion)
  test('should update task status when checkbox is clicked', async () => {
    const updatedTask = { ...mockTasks[0], completed: true };

    // Mock initial load with tasks and successful update
    mockedAxios.get.mockResolvedValueOnce({ data: mockTasks });
    mockedAxios.patch.mockResolvedValueOnce({ data: updatedTask });

    render(<App />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    // Find the first checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheckbox = checkboxes[0];
    
    // Initially should be unchecked (since mockTasks[0].completed = false)
    expect(firstCheckbox).not.toBeChecked();

    // Click the checkbox
    fireEvent.click(firstCheckbox);

    // Verify API was called to update the task
    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        '/tasks/1',
        expect.objectContaining({ completed: true })
      );
    });
  }, 10000); // Increased timeout

  // ADDITIONAL TEST: App Loads Successfully
  test('should render app header and navigation', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('🚀 Advanced Task Manager')).toBeInTheDocument();
      expect(screen.getByText('Stay organized and productive!')).toBeInTheDocument();
    });

    // Check navigation tabs exist
    expect(screen.getByText(/📝 Tasks/)).toBeInTheDocument();
    expect(screen.getByText('📊 Analytics')).toBeInTheDocument();
  });

  // ERROR HANDLING TEST
  test('should display error message when initial load fails', async () => {
    // Mock API failure
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    render(<App />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('⚠️ Connection Error')).toBeInTheDocument();
    });

    // Verify retry button exists
    expect(screen.getByText('🔄 Retry')).toBeInTheDocument();
  });

  // LOADING STATE TEST
  test('should show loading state initially', () => {
    // Mock a delayed response
    mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<App />);

    expect(screen.getByText('Loading your tasks...')).toBeInTheDocument();
  });
});
