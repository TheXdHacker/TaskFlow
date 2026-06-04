const Task = require('../models/Task');
const Project = require('../models/Project');

/**
 * @desc    Get all tasks with optional filters
 * @route   GET /api/tasks
 * @access  Private (Admins see all tasks or filtered, Members see tasks in their projects)
 */
exports.getTasks = async (req, res) => {
  const { projectId, status } = req.query;

  try {
    let query = {};

    // 1. Project Filter & Authorization Check
    if (projectId) {
      // Find the project first to verify membership
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }

      // If user is a member, make sure they belong to the project
      if (req.user.role !== 'admin' && !project.members.includes(req.user._id.toString())) {
        return res.status(403).json({ success: false, message: 'Not authorized to view tasks for this project.' });
      }

      query.project = projectId;
    } else {
      // No specific project requested:
      if (req.user.role !== 'admin') {
        // Members: find projects they belong to first
        const userProjects = await Project.find({ members: req.user._id });
        const projectIds = userProjects.map(p => p._id);
        
        // Return tasks belonging to any of their projects
        query.project = { $in: projectIds };
      }
      // Admins: no restrictions, can retrieve all tasks
    }

    // 2. Status Filter (optional)
    if (status) {
      query.status = status;
    }

    // 3. Execute query populating project and assignee details
    const tasks = await Task.find(query)
      .populate('project', 'name description')
      .populate('assignedTo', 'name email role')
      .sort({ dueDate: 1 }); // Sort by due date ascending

    return res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    console.error('getTasks error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving tasks.' });
  }
};

/**
 * @desc    Create a new task within a project
 * @route   POST /api/tasks
 * @access  Private (Admin Only)
 */
exports.createTask = async (req, res) => {
  const { title, description, status, assignedTo, project: projectId, dueDate } = req.body;

  try {
    // Validate required fields
    if (!title || !projectId || !dueDate) {
      return res.status(400).json({ success: false, message: 'Title, project, and due date are required.' });
    }

    // Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Associated project not found.' });
    }

    // Create the task
    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      assignedTo: assignedTo || null,
      project: projectId,
      dueDate,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name description')
      .populate('assignedTo', 'name email role');

    return res.status(201).json({ success: true, data: populatedTask });
  } catch (error) {
    console.error('createTask error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating task.' });
  }
};

/**
 * @desc    Update a task (status/details)
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Role-Based Authorization & Input Filtering
    if (req.user.role !== 'admin') {
      // Members can ONLY update task status
      const allowedKeys = ['status'];
      const updateKeys = Object.keys(updates);
      const isViolation = updateKeys.some(key => !allowedKeys.includes(key));

      if (isViolation) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. Team members are only authorized to update task status.' 
        });
      }

      // Check if member belongs to the project containing this task
      const project = await Project.findById(task.project);
      if (!project || !project.members.includes(req.user._id.toString())) {
        return res.status(403).json({ success: false, message: 'Not authorized to modify tasks for this project.' });
      }
    }

    // Apply updates
    Object.keys(updates).forEach(key => {
      task[key] = updates[key];
    });

    // TODO: add validation for status state transition if necessary
    await task.save();

    const updatedTask = await Task.findById(id)
      .populate('project', 'name description')
      .populate('assignedTo', 'name email role');

    return res.status(200).json({ success: true, data: updatedTask });
  } catch (error) {
    console.error('updateTask error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating task.' });
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private (Admin Only)
 */
exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await Task.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Task successfully deleted.' });
  } catch (error) {
    console.error('deleteTask error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting task.' });
  }
};
