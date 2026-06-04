const express = require('express');
const router = express.Router();
const { signup, login, getMe, getUsers } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Route for user registration
router.post('/signup', signup);

// Route for user login
router.post('/login', login);

// Route to fetch current user's profile (requires a valid JWT token)
router.get('/me', verifyToken, getMe);

// Route to fetch all users in the workspace (requires a valid JWT token)
router.get('/users', verifyToken, getUsers);


module.exports = router;
