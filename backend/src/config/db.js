const mongoose = require('mongoose');
const initDefaults = require('../utils/initDefaults');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[LOGOS DB] MongoDB Connected: ${conn.connection.host}`);
    // Run idempotent startup maintenance in the background so API requests aren't delayed on boot
    initDefaults().catch((err) => {
      console.warn(`[LOGOS Init Warning] ${err.message}`);
    });
  } catch (error) {
    console.error(`[LOGOS DB Error] ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

