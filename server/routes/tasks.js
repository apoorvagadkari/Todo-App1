const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// CREATE - Add new task
router.post('/', async (req, res) => {
  try {
    const task = new Task(req.body);
    if (req.body.completed) {
      task.completedAt = new Date();
    }
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ - Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ - Get single task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE - Edit task
router.patch('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // If marking as completed, add completedAt timestamp
    if (updates.completed === true) {
      updates.completedAt = new Date();
    } else if (updates.completed === false) {
      updates.completedAt = null;
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id, 
      updates, 
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE - Remove task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ANALYTICS - Get task statistics (STANDOUT FEATURE)
router.get('/analytics', async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ completed: true });
    const pendingTasks = totalTasks - completedTasks;
    
    const priorityStats = await Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    const categoryStats = await Task.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Recent completion trend (last 7 days) - safer query
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentCompletions = await Task.countDocuments({
      completed: true,
      completedAt: { $gte: sevenDaysAgo, $ne: null }
    });

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0',
      priorityStats,
      categoryStats,
      recentCompletions
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
