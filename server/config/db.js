const mongoose = require('mongoose');

// Function to establish connection to MongoDB
const connectDB = async () => {
  try {
    // Attempt to connect to the MongoDB instance using connection URI from environment variables.
    // Falls back to a local MongoDB instance if not specified.
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskmanager');
    
    console.log(`🚀 MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure code if connection fails
    process.exit(1);
  }
};

module.exports = connectDB;
