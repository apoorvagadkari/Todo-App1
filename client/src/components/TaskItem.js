import React, { useState } from 'react';

const TaskItem = ({ task, onUpdateTask, onDeleteTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    category: task.category
  });

  const handleToggleComplete = async () => {
    try {
      await onUpdateTask(task._id, { completed: !task.completed });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await onUpdateTask(task._id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error editing task:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await onDeleteTask(task._id);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#44aa44';
      default: return '#888';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  if (isEditing) {
    return (
      <div className={`task-item editing ${task.completed ? 'completed' : ''}`}>
        <form onSubmit={handleEdit}>
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({...editData, title: e.target.value})}
            required
          />
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({...editData, description: e.target.value})}
            placeholder="Description..."
          />
          <select
            value={editData.priority}
            onChange={(e) => setEditData({...editData, priority: e.target.value})}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="text"
            value={editData.category}
            onChange={(e) => setEditData({...editData, category: e.target.value})}
            placeholder="Category..."
          />
          <div className="edit-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-content">
        <div className="task-header">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={handleToggleComplete}
            />
            <span className="checkmark"></span>
          </label>
          <h3 className={task.completed ? 'completed-text' : ''}>{task.title}</h3>
          <span 
            className="priority-badge"
            style={{ backgroundColor: getPriorityColor(task.priority) }}
          >
            {task.priority}
          </span>
        </div>
        
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
        
        <div className="task-meta">
          <span className="category">📁 {task.category}</span>
          {task.dueDate && (
            <span className="due-date">📅 {formatDate(task.dueDate)}</span>
          )}
          <span className="created-date">
            Created: {formatDate(task.createdAt)}
          </span>
        </div>
      </div>
      
      <div className="task-actions">
        <button onClick={() => setIsEditing(true)} className="edit-btn">
          ✏️
        </button>
        <button onClick={handleDelete} className="delete-btn">
          🗑️
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
