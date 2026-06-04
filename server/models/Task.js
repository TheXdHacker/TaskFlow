const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'done'],
    default: 'todo', // Tasks begin in the 'todo' stage
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model (the member assigned to do the task)
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project', // Reference to the parent Project model
    required: [true, 'Task must belong to a project'],
  },
  dueDate: {
    type: Date,
    required: [true, 'Task due date is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Task', TaskSchema);
