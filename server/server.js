const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();

// Express Middlewares
app.use(cors()); // Enable Cross-Origin Resource Sharing (allows frontend to call API)
app.use(express.json()); // Parse incoming JSON payloads

// Logging middleware in development mode
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// Root API Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'TaskFlow API is online and healthy.' });
});

// Fallback Route for non-existent API routes (404 Handler)
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

// Centralized Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An internal server error occurred.',
  });
});

const PORT = process.env.PORT || 5000;

// Start Express Server
app.listen(PORT, () => {
  console.log(`📡 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
