const express = require('express');
const DailyTask = require('../models/DailyTask');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all daily tasks for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await DailyTask.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json({
      message: 'Daily tasks retrieved successfully',
      tasks
    });
  } catch (error) {
    console.error('Get daily tasks error:', error);
    res.status(500).json({
      error: 'Internal server error while retrieving daily tasks'
    });
  }
});

// Create a new daily task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, priority, dueDate, category } = req.body;

    if (!title) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Title is required'
      });
    }

    const task = new DailyTask({
      userId: req.user.userId,
      title,
      description,
      priority: priority || 'medium',
      date: dueDate || new Date(),
      category: category || 'general',
      completed: false
    });

    await task.save();

    res.status(201).json({
      message: 'Daily task created successfully',
      task
    });
  } catch (error) {
    console.error('Create daily task error:', error);
    res.status(500).json({
      error: 'Internal server error while creating daily task'
    });
  }
});

// Get a specific daily task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await DailyTask.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        message: 'Daily task not found'
      });
    }

    res.status(200).json({
      message: 'Daily task retrieved successfully',
      task
    });
  } catch (error) {
    console.error('Get daily task error:', error);
    res.status(500).json({
      error: 'Internal server error while retrieving daily task'
    });
  }
});

// Update a daily task
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, priority, dueDate, category, completed } = req.body;

    const task = await DailyTask.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId
      },
      {
        title,
        description,
        priority,
        dueDate,
        category,
        completed
      },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        message: 'Daily task not found'
      });
    }

    res.status(200).json({
      message: 'Daily task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update daily task error:', error);
    res.status(500).json({
      error: 'Internal server error while updating daily task'
    });
  }
});

// Delete a daily task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await DailyTask.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        message: 'Daily task not found'
      });
    }

    res.status(200).json({
      message: 'Daily task deleted successfully'
    });
  } catch (error) {
    console.error('Delete daily task error:', error);
    res.status(500).json({
      error: 'Internal server error while deleting daily task'
    });
  }
});

// Toggle task completion
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const task = await DailyTask.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        message: 'Daily task not found'
      });
    }

    task.completed = !task.completed;
    await task.save();

    res.status(200).json({
      message: 'Task completion toggled successfully',
      task
    });
  } catch (error) {
    console.error('Toggle task completion error:', error);
    res.status(500).json({
      error: 'Internal server error while toggling task completion'
    });
  }
});

module.exports = router; 