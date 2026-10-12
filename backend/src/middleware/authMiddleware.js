const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const { getJwtSecret } = require('../config/jwt');

const protectCustomer = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, getJwtSecret());
      
      const customer = await Customer.findById(decoded.id).select('-password');
      if (!customer) {
        return res.status(401).json({ success: false, message: 'User not found or deactivated' });
      }

      req.customer = customer;
      req.user = customer; // compatibility alias
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, getJwtSecret());
      const customer = await Customer.findById(decoded.id).select('-password');
      if (customer) {
        req.customer = customer;
        req.user = customer;
      }
    } catch (error) {
      // Continue without authenticated user
    }
  }
  next();
};

const protectCustomerOrAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, getJwtSecret());

      if (decoded.role === 'admin') {
        const Admin = require('../models/Admin');
        const admin = await Admin.findById(decoded.id).select('-password');
        if (admin && admin.isActive) {
          req.admin = admin;
          return next();
        }
      }

      const customer = await Customer.findById(decoded.id).select('-password');
      if (customer) {
        req.customer = customer;
        req.user = customer;
        return next();
      }

      return res.status(401).json({ success: false, message: 'Account not found or inactive' });
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired authorization token' });
    }
  }

  return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
};

module.exports = {
  protectCustomer,
  optionalAuth,
  protectCustomerOrAdmin
};
