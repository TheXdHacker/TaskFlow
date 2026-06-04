const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to sign JWT tokens
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_key_123', {
    expiresIn: '30d', // Tokens expire in 30 days
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // 1. Basic validation check
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    // 2. Prevent duplicate user registrations
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email.' });
    }

    // 3. Create the user database record (password will be automatically hashed in pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'member', // Default role is member
    });

    // 4. Respond with user info and signed JWT token
    return res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, message: 'Server error during user registration.' });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if both parameters are provided
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    // 2. Lookup the user. Explicitly select password field since it is hidden by default in schema
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    // 3. Verify user's password using helper method in User schema
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password mismatch.' });
    }

    // 4. Return user data with token
    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during user login.' });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    // req.user is set by verifyToken middleware
    return res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving profile.' });
  }
};

/**
 * @desc    Get all users in the workspace (for selection dropdowns)
 * @route   GET /api/auth/users
 * @access  Private
 */
exports.getUsers = async (req, res) => {
  try {
    // Retrieve all users, but only fetch name, email, and role fields
    const users = await User.find().select('name email role');
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('getUsers error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching workspace users.' });
  }
};

