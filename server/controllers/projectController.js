const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

/**
 * @desc    Get all projects matching user permissions
 * @route   GET /api/projects
 * @access  Private (Admins see all projects, Members see assigned projects)
 */
exports.getProjects = async (req, res) => {
  try {
    let projects;
    
    // Admins can manage all projects; Members can only view projects they are added to.
    if (req.user.role === 'admin') {
      // Find all projects, populating details for creator and members
      projects = await Project.find()
        .populate('createdBy', 'name email role')
        .populate('members', 'name email role');
    } else {
      // Find projects where the current member is a part of the members array
      projects = await Project.find({ members: req.user._id })
        .populate('createdBy', 'name email role')
        .populate('members', 'name email role');
    }

    return res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    console.error('getProjects error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving projects.' });
  }
};

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private (Admin Only)
 */
exports.createProject = async (req, res) => {
  const { name, description, members } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required.' });
    }

    // Initialize members list. Always include the admin creator
    const membersList = members ? [...members] : [];
    if (!membersList.includes(req.user._id.toString())) {
      membersList.push(req.user._id);
    }

    // Create the new project in the DB
    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: membersList,
    });

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');

    return res.status(201).json({ success: true, data: populatedProject });
  } catch (error) {
    console.error('createProject error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating project.' });
  }
};

/**
 * @desc    Update project details
 * @route   PUT /api/projects/:id
 * @access  Private (Admin Only)
 */
exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description, members } = req.body;

  try {
    // Look up project
    let project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Perform updates
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    
    // Update members list if provided in the body
    if (members) {
      // Ensure the creator remains in the project
      const updatedMembers = [...members];
      if (!updatedMembers.includes(project.createdBy.toString())) {
        updatedMembers.push(project.createdBy);
      }
      project.members = updatedMembers;
    }

    await project.save();

    // Fetch updated project with populated relations
    const updatedProject = await Project.findById(id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');

    return res.status(200).json({ success: true, data: updatedProject });
  } catch (error) {
    console.error('updateProject error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating project.' });
  }
};

/**
 * @desc    Delete a project and its tasks
 * @route   DELETE /api/projects/:id
 * @access  Private (Admin Only)
 */
exports.deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // 1. Cascading Delete: Delete all tasks associated with this project
    // TODO: maybe backup tasks or log this deletion
    await Task.deleteMany({ project: id });

    // 2. Delete the project itself
    await Project.findByIdAndDelete(id);

    return res.status(200).json({ 
      success: true, 
      message: 'Project and all its associated tasks have been successfully deleted.' 
    });
  } catch (error) {
    console.error('deleteProject error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting project.' });
  }
};
