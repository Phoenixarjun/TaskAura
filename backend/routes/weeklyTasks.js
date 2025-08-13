const express = require('express');
const WeeklyTask = require('../models/WeeklyTask');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all weekly tasks for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await WeeklyTask.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json({
      message: 'Weekly tasks retrieved successfully',
      tasks
    });
  } catch (error) {
    console.error('Get weekly tasks error:', error);
    res.status(500).json({
      error: 'Internal server error while retrieving weekly tasks'
    });
  }
});

// Create a new weekly task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, priority, dueDate, category, weekNumber } = req.body;

    if (!title) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Title is required'
      });
    }

    // Calculate week number
    const getWeekNumber = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
      const yearStart = new Date(d.getFullYear(), 0, 1);
      const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      return weekNo;
    };

    // Calculate week start date (Monday of the current week)
    const getWeekStart = (date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      return new Date(d.setDate(diff));
    };

    const task = new WeeklyTask({
      userId: req.user.userId,
      title,
      description,
      priority: priority || 'medium',
      dueDate,
      category: category || 'general',
      weekStart: getWeekStart(new Date()),
      completed: false
    });

    await task.save();

    res.status(201).json({
      message: 'Weekly task created successfully',
      task
    });
  } catch (error) {
    console.error('Create weekly task error:', error);
    res.status(500).json({
      error: 'Internal server error while creating weekly task'
    });
  }
});

// Get a specific weekly task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await WeeklyTask.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        message: 'Weekly task not found'
      });
    }

    res.status(200).json({
      message: 'Weekly task retrieved successfully',
      task
    });
  } catch (error) {
    console.error('Get weekly task error:', error);
    res.status(500).json({
      error: 'Internal server error while retrieving weekly task'
    });
  }
});

// Update a weekly task
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, priority, dueDate, category, completed } = req.body;

    const task = await WeeklyTask.findOneAndUpdate(
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
        message: 'Weekly task not found'
      });
    }

    res.status(200).json({
      message: 'Weekly task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update weekly task error:', error);
    res.status(500).json({
      error: 'Internal server error while updating weekly task'
    });
  }
});

// Delete a weekly task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await WeeklyTask.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        message: 'Weekly task not found'
      });
    }

    res.status(200).json({
      message: 'Weekly task deleted successfully'
    });
  } catch (error) {
    console.error('Delete weekly task error:', error);
    res.status(500).json({
      error: 'Internal server error while deleting weekly task'
    });
  }
});

// Toggle task completion
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const task = await WeeklyTask.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        message: 'Weekly task not found'
      });
    }

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
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