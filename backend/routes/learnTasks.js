const express = require('express');
const router = express.Router();
const LearnTask = require('../models/LearnTask');
const auth = require('../middleware/auth');

// Get all learn tasks for a user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const tasks = await LearnTask.find({ userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching learn tasks:', error);
    res.status(500).json({ error: 'Failed to fetch learn tasks' });
  }
});

// Create a new learn task
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, priority, category, duration, subject } = req.body;

    const task = new LearnTask({
      userId,
      title,
      description,
      priority: priority || 'medium',
      category,
      duration,
      subject
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating learn task:', error);
    res.status(500).json({ error: 'Failed to create learn task' });
  }
});

// Update a learn task
router.put('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const updates = req.body;

    const task = await LearnTask.findOneAndUpdate(
      { _id: id, userId },
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error updating learn task:', error);
    res.status(500).json({ error: 'Failed to update learn task' });
  }
});

// Delete a learn task
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const task = await LearnTask.findOneAndDelete({ _id: id, userId });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting learn task:', error);
    res.status(500).json({ error: 'Failed to delete learn task' });
  }
});

// Toggle task completion
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const task = await LearnTask.findOne({ _id: id, userId });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    task.updatedAt = new Date();

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    console.error('Error toggling learn task:', error);
    res.status(500).json({ error: 'Failed to toggle learn task' });
  }
});

// Get learn task statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const totalTasks = await LearnTask.countDocuments({ userId });
    const completedTasks = await LearnTask.countDocuments({ userId, completed: true });
    const pendingTasks = totalTasks - completedTasks;
    const totalDuration = await LearnTask.aggregate([
      { $match: { userId, completed: true } },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ]);

    res.json({
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalDuration: totalDuration.length > 0 ? totalDuration[0].total : 0
    });
  } catch (error) {
    console.error('Error fetching learn task stats:', error);
    res.status(500).json({ error: 'Failed to fetch learn task statistics' });
  }
});

// Get learn tasks by subject
router.get('/by-subject', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { subject } = req.query;

    const query = { userId };
    if (subject) {
      query.subject = { $regex: subject, $options: 'i' };
    }

    const tasks = await LearnTask.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching learn tasks by subject:', error);
    res.status(500).json({ error: 'Failed to fetch learn tasks by subject' });
  }
});

module.exports = router; 