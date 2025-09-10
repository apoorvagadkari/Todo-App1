import React, { useState } from 'react';

const TaskForm = ({ onAddTask }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    dueDate: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAddTask(formData);
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'general',
        dueDate: ''
      });
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="task-form-container">
      <h2>Add New Task</h2>
      <form className="task-form" onSubmit={handleSubmit} data-testid="task-form">
        <div className="form-row">
          <input
            type="text"
            name="title"
            placeholder="Task title..."
            value={formData.title}
            onChange={handleChange}
            data-testid="task-title-input"
            required
            disabled={isSubmitting}
          />
          <select 
            name="priority" 
            value={formData.priority} 
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
        
        <textarea
          name="description"
          placeholder="Task description (optional)..."
          value={formData.description}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        
        <div className="form-row">
          <input
            type="text"
            name="category"
            placeholder="Category..."
            value={formData.category}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>
        
        <button 
          type="submit" 
          data-testid="add-task-button"
          disabled={isSubmitting || !formData.title.trim()}
        >
          {isSubmitting ? 'Adding...' : 'Add Task'}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;
