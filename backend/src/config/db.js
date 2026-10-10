const mongoose = require('mongoose');
const initDefaults = require('../utils/initDefaults');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[LOGOS DB] MongoDB Connected: ${conn.connection.host}`);
    await initDefaults();
  } catch (error) {
    console.error(`[LOGOS DB Error] ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

