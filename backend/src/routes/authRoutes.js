const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  googleAuth,
  getProfile,
  updateProfile,
  addAddress,
  deleteAddress,
  forgotPassword,
  resetPassword,
  loginAdmin,
  getAdminProfile,
  getCustomersAdmin
} = require('../controllers/authController');
const { protectCustomer } = require('../middleware/authMiddleware');
const { protectAdmin } = require('../middleware/adminMiddleware');

// Public Customer Auth
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Private Customer Routes
router.get('/profile', protectCustomer, getProfile);
router.put('/profile', protectCustomer, updateProfile);
router.post('/address', protectCustomer, addAddress);
router.delete('/address/:addressId', protectCustomer, deleteAddress);

// Admin Auth Routes
router.post('/admin/login', loginAdmin);
router.get('/admin/profile', protectAdmin, getAdminProfile);
router.get('/admin/customers', protectAdmin, getCustomersAdmin);

module.exports = router;
