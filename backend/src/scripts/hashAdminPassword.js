require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const hashAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI is not set in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    const adminEmail = (process.env.ADMIN_EMAIL || 'logosadmin@gmail.com').toLowerCase().trim();
    // Default raw password to hash
    const rawPassword = process.env.ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD.startsWith('$2')
      ? process.env.ADMIN_PASSWORD
      : 'LogosAdmin@2026';

    console.log(`Target admin email: ${adminEmail}`);
    console.log(`Hashing password with bcrypt (salt rounds = 10)...`);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    console.log(`Generated Hash: ${hashedPassword}`);

    // Verify hash
    const verifyTest = await bcrypt.compare(rawPassword, hashedPassword);
    console.log(`Verification test passed: ${verifyTest}`);

    // Get Admin model or direct collection
    const adminCollection = mongoose.connection.collection('admins');
    
    // Check if admin exists
    const existing = await adminCollection.findOne({ email: adminEmail });
    if (existing) {
      console.log(`Found existing admin with id: ${existing._id}`);
      await adminCollection.updateOne(
        { email: adminEmail },
        { 
          $set: { 
            password: hashedPassword,
            updatedAt: new Date()
          } 
        }
      );
      console.log(`Updated admin password with bcrypt hash in MongoDB.`);
    } else {
      console.log(`Admin not found. Creating new admin document with hashed password...`);
      await adminCollection.insertOne({
        name: 'LOGOS Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'superadmin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Admin created in MongoDB.`);
    }

    // Verify what is stored in DB
    const updated = await adminCollection.findOne({ email: adminEmail });
    console.log(`MongoDB admin record confirmed: email=${updated.email}, role=${updated.role}, passwordHash=${updated.password.substring(0, 15)}...`);
    const isDbPasswordValid = await bcrypt.compare(rawPassword, updated.password);
    console.log(`Password comparison check against MongoDB record: ${isDbPasswordValid ? 'SUCCESS' : 'FAILED'}`);

    console.log('--- RESULT FOR .ENV ---');
    console.log(`ADMIN_PASSWORD_HASH=${hashedPassword}`);
    console.log('------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error hashing admin password:', err);
    process.exit(1);
  }
};

hashAdmin();
