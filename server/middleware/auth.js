const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify the client's JWT token
const verifyToken = async (req, res, next) => {
  let token;

  // Retrieve token from Authorization header (e.g., Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token is provided, block access
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    // Decode and verify the token using the secret key (fallback to default secret for dev)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_123');

    // Retrieve user details from database and attach user info to request (excluding password)
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found or authorization failed.' });
    }
    
    // Proceed to next middleware or route controller
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// Middleware to restrict access to Admins only
const isAdmin = (req, res, next) => {
  // Check if req.user exists (set by verifyToken) and has 'admin' role
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    // Deny permission for Members trying to perform Admin-only actions
    res.status(403).json({ success: false, message: 'Access forbidden. Administrator privileges required.' });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
};
