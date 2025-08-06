const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'learn'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  // For daily tasks
  date: {
    type: Date
  },
  // For weekly tasks
  weekStart: {
    type: Date
  },
  // For learn tasks
  duration: {
    type: Number, // in minutes
    min: [0, 'Duration cannot be negative']
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [100, 'Subject cannot exceed 100 characters']
  },
  // Common fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
taskSchema.index({ userId: 1, type: 1, date: 1 });
taskSchema.index({ userId: 1, type: 1, weekStart: 1 });
taskSchema.index({ userId: 1, completed: 1 });

// Update the updatedAt field before saving
taskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to mark task as completed
taskSchema.methods.markCompleted = function() {
  this.completed = true;
  this.completedAt = new Date();
  return this.save();
};

// Method to mark task as incomplete
taskSchema.methods.markIncomplete = function() {
  this.completed = false;
  this.completedAt = undefined;
  return this.save();
};

module.exports = mongoose.model('Task', taskSchema); 