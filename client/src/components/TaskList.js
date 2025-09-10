import React, { useState } from 'react';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onUpdateTask, onDeleteTask }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'completed':
        return task.completed;
      case 'pending':
        return !task.completed;
      case 'high':
        return task.priority === 'high';
      case 'medium':
        return task.priority === 'medium';
      case 'low':
        return task.priority === 'low';
      default:
        return true;
    }
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'dueDate':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      default: // createdAt
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    high: tasks.filter(t => t.priority === 'high').length
  };

  if (tasks.length === 0) {
    return (
      <div className="task-list-container">
        <div className="empty-state">
          <h3>No tasks yet!</h3>
          <p>Add your first task above to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-list-container">
      <div className="task-controls">
        <div className="task-stats">
          <span>Total: {taskStats.total}</span>
          <span>Completed: {taskStats.completed}</span>
          <span>Pending: {taskStats.pending}</span>
          <span>High Priority: {taskStats.high}</span>
        </div>
        
        <div className="controls">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="createdAt">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="priority">Sort by Priority</option>
            <option value="dueDate">Sort by Due Date</option>
          </select>
        </div>
      </div>
      
      <div className="task-list">
        {sortedTasks.map(task => (
          <TaskItem
            key={task._id}
            task={task}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>
      
      {filteredTasks.length === 0 && tasks.length > 0 && (
        <div className="no-results">
          <p>No tasks match the current filter.</p>
        </div>
      )}
    </div>
  );
};

export default TaskList;
