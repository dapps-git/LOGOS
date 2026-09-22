const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[LOGOS DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[LOGOS DB Error] ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
