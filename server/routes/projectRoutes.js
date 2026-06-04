const express = require('express');
const router = express.Router();
const { getProjects, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Protect all project routes under verifyToken middleware
router.use(verifyToken);

// GET /api/projects - Admins and Members retrieve projects they are associated with
// POST /api/projects - Only Admins can create projects
router.route('/')
  .get(getProjects)
  .post(isAdmin, createProject);

// PUT /api/projects/:id - Only Admins can modify project details (like adding members)
// DELETE /api/projects/:id - Only Admins can delete projects and trigger cascade delete of tasks
router.route('/:id')
  .put(isAdmin, updateProject)
  .delete(isAdmin, deleteProject);

module.exports = router;
