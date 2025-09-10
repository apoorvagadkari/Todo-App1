import React, { useState, useEffect } from 'react';
import { taskAPI } from './utils/api';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import Analytics from './components/Analytics';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getAllTasks();
      setTasks(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Make sure your backend server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData) => {
    try {
      const response = await taskAPI.createTask(taskData);
      setTasks([response.data, ...tasks]);
      return response.data;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const response = await taskAPI.updateTask(id, updates);
      setTasks(tasks.map(task => task._id === id ? response.data : task));
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (id) => {
    try {
      await taskAPI.deleteTask(id);
      setTasks(tasks.filter(task => task._id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <div className="error-container">
          <h2>⚠️ Connection Error</h2>
          <p>{error}</p>
          <button onClick={fetchTasks} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>🚀 Advanced Task Manager</h1>
          <p>Stay organized and productive!</p>
        </div>
        
        <nav className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
             Tasks ({tasks.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
             Analytics
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'tasks' ? (
          <div className="tasks-section">
            <TaskForm onAddTask={addTask} />
            <TaskList 
              tasks={tasks} 
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
            />
          </div>
        ) : (
          <Analytics />
        )}
      </main>

      <footer className="app-footer">
        <p>Built by Apoorva Gadkarik</p>
      </footer>
    </div>
  );
}

export default App;
