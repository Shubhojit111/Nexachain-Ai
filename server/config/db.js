const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI supplied in environment variables.
 * Exits the process on failure so that process managers (pm2, docker, etc.)
 * can restart the service rather than run in a broken state.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected successfully`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
