const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Require authentication for all task operations
router.use(verifyToken);

// GET /api/tasks - Retrieve list of tasks (filtered by project or assignee)
// POST /api/tasks - Admins only can create new tasks in projects
router.route('/')
  .get(getTasks)
  .post(isAdmin, createTask);

// PUT /api/tasks/:id - Update task (Admins can change any field, Members can change only status)
// DELETE /api/tasks/:id - Admins only can delete tasks
router.route('/:id')
  .put(updateTask)
  .delete(isAdmin, deleteTask);

module.exports = router;
