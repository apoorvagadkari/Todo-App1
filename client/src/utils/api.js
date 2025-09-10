import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Task API functions
export const taskAPI = {
  // Get all tasks
  getAllTasks: () => api.get('/tasks'),
  
  // Get single task
  getTask: (id) => api.get(`/tasks/${id}`),
  
  // Create new task
  createTask: (taskData) => api.post('/tasks', taskData),
  
  // Update task
  updateTask: (id, updates) => api.patch(`/tasks/${id}`, updates),
  
  // Delete task
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  
  // Get analytics
  getAnalytics: () => api.get('/tasks/analytics'),
};

export default api;
