const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'logos_book_store_super_secure_jwt_secret_key_2026_xyz!';

const protectAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized as admin, no token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Admin account not authorized or inactive' });
    }

    req.admin = admin;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin authorization token' });
  }
};

module.exports = {
  protectAdmin
};
